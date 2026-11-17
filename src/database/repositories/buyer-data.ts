import type { SQLiteDatabase } from 'expo-sqlite';
import type { ProductRecord } from './products';

export type FavoriteProduct = ProductRecord & { favorite_id: string; created_at: string };
export type CartProduct = {
  id: string; user_id: string; product_id: string; quantity: number; added_at: string;
  updated_at: string; sync_status: string; name: string; price: number;
  image_url: string | null; stock: number;
};

export const buyerDataRepository = {
  async addFavorite(db: SQLiteDatabase, id: string, uid: string, productId: string, now: string) {
    await db.runAsync(
      `INSERT INTO Favorites(id,user_id,product_id,created_at) VALUES(?,?,?,?)
       ON CONFLICT(user_id,product_id) DO NOTHING`, id, uid, productId, now,
    );
  },
  async listFavorites(db: SQLiteDatabase, uid: string): Promise<FavoriteProduct[]> {
    return db.getAllAsync<FavoriteProduct>(
      `SELECT p.*, f.id AS favorite_id, f.created_at FROM Favorites f
       JOIN Products p ON p.id=f.product_id WHERE f.user_id=? ORDER BY f.created_at DESC`, uid,
    );
  },
  async removeFavorite(db: SQLiteDatabase, uid: string, productId: string) {
    await db.runAsync('DELETE FROM Favorites WHERE user_id=? AND product_id=?', uid, productId);
  },
  async setCartQuantity(
    db: SQLiteDatabase, id: string, uid: string, productId: string, quantity: number, now: string,
  ) {
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error('quantity must be a positive integer');
    await db.withTransactionAsync(async () => {
      const product = await db.getFirstAsync<{ stock: number }>(
        'SELECT stock FROM Products WHERE id=?', productId,
      );
      if (!product) throw new Error('Product does not exist.');
      if (quantity > product.stock) throw new Error('Quantity exceeds available stock.');
      await db.runAsync(
        `INSERT INTO CartItems(id,user_id,product_id,quantity,added_at,updated_at)
         VALUES(?,?,?,?,?,?) ON CONFLICT(user_id,product_id) DO UPDATE SET
         quantity=excluded.quantity,updated_at=excluded.updated_at,sync_status='pending'`,
        id, uid, productId, quantity, now, now,
      );
    });
  },
  async listCart(db: SQLiteDatabase, uid: string): Promise<CartProduct[]> {
    return db.getAllAsync<CartProduct>(
      `SELECT c.*, p.name, p.price, p.image_url, p.stock FROM CartItems c
       JOIN Products p ON p.id=c.product_id WHERE c.user_id=? ORDER BY c.added_at DESC`, uid,
    );
  },
  async removeCartItem(db: SQLiteDatabase, uid: string, productId: string): Promise<void> {
    await db.runAsync('DELETE FROM CartItems WHERE user_id=? AND product_id=?', uid, productId);
  },
  async clearCart(db: SQLiteDatabase, uid: string): Promise<void> {
    await db.runAsync('DELETE FROM CartItems WHERE user_id=?', uid);
  },
};
