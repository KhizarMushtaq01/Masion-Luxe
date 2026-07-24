import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Play, Truck } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productAPI, newsletterAPI } from '../services/api'
import ProductCard, { ProductCardSkeleton } from '../components/product/ProductCard'
import toast from 'react-hot-toast'

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const slides = [
    {
      img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&q=90',
      label: 'Spring / Summer Collection',
      title: 'Where Luxury\nMeets Artistry',
      cta: 'Explore Women',
      href: '/shop?gender=women&isNew=true',
    },
    {
      img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=90',
      label: 'New Arrivals',
      title: 'Crafted for the\nExtraordinary',
      cta: 'Explore Men',
      href: '/shop?gender=men&isNew=true',
    },
    {
      img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&q=90',
      label: 'The Atelier Edit',
      title: 'Timeless Elegance\nRedefined',
      cta: 'View Lookbook',
      href: '/lookbook',
    },
  ]
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % slides.length), 6000)
    return () => clearInterval(t)
  }, [])

  const slide = slides[active]

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden -mt-[calc(4rem+2.5rem)]">
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === active ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={s.img} alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-hero-gradient" />
        </div>
      ))}

      <div className="relative z-10 h-full flex flex-col justify-end pb-16 sm:pb-20 lg:pb-24 page-container">
        <div className="max-w-2xl px-4 sm:px-0">
          <p className="text-xs tracking-luxury uppercase text-gold-400 font-sans mb-3 sm:mb-4 animate-fade-up">
            {slide.label}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white font-light leading-[1.1] sm:leading-[1.05] mb-6 sm:mb-8 animate-fade-up animate-delay-100 whitespace-pre-line">
            {slide.title}
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 animate-fade-up animate-delay-200">
            <Link to={slide.href} className="btn-gold inline-flex items-center gap-2">
              {slide.cta} <ArrowRight size={14} />
            </Link>
            <Link to="/lookbook" className="flex items-center gap-2 text-white text-xs tracking-widest uppercase font-sans hover:text-gold-300 transition-colors">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/50 flex items-center justify-center">
                <Play size={12} fill="currentColor" />
              </div>
              Watch Film
            </Link>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-px transition-all duration-300 ${i === active ? 'w-6 sm:w-10 bg-gold-400' : 'w-3 sm:w-4 bg-white/40'}`}
            />
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-8 sm:h-10 bg-white/40" />
          <p className="text-[10px] tracking-widest uppercase text-white/60 font-sans hidden sm:block">Scroll</p>
        </div>
      </div>
    </section>
  )
}

// ─── Category Grid ────────────────────────────────────────────────────────────
function CategoryGrid() {
  const cats = [
    { label: 'Women', sub: 'New Collection', href: '/shop?gender=women', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', tall: true },
    { label: 'Men', sub: 'The Modern Man', href: '/shop?gender=men', img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80', tall: false },
    { label: 'Accessories', sub: 'Complete the Look', href: '/shop?tags=accessories', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', tall: false },
    { label: 'Kids', sub: 'Young Luxe', href: '/shop?gender=kids', img: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&q=80', tall: false },
  ]

  return (
    <section className="page-container py-12 sm:py-16 lg:py-20">
      <div className="text-center mb-8 sm:mb-12">
        <p className="section-subtitle mb-2 sm:mb-3">Explore</p>
        <h2 className="section-title text-2xl sm:text-3xl md:text-4xl">Our Collections</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[250px] sm:auto-rows-[300px] lg:auto-rows-[350px]">
        <div className="sm:row-span-2">
          <CategoryCard {...cats[0]} className="h-full" />
        </div>
        {cats.slice(1).map(c => (
          <CategoryCard key={c.label} {...c} className="h-full" />
        ))}
      </div>
    </section>
  )
}

function CategoryCard({ label, sub, href, img, className }) {
  return (
    <Link to={href} className={`relative overflow-hidden group block ${className} rounded-lg overflow-hidden`}>
      <img src={img} alt={label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4">
        <p className="text-[10px] sm:text-xs tracking-widest uppercase text-gold-300 font-sans mb-1">{sub}</p>
        <h3 className="font-display text-xl sm:text-2xl lg:text-3xl text-white font-light">{label}</h3>
        <div className="flex items-center gap-2 mt-2 text-white/80 text-[10px] sm:text-xs tracking-widest uppercase font-sans group-hover:text-gold-300 transition-colors">
          Shop Now <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}

// ─── Featured Products ────────────────────────────────────────────────────────
function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => productAPI.getCollections().then(r => r.data),
  })

  const [tab, setTab] = useState('featured')
  const tabs = [
    { key: 'featured', label: 'Featured' },
    { key: 'newArrivals', label: 'New Arrivals' },
    { key: 'bestsellers', label: 'Bestsellers' },
    { key: 'onSale', label: 'On Sale' },
  ]

  const products = data?.[tab] || []

  return (
    <section className="bg-cream py-12 sm:py-16 lg:py-20">
      <div className="page-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-6">
          <div>
            <p className="section-subtitle mb-2 sm:mb-3">Curated For You</p>
            <h2 className="section-title text-2xl sm:text-3xl md:text-4xl">Discover Maison Luxe</h2>
          </div>
          <div className="flex flex-wrap gap-0 border-b border-obsidian-200 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 sm:px-5 py-2 text-[10px] sm:text-xs tracking-widest uppercase font-sans transition-all duration-200 border-b-2 -mb-px whitespace-nowrap ${
                  tab === t.key
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-obsidian-400 hover:text-obsidian'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="product-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {isLoading
            ? Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.slice(0, 8).map(p => <ProductCard key={p._id} product={p} />)
          }
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <Link to={`/shop?${tab === 'newArrivals' ? 'isNew=true' : tab === 'bestsellers' ? 'isBestseller=true' : tab === 'onSale' ? 'isOnSale=true' : 'isFeatured=true'}`}
            className="btn-outline inline-flex items-center gap-2">
            View All <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Brand Story ──────────────────────────────────────────────────────────────
function BrandStory() {
  return (
    <section className="flex flex-col md:flex-row min-h-[60vh]">
      <div className="relative overflow-hidden md:w-1/2 order-2 md:order-1">
        <img
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&q=85"
          alt="Brand story"
          className="w-full h-full object-cover min-h-[300px]"
        />
      </div>
      <div className="bg-obsidian flex items-center px-6 sm:px-10 md:px-16 py-12 sm:py-16 md:py-20 md:w-1/2 order-1 md:order-2">
        <div className="max-w-md mx-auto md:mx-0">
          <div className="divider-gold mb-6 sm:mb-8 max-w-[40px] sm:max-w-[60px]" style={{ height: '1px', background: '#D4AF37' }} />
          <p className="section-subtitle text-gold-400 mb-3 sm:mb-4">The Maison Story</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white font-light leading-tight mb-4 sm:mb-6">
            Craftsmanship That Transcends Time
          </h2>
          <p className="text-obsidian-300 font-sans text-sm leading-relaxed mb-4">
            Founded in 1998 with a singular vision — to create fashion that speaks the language of true luxury. Every stitch, every fabric, every silhouette is a testament to our uncompromising pursuit of perfection.
          </p>
          <p className="text-obsidian-400 font-sans text-sm leading-relaxed mb-6 sm:mb-8">
            Our ateliers in Milan and Paris house the world's most skilled artisans, each piece taking hundreds of hours to bring to life.
          </p>
          <Link to="/about" className="btn-outline-gold inline-flex items-center gap-2">
            Our Heritage <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Highlights ───────────────────────────────────────────────────────────────
function Highlights() {
  const items = [
    { icon: Truck, title: 'Complimentary Shipping', desc: 'On all orders over $500 worldwide' },
    { icon: '◈', title: 'Free Returns', desc: '30-day hassle-free return policy' },
    { icon: '◉', title: 'Authenticity Guaranteed', desc: 'Every piece certified genuine' },
    { icon: '◆', title: 'Concierge Service', desc: 'Personal styling consultation available' },
  ]

  return (
    <section className="border-y border-obsidian-100">
      <div className="page-container px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-obsidian-100">
          {items.map((item, idx) => (
            <div key={item.title} className="py-8 sm:py-10 px-4 sm:px-6 text-center">
              <div className="text-gold-500 text-2xl mb-3">{typeof item.icon === 'string' ? item.icon : <item.icon size={20} />}</div>
              <h4 className="font-sans font-medium text-sm mb-1.5">{item.title}</h4>
              <p className="text-xs text-obsidian-400 font-sans leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Lookbook Strip ───────────────────────────────────────────────────────────
function LookbookStrip() {
  const looks = [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=80',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&q=80',
    'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500&q=80',
  ]

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="page-container mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="section-subtitle mb-2 sm:mb-3">The Lookbook</p>
          <h2 className="section-title text-2xl sm:text-3xl md:text-4xl">Style Stories</h2>
        </div>
        <Link to="/lookbook" className="btn-ghost inline-flex items-center gap-2 self-start sm:self-auto">
          View All <ArrowRight size={14} />
        </Link>
      </div>
      <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide px-4 md:px-8 lg:px-16 pb-4">
        {looks.map((img, i) => (
          <Link key={i} to="/lookbook" className="flex-shrink-0 w-48 sm:w-64 md:w-72 overflow-hidden group">
            <div className="aspect-[3/4] overflow-hidden rounded-lg">
              <img src={img} alt={`Look ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ─── Press ────────────────────────────────────────────────────────────────────
function Press() {
  const outlets = ['Vogue', 'Harper\'s Bazaar', 'Elle', 'GQ', 'Vanity Fair', 'The New York Times']
  
  return (
    <section className="bg-cream py-10 sm:py-12 border-y border-obsidian-100">
      <div className="page-container px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[10px] sm:text-xs tracking-widest uppercase text-obsidian-400 font-sans mb-6 sm:mb-8">
          As Seen In
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-14">
          {outlets.map(o => (
            <span 
              key={o} 
              className="font-display text-lg sm:text-xl md:text-2xl text-obsidian-300 hover:text-obsidian transition-colors cursor-default"
            >
              {o}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Newsletter Section ──────────────────────────────────────────────────────
function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await newsletterAPI.subscribe({ email })
      toast.success('Successfully subscribed!')
      setEmail('')
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-obsidian">
      <div className="page-container text-center">
        <p className="section-subtitle text-gold-400 mb-3">Stay Updated</p>
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-white font-light mb-4">
          Join Our Inner Circle
        </h2>
        <p className="text-obsidian-300 font-sans text-sm mb-8 max-w-md mx-auto">
          Be the first to discover new collections, exclusive releases, and private events.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 bg-white/5 border border-obsidian-600 text-white placeholder-obsidian-400 rounded-full focus:outline-none focus:border-gold-500 transition-colors"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gold-500 text-obsidian font-sans font-medium text-sm tracking-wider uppercase rounded-full hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  )
}

// ─── Home Page ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Hero />
      <div className="overflow-x-hidden">
        <Highlights />
        <CategoryGrid />
        <FeaturedProducts />
        <BrandStory />
        <LookbookStrip />
        <Press />
        <Newsletter />
      </div>
    </>
  )
}