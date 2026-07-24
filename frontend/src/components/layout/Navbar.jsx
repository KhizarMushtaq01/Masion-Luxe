import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { useCartStore, useUIStore } from '../../store/cartStore'
import SearchModal from '../common/SearchModal'

const navLinks = [
  {
    label: 'New In',
    href: '/shop?isNew=true',
    mega: null,
  },
  {
    label: 'Women',
    mega: {
      cols: [
        { title: 'Clothing', links: [
          { label: 'All Ready-to-Wear', href: '/shop/women/clothing' },
          { label: 'Dresses', href: '/shop?gender=women&tags=dresses' },
          { label: 'Jackets & Coats', href: '/shop?gender=women&tags=jackets' },
          { label: 'Tops & Blouses', href: '/shop?gender=women&tags=tops' },
          { label: 'Trousers & Skirts', href: '/shop?gender=women&tags=trousers' },
        ]},
        { title: 'Accessories', links: [
          { label: 'All Bags', href: '/shop/women/bags' },
          { label: 'Shoes', href: '/shop/women/shoes' },
          { label: 'Jewellery', href: '/shop/women/jewellery' },
          { label: 'Scarves', href: '/shop?gender=women&tags=scarves' },
          { label: 'Belts', href: '/shop?gender=women&tags=belts' },
        ]},
        { title: 'Fragrance & Beauty', links: [
          { label: 'Perfumes', href: '/shop/women/perfumes' },
          { label: 'Sunglasses', href: '/shop?gender=women&tags=sunglasses' },
          { label: 'Watches', href: '/shop?gender=unisex&tags=watches' },
        ]},
      ],
      featured: { label: 'New Collection', href: '/shop?gender=women&isNew=true', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80' },
    },
  },
  {
    label: 'Men',
    mega: {
      cols: [
        { title: 'Clothing', links: [
          { label: 'All Ready-to-Wear', href: '/shop/men/clothing' },
          { label: 'Suits & Blazers', href: '/shop?gender=men&tags=suits' },
          { label: 'Shirts', href: '/shop?gender=men&tags=shirts' },
          { label: 'T-shirts & Polos', href: '/shop?gender=men&tags=tshirts' },
          { label: 'Trousers & Jeans', href: '/shop?gender=men&tags=trousers' },
        ]},
        { title: 'Accessories', links: [
          { label: 'All Bags', href: '/shop/men/bags' },
          { label: 'Shoes', href: '/shop/men/shoes' },
          { label: 'Ties & Pocket Squares', href: '/shop?gender=men&tags=ties' },
          { label: 'Belts', href: '/shop?gender=men&tags=belts' },
          { label: 'Wallets', href: '/shop?gender=men&tags=wallets' },
        ]},
        { title: 'Fragrance', links: [
          { label: 'Perfumes', href: '/shop/men/perfumes' },
          { label: 'Sunglasses', href: '/shop?gender=men&tags=sunglasses' },
        ]},
      ],
      featured: { label: 'The New Man', href: '/shop?gender=men&isNew=true', img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&q=80' },
    },
  },
  {
    label: 'Kids',
    href: '/shop?gender=kids',
    mega: null,
  },
  {
    label: 'Sale',
    href: '/shop?isOnSale=true',
    className: 'text-red-600',
    mega: null,
  },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeMenu, setActiveMenu] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileActiveDropdown, setMobileActiveDropdown] = useState(null)
  const { user, logout } = useAuthStore()
  const { getItemCount, toggleCart } = useCartStore()
  const navigate = useNavigate()
  const location = useLocation()
  const menuTimer = useRef(null)
  const mobileMenuRef = useRef(null)

  const isTransparent = location.pathname === '/'
  const itemCount = getItemCount()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setActiveMenu(null)
    setMobileMenuOpen(false)
    setMobileActiveDropdown(null)
  }, [location.pathname])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
        setMobileActiveDropdown(null)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const handleMouseEnter = (label) => {
    clearTimeout(menuTimer.current)
    setActiveMenu(label)
  }

  const handleMouseLeave = () => {
    menuTimer.current = setTimeout(() => setActiveMenu(null), 150)
  }

  const toggleMobileDropdown = (label) => {
    setMobileActiveDropdown(mobileActiveDropdown === label ? null : label)
  }

  const navBg = isTransparent && !scrolled
    ? 'bg-transparent'
    : 'bg-white shadow-luxury border-b border-obsidian-100'

  const textColor = isTransparent && !scrolled ? 'text-white' : 'text-obsidian'
  const iconColor = isTransparent && !scrolled ? 'text-white hover:text-gold-300' : 'text-obsidian hover:text-gold-600'

  return (
    <>
      {/* Announcement bar */}
      <div className="relative z-50 bg-obsidian text-center py-2.5 px-4">
        <p className="text-xs tracking-widest text-gold-400 font-sans uppercase">
          Complimentary shipping on orders over $500 · Free returns within 30 days
        </p>
      </div>

      <header className={`sticky top-0 z-50 transition-all duration-500 ${navBg}`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
            {/* Left side - Desktop Navigation (hidden on mobile) */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.mega && handleMouseEnter(link.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  {link.href ? (
                    <Link
                      to={link.href}
                      className={`text-xs tracking-widest uppercase font-sans font-medium transition-colors duration-200 hover:text-gold-500 whitespace-nowrap ${textColor} ${link.className || ''}`}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button
                      className={`text-xs tracking-widest uppercase font-sans font-medium transition-colors duration-200 hover:text-gold-500 flex items-center gap-1 ${textColor}`}
                    >
                      {link.label}
                      {link.mega && <ChevronDown size={12} className={`transition-transform duration-200 ${activeMenu === link.label ? 'rotate-180' : ''}`} />}
                    </button>
                  )}

                  {/* Mega menu */}
                  {link.mega && activeMenu === link.label && (
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-screen max-w-[700px] bg-white shadow-luxury-lg border-t-2 border-gold-400 animate-fade-in z-50"
                      onMouseEnter={() => handleMouseEnter(link.label)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="flex p-6 xl:p-8 gap-6 xl:gap-8">
                        <div className="flex-1 grid grid-cols-3 gap-6 xl:gap-8">
                          {link.mega.cols.map((col) => (
                            <div key={col.title}>
                              <h4 className="text-xs tracking-widest uppercase text-gold-600 font-sans mb-4">{col.title}</h4>
                              <ul className="space-y-2.5">
                                {col.links.map((l) => (
                                  <li key={l.label}>
                                    <Link
                                      to={l.href}
                                      className="text-sm text-obsidian-600 hover:text-gold-600 font-sans transition-colors duration-150 whitespace-nowrap"
                                    >
                                      {l.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        <div className="w-48 flex-shrink-0 hidden xl:block">
                          <Link to={link.mega.featured.href} className="block group">
                            <div className="overflow-hidden">
                              <img
                                src={link.mega.featured.img}
                                alt={link.mega.featured.label}
                                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <p className="mt-2 text-xs tracking-widest uppercase text-obsidian font-sans group-hover:text-gold-600 transition-colors">
                              {link.mega.featured.label}
                            </p>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Logo - Centered on mobile, left on desktop */}
            <Link to="/" className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 flex-shrink-0">
              <div className="text-center">
                <div className={`font-display text-xl sm:text-2xl lg:text-3xl tracking-luxury font-light transition-colors duration-500 whitespace-nowrap ${isTransparent && !scrolled ? 'text-white' : 'text-obsidian'}`}>
                  MAISON LUXE
                </div>
              </div>
            </Link>

            {/* Right side - Icons */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={() => setSearchOpen(true)}
                className={`p-2 transition-colors duration-200 ${iconColor}`}
                aria-label="Search"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>

              <Link
                to={user ? '/account/wishlist' : '/sign-in'}
                className={`p-2 transition-colors duration-200 hidden sm:block ${iconColor}`}
                aria-label="Wishlist"
              >
                <Heart size={18} strokeWidth={1.5} />
              </Link>

              {user ? (
                <div className="relative group hidden sm:block">
                  <button className={`p-2 transition-colors duration-200 ${iconColor}`}>
                    <User size={18} strokeWidth={1.5} />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white shadow-luxury-lg border border-obsidian-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4 border-b border-obsidian-100">
                      <p className="text-sm font-sans font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-obsidian-400 font-sans mt-0.5 truncate">{user.email}</p>
                    </div>
                    <div className="py-2">
                      {[
                        { label: 'My Account', href: '/account' },
                        { label: 'My Orders', href: '/account/orders' },
                        { label: 'Wishlist', href: '/account/wishlist' },
                        ...(user.role !== 'user' ? [{ label: 'Admin Dashboard', href: '/admin' }] : []),
                      ].map(item => (
                        <Link key={item.href} to={item.href} className="block px-4 py-2.5 text-xs tracking-wide font-sans text-obsidian-600 hover:text-gold-600 hover:bg-cream transition-colors">
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => { logout(); navigate('/') }}
                        className="w-full text-left px-4 py-2.5 text-xs tracking-wide font-sans text-obsidian-600 hover:text-red-500 hover:bg-cream transition-colors border-t border-obsidian-100 mt-1"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/sign-in" className={`p-2 transition-colors duration-200 hidden sm:block ${iconColor}`}>
                  <User size={18} strokeWidth={1.5} />
                </Link>
              )}

              <button
                onClick={toggleCart}
                className={`relative p-2 transition-colors duration-200 ${iconColor}`}
                aria-label="Cart"
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute -top-0 -right-0 bg-gold-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans font-medium">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2 transition-colors duration-200 z-50 ${iconColor}`}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <div 
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${
            mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Mobile Menu Panel */}
        <div
          ref={mobileMenuRef}
          className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-luxury-lg z-40 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="pt-20 pb-8 px-6">
            {/* User info for mobile */}
            {user && (
              <div className="mb-6 pb-6 border-b border-obsidian-100">
                <p className="text-sm font-sans font-medium text-obsidian">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-obsidian-400 font-sans mt-0.5 truncate">{user.email}</p>
              </div>
            )}

            {/* Mobile Navigation Links */}
            <div className="space-y-1">
              {navLinks.map((link) => (
                <div key={link.label} className="border-b border-obsidian-50">
                  {link.href ? (
                    <Link
                      to={link.href}
                      className="block py-4 text-sm tracking-widest uppercase font-sans font-medium text-obsidian hover:text-gold-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <div>
                      <button
                        onClick={() => toggleMobileDropdown(link.label)}
                        className="w-full flex items-center justify-between py-4 text-sm tracking-widest uppercase font-sans font-medium text-obsidian hover:text-gold-600 transition-colors"
                      >
                        {link.label}
                        <ChevronDown 
                          size={16} 
                          className={`transition-transform duration-200 ${
                            mobileActiveDropdown === link.label ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      
                      {/* Mobile Dropdown */}
                      {mobileActiveDropdown === link.label && link.mega && (
                        <div className="pb-4 pl-4 space-y-4 animate-fade-in">
                          {link.mega.cols.map((col) => (
                            <div key={col.title}>
                              <h4 className="text-xs tracking-widest uppercase text-gold-600 font-sans mb-2">
                                {col.title}
                              </h4>
                              <ul className="space-y-2">
                                {col.links.map((l) => (
                                  <li key={l.label}>
                                    <Link
                                      to={l.href}
                                      className="text-sm text-obsidian-600 hover:text-gold-600 font-sans transition-colors block py-1"
                                      onClick={() => setMobileMenuOpen(false)}
                                    >
                                      {l.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                          {link.mega.featured && (
                            <Link
                              to={link.mega.featured.href}
                              className="block mt-4"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <div className="overflow-hidden rounded-lg">
                                <img
                                  src={link.mega.featured.img}
                                  alt={link.mega.featured.label}
                                  className="w-full h-32 object-cover"
                                />
                              </div>
                              <p className="mt-2 text-xs tracking-widest uppercase text-obsidian font-sans">
                                {link.mega.featured.label}
                              </p>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Action Links */}
            <div className="mt-8 pt-6 border-t border-obsidian-100 space-y-4">
              <Link
                to={user ? '/account/wishlist' : '/sign-in'}
                className="flex items-center gap-3 text-sm text-obsidian hover:text-gold-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart size={18} strokeWidth={1.5} />
                <span>Wishlist</span>
              </Link>
              
              {!user && (
                <Link
                  to="/sign-in"
                  className="flex items-center gap-3 text-sm text-obsidian hover:text-gold-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={18} strokeWidth={1.5} />
                  <span>Sign In</span>
                </Link>
              )}
              
              {user && (
                <>
                  <Link
                    to="/account"
                    className="flex items-center gap-3 text-sm text-obsidian hover:text-gold-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={18} strokeWidth={1.5} />
                    <span>My Account</span>
                  </Link>
                  <Link
                    to="/account/orders"
                    className="flex items-center gap-3 text-sm text-obsidian hover:text-gold-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingBag size={18} strokeWidth={1.5} />
                    <span>My Orders</span>
                  </Link>
                  {user.role !== 'user' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 text-sm text-obsidian hover:text-gold-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 text-sm text-red-600 hover:text-red-700 transition-colors mt-4 pt-4 border-t border-obsidian-100"
                  >
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}