import { Outlet } from 'react-router'
import Header from '../../components/layout/Header.jsx'
import Footer from '../../components/layout/Footer.jsx'
import Toast from '../../components/ui/Toast.jsx'

export default function StoreLayout() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header />
      <main className="page-enter"><Outlet /></main>
      <Footer />
      <Toast />
    </div>
  )
}
