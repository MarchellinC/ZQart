export const initialSchema = [
  `CREATE TABLE Users (
    id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK(role IN ('admin', 'buyer')), created_at TEXT NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'pending' CHECK(sync_status IN ('pending','synced','failed'))
  )`,
  `CREATE TABLE Categories (
    id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL UNIQUE, updated_at TEXT NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'pending' CHECK(sync_status IN ('pending','synced','failed'))
  )`,
  `CREATE TABLE Products (
    id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, description TEXT NOT NULL,
    price REAL NOT NULL CHECK(price >= 0), image_url TEXT, category_id TEXT,
    stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0), updated_at TEXT NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'pending' CHECK(sync_status IN ('pending','synced','failed')),
    FOREIGN KEY(category_id) REFERENCES Categories(id) ON UPDATE CASCADE ON DELETE SET NULL
  )`,
  `CREATE TABLE Favorites (
    id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, product_id TEXT NOT NULL,
    created_at TEXT NOT NULL, sync_status TEXT NOT NULL DEFAULT 'pending'
      CHECK(sync_status IN ('pending','synced','failed')),
    UNIQUE(user_id, product_id), FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES Products(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE CartItems (
    id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0), added_at TEXT NOT NULL, updated_at TEXT NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'pending' CHECK(sync_status IN ('pending','synced','failed')),
    UNIQUE(user_id, product_id), FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES Products(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE Addresses (
    id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, recipient_name TEXT NOT NULL,
    phone_number TEXT NOT NULL, province TEXT NOT NULL, city TEXT NOT NULL, district TEXT NOT NULL,
    postal_code TEXT NOT NULL, full_address TEXT NOT NULL, is_default INTEGER NOT NULL DEFAULT 0
      CHECK(is_default IN (0,1)), sync_status TEXT NOT NULL DEFAULT 'pending'
      CHECK(sync_status IN ('pending','synced','failed')),
    FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE StoreAddress (
    id TEXT PRIMARY KEY NOT NULL CHECK(id = 'store'), recipient_name TEXT NOT NULL,
    phone_number TEXT NOT NULL, province TEXT NOT NULL, city TEXT NOT NULL, district TEXT NOT NULL,
    postal_code TEXT NOT NULL, full_address TEXT NOT NULL, updated_at TEXT NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'pending' CHECK(sync_status IN ('pending','synced','failed'))
  )`,
  'CREATE INDEX idx_products_name ON Products(name COLLATE NOCASE)',
  'CREATE INDEX idx_products_category ON Products(category_id)',
  'CREATE INDEX idx_favorites_user ON Favorites(user_id)',
  'CREATE INDEX idx_cart_user ON CartItems(user_id)',
  'CREATE INDEX idx_addresses_user ON Addresses(user_id)',
];
