import type { SQLiteDatabase } from 'expo-sqlite';

export type StoreAddressRecord = {
  recipient_name: string; phone_number: string; province: string; city: string;
  district: string; postal_code: string; full_address: string; updated_at: string;
  sync_status: 'pending' | 'synced' | 'failed';
};

export const storeAddressRepository = {
  async get(db: SQLiteDatabase): Promise<StoreAddressRecord | null> {
    return db.getFirstAsync<StoreAddressRecord>('SELECT * FROM StoreAddress WHERE id=?', 'store');
  },
  async save(db: SQLiteDatabase, address: StoreAddressRecord): Promise<void> {
    await db.runAsync(
      `INSERT INTO StoreAddress(id,recipient_name,phone_number,province,city,district,
       postal_code,full_address,updated_at,sync_status) VALUES('store',?,?,?,?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET recipient_name=excluded.recipient_name,
       phone_number=excluded.phone_number,province=excluded.province,city=excluded.city,
       district=excluded.district,postal_code=excluded.postal_code,
       full_address=excluded.full_address,updated_at=excluded.updated_at,
       sync_status=excluded.sync_status`,
      address.recipient_name, address.phone_number, address.province, address.city,
      address.district, address.postal_code, address.full_address, address.updated_at,
      address.sync_status,
    );
  },
};
