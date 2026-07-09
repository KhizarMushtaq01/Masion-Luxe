export default function About() {
  return (
    <div>
      <div className="relative h-[50vh] flex items-end pb-16 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1800&q=90" alt="" className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 to-transparent"/>
        <div className="relative z-10 page-container">
          <h1 className="font-display text-5xl md:text-7xl text-white font-light">Our Heritage</h1>
        </div>
      </div>
      <div className="page-container py-20 max-w-4xl">
        <p className="section-subtitle mb-4">Since 1998</p>
        <h2 className="section-title mb-8">The Maison Luxe Story</h2>
        <div className="space-y-6 font-sans text-obsidian-600 leading-relaxed">
          <p>Founded in Milan in 1998, Maison Luxe was born from a simple yet profound vision: to create fashion that transcends time, trend, and occasion. Our founder, with decades of experience in haute couture, established a house dedicated to the belief that true luxury lies in the quality of craft, not the loudness of a logo.</p>
          <p>Today, our ateliers in Milan and Paris employ over 200 artisans, each a master of their craft. From the silk weavers of Como to the leather craftspeople of Florence, every piece bears the mark of human hands guided by generations of knowledge.</p>
          <p>We do not believe in fast fashion. We believe in pieces that outlast seasons, pieces that become part of your story. Every Maison Luxe creation is designed with longevity in mind — both in terms of durability and aesthetic relevance.</p>
        </div>
        <div className="grid grid-cols-3 gap-8 mt-16 py-16 border-y border-obsidian-100">
          {[{n:'26+',l:'Years of Craft'},{n:'200+',l:'Skilled Artisans'},{n:'80+',l:'Countries Served'}].map(s=>(
            <div key={s.l} className="text-center">
              <p className="font-display text-5xl text-gold-600 mb-2">{s.n}</p>
              <p className="text-xs tracking-widests uppercase font-sans text-obsidian-500">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
