import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Facebook, Youtube, ArrowRight } from 'lucide-react'
import { newsletterAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await newsletterAPI.subscribe(email)
      toast.success('Thank you for subscribing!')
      setEmail('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-obsidian text-white">
      {/* Newsletter strip */}
      <div className="border-b border-obsidian-700">
        <div className="page-container py-12">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-xs tracking-widest uppercase text-gold-400 font-sans mb-3">Join the Inner Circle</p>
            <h3 className="font-display text-3xl text-white font-light mb-2">Be First to Know</h3>
            <p className="text-sm text-obsidian-300 font-sans mb-8">New collections, exclusive events, and curated stories delivered to your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex gap-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 bg-obsidian-800 border border-obsidian-600 border-r-0 px-5 py-3.5 text-sm font-sans text-white placeholder-obsidian-400 focus:outline-none focus:border-gold-400 transition-colors"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-gold-gradient px-6 py-3.5 text-xs tracking-widest uppercase font-sans text-white hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
              >
                {loading ? '...' : <><span>Subscribe</span><ArrowRight size={14} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="page-container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="font-display text-2xl tracking-luxury text-white block mb-4">MAISON LUXE</Link>
            <p className="text-sm text-obsidian-400 font-sans leading-relaxed mb-6">The art of living beautifully. Premium luxury fashion since 1998.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-obsidian-400 hover:text-gold-400 transition-colors"><Instagram size={18} /></a>
              <a href="#" className="text-obsidian-400 hover:text-gold-400 transition-colors"><Facebook size={18} /></a>
              <a href="#" className="text-obsidian-400 hover:text-gold-400 transition-colors"><Youtube size={18} /></a>
            </div>
          </div>

          {[
            {
              title: 'Collections',
              links: [
                { label: 'New Arrivals', href: '/shop?isNew=true' },
                { label: 'Women', href: '/shop?gender=women' },
                { label: 'Men', href: '/shop?gender=men' },
                { label: 'Kids', href: '/shop?gender=kids' },
                { label: 'Sale', href: '/shop?isOnSale=true' },
              ],
            },
            {
              title: 'Maison',
              links: [
                { label: 'World of Maison', href: '/world-of-maison' },
                { label: 'Lookbook', href: '/lookbook' },
                { label: 'About Us', href: '/about' },
                { label: 'Sustainability', href: '/sustainability' },
                { label: 'Contact', href: '/contact' },
              ],
            },
            {
              title: 'Client Services',
              links: [
                { label: 'My Account', href: '/account' },
                { label: 'Order Tracking', href: '/account/orders' },
                { label: 'Shipping & Returns', href: '/contact#shipping' },
                { label: 'Size Guide', href: '/contact#sizing' },
                { label: 'FAQ', href: '/contact#faq' },
              ],
            },
            {
              title: 'Legal',
              links: [
                { label: 'Privacy Policy', href: '/contact#privacy' },
                { label: 'Terms of Service', href: '/contact#terms' },
                { label: 'Cookie Policy', href: '/contact#cookies' },
                { label: 'Accessibility', href: '/contact#accessibility' },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs tracking-widest uppercase text-gold-500 font-sans mb-5">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.href} className="text-sm text-obsidian-400 hover:text-white font-sans transition-colors duration-150">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-obsidian-800">
        <div className="page-container py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-obsidian-500 font-sans">© {new Date().getFullYear()} Maison Luxe. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {['Visa', 'Mastercard', 'Amex', 'PayPal'].map(p => (
              <span key={p} className="text-xs text-obsidian-500 font-sans border border-obsidian-700 px-2.5 py-1">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
