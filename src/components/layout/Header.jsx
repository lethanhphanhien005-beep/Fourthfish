import { Menu, ShoppingBag } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { useState } from 'react'
import { useStore } from '../../features/cart/CartContext.jsx'

export default function Header() {
  const { count } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <>
      <div className="announcement">MIỄN PHÍ VẬN CHUYỂN CHO ĐƠN HÀNG TỪ 1.000.000₫ <span>·</span> ĐỔI TRẢ TRONG 30 NGÀY</div>
      <header className="site-header">
        <div className="header-inner">
          <button className="icon-button mobile-menu-button" aria-label="Mở danh mục" onClick={() => setMenuOpen((open) => !open)}><Menu size={22} /></button>
          <Link to="/" className="wordmark" aria-label="Fourthfish trang chủ">FOURTH<span>FISH</span><i>®</i></Link>
          <nav className="desktop-nav" aria-label="Điều hướng chính">
            <NavLink to="/">MỚI NHẤT</NavLink>
            <Link to="/san-pham">SẢN PHẨM</Link><Link to="/#sports">MÔN THỂ THAO</Link>
          </nav>
          <div className="header-actions">
            <Link to="/gio-hang" className="icon-button bag-button" aria-label={`Giỏ hàng, ${count} sản phẩm`}><ShoppingBag size={20} /><span className="bag-label">GIỎ HÀNG</span><span className="bag-count">{count}</span></Link>
          </div>
        </div>
        {menuOpen && <nav className="mobile-nav"><Link to="/san-pham" onClick={() => setMenuOpen(false)}>Mua sắm sản phẩm</Link><Link to="/#sports" onClick={() => setMenuOpen(false)}>Môn thể thao</Link><Link to="/gio-hang" onClick={() => setMenuOpen(false)}>Giỏ hàng ({count})</Link></nav>}
      </header>
    </>
  )
}
