import type { SQLiteDatabase } from 'expo-sqlite';

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
  async save(db: SQLiteDatabase, category: CategoryRecord): Promise<void> {
    await db.runAsync(
      `INSERT INTO Categories(id,name,updated_at,sync_status) VALUES(?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name,updated_at=excluded.updated_at,
       sync_status=excluded.sync_status`,
      category.id, category.name, category.updated_at, category.sync_status,
    );
  },
  async remove(db: SQLiteDatabase, id: string): Promise<void> {
    await db.runAsync('DELETE FROM Categories WHERE id=?', id);
  },
};
