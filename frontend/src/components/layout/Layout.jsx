import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import CartDrawer from '../cart/CartDrawer'
import MobileMenu from './MobileMenu'

export default function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />
      <MobileMenu />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
