import { ArrowUpRight } from 'lucide-react'

const categories = [
  { id: 'run', title: 'CHẠY BỘ', note: 'NHẸ NHÀNG. BỀN BỈ.', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=85' },
  { id: 'train', title: 'TẬP LUYỆN', note: 'SẴN SÀNG BỨT PHÁ.', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85' },
  { id: 'football', title: 'BÓNG ĐÁ', note: 'CHƠI HẾT MÌNH.', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=85' },
]

export default function SportCategoryLinks() {
  return (
    <section id="sports" className="section-wrap sports-section">
      <div className="section-heading"><div><p className="eyebrow">FIND YOUR GAME</p><h2>CHỌN MÔN.<br />BẮT ĐẦU CHUYỂN ĐỘNG.</h2></div><p className="section-note">Mỗi môn thể thao có nhịp điệu riêng.<br />Chọn thứ đưa bạn tiến lên.</p></div>
      <div className="sport-grid">{categories.map((category, index) => <a href="#featured" className={`sport-tile sport-tile-${index + 1}`} key={category.id}>
        <img src={category.image} alt="" loading="lazy" /><span className="sport-index">0{index + 1} / FOURTHFISH SPORT</span><div className="sport-label"><div><span>{category.note}</span><h3>{category.title}</h3></div><i><ArrowUpRight size={20} /></i></div>
      </a>)}</div>
    </section>
  )
}
