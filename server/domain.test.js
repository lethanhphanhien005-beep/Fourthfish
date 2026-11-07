import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeOrder } from './domain.js'
const payload = () => ({ items: [{ id: 'tempo-tee', size: 'M', quantity: 1, price: 1 }], address: { fullName: 'Test', phone: '0912345678', city: 'Hà Nội', district: 'Đống Đa', ward: 'A', street: '1 Test' }, email: 'test@example.com', payment: 'vietqr', shipping: 'standard' })
test('server ignores client prices and applies shipping', () => { const order = normalizeOrder(payload()); assert.equal(order.total, 620000); assert.equal(order.address.phone, '+84912345678') })
test('standard free shipping; express remains charged', () => { const p = payload(); p.items[0].quantity = 2; assert.equal(normalizeOrder(p).shippingCost, 0); p.shipping = 'express'; assert.equal(normalizeOrder(p).shippingCost, 55000) })
test('reject bad quantity, unknown product, duplicate line, invalid contact', () => {
  for (const mutate of [p => p.items[0].quantity = -1, p => p.items[0].quantity = 1.5, p => p.items[0].id = 'fake', p => p.items.push(p.items[0]), p => p.address.phone = 'bad', p => p.email = '<bad>']) {
    const p = payload(); mutate(p); assert.throws(() => normalizeOrder(p))
  }
})
