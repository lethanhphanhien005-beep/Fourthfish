import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { PayOS } from '@payos/node'
import { api } from './worker.js'
function database() {
  const sqlite = new DatabaseSync(':memory:')
  sqlite.exec(readFileSync(new URL('./migrations/0001_orders.sql', import.meta.url), 'utf8'))
  return {
    prepare(sql) {
      let params = []
      const query = {
        bind(...values) { params = values; return query },
        async first() { return sqlite.prepare(sql).get(...params) || null },
        async all() { return { results: sqlite.prepare(sql).all(...params) } },
        async run() { const result = sqlite.prepare(sql).run(...params); return { meta: { changes: Number(result.changes) } } },
      }
      return query
    },
    async batch(statements) {
      sqlite.exec('BEGIN')
      try { const results = []; for (const s of statements) results.push(await s.run()); sqlite.exec('COMMIT'); return results }
      catch(e) { sqlite.exec('ROLLBACK'); throw e }
    },
  }
}
const payload = () => ({ items: [{ id: 'tempo-tee', size: 'M', quantity: 1, price: 1 }], address: { fullName: 'Test', phone: '0912345678', city: 'Hà Nội', district: 'A', ward: 'B', street: '1 Test' }, email: 'test@example.com', payment: 'cod', shipping: 'standard', total: 1 })
const environment = () => ({ DB: database(), STORE_ENABLED: 'true', APP_ORIGIN: 'https://fourthfish.example', API_LIMITER: { limit: async () => ({ success: true }) } })
const request = (path, token, data) => new Request(`https://fourthfish.example${path}`, { method: data ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', 'X-Order-Token': token, Origin: 'https://fourthfish.example' }, ...(data ? { body: JSON.stringify(data) } : {}) })
test('COD create, idempotent retry, privacy, changed payload conflict', async () => {
  const env = environment(), token = randomUUID(), input = payload()
  const first = await api(request('/api/orders', token, input), env)
  assert.equal(first.status, 201)
  const order = await first.json()
  assert.equal(order.total, 620000)
  assert.equal(order.status, 'confirmed')
  const retry = await api(request('/api/orders', token, input), env)
  assert.equal((await retry.json()).code, order.code)
  assert.equal((await env.DB.prepare('SELECT count(*) AS n FROM notifications').first()).n, 1)
  assert.equal((await api(request(`/api/orders/${order.code}`, randomUUID()), env)).status, 404)
  input.items[0].quantity = 2
  assert.equal((await api(request('/api/orders', token, input), env)).status, 409)
})
test('unconfigured and disabled store fails closed; missing QR keys rejected', async () => {
  const env = environment(), token = randomUUID()
  env.STORE_ENABLED = 'false'
  assert.equal((await api(request('/api/orders', token, payload()), env)).status, 503)
  env.STORE_ENABLED = 'true'
  assert.equal((await api(request('/api/orders', token, { ...payload(), payment: 'vietqr' }), env)).status, 503)
})
test('PayOS registration sample signature verified; tampered amount rejected', async () => {
  const env = { ...environment(), PAYOS_CLIENT_ID: 'test', PAYOS_API_KEY: 'test', PAYOS_CHECKSUM_KEY: 'test' }
  const p = new PayOS({ clientId: 'test', apiKey: 'test', checksumKey: 'test', logLevel: 'off' })
  const data = { orderCode: 123, amount: 1000, description: 'test', accountNumber: '123', reference: 'test', transactionDateTime: '2026-11-07 10:00:00', currency: 'VND', paymentLinkId: 'test', code: '00', desc: 'success', counterAccountBankId: '', counterAccountBankName: '', counterAccountName: '', counterAccountNumber: '', virtualAccountName: '', virtualAccountNumber: '' }
  const signature = await p.crypto.createSignatureFromObj(data, 'test')
  const body = { code: '00', desc: 'success', success: true, data, signature }
  assert.equal((await api(request('/api/webhooks/payos', '', body), env)).status, 200)
  assert.equal((await api(request('/api/webhooks/payos', '', { ...body, data: { ...data, amount: 99999 } }), env)).status, 400)
})
