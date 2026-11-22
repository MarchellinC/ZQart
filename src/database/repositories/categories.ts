import type { SQLiteDatabase } from 'expo-sqlite';
import { queueSyncOperation } from '../sync-queue';

export type CategoryRecord = {
  id: string; name: string; updated_at: string; sync_status: 'pending' | 'synced' | 'failed';
};

export const categoryRepository = {
  async list(db: SQLiteDatabase): Promise<CategoryRecord[]> {
    return db.getAllAsync<CategoryRecord>('SELECT * FROM Categories ORDER BY name COLLATE NOCASE');
  },
  async findById(db: SQLiteDatabase, id: string): Promise<CategoryRecord | null> {
    return db.getFirstAsync<CategoryRecord>('SELECT * FROM Categories WHERE id=?', id);
  },
  async findByName(db: SQLiteDatabase, name: string): Promise<CategoryRecord | null> {
    return db.getFirstAsync<CategoryRecord>(
      'SELECT * FROM Categories WHERE name=? COLLATE NOCASE ORDER BY CASE sync_status WHEN \'synced\' THEN 0 ELSE 1 END LIMIT 1',
      name.trim(),
    );
  },
  async save(db: SQLiteDatabase, category: CategoryRecord): Promise<string> {
    const existingName = await this.findByName(db, category.name);
    if (existingName && existingName.id !== category.id) return existingName.id;
    await db.runAsync(
      `INSERT INTO Categories(id,name,updated_at,sync_status) VALUES(?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name,updated_at=excluded.updated_at,
       sync_status=excluded.sync_status`,
      category.id, category.name, category.updated_at, category.sync_status,
    );
    return category.id;
  },
  async remove(db: SQLiteDatabase, id: string): Promise<void> {
    await db.withTransactionAsync(async () => {
      await queueSyncOperation(db, {
        collection: 'categories', document_id: id, owner_uid: '', operation: 'delete', payload: null,
      });
      await db.runAsync('DELETE FROM Categories WHERE id=?', id);
    });
  },
};
