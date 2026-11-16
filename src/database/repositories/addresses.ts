import type { SQLiteDatabase } from 'expo-sqlite';

export interface AddressRecord {
  id: string; user_id: string; recipient_name: string; phone_number: string; province: string;
  city: string; district: string; postal_code: string; full_address: string; is_default: 0 | 1;
}

export const addressRepository = {
  async listForUser(db: SQLiteDatabase, firebaseUid: string): Promise<AddressRecord[]> {
    return db.getAllAsync<AddressRecord>(
      'SELECT * FROM Addresses WHERE user_id=? ORDER BY is_default DESC', firebaseUid,
    );
  },
  async save(db: SQLiteDatabase, address: AddressRecord): Promise<void> {
    await db.withTransactionAsync(async () => {
      if (address.is_default) {
        await db.runAsync('UPDATE Addresses SET is_default=0 WHERE user_id=?', address.user_id);
      }
      await db.runAsync(
        `INSERT INTO Addresses(id,user_id,recipient_name,phone_number,province,city,district,
         postal_code,full_address,is_default) VALUES(?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(id) DO UPDATE SET recipient_name=excluded.recipient_name,
         phone_number=excluded.phone_number,province=excluded.province,city=excluded.city,
         district=excluded.district,postal_code=excluded.postal_code,
         full_address=excluded.full_address,is_default=excluded.is_default,sync_status='pending'`,
        address.id, address.user_id, address.recipient_name, address.phone_number,
        address.province, address.city, address.district, address.postal_code,
        address.full_address, address.is_default,
      );
    });
  },
};
