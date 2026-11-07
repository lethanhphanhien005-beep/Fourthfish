import { formatPrice } from '../../features/products/productData.js'

export default function OrderSummary({ subtotal, shipping, total, action, actionLabel, disabled = false, note = 'Phí giao hàng được tính theo hình thức vận chuyển bạn chọn.' }) {
  return <aside className="order-summary">
    <p className="eyebrow">TÓM TẮT ĐƠN HÀNG</p>
    <div className="summary-row"><span>Tạm tính</span><b>{formatPrice(subtotal)}</b></div>
    <div className="summary-row"><span>Phí vận chuyển</span><b>{shipping === null ? 'Tính ở bước sau' : formatPrice(shipping)}</b></div>
    <div className="summary-total"><span>Tổng cộng</span><b>{total === null ? formatPrice(subtotal) : formatPrice(total)}</b></div>
    <p className="summary-note">{note}</p>
    <button className="button button-black summary-cta" onClick={action} disabled={disabled}>{actionLabel}</button>
    <div className="secure-note">✓ THANH TOÁN AN TOÀN · ĐỔI TRẢ TRONG 30 NGÀY</div>
  </aside>
}
