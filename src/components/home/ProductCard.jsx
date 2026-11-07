import { ArrowUpRight, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { useStore } from '../../features/cart/CartContext.jsx'
import { formatPrice } from '../../features/products/productData.js'
import ProductImage from './ProductImage.jsx'

export default function ProductCard({ product, index }) {
  const { addItem } = useStore()
  const url = `/san-pham/${product.id}`
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link className="product-image-link" to={url} aria-label={`Xem chi tiết ${product.name}`}><ProductImage product={product} loading="lazy" /></Link>
        {product.label && <span className="product-badge">{product.label}</span>}
        <button className="quick-add" type="button" onClick={() => addItem(product)} aria-label={`Thêm ${product.name} size M vào giỏ`}><Plus size={19} /></button>
      </div>
      <div className="product-details">
        <div><p className="product-category">{product.category} <span>· 0{index + 1}</span></p><h3><Link to={url}>{product.name}</Link></h3><p className="product-price">{formatPrice(product.price)}</p></div>
        <Link className="buy-now-link" to={url}>CHỌN SIZE <ArrowUpRight size={14} /></Link>
      </div>
    </article>
  )
}
