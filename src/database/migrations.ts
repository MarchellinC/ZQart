import type { SQLiteDatabase } from 'expo-sqlite';
import { initialSchema } from './schema';

const migrations = [
  { version: 1, statements: initialSchema },
  {
    version: 2,
    statements: [
      `UPDATE Addresses SET is_default=0 WHERE is_default=1 AND rowid NOT IN (
        SELECT MIN(rowid) FROM Addresses WHERE is_default=1 GROUP BY user_id
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_addresses_single_default
       ON Addresses(user_id) WHERE is_default=1`,
    ],
  },
  {
    version: 3,
    statements: [
      `ALTER TABLE Users ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''`,
      `UPDATE Users SET updated_at=created_at WHERE updated_at=''`,
      `ALTER TABLE Favorites ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''`,
      `UPDATE Favorites SET updated_at=created_at WHERE updated_at=''`,
      `ALTER TABLE Addresses ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''`,
      `UPDATE Addresses SET updated_at=datetime('now') WHERE updated_at=''`,
      `CREATE TABLE SyncQueue (
        id TEXT PRIMARY KEY NOT NULL, collection TEXT NOT NULL, document_id TEXT NOT NULL,
        owner_uid TEXT NOT NULL DEFAULT '', operation TEXT NOT NULL CHECK(operation IN ('upsert','delete')),
        payload TEXT, queued_at TEXT NOT NULL,
        CHECK(collection IN ('users','products','categories','favorites','cartItems','addresses','storeAddress'))
      )`,
      'CREATE INDEX idx_sync_queue_owner ON SyncQueue(owner_uid,queued_at)',
      `CREATE TABLE AppliedSyncDeletions (id TEXT PRIMARY KEY NOT NULL, applied_at TEXT NOT NULL)`,
    ],
  },
  {
    version: 4,
    statements: [
      `CREATE TABLE Orders (
        id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, items_json TEXT NOT NULL,
        total REAL NOT NULL, address_json TEXT NOT NULL, created_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'baru', sync_status TEXT NOT NULL DEFAULT 'synced'
      )`,
      'CREATE INDEX idx_orders_user ON Orders(user_id,created_at)',
    ],
  },
];

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY NOT NULL, applied_at TEXT NOT NULL
  )`);
  const current = await db.getFirstAsync<{ version: number }>(
    'SELECT MAX(version) AS version FROM schema_migrations',
  );
  let version = current?.version ?? 0;
  for (const migration of migrations.filter((item) => item.version > version)) {
    await db.withTransactionAsync(async () => {
      for (const statement of migration.statements) await db.execAsync(statement);
      await db.runAsync(
        'INSERT INTO schema_migrations(version, applied_at) VALUES (?, ?)',
        migration.version,
        new Date().toISOString(),
      );
    });
    version = migration.version;
  }
}
