import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const path = process.env.DB_PATH || './data/fourthfish.sqlite'
mkdirSync(dirname(path), { recursive: true })
export const db = new DatabaseSync(path)
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS orders (
  code INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash TEXT NOT NULL UNIQUE,
  fingerprint TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_link_id TEXT,
  payment_data TEXT,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY,
  order_code INTEGER NOT NULL REFERENCES orders(code),
  channel TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  provider_id TEXT,
  created_at INTEGER NOT NULL,
  UNIQUE(order_code, channel)
);`)
export const findOrder = (code) => db.prepare('SELECT * FROM orders WHERE code=?').get(code)
export function confirmOrder(code, status) {
  const row = findOrder(code)
  if (!row) return
  const order = JSON.parse(row.body)
  db.exec('BEGIN IMMEDIATE')
  try {
    db.prepare('UPDATE orders SET status=? WHERE code=?').run(status, code)
    const insert = db.prepare('INSERT OR IGNORE INTO notifications (order_code,channel,created_at) VALUES (?,?,?)')
    insert.run(code, 'email', Date.now())
    if (order.smsConsent) insert.run(code, 'sms', Date.now())
    db.exec('COMMIT')
  } catch (error) { db.exec('ROLLBACK'); throw error }
}
