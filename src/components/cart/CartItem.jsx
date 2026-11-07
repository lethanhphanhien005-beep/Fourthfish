import { X } from 'lucide-react'
import { Link } from 'react-router'
import ProductImage from '../home/ProductImage.jsx'
import QuantityStepper from './QuantityStepper.jsx'
import { formatPrice } from '../../features/products/productData.js'

export default function CartItem({ item, setQuantity, removeItem, compact = false }) {
  return <article className={`cart-item ${compact ? 'cart-item-compact' : ''}`}>
    <Link className="cart-item-photo" to={`/san-pham/${item.id}`} aria-label={`Xem ${item.name}`}><ProductImage product={item} /></Link>
    <div className="cart-item-info"><div className="cart-item-title"><div><p className="product-category">{item.category}</p><h3><Link to={`/san-pham/${item.id}`}>{item.name}</Link></h3></div>{!compact && <button className="remove-item" onClick={() => removeItem(item.id, item.size)} aria-label={`Xóa ${item.name}`}><X size={17} /></button>}</div>
      <p className="cart-item-meta">Màu: Đen <span>·</span> Size: {item.size}</p>
      <div className="cart-item-bottom"><QuantityStepper value={item.quantity} onChange={(value) => setQuantity(item.id, item.size, value)} /><b>{formatPrice(item.price * item.quantity)}</b></div>
    </div>
  </article>
}
