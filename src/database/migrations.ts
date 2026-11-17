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
