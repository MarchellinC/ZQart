import type { SQLiteDatabase } from 'expo-sqlite';

export type OrderLine = { product_id: string; name: string; price: number; quantity: number };
export type OrderRecord = {
  id: string; user_id: string; items: OrderLine[]; total: number;
  address: Record<string, unknown>; created_at: string; status: string;
};

export const orderRepository = {
  async create(db: SQLiteDatabase, order: OrderRecord, stockAfter: Record<string, number>) {
    await db.withTransactionAsync(async () => {
      for (const item of order.items) {
        const result = await db.runAsync(
          'UPDATE Products SET stock=?,updated_at=?,sync_status=\'synced\' WHERE id=?',
          stockAfter[item.product_id], order.created_at, item.product_id,
        );
        if (!result.changes) throw new Error(`Produk ${item.name} tidak ditemukan di penyimpanan lokal. Sinkronkan katalog lalu coba lagi.`);
      }
      await db.runAsync(
        `INSERT INTO Orders(id,user_id,items_json,total,address_json,created_at,status,sync_status)
         VALUES(?,?,?,?,?,?,?,'synced')`, order.id, order.user_id, JSON.stringify(order.items),
        order.total, JSON.stringify(order.address), order.created_at, order.status,
      );
    });
  },
  async listForUser(db: SQLiteDatabase, uid: string): Promise<OrderRecord[]> {
    const rows = await db.getAllAsync<{ id: string; user_id: string; items_json: string; total: number; address_json: string; created_at: string; status: string }>(
      'SELECT * FROM Orders WHERE user_id=? ORDER BY created_at DESC', uid,
    );
    return rows.map((row) => ({ ...row, items: JSON.parse(row.items_json) as OrderLine[], address: JSON.parse(row.address_json) as Record<string, unknown> }));
  },
};
