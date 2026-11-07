import { ArrowDown, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'

export default function CampaignHero() {
  return (
    <section className="campaign-hero" aria-label="Chiến dịch Fourthfish Move Your Own Way">
      <img className="hero-image" src="https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=2200&q=90" alt="Vận động viên chạy bộ đang bứt tốc trên đường chạy" />
      <div className="hero-grain" />
      <div className="hero-topline"><span>FOURTHFISH RUNNING / 2026</span><span>01 — 04</span></div>
      <div className="hero-content">
        <p className="eyebrow light">MOVE YOUR OWN WAY</p>
        <h1><span>CHẠY THEO</span><em>NHỊP CỦA BẠN.</em></h1>
        <p className="hero-copy">Trang phục nhẹ và thoáng, đồng hành cùng bạn trên mỗi cung đường.</p>
        <div className="hero-actions"><Link className="button button-white" to="/san-pham?mon=chay-bo">MUA BỘ SƯU TẬP <ArrowUpRight size={17} /></Link><a href="#sports" className="text-link-light">KHÁM PHÁ MÔN THỂ THAO <ArrowDownRight className="inline-block ml-1" size={15} aria-hidden="true" /></a></div>
      </div>
      <div className="hero-meta"><span>01 / RUNNING SERIES</span><span>BUILT FOR THE LONG RUN</span><a href="#featured" aria-label="Cuộn xuống sản phẩm nổi bật"><ArrowDown size={19} /></a></div>
    </section>
  )
}
