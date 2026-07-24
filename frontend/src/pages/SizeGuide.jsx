import { useState } from 'react'
import { Ruler } from 'lucide-react'

const charts = {
  women: {
    label: 'Women',
    headers: ['Size', 'US', 'UK', 'EU', 'Bust (cm)', 'Waist (cm)', 'Hips (cm)'],
    rows: [
      ['XS', '0 – 2', '4 – 6', '32 – 34', '78 – 81', '60 – 63', '86 – 89'],
      ['S', '4 – 6', '8 – 10', '36 – 38', '84 – 87', '66 – 69', '92 – 95'],
      ['M', '8 – 10', '12 – 14', '40 – 42', '90 – 93', '72 – 75', '98 – 101'],
      ['L', '12 – 14', '16 – 18', '44 – 46', '96 – 101', '78 – 83', '104 – 109'],
      ['XL', '16 – 18', '20 – 22', '48 – 50', '104 – 109', '86 – 91', '112 – 117'],
    ],
  },
  men: {
    label: 'Men',
    headers: ['Size', 'US', 'UK', 'EU', 'Chest (cm)', 'Waist (cm)', 'Neck (cm)'],
    rows: [
      ['S', '36', '36', '46', '91 – 96', '76 – 81', '37 – 38'],
      ['M', '38 – 40', '38 – 40', '48 – 50', '99 – 104', '84 – 89', '39 – 40'],
      ['L', '42', '42', '52', '107 – 112', '91 – 97', '41 – 42'],
      ['XL', '44', '44', '54', '114 – 119', '99 – 104', '43 – 44'],
      ['XXL', '46 – 48', '46 – 48', '56 – 58', '122 – 127', '107 – 112', '45 – 46'],
    ],
  },
  kids: {
    label: 'Kids',
    headers: ['Size', 'Age', 'Height (cm)', 'Chest (cm)', 'Waist (cm)'],
    rows: [
      ['2Y', '2 years', '86 – 92', '52 – 53', '50 – 51'],
      ['4Y', '4 years', '98 – 104', '55 – 56', '52 – 53'],
      ['6Y', '6 years', '110 – 116', '58 – 60', '54 – 56'],
      ['8Y', '8 years', '122 – 128', '62 – 64', '57 – 59'],
      ['10Y', '10 years', '134 – 140', '66 – 68', '60 – 62'],
    ],
  },
}

const measuringTips = [
  { title: 'Bust / Chest', desc: 'Measure around the fullest part of your bust or chest, keeping the tape parallel to the floor.' },
  { title: 'Waist', desc: 'Measure around the narrowest part of your natural waistline, above the belly button.' },
  { title: 'Hips', desc: 'Measure around the fullest part of your hips, roughly 20cm below your waist.' },
  { title: 'Inseam', desc: 'Measure from the crotch seam straight down to the bottom of the ankle.' },
]

export default function SizeGuide() {
  const [tab, setTab] = useState('women')
  const chart = charts[tab]

  return (
    <div className="page-container py-16 md:py-20">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="section-subtitle mb-3">Fit With Confidence</p>
        <h1 className="section-title mb-5">Size Guide</h1>
        <p className="font-sans text-sm md:text-base text-obsidian-600 leading-relaxed">
          Find your perfect fit across our Women's, Men's, and Kids' collections. All measurements are body measurements, not garment measurements.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex justify-center gap-0 border-b border-obsidian-100 mb-8 overflow-x-auto scrollbar-hide">
        {Object.entries(charts).map(([key, c]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-6 md:px-8 py-4 text-xs tracking-widest uppercase font-sans border-b-2 -mb-px whitespace-nowrap transition-all duration-200 ${tab === key ? 'border-gold-500 text-gold-600' : 'border-transparent text-obsidian-400 hover:text-obsidian'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="overflow-x-auto border border-obsidian-100 mb-16">
        <table className="w-full text-left font-sans text-sm min-w-[560px]">
          <thead>
            <tr className="bg-obsidian-50 text-xs tracking-widest uppercase text-obsidian-500">
              {chart.headers.map(h => (
                <th key={h} className="px-4 md:px-6 py-4 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chart.rows.map((row, i) => (
              <tr key={i} className="border-t border-obsidian-100">
                {row.map((cell, j) => (
                  <td key={j} className={`px-4 md:px-6 py-4 whitespace-nowrap ${j === 0 ? 'text-obsidian font-medium' : 'text-obsidian-600'}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* How to measure */}
      <section className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8 justify-center text-center flex-col sm:flex-row sm:justify-start sm:text-left">
          <Ruler size={20} className="text-gold-500" />
          <h2 className="font-display text-2xl md:text-3xl font-light text-obsidian">How to Measure</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-8">
          {measuringTips.map(t => (
            <div key={t.title} className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-gold-500 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-display text-lg text-obsidian mb-1.5">{t.title}</h3>
                <p className="text-sm text-obsidian-600 font-sans leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-obsidian-500 font-sans mt-8 leading-relaxed">
          Between sizes? We recommend sizing up for a relaxed fit or sizing down for a tailored silhouette. For further assistance, our <a href="/contact" className="text-gold-600 hover:underline">Client Services</a> team is happy to help you find your ideal fit.
        </p>
      </section>
    </div>
  )
}
