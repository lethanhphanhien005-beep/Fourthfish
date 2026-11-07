import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { featuredProducts } from '../../features/products/productData.js'
import ProductCard from './ProductCard.jsx'

export default function FeaturedProducts() {
  return (
    <section id="featured" className="section-wrap featured-section">
      <div className="section-heading product-heading"><div><p className="eyebrow">GEAR UP / GET OUT</p><h2>SẢN PHẨM<br />NỔI BẬT.</h2></div><Link className="underlined-link" to="/san-pham">KHÁM PHÁ SẢN PHẨM <ArrowRight size={16} /></Link></div>
      <div className="product-grid">{featuredProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
      <div className="view-all"><span>THIẾT KẾ CHO CHUYỂN ĐỘNG. SẴN SÀNG CHO MỌI NGÀY.</span><Link to="/san-pham">XEM TẤT CẢ SẢN PHẨM <ArrowRight size={16} /></Link></div>
    </section>
  )
}
