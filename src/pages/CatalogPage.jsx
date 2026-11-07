import { Link, useSearchParams } from 'react-router'
import ProductCard from '../components/home/ProductCard.jsx'
import { products } from '../features/products/productData.js'
import { sports } from '../features/products/sports.js'

export default function CatalogPage() {
  const [params] = useSearchParams()
  const selected = sports.find(sport => sport.id === params.get('mon'))
  const sections = selected ? [selected] : sports

  return <div className="page-shell catalog-page">
    <nav className="breadcrumb" aria-label="Đường dẫn"><Link to="/">TRANG CHỦ</Link><span>/</span><span>SẢN PHẨM</span></nav>
    <div className="page-title-row"><div><p className="eyebrow">BỘ SƯU TẬP FOURTHFISH</p><h1>KHÁM PHÁ SẢN PHẨM</h1></div></div>
    <nav className="catalog-filters" aria-label="Danh mục sản phẩm">
      <Link to="/san-pham" aria-current={selected ? undefined : 'page'}>Tất cả ({products.length})</Link>
      {sports.map(sport => <Link key={sport.id} to={`/san-pham?mon=${sport.id}`} aria-current={selected?.id === sport.id ? 'page' : undefined}>{sport.title}</Link>)}
    </nav>
    {sections.map(sport => <section key={sport.id} className="catalog-section">
      <div className="catalog-section-heading"><h2>{sport.title}</h2><Link to={`/mon-the-thao/${sport.id}`} className="underlined-link">CÂU CHUYỆN BỘ MÔN</Link></div>
      <div className="product-grid">{products.filter(product => product.sport === sport.id).map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
    </section>)}
  </div>
}
