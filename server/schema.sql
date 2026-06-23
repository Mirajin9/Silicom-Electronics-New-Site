-- Silicom component store — SQLite schema.
-- Applied idempotently on every boot by db.js. Safe to re-run.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  sku         TEXT    NOT NULL UNIQUE,
  slug        TEXT    NOT NULL UNIQUE,
  name        TEXT    NOT NULL,
  brand       TEXT    NOT NULL DEFAULT '',
  category    TEXT    NOT NULL DEFAULT '',
  short_desc  TEXT    NOT NULL DEFAULT '',
  long_desc   TEXT    NOT NULL DEFAULT '',
  image_main  TEXT    NOT NULL DEFAULT '',     -- relative URL e.g. /store-uploads/abc.jpg
  images_json TEXT    NOT NULL DEFAULT '[]',   -- JSON array of extra image URLs
  stock       INTEGER NOT NULL DEFAULT 0,
  weight_g    INTEGER NOT NULL DEFAULT 0,
  status      TEXT    NOT NULL DEFAULT 'active', -- 'active' | 'hidden'
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Quantity-break price tiers. Ceiling = row with min_qty = 1; floor = highest min_qty row.
-- Unit price for a quantity = the row with the greatest min_qty <= quantity.
CREATE TABLE IF NOT EXISTS product_tiers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  min_qty    INTEGER NOT NULL,
  unit_price REAL    NOT NULL,                  -- price per piece in INR (rupees)
  UNIQUE (product_id, min_qty)
);
CREATE INDEX IF NOT EXISTS idx_tiers_product ON product_tiers(product_id, min_qty);

-- Flat-rate shipping zones, matched by leading digits of the destination pincode.
CREATE TABLE IF NOT EXISTS shipping_zones (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT    NOT NULL,
  pincode_prefixes TEXT    NOT NULL DEFAULT '', -- CSV of leading-digit prefixes, e.g. "11,12,201"
  flat_rate        REAL    NOT NULL DEFAULT 0,  -- INR
  free_above       REAL    NOT NULL DEFAULT 0,  -- 0 = never free; otherwise subtotal >= this ships free
  is_default       INTEGER NOT NULL DEFAULT 0   -- fallback zone when no prefix matches
);

CREATE TABLE IF NOT EXISTS orders (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  razorpay_order_id   TEXT    UNIQUE,
  razorpay_payment_id TEXT,
  status              TEXT    NOT NULL DEFAULT 'created', -- created | paid | failed
  subtotal            REAL    NOT NULL DEFAULT 0,
  shipping            REAL    NOT NULL DEFAULT 0,
  total               REAL    NOT NULL DEFAULT 0,
  customer_name       TEXT    NOT NULL DEFAULT '',
  email               TEXT    NOT NULL DEFAULT '',
  phone               TEXT    NOT NULL DEFAULT '',
  address             TEXT    NOT NULL DEFAULT '',
  city                TEXT    NOT NULL DEFAULT '',
  state               TEXT    NOT NULL DEFAULT '',
  pincode             TEXT    NOT NULL DEFAULT '',
  notify_sent         INTEGER NOT NULL DEFAULT 0,  -- idempotency guard for emails/stock
  created_at          TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_rzp ON orders(razorpay_order_id);

CREATE TABLE IF NOT EXISTS order_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  sku        TEXT    NOT NULL DEFAULT '',
  name       TEXT    NOT NULL DEFAULT '',
  qty        INTEGER NOT NULL,
  unit_price REAL    NOT NULL,
  line_total REAL    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_items_order ON order_items(order_id);
