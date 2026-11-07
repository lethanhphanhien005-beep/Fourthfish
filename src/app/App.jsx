import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { StoreProvider } from '../features/cart/CartContext.jsx'
import StoreLayout from './layouts/StoreLayout.jsx'
import HomePage from '../pages/HomePage.jsx'
import CartPage from '../pages/CartPage.jsx'
import CheckoutPage from '../pages/CheckoutPage.jsx'
import OrderSuccessPage from '../pages/OrderSuccessPage.jsx'
import CatalogPage from '../pages/CatalogPage.jsx'
import SportPage from '../pages/SportPage.jsx'
import ProductPage, { NotFoundPage } from '../pages/ProductPage.jsx'

function ScrollToTop() {
  const { pathname, hash, key } = useLocation()
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const anchor = hash && document.getElementById(hash.slice(1))
      if (anchor) anchor.scrollIntoView({ block: 'start' })
      else window.scrollTo({ top: 0, behavior: 'instant' })
    })
    // An effect cleanup must be a function, even if the browser returns a scroll promise.
    return () => window.cancelAnimationFrame(frame)
  }, [pathname, hash, key])
  return null
}

export default function App() {
  return (
    <StoreProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<StoreLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/san-pham" element={<CatalogPage />} />
          <Route path="/mon-the-thao/:id" element={<SportPage />} />
          <Route path="/san-pham/:id" element={<ProductPage />} />
          <Route path="/gio-hang" element={<CartPage />} />
          <Route path="/thanh-toan" element={<CheckoutPage />} />
          <Route path="/thanh-toan/chuyen-khoan" element={<OrderSuccessPage />} />
          <Route path="/dat-hang-thanh-cong" element={<OrderSuccessPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </StoreProvider>
  )
}
