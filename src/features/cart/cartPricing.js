export const FREE_SHIPPING_FROM = 1000000
export const EXPRESS_FEE = 55000

export const itemCount = items => items.reduce((sum, item) => sum + item.quantity, 0)
export const itemsSubtotal = items => items.reduce((sum, item) => sum + item.price * item.quantity, 0)
export const standardShippingFee = subtotal => subtotal >= FREE_SHIPPING_FROM ? 0 : 30000
export const cartItemKey = item => `${item.id}:${item.size}`
