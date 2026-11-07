import { Check, ChevronDown, CreditCard, MapPin, Truck } from 'lucide-react'
import { formatPrice } from '../../features/products/productData.js'
import { EXPRESS_FEE } from '../../features/cart/cartPricing.js'
import AddressForm from './AddressForm.jsx'

export function AddressSection({ address, setAddress, showAddressForm, setShowAddressForm }) {
  const saved = ['fullName', 'phone', 'city', 'district', 'ward', 'street'].every(key => address[key].trim())
  return <section className="checkout-section"><div className="checkout-section-heading"><span className="step-number">02</span><div><h2>Địa chỉ giao hàng</h2><p>Cho Fourthfish biết nơi bạn muốn nhận đơn.</p></div><MapPin size={18} /></div>
    {saved && !showAddressForm && <div className="saved-address"><div className="saved-address-top"><div><b>{address.fullName}</b><span>{address.phone}</span></div><span className="default-tag">{address.type.toUpperCase()}</span></div><p>{address.street}, {address.ward}, {address.district}, {address.city}</p>{address.note && <p className="saved-note">Ghi chú: {address.note}</p>}<button type="button" className="edit-address" onClick={() => setShowAddressForm(true)}>SỬA ĐỊA CHỈ</button></div>}
    {!saved && !showAddressForm && <div className="add-address-card"><p>Thêm địa chỉ nhận hàng để tiếp tục đặt mua.</p><button className="button button-black" type="button" onClick={() => setShowAddressForm(true)}>THÊM ĐỊA CHỈ <MapPin size={15} /></button></div>}
    {showAddressForm && <><AddressForm address={address} setAddress={setAddress} /><button className="save-address" type="button" disabled={!saved} onClick={() => setShowAddressForm(false)}>LƯU ĐỊA CHỈ <Check size={15} /></button></>}
  </section>
}

export function ShippingOptions({ shipping, setShipping, standardFee }) {
  return <section className="checkout-section"><div className="checkout-section-heading"><span className="step-number">03</span><div><h2>Vận chuyển</h2><p>Chọn thời gian giao phù hợp.</p></div><Truck size={18} /></div>
    <div className="option-list"><label className={`choice-option ${shipping === 'standard' ? 'selected' : ''}`}><input type="radio" name="shipping" checked={shipping === 'standard'} onChange={() => setShipping('standard')} /><span className="radio-dot" /><div className="option-copy"><b>Giao nhanh</b><span>Dự kiến 2–4 ngày làm việc</span></div><strong>{standardFee === 0 ? 'Miễn phí' : formatPrice(standardFee)}</strong></label><label className={`choice-option ${shipping === 'express' ? 'selected' : ''}`}><input type="radio" name="shipping" checked={shipping === 'express'} onChange={() => setShipping('express')} /><span className="radio-dot" /><div className="option-copy"><b>Hỏa tốc</b><span>Nhận trong ngày tại khu vực hỗ trợ</span></div><strong>{formatPrice(EXPRESS_FEE)}</strong></label></div>
  </section>
}

export function PaymentOptions({ payment, setPayment }) {
  return <section className="checkout-section"><div className="checkout-section-heading"><span className="step-number">04</span><div><h2>Phương thức thanh toán</h2><p>Chọn cách bạn muốn thanh toán.</p></div><CreditCard size={18} /></div>
    <div className="option-list"><label className={`choice-option ${payment === 'cod' ? 'selected' : ''}`}><input type="radio" name="payment" checked={payment === 'cod'} onChange={() => setPayment('cod')} /><span className="radio-dot" /><div className="option-copy"><b>Thanh toán khi nhận hàng</b><span>Tiền mặt hoặc chuyển khoản cho nhân viên giao hàng</span></div><span className="payment-code">COD</span></label><label className={`choice-option ${payment === 'vietqr' ? 'selected' : ''}`}><input type="radio" name="payment" checked={payment === 'vietqr'} onChange={() => setPayment('vietqr')} /><span className="radio-dot" /><div className="option-copy"><b>Chuyển khoản VietQR</b><span>Quét mã QR để thanh toán nhanh chóng</span></div><span className="payment-code">QR</span></label></div>
    {payment === 'vietqr' && <div className="qr-placeholder"><CreditCard size={28} /><div><b>Mã QR sẽ được tạo khi xác nhận đơn</b><p>Sử dụng ứng dụng ngân hàng để quét mã QR và kiểm tra thông tin người nhận.</p></div><ChevronDown size={16} /></div>}
  </section>
}
