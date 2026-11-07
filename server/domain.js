import { createHash } from 'node:crypto'

import { products, productSizes } from '../src/features/products/productData.js'
import { EXPRESS_FEE, itemsSubtotal, standardShippingFee } from '../src/features/cart/cartPricing.js'

// Read prices from the shared catalogue. Ignore prices submitted by the browser.
export const catalogue = Object.fromEntries(products.map(({ id, name, price }) => [id, { name, price }]))
export const hash = (value) => createHash('sha256').update(value).digest('hex')
export function normalizeOrder(input) {
  if (!['cod', 'vietqr'].includes(input.payment) || !['standard', 'express'].includes(input.shipping)) throw new Error('Phương thức thanh toán hoặc vận chuyển không hợp lệ.')
  if (!Array.isArray(input.items) || !input.items.length || input.items.length > 40) throw new Error('Giỏ hàng không hợp lệ.')
  const items = input.items.map(({ id, size, quantity }) => {
    const product = Object.hasOwn(catalogue, id) && catalogue[id]
    if (!product || !productSizes.includes(size) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error('Sản phẩm, size hoặc số lượng không hợp lệ.')
    return { id, size, quantity, ...product }
  }).sort((a, b) => `${a.id}:${a.size}`.localeCompare(`${b.id}:${b.size}`))
  if (new Set(items.map(i => `${i.id}:${i.size}`)).size !== items.length) throw new Error('Sản phẩm trùng trong giỏ hàng.')
  const address = {}
  for (const field of ['fullName', 'phone', 'city', 'district', 'ward', 'street']) {
    if (typeof input.address?.[field] !== 'string' || !input.address[field].trim() || input.address[field].length > 200) throw new Error('Vui lòng điền đầy đủ địa chỉ giao hàng.')
    address[field] = input.address[field].trim()
  }
  address.phone = address.phone.replace(/[\s.-]/g, '').replace(/^0/, '+84')
  if (!/^\+84[35789]\d{8}$/.test(address.phone)) throw new Error('Số điện thoại Việt Nam không hợp lệ.')
  address.note = String(input.address.note || '').slice(0, 500)
  address.type = input.address.type === 'Văn phòng' ? 'Văn phòng' : 'Nhà riêng'
  for (const field of ['isDefault', 'isPickupAddress', 'isReturnAddress']) address[field] = input.address[field] === true
  const email = String(input.email || '').trim().toLowerCase()
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email nhận xác nhận không hợp lệ.')
  const subtotal = itemsSubtotal(items)
  const shippingCost = input.shipping === 'express' ? EXPRESS_FEE : standardShippingFee(subtotal)
  return { items, address, email, smsConsent: input.smsConsent === true, payment: input.payment, shipping: input.shipping, subtotal, shippingCost, total: subtotal + shippingCost }
}
