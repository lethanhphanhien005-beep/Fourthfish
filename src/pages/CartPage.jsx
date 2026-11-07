import { useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import CartItem from '../components/cart/CartItem.jsx'
import OrderSummary from '../components/cart/OrderSummary.jsx'
import { useStore } from '../features/cart/CartContext.jsx'
import { cartItemKey, FREE_SHIPPING_FROM, itemCount, itemsSubtotal, standardShippingFee } from '../features/cart/cartPricing.js'
import { formatPrice } from '../features/products/productData.js'

export default function CartPage() {
  const { items, count, setQuantity, removeItem, setSelected, selectAll } = useStore()
  const navigate = useNavigate()
  const selectAllRef = useRef(null)
  const selected = items.filter(item => item.selected)
  const allChecked = items.length > 0 && selected.length === items.length
  const partiallyChecked = selected.length > 0 && !allChecked
  const subtotal = itemsSubtotal(selected)
  const shipping = selected.length ? standardShippingFee(subtotal) : 0

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = partiallyChecked
  }, [partiallyChecked])

  if (!items.length) return <section className="empty-state">
    <div className="empty-icon"><ShoppingBag size={26} /></div>
    <p className="eyebrow">GIỎ HÀNG CỦA BẠN</p><h1>GIỎ ĐANG TRỐNG.</h1>
    <p>Hãy chọn món đồ đồng hành cùng buổi tập tiếp theo.</p>
    <Link className="button button-black" to="/san-pham">TIẾP TỤC MUA SẮM <ArrowRight size={16} /></Link>
  </section>

  return <div className="page-shell cart-page">
    <nav className="breadcrumb" aria-label="Đường dẫn"><Link to="/">TRANG CHỦ</Link><span>/</span><span>GIỎ HÀNG</span></nav>
    <div className="page-title-row">
      <div><p className="eyebrow">SẴN SÀNG CHO BƯỚC TIẾP THEO</p><h1>GIỎ HÀNG <span className="cart-title-count">({count})</span></h1></div>
      <Link className="back-link" to="/san-pham"><ArrowLeft size={15} /> TIẾP TỤC MUA SẮM</Link>
    </div>
    <div className="cart-layout">
      <section className="cart-list" aria-label="Sản phẩm trong giỏ">
        <div className="list-heading"><span>SẢN PHẨM</span><span>THÀNH TIỀN</span></div>
        {items.map(item => <CartItem key={cartItemKey(item)} item={item} setQuantity={setQuantity} removeItem={removeItem} onSelect={checked => setSelected(cartItemKey(item), checked)} />)}
      </section>
      <OrderSummary subtotal={subtotal} shipping={shipping} note={`Áp dụng cho sản phẩm đã chọn. Miễn phí giao nhanh từ ${formatPrice(FREE_SHIPPING_FROM)}.`} />
    </div>
    <div className="cart-buy-bar">
      <label className="select-all-label"><input ref={selectAllRef} type="checkbox" checked={allChecked} onChange={event => selectAll(event.target.checked)} /> Chọn tất cả</label>
      <div className="cart-buy-total" aria-live="polite"><span>Đã chọn {itemCount(selected)} sản phẩm</span><strong>{formatPrice(subtotal + shipping)}</strong></div>
      <button type="button" className="button button-black" onClick={() => navigate('/thanh-toan')} disabled={!selected.length}>MUA NGAY <ArrowRight size={16} /></button>
    </div>
  </div>
}
