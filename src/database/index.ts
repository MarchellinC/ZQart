import * as SQLite from 'expo-sqlite';
import { migrateDatabase } from './migrations';

const DATABASE_NAME = 'zqart.db';
let initialization: Promise<SQLite.SQLiteDatabase> | undefined;

export function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!initialization) {
    initialization = (async () => {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await db.execAsync('PRAGMA foreign_keys = ON');
      await migrateDatabase(db);
      return db;
    })().catch((error: unknown) => {
      initialization = undefined;
      throw error;
    });
  }
  return initialization;
}

export { productRepository } from './repositories/products';
export { userRepository } from './repositories/users';
export { buyerDataRepository } from './repositories/buyer-data';
export { addressRepository } from './repositories/addresses';
export { categoryRepository } from './repositories/categories';
export { storeAddressRepository } from './repositories/store-address';
export { orderRepository } from './repositories/orders';
