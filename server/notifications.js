import { db, findOrder } from './db.js'
let running = false
export async function processNotifications() {
  if (running) return
  running = true
  try {
    // Email retries stay inside Resend's 24-hour idempotency window.
    const rows = db.prepare("SELECT * FROM notifications WHERE state='pending' AND attempts<5 AND created_at>? LIMIT 10").all(Date.now() - 20 * 60 * 60 * 1000)
    for (const task of rows) {
      if (process.env.NOTIFICATIONS_ENABLED !== 'true') continue
      if (task.channel === 'email' && !process.env.RESEND_API_KEY) continue
      if (task.channel === 'sms' && (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM)) continue
      const claim = db.prepare("UPDATE notifications SET state='sending', attempts=attempts+1 WHERE id=? AND state='pending'").run(task.id)
      if (!claim.changes) continue
      const row = findOrder(task.order_code)
      const order = JSON.parse(row.body)
      const message = `FOURTHFISH: Don FF${row.code} ${row.status === 'paid' ? 'da thanh toan' : 'da duoc ghi nhan'}. Tong ${new Intl.NumberFormat('vi-VN').format(order.total)} VND.`
      try {
        let response
        if (task.channel === 'email') {
          response = await fetch('https://api.resend.com/emails', {
            method: 'POST', signal: AbortSignal.timeout(15000),
            headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `fourthfish-order-${row.code}` },
            body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [order.email], subject: `Fourthfish — xác nhận đơn FF${row.code}`, text: `${message}\n\nCảm ơn bạn đã chọn Fourthfish. Địa chỉ giao hàng: ${order.address.street}, ${order.address.ward}, ${order.address.district}, ${order.address.city}.` }),
          })
        } else {
          response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
            method: 'POST', signal: AbortSignal.timeout(15000),
            headers: { Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ To: order.address.phone, From: process.env.TWILIO_FROM, Body: message }),
          })
        }
        const result = await response.json()
        if (!response.ok) throw new Error('Provider rejected notification')
        db.prepare("UPDATE notifications SET state='accepted', provider_id=? WHERE id=?").run(result.id || result.sid, task.id)
      } catch {
        // Twilio has no create-message idempotency guarantee; ambiguous SMS needs manual reconciliation.
        db.prepare('UPDATE notifications SET state=? WHERE id=?').run(task.channel === 'email' ? 'pending' : 'review_required', task.id)
      }
    }
  } finally { running = false }
}
