import type { SQLiteDatabase } from 'expo-sqlite';

export interface UserRecord {
  id: string; name: string; email: string; role: 'admin' | 'buyer'; created_at: string;
  sync_status: 'pending' | 'synced' | 'failed';
}

export const userRepository = {
  async findById(db: SQLiteDatabase, firebaseUid: string): Promise<UserRecord | null> {
    return db.getFirstAsync<UserRecord>('SELECT * FROM Users WHERE id = ?', firebaseUid);
  },
  async save(db: SQLiteDatabase, user: UserRecord): Promise<void> {
    await db.runAsync(
      `INSERT INTO Users(id,name,email,role,created_at,sync_status) VALUES(?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name,email=excluded.email,
       role=excluded.role,sync_status=excluded.sync_status`,
      user.id, user.name, user.email, user.role, user.created_at, user.sync_status,
    );
  },
};
