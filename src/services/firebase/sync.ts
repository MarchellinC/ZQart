import {
  collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where,
} from 'firebase/firestore';
import type { SQLiteDatabase } from 'expo-sqlite';
import { firestore } from './firestore';
import { LOCAL_ADMIN_UIDS } from './admin-accounts';
import { categoryRepository, productRepository, storeAddressRepository, userRepository } from '@/database';
import {
  listPendingSyncOperations, markSyncStatus, queueSyncOperation, removeSyncOperation,
  type SyncCollection, type SyncQueueRecord,
} from '@/database/sync-queue';
import type { ProductRecord } from '@/database/repositories/products';
import type { CategoryRecord } from '@/database/repositories/categories';
import type { StoreAddressRecord } from '@/database/repositories/store-address';

type SyncActor = { uid: string | null; role: 'admin' | 'buyer' | null };
type RemoteDeletion = {
  collection: SyncCollection; document_id: string; owner_uid: string; updated_at: string;
};
export type SyncSummary = { uploaded: number; downloaded: number; failed: number };

async function queueLegacyPendingChanges(db: SQLiteDatabase): Promise<void> {
  const entities: { table: string; collection: SyncCollection; ownerField?: string }[] = [
    { table: 'Users', collection: 'users', ownerField: 'id' },
    { table: 'Products', collection: 'products' },
    { table: 'Categories', collection: 'categories' },
    { table: 'Favorites', collection: 'favorites', ownerField: 'user_id' },
    { table: 'CartItems', collection: 'cartItems', ownerField: 'user_id' },
    { table: 'Addresses', collection: 'addresses', ownerField: 'user_id' },
    { table: 'StoreAddress', collection: 'storeAddress' },
  ];
  for (const entity of entities) {
    const ownerExpression = entity.ownerField ? `COALESCE(r.${entity.ownerField},'')` : "''";
    const rows = await db.getAllAsync<Record<string, unknown>>(
      `SELECT r.* FROM ${entity.table} r WHERE r.sync_status IN ('pending','failed')
       AND NOT EXISTS (SELECT 1 FROM SyncQueue q WHERE q.collection=? AND q.document_id=r.id
         AND q.owner_uid=${ownerExpression})`, entity.collection,
    );
    for (const row of rows) await queueSyncOperation(db, {
      collection: entity.collection,
      document_id: String(row.id),
      owner_uid: entity.ownerField ? String(row[entity.ownerField] ?? '') : '',
      operation: 'upsert', payload: JSON.stringify(row),
    });
  }
}

function deletionId(item: RemoteDeletion) {
  return encodeURIComponent(`${item.collection}:${item.owner_uid || 'public'}:${item.document_id}:${item.updated_at}`);
}

function isAdmin(actor: SyncActor): boolean {
  // This is a client-side queue filter. Firestore Security Rules remain authoritative.
  return actor.uid !== null && actor.role === 'admin';
}

function requiresAdmin(collectionName: SyncCollection): boolean {
  return collectionName === 'products' || collectionName === 'categories' || collectionName === 'storeAddress';
}

async function pushOperation(db: SQLiteDatabase, item: SyncQueueRecord, actor: SyncActor): Promise<void> {
  const admin = isAdmin(actor);
  if (item.owner_uid && item.owner_uid !== actor.uid) throw new Error('Operasi bukan milik akun yang aktif.');
  if (item.owner_uid === '' && !admin) throw new Error('Operasi ini hanya dapat disinkronkan admin.');
  if (requiresAdmin(item.collection) && !admin) throw new Error('Perubahan katalog hanya dapat disinkronkan admin.');
  if (item.collection === 'users' && item.document_id !== actor.uid) {
    throw new Error('Profil hanya dapat disinkronkan pemilik akun.');
  }

  const remoteRef = doc(firestore, item.collection, item.document_id);
  if (item.operation === 'upsert') {
    if (!item.payload) throw new Error('Data antrean sinkronisasi kosong.');
    const payload = JSON.parse(item.payload) as Record<string, unknown>;
    if (requiresAdmin(item.collection) || item.collection === 'users') {
      const remote = await getDoc(remoteRef);
      const remoteUpdatedAt = remote.exists() ? String(remote.data().updated_at ?? '') : '';
      const localUpdatedAt = String(payload.updated_at ?? '');
      if (remoteUpdatedAt && remoteUpdatedAt > localUpdatedAt) {
        await markSyncStatus(db, item.collection, item.document_id, item.owner_uid, 'synced');
        await removeSyncOperation(db, item.id);
        return;
      }
    }
    delete payload.sync_status;
    await setDoc(remoteRef, payload);
  } else {
    const updatedAt = item.queued_at;
    const tombstone: RemoteDeletion = {
      collection: item.collection, document_id: item.document_id,
      owner_uid: item.owner_uid, updated_at: updatedAt,
    };
    await setDoc(doc(firestore, '_deletions', deletionId(tombstone)), tombstone);
    const remote = await getDoc(remoteRef);
    const remoteUpdatedAt = remote.exists() ? String(remote.data().updated_at ?? '') : '';
    // A stale offline delete must not erase a newer cloud edit.
    if (remote.exists() && (!remoteUpdatedAt || remoteUpdatedAt <= updatedAt)) {
      await deleteDoc(remoteRef);
    }
  }

  if (item.operation === 'upsert') await markSyncStatus(
    db, item.collection, item.document_id, item.owner_uid, 'synced',
  );
  await removeSyncOperation(db, item.id);
}

async function isDirty(
  db: SQLiteDatabase, table: string, id: string, uid?: string,
): Promise<boolean> {
  const row = table === 'Users' || table === 'Products' || table === 'Categories' || table === 'StoreAddress'
    ? await db.getFirstAsync<{ sync_status: string }>(`SELECT sync_status FROM ${table} WHERE id=?`, id)
    : await db.getFirstAsync<{ sync_status: string }>(
      `SELECT sync_status FROM ${table} WHERE id=? AND user_id=?`, id, uid ?? '',
    );
  return row?.sync_status === 'pending' || row?.sync_status === 'failed';
}

async function upsertRemoteBuyerRecord(
  db: SQLiteDatabase, table: 'Favorites' | 'CartItems' | 'Addresses', id: string, uid: string,
  record: Record<string, unknown>,
): Promise<boolean> {
  if (await isDirty(db, table, id, uid)) return false;
  const local = table === 'Addresses'
    ? await db.getFirstAsync<{ updated_at: string }>(
      'SELECT updated_at FROM Addresses WHERE id=? AND user_id=?', id, uid,
    )
    : await db.getFirstAsync<{ updated_at: string }>(
      `SELECT updated_at FROM ${table} WHERE id=? AND user_id=?`, id, uid,
    );
  const remoteUpdatedAt = String(record.updated_at ?? record.created_at ?? '');
  if (local && local.updated_at > remoteUpdatedAt) return false;
  if (table !== 'Addresses') {
    const product = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM Products WHERE id=?', String(record.product_id ?? ''),
    );
    if (!product) return false;
  }
  if (table === 'Favorites') {
    await db.runAsync(
      `INSERT INTO Favorites(id,user_id,product_id,created_at,updated_at,sync_status)
       VALUES(?,?,?,?,?,'synced') ON CONFLICT(id) DO UPDATE SET
       product_id=excluded.product_id,created_at=excluded.created_at,
       updated_at=excluded.updated_at,sync_status='synced'`,
      id, uid, String(record.product_id), String(record.created_at), String(record.updated_at ?? record.created_at),
    );
  } else if (table === 'CartItems') {
    await db.runAsync(
      `INSERT INTO CartItems(id,user_id,product_id,quantity,added_at,updated_at,sync_status)
       VALUES(?,?,?,?,?,?,'synced') ON CONFLICT(id) DO UPDATE SET
       product_id=excluded.product_id,quantity=excluded.quantity,added_at=excluded.added_at,
       updated_at=excluded.updated_at,sync_status='synced'`,
      id, uid, String(record.product_id), Number(record.quantity), String(record.added_at), String(record.updated_at),
    );
  } else {
    const defaultFlag = record.is_default === 1 || record.is_default === true ? 1 : 0;
    if (defaultFlag) await db.runAsync(
      `UPDATE Addresses SET is_default=0 WHERE user_id=? AND is_default=1 AND id<>?`, uid, id,
    );
    await db.runAsync(
      `INSERT INTO Addresses(id,user_id,recipient_name,phone_number,province,city,district,
       postal_code,full_address,is_default,updated_at,sync_status)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,'synced') ON CONFLICT(id) DO UPDATE SET
       recipient_name=excluded.recipient_name,phone_number=excluded.phone_number,
       province=excluded.province,city=excluded.city,district=excluded.district,
       postal_code=excluded.postal_code,full_address=excluded.full_address,
       is_default=excluded.is_default,updated_at=excluded.updated_at,sync_status='synced'`,
      id, uid, String(record.recipient_name), String(record.phone_number), String(record.province),
      String(record.city), String(record.district), String(record.postal_code), String(record.full_address),
      defaultFlag, String(record.updated_at),
    );
  }
  return true;
}

async function pullCollection(name: 'products' | 'categories' | 'storeAddress') {
  return getDocs(collection(firestore, name));
}

async function pullBuyerCollection(name: 'favorites' | 'cartItems' | 'addresses', uid: string) {
  return getDocs(query(collection(firestore, name), where('user_id', '==', uid)));
}

async function applyDeletions(db: SQLiteDatabase, actor: SyncActor): Promise<number> {
  const ownerIds = actor.uid ? ['', actor.uid] : [''];
  const snapshots = await Promise.all(ownerIds.map((ownerUid) => getDocs(
    query(collection(firestore, '_deletions'), where('owner_uid', '==', ownerUid)),
  )));
  let applied = 0;
  for (const snapshot of snapshots) for (const deletionDoc of snapshot.docs) {
    const alreadyApplied = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM AppliedSyncDeletions WHERE id=?', deletionDoc.id,
    );
    if (alreadyApplied) continue;
    const tombstone = deletionDoc.data() as RemoteDeletion;
    if (tombstone.owner_uid !== '' && tombstone.owner_uid !== actor.uid) continue;
    if (tombstone.collection === 'products' || tombstone.collection === 'categories') {
      const table = tombstone.collection === 'products' ? 'Products' : 'Categories';
      if (await isDirty(db, table, tombstone.document_id)) continue;
      const local = await db.getFirstAsync<{ updated_at: string }>(
        `SELECT updated_at FROM ${table} WHERE id=?`, tombstone.document_id,
      );
      if (local && local.updated_at > tombstone.updated_at) {
        await db.runAsync('INSERT OR IGNORE INTO AppliedSyncDeletions(id,applied_at) VALUES(?,?)', deletionDoc.id, new Date().toISOString());
        applied++;
        continue;
      }
      await db.runAsync(`DELETE FROM ${table} WHERE id=?`, tombstone.document_id);
    } else if (tombstone.collection === 'storeAddress') {
      const local = await storeAddressRepository.get(db);
      if (local && local.updated_at > tombstone.updated_at) {
        await db.runAsync('INSERT OR IGNORE INTO AppliedSyncDeletions(id,applied_at) VALUES(?,?)', deletionDoc.id, new Date().toISOString());
        applied++;
        continue;
      }
      await db.runAsync('DELETE FROM StoreAddress WHERE id=?', 'store');
    } else if (tombstone.owner_uid === actor.uid) {
      const table = tombstone.collection === 'favorites' ? 'Favorites'
        : tombstone.collection === 'cartItems' ? 'CartItems'
          : tombstone.collection === 'addresses' ? 'Addresses' : null;
      if (table && !(await isDirty(db, table, tombstone.document_id, actor.uid ?? undefined))) {
        const local = await db.getFirstAsync<{ updated_at: string }>(
          `SELECT updated_at FROM ${table} WHERE id=? AND user_id=?`, tombstone.document_id, actor.uid,
        );
        if (local && local.updated_at > tombstone.updated_at) {
          await db.runAsync('INSERT OR IGNORE INTO AppliedSyncDeletions(id,applied_at) VALUES(?,?)', deletionDoc.id, new Date().toISOString());
          applied++;
          continue;
        }
        await db.runAsync(`DELETE FROM ${table} WHERE id=? AND user_id=?`, tombstone.document_id, actor.uid);
      }
    }
    await db.runAsync(
      'INSERT OR IGNORE INTO AppliedSyncDeletions(id,applied_at) VALUES(?,?)',
      deletionDoc.id, new Date().toISOString(),
    );
    applied++;
  }
  return applied;
}

async function pullRemoteData(db: SQLiteDatabase, actor: SyncActor): Promise<number> {
  let downloaded = 0;
  const [categories, products, storeAddresses] = await Promise.all([
    pullCollection('categories'), pullCollection('products'), pullCollection('storeAddress'),
  ]);
  for (const snapshot of categories.docs) {
    const remote = { ...snapshot.data(), id: snapshot.id } as CategoryRecord;
    if (await isDirty(db, 'Categories', remote.id)) continue;
    const local = await categoryRepository.findById(db, remote.id);
    if (local && local.updated_at > remote.updated_at) continue;
    await categoryRepository.save(db, { ...remote, sync_status: 'synced' });
    downloaded++;
  }
  for (const snapshot of products.docs) {
    const remote = { ...snapshot.data(), id: snapshot.id } as ProductRecord;
    if (await isDirty(db, 'Products', remote.id)) continue;
    const local = await productRepository.findById(db, remote.id);
    if (local && local.updated_at > remote.updated_at) continue;
    await productRepository.save(db, { ...remote, sync_status: 'synced' });
    downloaded++;
  }
  if (storeAddresses.docs.length) {
    const snapshot = storeAddresses.docs.find((item) => item.id === 'store') ?? storeAddresses.docs[0]!;
    const remote = snapshot.data() as StoreAddressRecord;
    const local = await storeAddressRepository.get(db);
    if (!(await isDirty(db, 'StoreAddress', 'store'))
      && (!local || local.updated_at <= remote.updated_at)) {
      await storeAddressRepository.save(db, { ...remote, sync_status: 'synced' });
      downloaded++;
    }
  }
  if (actor.uid) {
    const userSnapshot = await getDoc(doc(firestore, 'users', actor.uid));
    if (userSnapshot.exists() && !(await isDirty(db, 'Users', actor.uid))) {
      const remote = userSnapshot.data();
      const local = await userRepository.findById(db, actor.uid);
      if (!local || local.updated_at <= String(remote.updated_at ?? remote.created_at ?? '')) {
        await userRepository.save(db, {
          id: actor.uid, name: String(remote.name ?? ''), email: String(remote.email ?? ''),
          role: LOCAL_ADMIN_UIDS.has(actor.uid) ? 'admin' : 'buyer',
          created_at: String(remote.created_at ?? new Date().toISOString()),
          updated_at: String(remote.updated_at ?? remote.created_at ?? new Date().toISOString()),
          sync_status: 'synced',
        });
        downloaded++;
      }
    }

    const [favorites, cartItems, addresses] = await Promise.all([
      pullBuyerCollection('favorites', actor.uid), pullBuyerCollection('cartItems', actor.uid),
      pullBuyerCollection('addresses', actor.uid),
    ]);
    const defaultAddress = addresses.docs.filter((item) => item.data().is_default === 1 || item.data().is_default === true)
      .sort((a, b) => String(b.data().updated_at ?? '').localeCompare(String(a.data().updated_at ?? '')))[0]?.id;
    for (const snapshot of favorites.docs) if (await upsertRemoteBuyerRecord(
      db, 'Favorites', snapshot.id, actor.uid, snapshot.data(),
    )) downloaded++;
    for (const snapshot of cartItems.docs) if (await upsertRemoteBuyerRecord(
      db, 'CartItems', snapshot.id, actor.uid, snapshot.data(),
    )) downloaded++;
    for (const snapshot of addresses.docs) if (await upsertRemoteBuyerRecord(
      db, 'Addresses', snapshot.id, actor.uid,
      { ...snapshot.data(), is_default: snapshot.id === defaultAddress ? 1 : 0 },
    )) downloaded++;
  }
  return downloaded;
}

export async function synchronize(
  db: SQLiteDatabase, actor: SyncActor,
): Promise<SyncSummary> {
  let uploaded = 0;
  let downloaded = 0;
  let failed = 0;
  await queueLegacyPendingChanges(db);
  const queue = await listPendingSyncOperations(db, actor.uid ?? '');
  for (const item of queue) {
    if (requiresAdmin(item.collection) && !isAdmin(actor)) continue;
    if ((item.owner_uid === '' || item.owner_uid === actor.uid) && !actor.uid) continue;
    if (item.owner_uid !== '' && item.owner_uid !== actor.uid) continue;
    try {
      await pushOperation(db, item, actor);
      uploaded++;
    } catch (error) {
      failed++;
      await markSyncStatus(db, item.collection, item.document_id, item.owner_uid, 'failed');
      console.warn(`Sync failed for ${item.collection}/${item.document_id}`, error);
    }
  }
  try {
    downloaded += await pullRemoteData(db, actor);
    downloaded += await applyDeletions(db, actor);
  } catch (error) {
    failed++;
    console.warn('Firestore pull failed', error);
  }
  return { uploaded, downloaded, failed };
}
