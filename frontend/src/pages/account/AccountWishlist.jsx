import { useQuery } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AccountLayout } from '../../components/auth/AccountLayout'
import { userAPI } from '../../services/api'
import ProductCard from '../../components/product/ProductCard'

export default function AccountWishlist() {
  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => userAPI.getWishlist().then(r => r.data),
  })

  return (
    <AccountLayout title="My Wishlist">
      {isLoading ? (
        <div className="product-grid">{Array(6).fill(0).map((_,i) => <div key={i} className="aspect-[3/4] skeleton"/>)}</div>
      ) : !data?.wishlist?.length ? (
        <div className="text-center py-16">
          <Heart size={48} className="text-obsidian-200 mx-auto mb-4" strokeWidth={1} />
          <p className="font-display text-2xl text-obsidian-300 mb-3">Your wishlist is empty</p>
          <p className="text-sm text-obsidian-400 font-sans mb-6">Browse our collections and save the pieces you love.</p>
          <Link to="/shop" className="btn-primary">Explore Collections</Link>
        </div>
      ) : (
        <div className="product-grid">
          {data.wishlist.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </AccountLayout>
  )
}
