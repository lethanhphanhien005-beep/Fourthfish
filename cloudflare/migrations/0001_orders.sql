CREATE TABLE IF NOT EXISTS orders (
  code INTEGER PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  fingerprint TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_link_id TEXT,
  payment_data TEXT,
  payment_lock_until INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY,
  order_code INTEGER NOT NULL REFERENCES orders(code),
  channel TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  provider_id TEXT,
  lease_until INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  UNIQUE(order_code, channel)
);
CREATE INDEX IF NOT EXISTS notifications_pending ON notifications(state, created_at);
