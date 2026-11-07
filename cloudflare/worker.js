import { PayOS } from '@payos/node'
import { timingSafeEqual, randomInt } from 'node:crypto'
import { hash, normalizeOrder } from '../server/domain.js'
import { confirmOrder, findOrder, view } from './repository.js'
import { processNotifications } from './notifications.js'

const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
const failure = (message, status) => json({ error: message }, status)
const sameHash = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))
function client(env) {
  if (!env.PAYOS_CLIENT_ID || !env.PAYOS_API_KEY || !env.PAYOS_CHECKSUM_KEY) return null
  return new PayOS({ clientId: env.PAYOS_CLIENT_ID, apiKey: env.PAYOS_API_KEY, checksumKey: env.PAYOS_CHECKSUM_KEY, timeout: 15000, maxRetries: 0, logLevel: 'off' })
}
async function body(request) {
  const text = await request.text()
  if (text.length > 30000) throw new Error('Yêu cầu quá lớn.')
  return JSON.parse(text)
}
async function reconcile(db, row, payos) {
  const payment = await payos.paymentRequests.get(row.code)
  const total = JSON.parse(row.body).total
  if (payment.id !== row.payment_link_id || payment.amount !== total) throw new Error('Payment mismatch')
  if (payment.status === 'PAID' && payment.amountPaid === total) await confirmOrder(db, row, 'paid')
  else if (['CANCELLED', 'EXPIRED'].includes(payment.status)) await db.prepare("UPDATE orders SET status=? WHERE code=? AND status='awaiting_payment'").bind(payment.status.toLowerCase(), row.code).run()
  return payment
}
export async function api(request, env) {
  const url = new URL(request.url)
  const path = url.pathname
  const payos = client(env)
  const db = env.DB
  if (path === '/api/health' && request.method === 'GET') return json({ ok: true, environment: 'production', storeEnabled: env.STORE_ENABLED === 'true', paymentsConfigured: Boolean(payos) })
  if (path === '/api/webhooks/payos' && request.method === 'POST') {
    if (!payos) return failure('Payment unavailable', 503)
    let payload, data
    try { payload = await body(request); data = await payos.webhooks.verify(payload) } catch { return failure('Invalid webhook', 400) }
    const row = await findOrder(db, data.orderCode)
    if (!row) return json({ received: true }) // Signed registration sample or foreign order.
    if (JSON.parse(row.body).payment !== 'vietqr' || payload.success !== true || data.code !== '00' || data.currency !== 'VND' || (row.payment_link_id && row.payment_link_id !== data.paymentLinkId)) return failure('Payment mismatch', 400)
    try {
      const payment = await payos.paymentRequests.get(row.code)
      const total = JSON.parse(row.body).total
      if (payment.id !== data.paymentLinkId || payment.amount !== total) return failure('Payment mismatch', 400)
      if (payment.status === 'PAID' && payment.amountPaid === total) await confirmOrder(db, row, 'paid')
      return json({ received: true })
    } catch { return failure('Retry webhook later', 503) }
  }
  if (!/^\/api\/orders(?:\/\d+(?:\/payment)?)?$/.test(path)) return failure('Không tìm thấy API.', 404)
  if (!['GET', 'POST'].includes(request.method)) return failure('Phương thức không hỗ trợ.', 405)
  if (request.method === 'POST' && request.headers.get('Origin') && request.headers.get('Origin') !== env.APP_ORIGIN) return failure('Nguồn yêu cầu không hợp lệ.', 403)
  if (!(await env.API_LIMITER.limit({ key: request.headers.get('CF-Connecting-IP') || 'unknown' })).success) return failure('Bạn thao tác quá nhanh. Vui lòng thử lại sau một phút.', 429)
  const token = request.headers.get('X-Order-Token') || ''
  if (!/^[0-9a-f-]{36}$/.test(token)) return failure('Mã yêu cầu không hợp lệ.', 400)

  if (path === '/api/orders' && request.method === 'POST') {
    if (env.STORE_ENABLED !== 'true') return failure('Fourthfish đang chuẩn bị mở bán. Vui lòng quay lại sau.', 503)
    if (!env.APP_ORIGIN || env.APP_ORIGIN.includes('REPLACE-')) return failure('Cửa hàng chưa hoàn tất cấu hình.', 503)
    let order
    try { order = normalizeOrder(await body(request)) } catch (error) { return failure(error.message, 400) }
    if (order.payment === 'vietqr' && !payos) return failure('VietQR chưa sẵn sàng. Vui lòng chọn COD.', 503)
    const fingerprint = hash(JSON.stringify(order))
    // Unique token index resolves requests racing on different Cloudflare isolates.
    await db.prepare('INSERT OR IGNORE INTO orders(code,token_hash,fingerprint,body,status,created_at) VALUES(?,?,?,?,?,?)').bind(Date.now() * 1000 + randomInt(1000), hash(token), fingerprint, JSON.stringify(order), order.payment === 'cod' ? 'confirmed' : 'awaiting_payment', Date.now()).run()
    const row = await db.prepare('SELECT * FROM orders WHERE token_hash=?').bind(hash(token)).first()
    if (!row) return failure('Không thể tạo mã đơn. Vui lòng thử lại.', 503)
    if (row.fingerprint !== fingerprint) return failure('Thông tin đơn đã thay đổi. Vui lòng tạo yêu cầu mới.', 409)
    if (order.payment === 'cod') await confirmOrder(db, row, 'confirmed')
    return json(view(row), 201)
  }
  const match = path.match(/^\/api\/orders\/(\d+)(\/payment)?$/)
  if (!match || !Number.isSafeInteger(Number(match[1]))) return failure('Không tìm thấy đơn hàng.', 404)
  let row = await findOrder(db, Number(match[1]))
  if (!row || !sameHash(row.token_hash, hash(token))) return failure('Không tìm thấy đơn hàng.', 404)
  if (request.method === 'GET' && !match[2]) {
    if (row.status === 'awaiting_payment' && row.payment_link_id && payos) {
      try { await reconcile(db, row, payos); row = await findOrder(db, row.code) } catch { /* Last verified status remains authoritative. */ }
    }
    return json(view(row))
  }
  if (request.method !== 'POST' || !match[2]) return failure('Phương thức không hỗ trợ.', 405)
  if (!payos || JSON.parse(row.body).payment !== 'vietqr') return failure('Đơn hàng không sử dụng VietQR.', 400)
  if (row.payment_data) return json(view(row))
  const now = Date.now()
  const lease = await db.prepare('UPDATE orders SET payment_lock_until=? WHERE code=? AND payment_data IS NULL AND payment_lock_until<?').bind(now + 60000, row.code, now).run()
  if (!lease.meta.changes) return failure('Đang tạo mã thanh toán. Vui lòng thử lại.', 409)
  try {
    const total = JSON.parse(row.body).total
    let paymentData, linkId
    try {
      const result = await payos.paymentRequests.create({ orderCode: row.code, amount: total, description: `FF${row.code.toString(36).slice(-7)}`, returnUrl: `${env.APP_ORIGIN}/dat-hang-thanh-cong`, cancelUrl: `${env.APP_ORIGIN}/dat-hang-thanh-cong?cancelled=1`, expiredAt: Math.floor(Date.now() / 1000) + 1800 })
      linkId = result.paymentLinkId
      paymentData = { qrCode: result.qrCode, checkoutUrl: result.checkoutUrl, accountName: result.accountName, accountNumber: result.accountNumber }
    } catch {
      const existing = await payos.paymentRequests.get(row.code)
      if (existing.amount !== total) throw new Error('Payment mismatch')
      linkId = existing.id
      paymentData = { checkoutUrl: `https://pay.payos.vn/web/${existing.id}` }
      if (existing.status === 'PAID' && existing.amountPaid === total) await confirmOrder(db, row, 'paid')
    }
    await db.prepare('UPDATE orders SET payment_link_id=?,payment_data=? WHERE code=?').bind(linkId, JSON.stringify(paymentData), row.code).run()
    return json(view(await findOrder(db, row.code)))
  } catch { return failure('Chưa tạo được mã QR. Vui lòng thử lại với cùng đơn hàng.', 502) }
  finally { await db.prepare('UPDATE orders SET payment_lock_until=0 WHERE code=?').bind(row.code).run() }
}
export default {
  async fetch(request, env) {
    if (!new URL(request.url).pathname.startsWith('/api/')) return env.ASSETS.fetch(request)
    try { return await api(request, env) } catch (error) { console.error('API error:', error.name); return failure('Không thể xử lý yêu cầu. Vui lòng thử lại.', 500) }
  },
  async scheduled(event, env, ctx) { ctx.waitUntil(processNotifications(env)) },
}
