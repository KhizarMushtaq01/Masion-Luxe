import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, Users, Star,
  Tag, Grid, BarChart3, Activity, LogOut, Menu, X, ChevronRight, Settings
} from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../../store/authStore'

const NAV = [
  { href: '/admin',              label: 'Dashboard',     icon: LayoutDashboard, exact: true },
  { href: '/admin/products',     label: 'Products',      icon: Package },
  { href: '/admin/orders',       label: 'Orders',        icon: ShoppingBag },
  { href: '/admin/users',        label: 'Users',         icon: Users },
  { href: '/admin/reviews',      label: 'Reviews',       icon: Star },
  { href: '/admin/coupons',      label: 'Coupons',       icon: Tag },
  { href: '/admin/categories',   label: 'Categories',    icon: Grid },
  { href: '/admin/analytics',    label: 'Analytics',     icon: BarChart3 },
  { href: '/admin/activity-logs',label: 'Activity Logs', icon: Activity },
  { href: '/admin/settings',     label: 'Settings',      icon: Settings },
]

export default function AdminLayout() {
  const { pathname } = useLocation()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen flex bg-obsidian-900">
      {/* Sidebar */}
      <aside className={`flex-shrink-0 ${sidebarOpen ? 'w-60' : 'w-16'} bg-obsidian transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-obsidian-800">
          {sidebarOpen && (
            <Link to="/" className="font-display text-lg tracking-widest text-white">MAISON LUXE</Link>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-obsidian-400 hover:text-gold-400 transition-colors p-1">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Admin badge */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-obsidian-800">
            <p className="text-[10px] tracking-widest uppercase text-gold-500 font-sans">Admin Panel</p>
            <p className="text-sm text-white font-sans mt-0.5 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-obsidian-400 font-sans capitalize">{user?.role}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link key={href} to={href}
                title={!sidebarOpen ? label : undefined}
                className={`flex items-center gap-3 px-4 py-3 transition-all duration-150 ${active ? 'bg-gold-gradient text-white' : 'text-obsidian-400 hover:text-white hover:bg-obsidian-800'}`}>
                <Icon size={16} className="flex-shrink-0" />
                {sidebarOpen && <span className="text-xs tracking-widest uppercase font-sans">{label}</span>}
                {sidebarOpen && active && <ChevronRight size={12} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-obsidian-800 py-4">
          <Link to="/" className={`flex items-center gap-3 px-4 py-2.5 text-obsidian-400 hover:text-white transition-colors`}>
            <Package size={16} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-xs tracking-widest uppercase font-sans">View Store</span>}
          </Link>
          <button onClick={() => { logout(); navigate('/') }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-obsidian-400 hover:text-red-400 transition-colors">
            <LogOut size={16} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-xs tracking-widest uppercase font-sans">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 bg-obsidian-50">
        {/* Top bar */}
        <header className="bg-white border-b border-obsidian-100 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-sans font-medium text-sm text-obsidian">
              {NAV.find(n => n.exact ? pathname === n.href : pathname.startsWith(n.href))?.label || 'Admin'}
            </h2>
            <p className="text-xs text-obsidian-400 font-sans">{new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-white text-xs font-display overflow-hidden">
              {user?.avatar?.url ? <img src={user.avatar.url} alt="" className="w-full h-full object-cover" /> : `${user?.firstName?.[0]}${user?.lastName?.[0]}`}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
