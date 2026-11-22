import type { SQLiteDatabase } from 'expo-sqlite';

export type SyncCollection =
  | 'users' | 'products' | 'categories' | 'favorites' | 'cartItems' | 'addresses' | 'storeAddress';
export type SyncOperation = 'upsert' | 'delete';
export type SyncQueueRecord = {
  id: string; collection: SyncCollection; document_id: string; owner_uid: string;
  operation: SyncOperation; payload: string | null; queued_at: string;
};

export async function queueSyncOperation(
  db: SQLiteDatabase,
  item: Omit<SyncQueueRecord, 'id' | 'queued_at'>,
): Promise<void> {
  const id = `${item.collection}:${item.owner_uid || 'public'}:${item.document_id}`;
  await db.runAsync(
    `INSERT INTO SyncQueue(id,collection,document_id,owner_uid,operation,payload,queued_at)
     VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET
     operation=excluded.operation,payload=excluded.payload,queued_at=excluded.queued_at`,
    id, item.collection, item.document_id, item.owner_uid, item.operation, item.payload,
    new Date().toISOString(),
  );
}

export async function getPendingSyncCount(db: SQLiteDatabase): Promise<number> {
  const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM SyncQueue');
  return result?.count ?? 0;
}

export async function listPendingSyncOperations(
  db: SQLiteDatabase, ownerUid: string,
): Promise<SyncQueueRecord[]> {
  return db.getAllAsync<SyncQueueRecord>(
    `SELECT * FROM SyncQueue WHERE owner_uid='' OR owner_uid=? ORDER BY queued_at ASC`, ownerUid,
  );
}

export async function removeSyncOperation(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM SyncQueue WHERE id=?', id);
}

export async function markSyncStatus(
  db: SQLiteDatabase, collection: SyncCollection, documentId: string, ownerUid: string,
  status: 'synced' | 'failed',
): Promise<void> {
  const tables: Partial<Record<SyncCollection, string>> = {
    users: 'Users', products: 'Products', categories: 'Categories', favorites: 'Favorites',
  };
  const table = tables[collection];
  if (collection === 'storeAddress') {
    await db.runAsync('UPDATE StoreAddress SET sync_status=? WHERE id=?', status, documentId);
  } else if (collection === 'cartItems' || collection === 'addresses' || collection === 'favorites') {
    const actual = collection === 'cartItems' ? 'CartItems' : collection === 'addresses' ? 'Addresses' : 'Favorites';
    await db.runAsync(`UPDATE ${actual} SET sync_status=? WHERE id=? AND user_id=?`, status, documentId, ownerUid);
  } else if (table) {
    await db.runAsync(`UPDATE ${table} SET sync_status=? WHERE id=?`, status, documentId);
  }
}
