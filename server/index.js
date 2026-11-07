import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { PayOS } from '@payos/node'
import { timingSafeEqual } from 'node:crypto'
import { db, findOrder, confirmOrder } from './db.js'
import { hash, normalizeOrder } from './domain.js'
import { processNotifications } from './notifications.js'

const app = express()
const origin = process.env.APP_ORIGIN || 'http://localhost:5173'
const payos = process.env.PAYOS_CLIENT_ID && process.env.PAYOS_API_KEY && process.env.PAYOS_CHECKSUM_KEY
  ? new PayOS({ clientId: process.env.PAYOS_CLIENT_ID, apiKey: process.env.PAYOS_API_KEY, checksumKey: process.env.PAYOS_CHECKSUM_KEY, timeout: 15000, maxRetries: 0, logLevel: 'off' }) : null
app.disable('x-powered-by')
app.use(helmet())
app.use(express.json({ limit: '30kb' }))
app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next() })
app.get('/api/health', (_, res) => res.json({ ok: true, paymentsConfigured: Boolean(payos), notificationsEnabled: process.env.NOTIFICATIONS_ENABLED === 'true' }))
const limiter = rateLimit({ windowMs: 60_000, limit: 15, standardHeaders: 'draft-8', legacyHeaders: false })
const equalHash = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))
function authenticate(req, res, next) {
  const row = findOrder(req.params.code)
  const token = req.get('X-Order-Token') || ''
  if (!row || !equalHash(row.token_hash, hash(token))) return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' })
  req.order = row
  next()
}
const view = row => ({ code: row.code, status: row.status, total: JSON.parse(row.body).total, payment: JSON.parse(row.body).payment, paymentData: row.payment_data ? JSON.parse(row.payment_data) : null })

app.post('/api/orders', limiter, (req, res) => {
  if (req.get('Origin') && req.get('Origin') !== origin) return res.status(403).json({ error: 'Nguồn yêu cầu không hợp lệ.' })
  const token = req.get('X-Order-Token') || ''
  if (!/^[0-9a-f-]{36}$/.test(token)) return res.status(400).json({ error: 'Mã yêu cầu không hợp lệ.' })
  let order
  try { order = normalizeOrder(req.body) } catch (e) { return res.status(400).json({ error: e.message }) }
  if (order.payment === 'vietqr' && !payos) return res.status(503).json({ error: 'Chuyển khoản chưa sẵn sàng. Vui lòng chọn COD.' })
  const fingerprint = hash(JSON.stringify(order))
  let row = db.prepare('SELECT * FROM orders WHERE token_hash=?').get(hash(token))
  if (row && row.fingerprint !== fingerprint) return res.status(409).json({ error: 'Thông tin giỏ đã thay đổi. Vui lòng tạo yêu cầu mới.' })
  if (!row) {
    const result = db.prepare('INSERT INTO orders (token_hash,fingerprint,body,status,created_at) VALUES (?,?,?,?,?)').run(hash(token), fingerprint, JSON.stringify(order), order.payment === 'cod' ? 'confirmed' : 'awaiting_payment', Date.now())
    row = findOrder(Number(result.lastInsertRowid))
  }
  if (order.payment === 'cod') confirmOrder(row.code, 'confirmed')
  res.status(201).json(view(findOrder(row.code)))
})

const linking = new Map()
app.post('/api/orders/:code/payment', limiter, authenticate, async (req, res) => {
  const row = req.order
  const order = JSON.parse(row.body)
  if (!payos || order.payment !== 'vietqr') return res.status(400).json({ error: 'Đơn hàng không sử dụng VietQR.' })
  if (row.payment_data) return res.json(view(row))
  if (linking.has(row.code)) return res.status(409).json({ error: 'Đang tạo mã thanh toán, vui lòng thử lại.' })
  linking.set(row.code, true)
  try {
    // Deterministic orderCode; retry safely recovers an already-created upstream request.
    try {
      const result = await payos.paymentRequests.create({ orderCode: row.code, amount: order.total, description: `FF${String(row.code).slice(-7)}`, returnUrl: `${origin}/dat-hang-thanh-cong`, cancelUrl: `${origin}/dat-hang-thanh-cong?cancelled=1`, expiredAt: Math.floor(Date.now() / 1000) + 1800 })
      db.prepare('UPDATE orders SET payment_link_id=?,payment_data=? WHERE code=?').run(result.paymentLinkId, JSON.stringify({ qrCode: result.qrCode, checkoutUrl: result.checkoutUrl, accountName: result.accountName, accountNumber: result.accountNumber }), row.code)
    } catch (createError) {
      // A timeout can occur after payOS created the link. Recover by the SAME orderCode.
      const existing = await payos.paymentRequests.get(row.code)
      if (existing.amount !== order.total) throw new Error('Payment amount mismatch')
      if (existing.status === 'PAID' && existing.amountPaid === order.total) confirmOrder(row.code, 'paid')
      db.prepare('UPDATE orders SET payment_link_id=?,payment_data=? WHERE code=?').run(existing.id, JSON.stringify({ checkoutUrl: `https://pay.payos.vn/web/${existing.id}` }), row.code)
    }
    res.json(view(findOrder(row.code)))
  } catch { res.status(502).json({ error: 'Chưa tạo được mã QR. Bạn có thể thử lại với cùng đơn hàng.' }) }
  finally { linking.delete(row.code) }
})

app.get('/api/orders/:code', limiter, authenticate, async (req, res) => {
  const row = req.order
  // Return URL/query string is never treated as proof of payment.
  if (payos && row.status === 'awaiting_payment' && row.payment_link_id) {
    try {
      const payment = await payos.paymentRequests.get(row.code)
      const total = JSON.parse(row.body).total
      if (payment.id === row.payment_link_id && payment.status === 'PAID' && payment.amount === total && payment.amountPaid === total) confirmOrder(row.code, 'paid')
      else if (payment.status === 'CANCELLED' || payment.status === 'EXPIRED') db.prepare('UPDATE orders SET status=? WHERE code=? AND status=?').run(payment.status.toLowerCase(), row.code, 'awaiting_payment')
    } catch { /* Keep last verified state; webhook can still settle the order. */ }
  }
  res.json(view(findOrder(row.code)))
})
app.post('/api/webhooks/payos', async (req, res) => {
  if (!payos) return res.sendStatus(503)
  let data
  try { data = await payos.webhooks.verify(req.body) } catch { return res.status(400).json({ error: 'Invalid signature' }) }
  const row = findOrder(data.orderCode)
  // A signed sample notification is sent by payOS while confirming the webhook.
  if (!row) return res.sendStatus(200)
  const order = JSON.parse(row.body)
  if (order.payment !== 'vietqr' || req.body.success !== true || data.code !== '00' || data.currency !== 'VND' || (row.payment_link_id && row.payment_link_id !== data.paymentLinkId)) return res.status(400).json({ error: 'Payment mismatch' })
  try {
    // Cross-check full settlement: supports multiple partial transfers and webhook replay.
    const payment = await payos.paymentRequests.get(row.code)
    if (payment.id !== data.paymentLinkId || payment.amount !== order.total) return res.status(400).json({ error: 'Payment mismatch' })
    if (payment.status === 'PAID' && payment.amountPaid === order.total) confirmOrder(row.code, 'paid')
    return res.sendStatus(200)
  } catch { return res.sendStatus(503) }
})
app.use((error, req, res, next) => {
  console.error('Request failed:', error.name)
  res.status(error.type === 'entity.parse.failed' ? 400 : 500).json({ error: 'Không thể xử lý yêu cầu. Vui lòng thử lại.' })
})
// No external notification is sent until explicitly enabled in server environment.
// After a process crash, review 'sending' SMS manually; email can safely retry within 20 hours.
db.prepare("UPDATE notifications SET state='pending' WHERE state='sending' AND channel='email'").run()
const timer = setInterval(() => processNotifications().catch(() => console.error('Notification job failed')), 60000)
timer.unref()
app.listen(Number(process.env.PORT || 3001), '127.0.0.1', () => console.log('Fourthfish API: http://127.0.0.1:3001'))
