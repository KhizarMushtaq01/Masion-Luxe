// Wishlist.jsx
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { userAPI } from '../../services/api'
import ProductCard from '../../components/product/ProductCard'

export default function Wishlist() {
  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => userAPI.getWishlist().then(r => r.data),
  })

  return (
    <div className="page-container py-12">
      <div className="mb-10">
        <p className="section-subtitle mb-2">My Collection</p>
        <h1 className="section-title">Saved Pieces</h1>
      </div>

      {isLoading ? (
        <div className="product-grid">{Array(8).fill(0).map((_, i) => <div key={i} className="aspect-[3/4] skeleton" />)}</div>
      ) : !data?.wishlist?.length ? (
        <div className="text-center py-20">
          <Heart size={48} className="text-obsidian-200 mx-auto mb-4" strokeWidth={1} />
          <h2 className="font-display text-3xl text-obsidian-300 mb-3">Your wishlist is empty</h2>
          <p className="text-sm text-obsidian-400 font-sans mb-6">Save items you love and come back to them anytime.</p>
          <Link to="/shop" className="btn-primary">Discover Collections</Link>
        </div>
      ) : (
        <div className="product-grid">
          {data.wishlist.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  )
}
