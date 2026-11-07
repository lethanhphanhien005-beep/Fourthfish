import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top"><Link to="/" className="wordmark footer-mark">FOURTH<span>FISH</span><i>®</i></Link><p>MOVE FORWARD.<br />EVERY DAY.</p><a href="mailto:hello@fourthfish.vn">LIÊN HỆ <ArrowUpRight size={15} /></a></div>
      <div className="footer-bottom"><span>© 2026 FOURTHFISH ATHLETICS</span><div><a href="#policy">CHÍNH SÁCH ĐỔI TRẢ</a><a href="#shipping">GIAO HÀNG</a><Link to="/gio-hang">GIỎ HÀNG</Link></div><span>MADE TO MOVE</span></div>
    </footer>
  )
}
