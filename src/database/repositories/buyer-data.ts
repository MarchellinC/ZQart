import type { SQLiteDatabase } from 'expo-sqlite';

export const buyerDataRepository = {
  async addFavorite(db: SQLiteDatabase, id: string, uid: string, productId: string, now: string) {
    await db.runAsync(
      `INSERT INTO Favorites(id,user_id,product_id,created_at) VALUES(?,?,?,?)
       ON CONFLICT(user_id,product_id) DO NOTHING`, id, uid, productId, now,
    );
  },
  async removeFavorite(db: SQLiteDatabase, uid: string, productId: string) {
    await db.runAsync('DELETE FROM Favorites WHERE user_id=? AND product_id=?', uid, productId);
  },
  async setCartQuantity(
    db: SQLiteDatabase, id: string, uid: string, productId: string, quantity: number, now: string,
  ) {
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error('quantity must be a positive integer');
    await db.runAsync(
      `INSERT INTO CartItems(id,user_id,product_id,quantity,added_at,updated_at)
       VALUES(?,?,?,?,?,?) ON CONFLICT(user_id,product_id) DO UPDATE SET
       quantity=excluded.quantity,updated_at=excluded.updated_at,sync_status='pending'`,
      id, uid, productId, quantity, now, now,
    );
  },
  async listCart(db: SQLiteDatabase, uid: string) {
    return db.getAllAsync(
      `SELECT c.*, p.name, p.price, p.image_url, p.stock FROM CartItems c
       JOIN Products p ON p.id=c.product_id WHERE c.user_id=? ORDER BY c.added_at DESC`, uid,
    );
  },
};
