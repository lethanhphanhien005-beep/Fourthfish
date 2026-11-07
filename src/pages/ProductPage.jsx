import { ArrowRight, ShoppingBag } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import { useState } from 'react'
import { useStore } from '../features/cart/CartContext.jsx'
import { formatPrice, products, productSizes } from '../features/products/productData.js'
import ProductImage from '../components/home/ProductImage.jsx'

export function NotFoundPage({ product = false }) {
  return <section className="empty-state"><p className="eyebrow">FOURTHFISH</p><h1>{product ? 'Không tìm thấy sản phẩm' : 'Không tìm thấy trang'}</h1><p>Khám phá các sản phẩm đang có tại Fourthfish.</p><Link to="/#featured" className="button button-black">XEM SẢN PHẨM <ArrowRight size={16} /></Link></section>
}

function ProductDetails({ product }) {
  const [size, setSize] = useState('M')
  const { addItem } = useStore()
  const navigate = useNavigate()
  const buyNow = () => { addItem(product, size); navigate('/thanh-toan') }
  return <section className="page-shell product-page">
    <nav className="breadcrumb" aria-label="Đường dẫn"><Link to="/">TRANG CHỦ</Link><span>/</span><Link to="/#featured">SẢN PHẨM</Link><span>/</span><span>{product.name}</span></nav>
    <div className="product-view">
      <div className="product-view-photo"><ProductImage product={product} />{product.label && <span className="product-badge">{product.label}</span>}</div>
      <div className="product-view-info">
        <p className="eyebrow">{product.category} / FOURTHFISH</p>
        <h1>{product.name}</h1><p className="product-view-price">{formatPrice(product.price)}</p>
        <p className="product-description">{product.description}</p>
        <fieldset className="size-picker"><legend>Chọn size</legend><div className="size-options">{productSizes.map(value => <label key={value}><input type="radio" name="size" value={value} checked={value === size} onChange={() => setSize(value)} /><span>{value}</span></label>)}</div></fieldset>
        <div className="product-view-actions">
          <button className="button button-black" type="button" onClick={buyNow}>MUA NGAY <ArrowRight size={17} /></button>
          <button className="button button-outline" type="button" onClick={() => addItem(product, size)}>THÊM VÀO GIỎ <ShoppingBag size={17} /></button>
        </div>
        <Link className="underlined-link" to="/gio-hang">XEM GIỎ HÀNG <ArrowRight size={15} /></Link>
      </div>
    </div>
  </section>
}

export default function ProductPage() {
  const { id } = useParams()
  const product = products.find(item => item.id === id)
  return product ? <ProductDetails key={product.id} product={product} /> : <NotFoundPage product />
}
