// MobileMenu.jsx
import { Link, useNavigate } from 'react-router-dom'
import { X, User, Heart, ChevronRight } from 'lucide-react'
import { useUIStore } from '../../store/cartStore'
import useAuthStore from '../../store/authStore'

export default function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const links = [
    { label: 'New In', href: '/shop?isNew=true' },
    { label: 'Women', href: '/shop?gender=women' },
    { label: 'Men', href: '/shop?gender=men' },
    { label: 'Kids', href: '/shop?gender=kids' },
    { label: 'Sale', href: '/shop?isOnSale=true', className: 'text-red-500' },
    { label: 'World of Maison', href: '/world-of-maison' },
    { label: 'Lookbook', href: '/lookbook' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  if (!isMobileMenuOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeMobileMenu} />
      <div className="relative w-80 bg-white h-full flex flex-col animate-slide-in-left">
        <div className="flex items-center justify-between px-6 py-5 border-b border-obsidian-100">
          <span className="font-display text-xl tracking-widest">MAISON LUXE</span>
          <button onClick={closeMobileMenu}><X size={20} /></button>
        </div>

        {user && (
          <div className="px-6 py-4 bg-cream border-b border-obsidian-100">
            <p className="text-sm font-sans font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-obsidian-400 font-sans">{user.email}</p>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-4">
          {links.map(link => (
            <Link key={link.href} to={link.href} onClick={closeMobileMenu}
              className={`flex items-center justify-between px-6 py-3.5 text-sm font-sans hover:bg-cream transition-colors ${link.className || ''}`}>
              {link.label}
              <ChevronRight size={14} className="text-obsidian-300" />
            </Link>
          ))}
        </nav>

        <div className="border-t border-obsidian-100 p-6 space-y-3">
          {user ? (
            <>
              <Link to="/account" onClick={closeMobileMenu} className="flex items-center gap-3 text-sm font-sans text-obsidian-600 hover:text-gold-600 py-2">
                <User size={16} /> My Account
              </Link>
              <Link to="/account/wishlist" onClick={closeMobileMenu} className="flex items-center gap-3 text-sm font-sans text-obsidian-600 hover:text-gold-600 py-2">
                <Heart size={16} /> Wishlist
              </Link>
              <button onClick={() => { logout(); navigate('/'); closeMobileMenu() }}
                className="w-full text-left text-sm font-sans text-red-500 hover:text-red-600 py-2">
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link to="/sign-in" onClick={closeMobileMenu} className="btn-primary flex-1 text-center text-xs py-3">Sign In</Link>
              <Link to="/register" onClick={closeMobileMenu} className="btn-outline flex-1 text-center text-xs py-3">Register</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
