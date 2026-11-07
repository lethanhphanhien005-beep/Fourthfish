import { ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import CartItem from '../components/cart/CartItem.jsx'
import OrderSummary from '../components/cart/OrderSummary.jsx'
import { useStore } from '../features/cart/CartContext.jsx'

const SHIPPING = 30000
const FREE_SHIPPING_FROM = 1000000

export default function CartPage() {
  const { items, subtotal, setQuantity, removeItem } = useStore()
  const navigate = useNavigate()
  const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING
  if (items.length === 0) return <section className="empty-state"><div className="empty-icon"><ShoppingBag size={26} /></div><p className="eyebrow">GIỎ HÀNG CỦA BẠN</p><h1>GIỎ ĐANG TRỐNG.</h1><p>Hãy chọn món đồ đồng hành cùng buổi tập tiếp theo.</p><Link className="button button-black" to="/">TIẾP TỤC MUA SẮM <ArrowRight size={16} /></Link></section>
  return <div className="page-shell cart-page">
    <div className="breadcrumb"><Link to="/">TRANG CHỦ</Link><span>/</span><span>GIỎ HÀNG</span></div>
    <div className="page-title-row"><div><p className="eyebrow">SẴN SÀNG CHO BƯỚC TIẾP THEO</p><h1>GIỎ HÀNG <span>({items.reduce((total, item) => total + item.quantity, 0)})</span></h1></div><Link className="back-link" to="/"><ArrowLeft size={15} /> TIẾP TỤC MUA SẮM</Link></div>
    <div className="cart-layout"><section className="cart-list"><div className="list-heading"><span>SẢN PHẨM</span><span>TỔNG</span></div>{items.map((item) => <CartItem key={`${item.id}-${item.size}`} item={item} setQuantity={setQuantity} removeItem={removeItem} />)}<div className="shipping-progress"><span>{subtotal >= FREE_SHIPPING_FROM ? '✓ BẠN ĐƯỢC MIỄN PHÍ VẬN CHUYỂN' : `CÒN ${new Intl.NumberFormat('vi-VN').format(FREE_SHIPPING_FROM - subtotal)}₫ ĐỂ ĐƯỢC MIỄN PHÍ VẬN CHUYỂN`}</span><div><i style={{ width: `${Math.min(subtotal / FREE_SHIPPING_FROM * 100, 100)}%` }} /></div></div></section>
      <OrderSummary subtotal={subtotal} shipping={shipping} total={subtotal + shipping} action={() => navigate('/thanh-toan')} actionLabel="MUA NGAY" note={subtotal >= FREE_SHIPPING_FROM ? 'Đơn hàng của bạn đã được miễn phí vận chuyển.' : `Miễn phí giao hàng cho đơn từ ${new Intl.NumberFormat('vi-VN').format(FREE_SHIPPING_FROM)}₫.`} />
    </div>
  </div>
}
