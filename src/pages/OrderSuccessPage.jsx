import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { ArrowRight, Check, RefreshCw } from 'lucide-react'
import { Link } from 'react-router'
import { formatPrice } from '../features/products/productData.js'
import { createPayment, getOrder, readOrder } from '../services/orderService.js'
import { useStore } from '../features/cart/CartContext.jsx'

export default function OrderSuccessPage() {
  const [saved] = useState(readOrder)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [qr, setQr] = useState('')
  const [retry, setRetry] = useState(0)
  const cleared = useRef(false)
  const { clearCart } = useStore()
  useEffect(() => {
    if (!saved?.token) return
    let active = true
    let timer
    async function load() {
      try {
        let result = await getOrder(saved)
        if (result.payment === 'vietqr' && result.status === 'awaiting_payment' && !result.paymentData) result = await createPayment(saved)
        if (!active) return
        setOrder(result)
        setError('')
        if (result.status === 'awaiting_payment') timer = setTimeout(load, 8000)
      } catch (e) { if (active) setError(e.message) }
    }
    load()
    return () => { active = false; clearTimeout(timer) }
  }, [saved, retry])
  useEffect(() => {
    if (order?.status === 'paid' && !cleared.current) {
      cleared.current = true
      clearCart()
      sessionStorage.removeItem('fourthfish-checkout-attempt')
    }
  }, [order?.status, clearCart])
  useEffect(() => {
    let active = true
    setQr('')
    if (order?.paymentData?.qrCode) QRCode.toDataURL(order.paymentData.qrCode, { width: 260, margin: 2 }).then(url => { if (active) setQr(url) })
    return () => { active = false }
  }, [order?.paymentData?.qrCode])
  const ready = order?.status === 'paid' || order?.status === 'confirmed'
  const awaiting = order?.status === 'awaiting_payment'
  const failed = ['cancelled', 'expired'].includes(order?.status)
  return <section className="success-page">
    <div className="success-stamp">{ready ? <Check size={28} /> : <RefreshCw size={24} />}</div>
    <p className="eyebrow">FOURTHFISH / {ready ? 'ĐƠN HÀNG ĐÃ XÁC NHẬN' : 'THANH TOÁN'}</p>
    <h1>{ready ? 'CẢM ƠN BẠN.' : awaiting ? 'QUÉT MÃ ĐỂ' : failed ? 'THANH TOÁN' : 'KIỂM TRA'}<br /><em>{ready ? 'SẴN SÀNG CHUYỂN ĐỘNG.' : awaiting ? 'THANH TOÁN.' : failed ? 'ĐÃ DỪNG.' : 'ĐƠN HÀNG.'}</em></h1>
    <p className="success-copy">{!saved?.token ? 'Không tìm thấy thông tin tra cứu trong trình duyệt này.' : ready ? order.status === 'paid' ? 'Fourthfish đã xác nhận thanh toán thành công.' : 'Đơn hàng đã được ghi nhận. Bạn thanh toán khi nhận hàng.' : failed ? 'Đơn hàng chưa được thanh toán. Giỏ hàng của bạn vẫn được giữ lại.' : 'Thông tin sẽ tự cập nhật sau khi ngân hàng xác nhận. Vui lòng không chuyển khoản lần nữa khi đang chờ.'}</p>
    {order && <div className="success-details"><div><span>MÃ ĐƠN HÀNG</span><b>FF{order.code}</b></div><div><span>TỔNG THANH TOÁN</span><b>{formatPrice(order.total)}</b></div><div><span>TRẠNG THÁI</span><b>{ready ? order.status === 'paid' ? 'ĐÃ THANH TOÁN' : 'COD / ĐÃ GHI NHẬN' : failed ? 'CHƯA THANH TOÁN' : 'CHỜ THANH TOÁN'}</b></div></div>}
    {awaiting && <div className="payment-panel">{qr && <img src={qr} alt={`Mã VietQR đơn FF${order.code}`} width="260" height="260" />}{order.paymentData?.accountName && <p>{order.paymentData.accountName}<br />{order.paymentData.accountNumber}</p>}{order.paymentData?.checkoutUrl && <a className="button button-black" href={order.paymentData.checkoutUrl}>MỞ TRANG THANH TOÁN PAYOS <ArrowRight size={16} /></a>}</div>}
    {error && <div className="form-error" role="alert">{error}<button type="button" className="button" onClick={() => setRetry(n => n + 1)}>THỬ LẠI</button></div>}
    {ready || failed || !saved ? <Link className="button button-black" to={failed ? '/gio-hang' : '/'}>{failed ? 'QUAY LẠI GIỎ HÀNG' : 'TIẾP TỤC MUA SẮM'} <ArrowRight size={16} /></Link> : null}
  </section>
}
