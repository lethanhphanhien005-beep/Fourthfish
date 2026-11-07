async function request(path, token, options = {}) {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', 'X-Order-Token': token, ...options.headers } })
  let result
  try { result = await response.json() } catch { throw new Error('Chưa kết nối được máy chủ. Vui lòng thử lại.') }
  if (!response.ok) throw new Error(result.error || 'Không thể xử lý đơn hàng.')
  return result
}
const attemptKey = 'fourthfish-checkout-attempt'
function readCheckoutAttempt() {
  try { return JSON.parse(sessionStorage.getItem(attemptKey)) } catch { return null }
}
export function clearCheckoutAttempt(token) {
  if (readCheckoutAttempt()?.token === token) sessionStorage.removeItem(attemptKey)
}
export async function createOrder(payload, cartItems) {
  const fingerprint = JSON.stringify(payload)
  let attempt = readCheckoutAttempt()
  if (!attempt || attempt.fingerprint !== fingerprint) {
    attempt = { fingerprint, token: crypto.randomUUID(), cartItems }
    sessionStorage.setItem(attemptKey, JSON.stringify(attempt))
  }
  const result = await request('/api/orders', attempt.token, { method: 'POST', body: JSON.stringify(payload) })
  const saved = { ...result, token: attempt.token, cartItems: attempt.cartItems ?? cartItems }
  sessionStorage.setItem('fourthfish-last-order', JSON.stringify(saved))
  return saved
}
export const getOrder = ({ code, token }) => request(`/api/orders/${code}`, token)
export const createPayment = ({ code, token }) => request(`/api/orders/${code}/payment`, token, { method: 'POST' })
export function readOrder() {
  try { return JSON.parse(sessionStorage.getItem('fourthfish-last-order') || 'null') } catch { return null }
}
