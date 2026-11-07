import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { StoreProvider } from '../features/cart/CartContext.jsx'
import StoreLayout from './layouts/StoreLayout.jsx'
import HomePage from '../pages/HomePage.jsx'
import CartPage from '../pages/CartPage.jsx'
import CheckoutPage from '../pages/CheckoutPage.jsx'
import OrderSuccessPage from '../pages/OrderSuccessPage.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo({ top: 0, behavior: 'smooth' }), [pathname])
  return null
}

export default function App() {
  return (
    <StoreProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<StoreLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/gio-hang" element={<CartPage />} />
          <Route path="/thanh-toan" element={<CheckoutPage />} />
          <Route path="/thanh-toan/chuyen-khoan" element={<OrderSuccessPage />} />
          <Route path="/dat-hang-thanh-cong" element={<OrderSuccessPage />} />
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </StoreProvider>
  )
}
