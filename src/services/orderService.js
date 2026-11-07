async function request(path, token, options = {}) {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', 'X-Order-Token': token, ...options.headers } })
  let result
  try { result = await response.json() } catch { throw new Error('Chưa kết nối được máy chủ. Vui lòng thử lại.') }
  if (!response.ok) throw new Error(result.error || 'Không thể xử lý đơn hàng.')
  return result
}
export async function createOrder(payload) {
  const fingerprint = JSON.stringify(payload)
  let attempt
  try { attempt = JSON.parse(sessionStorage.getItem('fourthfish-checkout-attempt')) } catch { /* New attempt. */ }
  if (!attempt || attempt.fingerprint !== fingerprint) {
    attempt = { fingerprint, token: crypto.randomUUID() }
    sessionStorage.setItem('fourthfish-checkout-attempt', JSON.stringify(attempt))
  }
  const result = await request('/api/orders', attempt.token, { method: 'POST', body: JSON.stringify(payload) })
  const saved = { ...result, token: attempt.token }
  sessionStorage.setItem('fourthfish-last-order', JSON.stringify(saved))
  return saved
}
export const getOrder = ({ code, token }) => request(`/api/orders/${code}`, token)
export const createPayment = ({ code, token }) => request(`/api/orders/${code}/payment`, token, { method: 'POST' })
export function readOrder() {
  try { return JSON.parse(sessionStorage.getItem('fourthfish-last-order') || 'null') } catch { return null }
}
