import { Menu, Search, ShoppingBag, UserRound } from 'lucide-react'
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
            <a href="#featured">NAM</a><a href="#featured">NỮ</a><a href="#sports">MÔN THỂ THAO</a>
          </nav>
          <div className="header-actions">
            <button className="icon-button search-button" aria-label="Tìm kiếm"><Search size={20} /></button>
            <button className="icon-button account-button" aria-label="Tài khoản"><UserRound size={20} /></button>
            <Link to="/gio-hang" className="icon-button bag-button" aria-label={`Giỏ hàng, ${count} sản phẩm`}><ShoppingBag size={20} /><span className="bag-count">{count}</span></Link>
          </div>
        </div>
        {menuOpen && <nav className="mobile-nav"><a href="#featured" onClick={() => setMenuOpen(false)}>Mua sắm sản phẩm</a><a href="#sports" onClick={() => setMenuOpen(false)}>Môn thể thao</a><Link to="/gio-hang" onClick={() => setMenuOpen(false)}>Giỏ hàng ({count})</Link></nav>}
      </header>
    </>
  )
}
