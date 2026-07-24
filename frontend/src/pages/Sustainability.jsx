import { Leaf, Recycle, Zap, Users } from 'lucide-react'

export default function Sustainability() {
  return (
    <div className="page-container py-20 max-w-3xl mx-auto">
      <p className="section-subtitle mb-3">Responsibility</p>
      <h1 className="section-title mb-10">Our Commitment to the Planet</h1>
      <div className="space-y-10">
        {[
          { icon: Leaf, title:'Responsible Sourcing', desc:'All our fabrics are sourced from certified suppliers who share our commitment to ethical practices. We prioritise organic, recycled, and traceable materials in every collection.' },
          { icon: Recycle, title:'Circular Fashion', desc:'Our take-back programme allows you to return worn Maison Luxe pieces for restoration or responsible recycling. We believe in closing the loop on fashion.' },
          { icon: Zap, title:'Carbon Neutral by 2030', desc:'We are committed to achieving carbon neutrality across our entire supply chain by 2030. We have already reduced our emissions by 40% since 2020.' },
          { icon: Users, title:'Fair Wages & Conditions', desc:'Every person in our supply chain is paid a living wage and works in safe, dignified conditions. We publish our full supplier list annually.' },
        ].map(s=>(
          <div key={s.title} className="flex gap-6">
            <div className="text-3xl flex-shrink-0 w-12"><s.icon size={20} className="text-gold-500" /></div>
            <div>
              <h3 className="font-display text-xl mb-2">{s.title}</h3>
              <p className="font-sans text-sm text-obsidian-600 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
