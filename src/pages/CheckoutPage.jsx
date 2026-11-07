import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Mail, PackageCheck } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { clearCheckoutAttempt, createOrder } from '../services/orderService.js'
import CartItem from '../components/cart/CartItem.jsx'
import { AddressSection, PaymentOptions, ShippingOptions } from '../components/checkout/CheckoutSections.jsx'
import { useStore } from '../features/cart/CartContext.jsx'
import { cartItemKey, EXPRESS_FEE, itemCount, itemsSubtotal, standardShippingFee } from '../features/cart/cartPricing.js'
import { formatPrice, products, productSizes } from '../features/products/productData.js'

const initialAddress = { fullName: '', phone: '', city: '', district: '', ward: '', street: '', note: '', isDefault: false, isPickupAddress: false, isReturnAddress: false, type: 'Nhà riêng' }

export default function CheckoutPage() {
  const { items: cart, setQuantity, completeCartOrder } = useStore()
  const [params] = useSearchParams()
  const directPurchase = params.has('mua')
  const product = products.find(item => item.id === params.get('mua'))
  const size = params.get('size')
  const directItem = product && productSizes.includes(size) ? [{ ...product, size, quantity: 1 }] : []
  const items = directPurchase ? directItem : cart.filter(item => item.selected)
  const subtotal = itemsSubtotal(items)

  const [address, setAddress] = useState(initialAddress)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [shipping, setShipping] = useState('standard')
  const [payment, setPayment] = useState('cod')
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [smsConsent, setSmsConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const submitLock = useRef(false)
  const addressCard = useRef(null)
  const navigate = useNavigate()
  const standardFee = standardShippingFee(subtotal)
  const shippingCost = shipping === 'express' ? EXPRESS_FEE : standardFee
  const total = subtotal + shippingCost

  if (!items.length) return <section className="empty-state">
    <div className="empty-icon"><PackageCheck size={26} /></div>
    <p className="eyebrow">THANH TOÁN</p><h1>CHƯA CÓ SẢN PHẨM ĐƯỢC CHỌN</h1>
    <p>Chọn sản phẩm và size để tiếp tục thanh toán.</p>
    <Link className="button button-black" to={cart.length ? '/gio-hang' : '/san-pham'}>{cart.length ? 'QUAY LẠI GIỎ HÀNG' : 'KHÁM PHÁ SẢN PHẨM'} <ArrowRight size={16} /></Link>
  </section>

  async function submitOrder(event) {
    event.preventDefault()
    if (submitLock.current) return
    const required = ['fullName', 'phone', 'city', 'district', 'ward', 'street']
    if (required.some(key => !address[key].trim())) {
      setShowAddressForm(true)
      setError('Vui lòng điền đầy đủ thông tin địa chỉ giao hàng.')
      addressCard.current?.scrollIntoView({ block: 'start' })
      return
    }
    submitLock.current = true
    setSubmitting(true)
    setError('')
    const lines = items.map(({ id, size, quantity }) => ({ id, size, quantity }))
    const purchasedCartItems = directPurchase ? [] : lines
    try {
      const order = await createOrder({ items: lines, address, email, smsConsent, payment, shipping }, purchasedCartItems)
      if (order.payment === 'cod') {
        completeCartOrder(order.code, order.cartItems)
        clearCheckoutAttempt(order.token)
      }
      navigate(order.payment === 'cod' ? '/dat-hang-thanh-cong' : '/thanh-toan/chuyen-khoan')
    } catch (error) {
      setError(error.message)
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

  return <div className="page-shell checkout-page">
    <nav className="breadcrumb" aria-label="Đường dẫn"><Link to="/">TRANG CHỦ</Link><span>/</span><Link to="/gio-hang">GIỎ HÀNG</Link><span>/</span><span>THANH TOÁN</span></nav>
    <div className="page-title-row">
      <div><p className="eyebrow">FOURTHFISH CHECKOUT</p><h1>THANH TOÁN</h1><p className="checkout-intro">Điền thông tin nhận hàng và kiểm tra đơn trước khi đặt.</p></div>
      <Link className="back-link" to="/gio-hang"><ArrowLeft size={15} /> QUAY LẠI GIỎ</Link>
    </div>
    <form className="checkout-layout" onSubmit={submitOrder}>
      <fieldset className="checkout-main" disabled={submitting}>
        <legend className="sr-only">Thông tin giao hàng và thanh toán</legend>
        <section className="checkout-section">
          <div className="checkout-section-heading"><span className="step-number">01</span><div><h2>Thông tin liên hệ</h2><p>Nhận xác nhận và cập nhật về đơn hàng.</p></div><Mail size={20} /></div>
          <label className="form-field"><span>Email xác nhận đơn hàng *</span><input type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="ban@example.com" autoComplete="email" /></label>
          <label className="sms-consent"><input type="checkbox" checked={smsConsent} onChange={event => setSmsConsent(event.target.checked)} /> Nhận thêm SMS cập nhật đơn hàng</label>
        </section>
        <div ref={addressCard} className="checkout-address-anchor"><AddressSection address={address} setAddress={setAddress} showAddressForm={showAddressForm} setShowAddressForm={setShowAddressForm} /></div>
        <ShippingOptions shipping={shipping} setShipping={setShipping} standardFee={standardFee} />
        <PaymentOptions payment={payment} setPayment={setPayment} />
      </fieldset>
      <aside className="checkout-review" aria-label="Tóm tắt đơn hàng">
        <div className="review-heading"><div><p className="eyebrow">KIỂM TRA LẦN CUỐI</p><h2>Đơn hàng của bạn</h2></div><span>{itemCount(items)} sản phẩm</span></div>
        <div className="review-items">{items.map(item => <CartItem key={cartItemKey(item)} item={item} setQuantity={directPurchase || submitting ? undefined : setQuantity} compact />)}</div>
        <div className="review-calculations">
          <div><span>Tạm tính</span><b>{formatPrice(subtotal)}</b></div>
          <div><span>Giao {shipping === 'express' ? 'hỏa tốc' : 'nhanh'}</span><b>{shippingCost ? formatPrice(shippingCost) : 'Miễn phí'}</b></div>
          <div className="review-total"><span>Tổng thanh toán</span><b>{formatPrice(total)}</b></div>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" disabled={submitting} className="button button-black summary-cta">{submitting ? 'ĐANG TẠO ĐƠN...' : payment === 'vietqr' ? 'TIẾP TỤC THANH TOÁN' : 'ĐẶT HÀNG'} <ArrowRight size={17} /></button>
        <p className="terms-copy">{payment === 'cod' ? 'Bạn sẽ thanh toán khi nhận hàng.' : 'Bạn sẽ nhận mã VietQR để chuyển khoản ở bước tiếp theo.'}</p>
      </aside>
    </form>
  </div>
}
