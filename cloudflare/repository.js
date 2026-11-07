export const findOrder = (db, code) => db.prepare('SELECT * FROM orders WHERE code=?').bind(code).first()
export const view = row => ({ code: row.code, status: row.status, total: JSON.parse(row.body).total, payment: JSON.parse(row.body).payment, paymentData: row.payment_data ? JSON.parse(row.payment_data) : null })
export async function confirmOrder(db, row, status) {
  const order = JSON.parse(row.body)
  const statements = [
    db.prepare("UPDATE orders SET status=? WHERE code=? AND status IN ('awaiting_payment','confirmed','paid')").bind(status, row.code),
  ]
  for (const channel of ['email', ...(order.smsConsent ? ['sms'] : [])]) {
    statements.push(db.prepare('INSERT OR IGNORE INTO notifications(order_code,channel,created_at) SELECT code,?,? FROM orders WHERE code=? AND status=?').bind(channel, Date.now(), row.code, status))
  }
  await db.batch(statements)
}
