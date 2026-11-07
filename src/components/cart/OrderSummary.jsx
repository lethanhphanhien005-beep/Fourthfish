import { formatPrice } from '../../features/products/productData.js'

export default function OrderSummary({ subtotal, shipping, note }) {
  return <aside className="order-summary">
    <h2>Tóm tắt đơn hàng</h2>
    <div className="summary-row"><span>Tạm tính</span><b>{formatPrice(subtotal)}</b></div>
    <div className="summary-row"><span>Phí giao hàng dự kiến</span><b>{shipping ? formatPrice(shipping) : '0₫'}</b></div>
    <div className="summary-total"><span>Tổng cộng</span><b>{formatPrice(subtotal + shipping)}</b></div>
    <p className="summary-note">{note}</p>
  </aside>
}
