import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { products } from '../../features/products/productData.js'
import ProductCard from './ProductCard.jsx'

export default function FeaturedProducts() {
  return (
    <section id="featured" className="section-wrap featured-section">
      <div className="section-heading product-heading"><div><p className="eyebrow">GEAR UP / GET OUT</p><h2>ĐƯỢC CHỌN ĐỂ<br />BỨT PHÁ.</h2></div><Link className="underlined-link" to="/gio-hang">XEM GIỎ HÀNG <ArrowRight size={16} /></Link></div>
      <div className="product-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
      <div className="view-all"><span>THIẾT KẾ CHO CHUYỂN ĐỘNG. SẴN SÀNG CHO MỌI NGÀY.</span><a href="#sports">KHÁM PHÁ FOURTHFISH <ArrowRight size={16} /></a></div>
    </section>
  )
}
