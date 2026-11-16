import type { SQLiteDatabase } from 'expo-sqlite';

export interface ProductRecord {
  id: string; name: string; description: string; price: number; image_url: string | null;
  category_id: string | null; stock: number; updated_at: string;
  sync_status: 'pending' | 'synced' | 'failed';
}

export const productRepository = {
  async list(db: SQLiteDatabase): Promise<ProductRecord[]> {
    return db.getAllAsync<ProductRecord>('SELECT * FROM Products ORDER BY name COLLATE NOCASE');
  },
  async search(db: SQLiteDatabase, query: string): Promise<ProductRecord[]> {
    return db.getAllAsync<ProductRecord>(
      'SELECT * FROM Products WHERE name LIKE ? ORDER BY name COLLATE NOCASE', `%${query}%`,
    );
  },
  async findById(db: SQLiteDatabase, id: string): Promise<ProductRecord | null> {
    return db.getFirstAsync<ProductRecord>('SELECT * FROM Products WHERE id = ?', id);
  },
  async save(db: SQLiteDatabase, product: ProductRecord): Promise<void> {
    await db.runAsync(
      `INSERT INTO Products(id,name,description,price,image_url,category_id,stock,updated_at,sync_status)
       VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,
       description=excluded.description,price=excluded.price,image_url=excluded.image_url,
       category_id=excluded.category_id,stock=excluded.stock,updated_at=excluded.updated_at,
       sync_status=excluded.sync_status`,
      product.id, product.name, product.description, product.price, product.image_url,
      product.category_id, product.stock, product.updated_at, product.sync_status,
    );
  },
};
