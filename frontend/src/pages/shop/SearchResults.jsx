import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productAPI } from '../../services/api'
import ProductCard, { ProductCardSkeleton } from '../../components/product/ProductCard'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''

  const { data, isLoading } = useQuery({
    queryKey: ['search', q],
    queryFn: () => productAPI.getProducts({ search: q, limit: 48 }).then(r => r.data),
    enabled: !!q,
  })

  return (
    <div className="page-container py-12">
      <div className="mb-10">
        <p className="section-subtitle mb-2">Search</p>
        <h1 className="section-title">
          {q ? <>Results for <em className="text-gold-600 not-italic">"{q}"</em></> : 'All Products'}
        </h1>
        {data && <p className="text-sm text-obsidian-400 font-sans mt-2">{data.pagination?.total || 0} results found</p>}
      </div>

      {isLoading ? (
        <div className="product-grid">{Array(12).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
      ) : data?.products?.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-3xl text-obsidian-300 mb-4">No results for "{q}"</p>
          <p className="text-sm text-obsidian-400 font-sans">Try different keywords or browse our collections.</p>
        </div>
      ) : (
        <div className="product-grid">
          {data?.products?.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  )
}
