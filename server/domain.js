import { createHash } from 'node:crypto'

// Authoritative catalogue; never accept prices or totals from the browser.
export const catalogue = {
  'tempo-tee': { name: 'Áo chạy Tempo', price: 590000 },
  'motion-short': { name: 'Quần tập Motion', price: 690000 },
  'run-shell': { name: 'Áo khoác Run Shell', price: 1290000 },
  'core-top': { name: 'Áo tập Core', price: 520000 },
}
export const hash = (value) => createHash('sha256').update(value).digest('hex')
export function normalizeOrder(input) {
  if (!['cod', 'vietqr'].includes(input.payment) || !['standard', 'express'].includes(input.shipping)) throw new Error('Phương thức thanh toán hoặc vận chuyển không hợp lệ.')
  if (!Array.isArray(input.items) || !input.items.length || input.items.length > 40) throw new Error('Giỏ hàng không hợp lệ.')
  const items = input.items.map(({ id, size, quantity }) => {
    const product = catalogue[id]
    if (!product || !['S', 'M', 'L', 'XL', 'XXL'].includes(size) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error('Sản phẩm, size hoặc số lượng không hợp lệ.')
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
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = input.shipping === 'express' ? 55000 : subtotal >= 1000000 ? 0 : 30000
  return { items, address, email, smsConsent: input.smsConsent === true, payment: input.payment, shipping: input.shipping, subtotal, shippingCost, total: subtotal + shippingCost }
}
