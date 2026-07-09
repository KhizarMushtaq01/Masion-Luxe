// Shared account sidebar
import { Link, useLocation } from 'react-router-dom'
import { User, ShoppingBag, Heart, MapPin, Shield, Settings, LogOut, LayoutDashboard } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

const navItems = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/account/orders', label: 'My Orders', icon: ShoppingBag },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/profile', label: 'Profile', icon: User },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/security', label: 'Security', icon: Shield },
]

export function AccountSidebar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="bg-obsidian text-white p-6 mb-4">
        <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center text-white font-display text-2xl mb-3 overflow-hidden">
          {user?.avatar?.url ? <img src={user.avatar.url} alt="" className="w-full h-full object-cover" /> : <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>}
        </div>
        <p className="font-display text-xl">{user?.firstName} {user?.lastName}</p>
        <p className="text-xs text-obsidian-400 font-sans mt-0.5 truncate">{user?.email}</p>
        <div className="flex gap-4 mt-3 text-xs font-sans text-obsidian-400">
          <span><strong className="text-gold-400">{user?.totalOrders || 0}</strong> Orders</span>
          <span><strong className="text-gold-400">{user?.loyaltyPoints || 0}</strong> Points</span>
        </div>
      </div>

      <nav className="space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} to={href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-sans transition-all duration-150 ${active ? 'bg-gold-50 text-gold-700 font-medium border-l-2 border-gold-500' : 'text-obsidian-600 hover:bg-cream hover:text-obsidian border-l-2 border-transparent'}`}>
              <Icon size={16} /> {label}
            </Link>
          )
        })}
        <button onClick={() => { logout(); navigate('/') }}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-sans text-obsidian-400 hover:text-red-500 hover:bg-red-50 transition-colors border-l-2 border-transparent mt-2">
          <LogOut size={16} /> Sign Out
        </button>
      </nav>
    </aside>
  )
}

export function AccountLayout({ title, children }) {
  return (
    <div className="page-container py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <AccountSidebar />
        <div className="flex-1 min-w-0">
          {title && <h1 className="font-display text-3xl mb-8">{title}</h1>}
          {children}
        </div>
      </div>
    </div>
  )
}
