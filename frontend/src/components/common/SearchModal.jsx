import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight } from 'lucide-react'
import { productAPI } from '../../services/api'

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) { setTimeout(() => inputRef.current?.focus(), 100); setQuery(''); setResults([]) }
  }, [isOpen])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await productAPI.search(query, 8)
        setResults(data.products)
      } catch {} finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) { navigate(`/search?q=${encodeURIComponent(query)}`); onClose() }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-obsidian/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 bg-white shadow-luxury-lg animate-fade-up">
        <div className="page-container py-6">
          <form onSubmit={handleSubmit} className="flex items-center gap-4">
            <Search size={20} className="text-obsidian-400 flex-shrink-0" strokeWidth={1.5} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search collections, products, styles..."
              className="flex-1 text-lg font-sans bg-transparent border-none outline-none placeholder-obsidian-300"
            />
            <button type="button" onClick={onClose} className="text-obsidian-400 hover:text-obsidian transition-colors">
              <X size={20} />
            </button>
          </form>
        </div>

        {results.length > 0 && (
          <div className="border-t border-obsidian-100">
            <div className="page-container py-6">
              <p className="text-xs tracking-widest uppercase text-gold-600 font-sans mb-4">Results</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {results.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => { navigate(`/products/${p.slug || p._id}`); onClose() }}
                    className="flex items-center gap-3 text-left hover:bg-cream p-2 transition-colors group"
                  >
                    <img
                      src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&q=80'}
                      alt={p.name}
                      className="w-14 h-14 object-cover flex-shrink-0 bg-cream"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-sans font-medium truncate group-hover:text-gold-600 transition-colors">{p.name}</p>
                      <p className="text-xs text-obsidian-400 font-sans mt-0.5">
                        {p.isOnSale && p.salePrice ? `$${p.salePrice.toFixed(2)}` : `$${p.basePrice?.toFixed(2) || '—'}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                className="mt-4 flex items-center gap-2 text-xs tracking-widest uppercase font-sans text-gold-600 hover:text-gold-700 transition-colors"
              >
                View all results for "{query}" <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <div className="border-t border-obsidian-100">
            <div className="page-container py-8 text-center">
              <p className="text-obsidian-400 font-sans text-sm">No results for "{query}"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
