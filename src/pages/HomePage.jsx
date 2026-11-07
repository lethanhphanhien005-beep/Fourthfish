import { ArrowUpRight } from 'lucide-react'
import CampaignHero from '../components/home/CampaignHero.jsx'
import SportCategoryLinks from '../components/home/SportCategoryLinks.jsx'
import FeaturedProducts from '../components/home/FeaturedProducts.jsx'

export default function HomePage() {
  return <>
    <CampaignHero />
    <div className="brand-strip"><span>FOURTHFISH ATHLETICS</span><b>MOVE WITH INTENT</b><span>DESIGNED IN VIETNAM <ArrowUpRight size={13} /></span></div>
    <SportCategoryLinks />
    <FeaturedProducts />
    <section className="manifesto"><p className="eyebrow light">NO SHORTCUTS. JUST FORWARD.</p><h2>KHÔNG CẦN<br /><em>CHỜ ĐÚNG LÚC.</em></h2><p>Đôi khi, chỉ cần bắt đầu là đủ.</p><a href="#sports" className="button button-outline-light">TÌM MÔN CỦA BẠN <ArrowUpRight size={16} /></a><span className="manifesto-mark">F.</span></section>
  </>
}
