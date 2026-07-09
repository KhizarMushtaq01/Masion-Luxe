import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
export default function WorldOfMaison() {
  const stories = [
    { title:'The Atelier', sub:'Behind the craft', img:'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80', href:'/about' },
    { title:'Fashion Week', sub:'Spring/Summer 2025', img:'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80', href:'/lookbook' },
    { title:'Sustainability', sub:'Our commitment', img:'https://images.unsplash.com/photo-1542601906897-eef2cce60ec8?w=800&q=80', href:'/sustainability' },
    { title:'Bespoke Service', sub:'Made for you', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', href:'/contact' },
  ]
  return (
    <div>
      <div className="relative h-[60vh] flex items-end pb-16 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&q=90" alt="" className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 to-transparent"/>
        <div className="relative z-10 page-container">
          <p className="section-subtitle text-gold-400 mb-3">Universe</p>
          <h1 className="font-display text-5xl md:text-7xl text-white font-light">World of Maison</h1>
        </div>
      </div>
      <div className="page-container py-20">
        <div className="grid md:grid-cols-2 gap-6">
          {stories.map(s => (
            <Link key={s.title} to={s.href} className="group relative overflow-hidden aspect-[4/3] block">
              <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 to-transparent"/>
              <div className="absolute bottom-6 left-6">
                <p className="text-xs text-gold-300 tracking-widests uppercase font-sans mb-1">{s.sub}</p>
                <h3 className="font-display text-2xl text-white font-light">{s.title}</h3>
                <div className="flex items-center gap-2 text-white/70 text-xs font-sans mt-2 group-hover:text-gold-300 transition-colors">Explore <ArrowRight size={12}/></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
