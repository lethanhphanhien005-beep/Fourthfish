export async function processNotifications(env) {
  if (env.NOTIFICATIONS_ENABLED !== 'true') return
  const db = env.DB
  const now = Date.now()
  // Recover interrupted email safely; interrupted SMS requires provider reconciliation.
  await db.batch([
    db.prepare("UPDATE notifications SET state='pending' WHERE state='sending' AND channel='email' AND lease_until<?").bind(now),
    db.prepare("UPDATE notifications SET state='review_required' WHERE state='sending' AND channel='sms' AND lease_until<?").bind(now),
  ])
  const { results } = await db.prepare("SELECT * FROM notifications WHERE state='pending' AND attempts<5 AND created_at>? ORDER BY id LIMIT 10").bind(now - 20 * 3600000).all()
  for (const task of results) {
    if (task.channel === 'email' && (!env.RESEND_API_KEY || !env.EMAIL_FROM)) continue
    if (task.channel === 'sms' && (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM)) continue
    const claim = await db.prepare("UPDATE notifications SET state='sending', attempts=attempts+1, lease_until=? WHERE id=? AND state='pending'").bind(Date.now() + 120000, task.id).run()
    if (!claim.meta.changes) continue
    const row = await db.prepare('SELECT * FROM orders WHERE code=?').bind(task.order_code).first()
    const order = JSON.parse(row.body)
    const message = `FOURTHFISH: Don FF${row.code} ${row.status === 'paid' ? 'da thanh toan' : 'da duoc ghi nhan'}. Tong ${new Intl.NumberFormat('vi-VN').format(order.total)} VND.`
    try {
      let response
      if (task.channel === 'email') {
        response = await fetch('https://api.resend.com/emails', {
          method: 'POST', signal: AbortSignal.timeout(15000),
          headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `fourthfish-production-${row.code}` },
          body: JSON.stringify({ from: env.EMAIL_FROM, to: [order.email], subject: `Fourthfish — xác nhận đơn FF${row.code}`, text: `${message}\n\nCảm ơn bạn đã chọn Fourthfish. Địa chỉ: ${order.address.street}, ${order.address.ward}, ${order.address.district}, ${order.address.city}.` }),
        })
      } else {
        response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
          method: 'POST', signal: AbortSignal.timeout(15000),
          headers: { Authorization: `Basic ${btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ To: order.address.phone, From: env.TWILIO_FROM, Body: message }),
        })
      }
      const result = await response.json()
      if (!response.ok || !(result.id || result.sid)) throw new Error('Provider rejected request')
      await db.prepare("UPDATE notifications SET state='accepted',provider_id=? WHERE id=?").bind(result.id || result.sid, task.id).run()
    } catch {
      await db.prepare('UPDATE notifications SET state=? WHERE id=?').bind(task.channel === 'email' ? 'pending' : 'review_required', task.id).run()
    }
  }
}
