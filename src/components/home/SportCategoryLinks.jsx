import { ArrowUpRight } from 'lucide-react'

import { Link } from 'react-router'
import { sports } from '../../features/products/sports.js'

export default function SportCategoryLinks() {
  return (
    <section id="sports" className="section-wrap sports-section">
      <div className="section-heading"><div><p className="eyebrow">FIND YOUR GAME</p><h2>CHỌN MÔN.<br />BẮT ĐẦU CHUYỂN ĐỘNG.</h2></div><p className="section-note">Mỗi môn thể thao có nhịp điệu riêng.<br />Chọn thứ đưa bạn tiến lên.</p></div>
      <div className="sport-grid">{sports.map((category, index) => <Link to={`/mon-the-thao/${category.id}`} className={`sport-tile sport-tile-${index + 1}`} key={category.id}>
        <img src={category.image} alt="" loading="lazy" /><span className="sport-index">0{index + 1} / FOURTHFISH SPORT</span><div className="sport-label"><div><span>{category.note}</span><h3>{category.title.toUpperCase()}</h3></div><i><ArrowUpRight size={20} /></i></div>
      </Link>)}</div>
    </section>
  )
}
