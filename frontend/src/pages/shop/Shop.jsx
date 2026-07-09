import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { productAPI, categoryAPI } from '../../services/api'
import ProductCard, { ProductCardSkeleton } from '../../components/product/ProductCard'

const SIZES = ['XS','S','M','L','XL','XXL','36','37','38','39','40','41','42','43','44','45']
const PRICE_RANGES = [
  { label: 'Under $200', min: 0, max: 200 },
  { label: '$200 – $500', min: 200, max: 500 },
  { label: '$500 – $1,000', min: 500, max: 1000 },
  { label: '$1,000 – $2,500', min: 1000, max: 2500 },
  { label: 'Over $2,500', min: 2500, max: null },
]
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: '-ratings.average', label: 'Best Rated' },
  { value: '-soldCount', label: 'Best Selling' },
]

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-obsidian-100 pb-5 mb-5">
      <button
        className="flex items-center justify-between w-full mb-4"
        onClick={() => setOpen(!open)}
      >
        <span className="text-xs tracking-widest uppercase font-sans font-medium">{title}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && children}
    </div>
  )
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { category, gender } = useParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)

  const getParam = (key) => searchParams.get(key)
  const sort = getParam('sort') || '-createdAt'
  const genderFilter = gender || getParam('gender') || ''
  const isOnSale = getParam('isOnSale') === 'true'
  const isNew = getParam('isNew') === 'true'
  const isFeatured = getParam('isFeatured') === 'true'
  const selectedSizes = searchParams.getAll('size')
  const minPrice = getParam('minPrice')
  const maxPrice = getParam('maxPrice')
  const search = getParam('search') || getParam('q') || ''

  const updateFilter = useCallback((key, value, multi = false) => {
    setPage(1)
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value === null || value === '') { next.delete(key) }
      else if (multi) {
        const vals = next.getAll(key)
        if (vals.includes(value)) next.delete(key)
        else next.append(key, value)
        // re-add remaining
      } else { next.set(key, value) }
      return next
    })
  }, [setSearchParams])

  const clearFilters = () => {
    setPage(1)
    setSearchParams({})
  }

  const { data, isLoading } = useQuery({
    queryKey: ['products', { genderFilter, isOnSale, isNew, isFeatured, sort, page, minPrice, maxPrice, selectedSizes, search }],
    queryFn: () => productAPI.getProducts({
      gender: genderFilter || undefined,
      isOnSale: isOnSale || undefined,
      isNew: isNew || undefined,
      isFeatured: isFeatured || undefined,
      sort,
      page,
      limit: 24,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      size: selectedSizes.length ? selectedSizes : undefined,
      search: search || undefined,
    }).then(r => r.data),
    keepPreviousData: true,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getCategories().then(r => r.data),
    staleTime: Infinity,
  })

  const title = (() => {
    if (search) return `Search: "${search}"`
    if (isOnSale) return 'Sale'
    if (isNew) return 'New Arrivals'
    if (isFeatured) return 'Featured'
    if (gender === 'women') return 'Women'
    if (gender === 'men') return 'Men'
    if (genderFilter === 'kids') return 'Kids'
    return 'All Collections'
  })()

  const totalPages = data?.pagination?.pages || 1
  const total = data?.pagination?.total || 0

  const Sidebar = () => (
    <div className="space-y-0">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-sans text-sm font-medium tracking-widest uppercase">Filters</h3>
        {(isOnSale || isNew || minPrice || maxPrice || selectedSizes.length) > 0 && (
          <button onClick={clearFilters} className="text-xs text-gold-600 hover:text-gold-700 font-sans flex items-center gap-1">
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Gender */}
      <FilterSection title="Collection">
        <div className="space-y-2">
          {['women', 'men', 'unisex', 'kids'].map(g => (
            <label key={g} className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="gender" checked={genderFilter === g}
                onChange={() => updateFilter('gender', genderFilter === g ? '' : g)}
                className="accent-gold-500" />
              <span className="text-sm font-sans capitalize text-obsidian-600 group-hover:text-obsidian transition-colors">{g}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price">
        <div className="space-y-2">
          {PRICE_RANGES.map((r) => (
            <label key={r.label} className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="price" checked={minPrice == r.min && (maxPrice == r.max || (!maxPrice && !r.max))}
                onChange={() => { updateFilter('minPrice', r.min); updateFilter('maxPrice', r.max || '') }}
                className="accent-gold-500" />
              <span className="text-sm font-sans text-obsidian-600 group-hover:text-obsidian transition-colors">{r.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map(s => (
            <button key={s} onClick={() => updateFilter('size', s, true)}
              className={`w-10 h-10 text-xs font-sans border transition-all duration-150 ${selectedSizes.includes(s) ? 'border-obsidian bg-obsidian text-white' : 'border-obsidian-200 hover:border-obsidian text-obsidian-600'}`}>
              {s}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Toggles */}
      <FilterSection title="Availability" defaultOpen={false}>
        <div className="space-y-3">
          {[
            { key: 'isNew', label: 'New Arrivals', val: isNew },
            { key: 'isOnSale', label: 'On Sale', val: isOnSale },
            { key: 'isFeatured', label: 'Featured', val: isFeatured },
          ].map(f => (
            <label key={f.key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={f.val} onChange={() => updateFilter(f.key, f.val ? '' : 'true')} className="accent-gold-500" />
              <span className="text-sm font-sans text-obsidian-600">{f.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  )

  return (
    <div className="page-container py-12">
      {/* Breadcrumb */}
      <div className="mb-6">
        <p className="text-xs text-obsidian-400 font-sans">
          Home / {gender ? <span className="capitalize">{gender} / </span> : null}
          <span className="text-obsidian">{title}</span>
        </p>
      </div>

      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-obsidian font-light">{title}</h1>
          <p className="text-sm text-obsidian-400 font-sans mt-2">{total} {total === 1 ? 'piece' : 'pieces'}</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setFiltersOpen(!filtersOpen)}
            className="lg:hidden flex items-center gap-2 btn-outline text-xs py-2.5 px-4">
            <SlidersHorizontal size={14} /> Filters
          </button>
          <select
            value={sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="text-xs tracking-widest uppercase font-sans border border-obsidian-200 bg-transparent px-4 py-2.5 focus:outline-none focus:border-gold-400 cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-10">
        {/* Sidebar – desktop */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Mobile filter overlay */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
            <div className="relative w-80 bg-white h-full overflow-y-auto p-6 animate-slide-in-left">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-sans font-medium">Filters</h3>
                <button onClick={() => setFiltersOpen(false)}><X size={18} /></button>
              </div>
              <Sidebar />
              <button onClick={() => setFiltersOpen(false)} className="btn-primary w-full mt-4">
                Show {total} Results
              </button>
            </div>
          </div>
        )}

        {/* Products */}
        <div className="flex-1">
          {isLoading ? (
            <div className="product-grid">
              {Array(12).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : data?.products?.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-display text-3xl text-obsidian-300 mb-4">No products found</p>
              <p className="text-sm text-obsidian-400 font-sans mb-6">Try adjusting your filters or</p>
              <button onClick={clearFilters} className="btn-outline">Clear All Filters</button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {data?.products?.map(p => <ProductCard key={p._id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-16">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="btn-outline text-xs py-2 px-4 disabled:opacity-40">Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-10 h-10 text-sm font-sans transition-all ${p === page ? 'bg-obsidian text-white' : 'border border-obsidian-200 hover:border-obsidian text-obsidian-600'}`}>
                      {p}
                    </button>
                  ))}
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                    className="btn-outline text-xs py-2 px-4 disabled:opacity-40">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
