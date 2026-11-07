import { ArrowUpRight, Plus } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useStore } from '../../features/cart/CartContext.jsx'
import { formatPrice } from '../../features/products/productData.js'

export default function ProductCard({ product, index }) {
  const { addItem } = useStore()
  const navigate = useNavigate()
  const buyNow = () => {
    addItem(product)
    navigate('/thanh-toan')
  }
  return (
    <article className="product-card">
      <div className="product-image-wrap"><img src={product.image} alt={product.name} loading="lazy" />{product.label && <span className="product-badge">{product.label}</span>}<button className="quick-add" onClick={() => addItem(product)} aria-label={`Thêm ${product.name} size M vào giỏ`}><Plus size={19} /></button></div>
      <div className="product-details"><div><p className="product-category">{product.category} <span>· 0{index + 1}</span></p><h3>{product.name}</h3><p className="product-price">{formatPrice(product.price)}</p></div><button className="buy-now-link" onClick={buyNow}>MUA NGAY <ArrowUpRight size={14} /></button></div>
    </article>
  )
}
