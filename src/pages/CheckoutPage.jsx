import { useRef, useState } from 'react'
import { createOrder } from '../services/orderService.js'
import { ArrowLeft, ArrowRight, PackageCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import CartItem from '../components/cart/CartItem.jsx'
import { AddressSection, PaymentOptions, ShippingOptions } from '../components/checkout/CheckoutSections.jsx'
import { useStore } from '../features/cart/CartContext.jsx'
import { formatPrice } from '../features/products/productData.js'

const initialAddress = { fullName: '', phone: '', city: '', district: '', ward: '', street: '', note: '', isDefault: false, isPickupAddress: false, isReturnAddress: false, type: 'Nhà riêng' }

export default function CheckoutPage() {
  const { items, subtotal, setQuantity, removeItem, clearCart } = useStore()
  const [address, setAddress] = useState(initialAddress)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [shipping, setShipping] = useState('standard')
  const [payment, setPayment] = useState('cod')
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [smsConsent, setSmsConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const submitLock = useRef(false)
  const navigate = useNavigate()
  const standardFee = subtotal >= 1000000 ? 0 : 30000
  const shippingCost = shipping === 'express' ? 55000 : standardFee
  const total = subtotal + shippingCost

  if (!items.length) return <section className="empty-state"><div className="empty-icon"><PackageCheck size={26} /></div><p className="eyebrow">CHƯA CÓ SẢN PHẨM</p><h1>GIỎ HÀNG ĐANG TRỐNG.</h1><p>Thêm sản phẩm vào giỏ trước khi thanh toán.</p><Link className="button button-black" to="/">QUAY LẠI CỬA HÀNG <ArrowRight size={16} /></Link></section>

  const submitOrder = async (event) => {
    event.preventDefault()
    const required = ['fullName', 'phone', 'city', 'district', 'ward', 'street']
    if (required.some((key) => !address[key].trim())) {
      setShowAddressForm(true)
      setError('Vui lòng điền đầy đủ thông tin địa chỉ giao hàng.')
      window.scrollTo({ top: 360, behavior: 'smooth' })
      return
    }
    if (submitLock.current) return
    submitLock.current = true
    setSubmitting(true)
    setError('')
    try {
      const order = await createOrder({
        items: items.map(({ id, size, quantity }) => ({ id, size, quantity })),
        address, email, smsConsent, payment, shipping,
      })
      if (order.payment === 'cod') { clearCart(); sessionStorage.removeItem('fourthfish-checkout-attempt') }
      navigate(order.payment === 'cod' ? '/dat-hang-thanh-cong' : '/thanh-toan/chuyen-khoan')
    } catch (error) { setError(error.message) }
    finally { submitLock.current = false; setSubmitting(false) }
  }

  return <div className="page-shell checkout-page">
    <div className="breadcrumb"><Link to="/">TRANG CHỦ</Link><span>/</span><Link to="/gio-hang">GIỎ HÀNG</Link><span>/</span><span>THANH TOÁN</span></div>
    <div className="page-title-row"><div><p className="eyebrow">MỘT BƯỚC NỮA LÀ SẴN SÀNG</p><h1>THANH TOÁN</h1></div><Link className="back-link" to="/gio-hang"><ArrowLeft size={15} /> QUAY LẠI GIỎ</Link></div>
    <form className={`checkout-layout ${submitting ? 'is-submitting' : ''}`} onSubmit={submitOrder}>
      <div className="checkout-main">
        <section className="checkout-section"><label className="form-field"><span>Email nhận xác nhận đơn hàng *</span><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ban@example.com" /></label><label className="sms-consent"><input type="checkbox" checked={smsConsent} onChange={(event) => setSmsConsent(event.target.checked)} /> Nhận thêm SMS cập nhật đơn hàng</label></section>
        <AddressSection address={address} setAddress={setAddress} showAddressForm={showAddressForm} setShowAddressForm={setShowAddressForm} />
        <ShippingOptions shipping={shipping} setShipping={setShipping} standardFee={standardFee} />
        <PaymentOptions payment={payment} setPayment={setPayment} />
      </div>
      <aside className="checkout-review"><div className="review-heading"><div><p className="eyebrow">KIỂM TRA LẦN CUỐI</p><h2>ĐƠN HÀNG CỦA BẠN</h2></div><span>{items.reduce((sum, item) => sum + item.quantity, 0)} MÓN</span></div>
        <div className="review-items">{items.map((item) => <CartItem key={`${item.id}-${item.size}`} item={item} setQuantity={setQuantity} removeItem={removeItem} compact />)}</div>
        <div className="review-calculations"><div><span>Tạm tính</span><b>{formatPrice(subtotal)}</b></div><div><span>Vận chuyển · {shipping === 'express' ? 'Hỏa tốc' : 'Nhanh'}</span><b>{shippingCost === 0 ? 'MIỄN PHÍ' : formatPrice(shippingCost)}</b></div><div className="review-total"><span>TỔNG CỘNG</span><b>{formatPrice(total)}</b></div></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" disabled={submitting} className="button button-black summary-cta">{submitting ? 'ĐANG TẠO ĐƠN...' : payment === 'vietqr' ? 'TIẾP TỤC THANH TOÁN' : 'ĐẶT HÀNG'} <ArrowRight size={17} /></button>
        <p className="terms-copy">Bằng việc đặt hàng, bạn đồng ý với <a href="#terms">Điều khoản mua hàng</a> và <a href="#privacy">Chính sách bảo mật</a> của Fourthfish.</p>
      </aside>
    </form>
  </div>
}
