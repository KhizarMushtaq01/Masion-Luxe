import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Eye } from 'lucide-react'
import { useCartStore, useWishlistStore } from '../../store/cartStore'
import useAuthStore from '../../store/authStore'
import { userAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function ProductCard({ product, className = '' }) {
  const [hovered, setHovered] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const { addToCart } = useCartStore()
  const { isInWishlist, toggle } = useWishlistStore()
  const { user } = useAuthStore()

  if (!product) return null

  const primaryImage = product.images?.find(i => i.isPrimary) || product.images?.[0]
  const secondaryImage = product.images?.[1]
  const imageUrl = primaryImage?.url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80'
  const hoverImageUrl = secondaryImage?.url || imageUrl
  const price = product.isOnSale && product.salePrice ? product.salePrice : product.basePrice
  const inWishlist = isInWishlist(product._id)

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { toast.error('Please sign in to save items'); return }
    toggle(product._id)
    try {
      await userAPI.toggleWishlist(product._id)
      toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist')
    } catch {
      toggle(product._id) // revert
      toast.error('Something went wrong')
    }
  }

  const handleQuickAdd = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { toast.error('Please sign in to add items'); return }
    setAddingToCart(true)
    const result = await addToCart({ productId: product._id, quantity: 1 })
    setAddingToCart(false)
    if (!result.success) toast.error(result.message)
    else toast.success('Added to bag')
  }

  return (
    <div
      className={`group relative ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <Link to={`/products/${product.slug || product._id}`} className="block">
        <div className="relative overflow-hidden bg-cream aspect-[3/4]">
          <img
            src={hovered && secondaryImage ? hoverImageUrl : imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNew && <span className="badge-gold text-[10px] py-0.5 px-2">New</span>}
            {product.isOnSale && product.salePercentage && (
              <span className="badge-sale text-[10px] py-0.5 px-2">-{product.salePercentage}%</span>
            )}
            {product.isBestseller && !product.isNew && (
              <span className="bg-obsidian text-white text-[10px] py-0.5 px-2 tracking-widest uppercase font-sans">Bestseller</span>
            )}
          </div>

          {/* Action buttons */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
            <button
              onClick={handleWishlist}
              className="w-9 h-9 bg-white shadow-luxury flex items-center justify-center hover:bg-obsidian hover:text-white transition-all duration-200"
              title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={15} fill={inWishlist ? 'currentColor' : 'none'} className={inWishlist ? 'text-red-500' : ''} />
            </button>
            <Link
              to={`/products/${product.slug || product._id}`}
              className="w-9 h-9 bg-white shadow-luxury flex items-center justify-center hover:bg-obsidian hover:text-white transition-all duration-200"
              title="Quick view"
            >
              <Eye size={15} />
            </Link>
          </div>

          {/* Quick add */}
          <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <button
              onClick={handleQuickAdd}
              disabled={addingToCart || product.stock === 0}
              className="w-full bg-obsidian/95 hover:bg-obsidian text-white py-3 text-xs tracking-widest uppercase font-sans flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              <ShoppingBag size={13} />
              {product.stock === 0 ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Quick Add'}
            </button>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="mt-3 space-y-1">
        {product.category?.name && (
          <p className="text-[10px] tracking-widest uppercase text-obsidian-400 font-sans">{product.category.name}</p>
        )}
        <Link to={`/products/${product.slug || product._id}`}>
          <h3 className="text-sm font-sans font-medium text-obsidian hover:text-gold-600 transition-colors leading-tight line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          {product.isOnSale && product.salePrice ? (
            <>
              <span className="text-sm font-sans font-medium text-red-600">${product.salePrice.toFixed(2)}</span>
              <span className="text-xs text-obsidian-400 font-sans line-through">${product.basePrice?.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-sm font-sans font-medium">${product.basePrice?.toFixed(2) || '—'}</span>
          )}
        </div>

        {product.ratings?.count > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <span key={s} className={`text-[10px] ${s <= Math.round(product.ratings.average) ? 'text-gold-500' : 'text-obsidian-200'}`}>★</span>
              ))}
            </div>
            <span className="text-[10px] text-obsidian-400 font-sans">({product.ratings.count})</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] skeleton" />
      <div className="mt-3 space-y-2">
        <div className="h-2.5 skeleton rounded w-1/3" />
        <div className="h-3.5 skeleton rounded w-full" />
        <div className="h-3 skeleton rounded w-1/4" />
      </div>
    </div>
  )
}
