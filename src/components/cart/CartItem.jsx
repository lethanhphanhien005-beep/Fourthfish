import { X } from 'lucide-react'
import { Link } from 'react-router'
import ProductImage from '../home/ProductImage.jsx'
import QuantityStepper from './QuantityStepper.jsx'
import { formatPrice } from '../../features/products/productData.js'

export default function CartItem({ item, setQuantity, removeItem, onSelect, compact = false }) {
  const variant = `${item.name}, size ${item.size}`

  return <article className={`cart-item ${compact ? 'cart-item-compact' : ''} ${onSelect ? 'cart-item-selectable' : ''}`}>
    {onSelect && <label className="cart-item-select">
      <input type="checkbox" checked={item.selected} onChange={event => onSelect(event.target.checked)} aria-label={`Chọn ${variant}`} />
    </label>}
    <Link className="cart-item-photo" to={`/san-pham/${item.id}`} aria-label={`Xem ${item.name}`}><ProductImage product={item} /></Link>
    <div className="cart-item-info">
      <div className="cart-item-title">
        <div><p className="product-category">{item.category}</p><h3><Link to={`/san-pham/${item.id}`}>{item.name}</Link></h3></div>
        {removeItem && <button type="button" className="remove-item" onClick={() => removeItem(item.id, item.size)} aria-label={`Xóa ${variant}`}><X size={17} /></button>}
      </div>
      <p className="cart-item-meta">{item.color} <span>·</span> Size {item.size}</p>
      <div className="cart-item-bottom">
        {setQuantity ? <QuantityStepper value={item.quantity} label={`Số lượng ${variant}`} onChange={value => setQuantity(item.id, item.size, value)} /> : <span>Số lượng {item.quantity}</span>}
        <b>{formatPrice(item.price * item.quantity)}</b>
      </div>
    </div>
  </article>
}
