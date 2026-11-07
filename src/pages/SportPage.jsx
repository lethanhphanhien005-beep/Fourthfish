import { ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router'
import ProductCard from '../components/home/ProductCard.jsx'
import { products } from '../features/products/productData.js'
import { sports } from '../features/products/sports.js'
import { NotFoundPage } from './ProductPage.jsx'

export default function SportPage() {
  const { id } = useParams()
  const sport = sports.find(item => item.id === id)
  if (!sport) return <NotFoundPage />

  return <div className="page-shell sport-page">
    <nav className="breadcrumb" aria-label="Đường dẫn"><Link to="/">TRANG CHỦ</Link><span>/</span><Link to="/#sports">MÔN THỂ THAO</Link><span>/</span><span>{sport.title}</span></nav>
    <header className="sport-story-hero">
      <img src={sport.image} alt={sport.title} />
      <div><p className="eyebrow light">FOURTHFISH / {sport.title.toUpperCase()}</p><h1>{sport.headline}</h1></div>
    </header>
    <section className="sport-story-copy" aria-label={`Câu chuyện ${sport.title}`}>
      {sport.story.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      <Link className="button button-black" to={`/san-pham?mon=${sport.id}`}>XEM SẢN PHẨM {sport.title.toUpperCase()} <ArrowRight size={16} /></Link>
    </section>
    <section className="catalog-section">
      <div className="catalog-section-heading"><h2>Trang phục cho {sport.title.toLowerCase()}</h2></div>
      <div className="product-grid">{products.filter(product => product.sport === sport.id).map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
    </section>
  </div>
}
