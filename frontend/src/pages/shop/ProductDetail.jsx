import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Heart, Share2, ChevronDown, Star, Truck, RotateCcw, Shield, AlertTriangle, Check, CheckCircle2 } from 'lucide-react'
import { productAPI, reviewAPI } from '../../services/api'
import { useCartStore, useWishlistStore } from '../../store/cartStore'
import useAuthStore from '../../store/authStore'
import { userAPI } from '../../services/api'
import ProductCard from '../../components/product/ProductCard'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id } = useParams()
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [activeTab, setActiveTab] = useState('details')
  const { addToCart, isLoading: cartLoading } = useCartStore()
  const { isInWishlist, toggle } = useWishlistStore()
  const { user } = useAuthStore()

  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productAPI.getProduct(id).then(r => r.data),
  })

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewAPI.getProductReviews(id).then(r => r.data),
    enabled: !!productData,
  })

  const product = productData?.product
  const reviews = reviewsData?.reviews || []
  const inWishlist = isInWishlist(product?._id)

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please sign in first'); return }
    if (product?.sizes?.length && !selectedSize) { toast.error('Please select a size'); return }
    const result = await addToCart({
      productId: product._id,
      quantity: qty,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    })
    if (!result.success) toast.error(result.message)
    else toast.success(`${product.name} added to your bag`)
  }

  const handleWishlist = async () => {
    if (!user) { toast.error('Please sign in to save items'); return }
    toggle(product._id)
    try {
      await userAPI.toggleWishlist(product._id)
      toast.success(inWishlist ? 'Removed from wishlist' : 'Saved to wishlist')
    } catch {
      toggle(product._id)
    }
  }

  if (isLoading) return (
    <div className="page-container py-16">
      <div className="grid md:grid-cols-2 gap-16 animate-pulse">
        <div className="aspect-[3/4] skeleton" />
        <div className="space-y-4">
          <div className="h-6 skeleton rounded w-1/3" />
          <div className="h-10 skeleton rounded w-2/3" />
          <div className="h-8 skeleton rounded w-1/4" />
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="page-container py-24 text-center">
      <p className="font-display text-3xl text-obsidian-300">Product not found</p>
      <Link to="/shop" className="btn-primary mt-6 inline-flex">Browse Shop</Link>
    </div>
  )

  const images = product.images?.length ? product.images : [{ url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80' }]
  const price = product.isOnSale && product.salePrice ? product.salePrice : product.basePrice

  return (
    <div className="page-container py-10 md:py-16">
      {/* Breadcrumb */}
      <nav className="text-xs text-obsidian-400 font-sans mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-gold-600 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-gold-600 transition-colors">Shop</Link>
        <span>/</span>
        {product.category && <><Link to={`/shop/${product.category.slug}`} className="hover:text-gold-600 transition-colors capitalize">{product.category.name}</Link><span>/</span></>}
        <span className="text-obsidian">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-[1fr_480px] lg:grid-cols-[1fr_520px] gap-10 lg:gap-20">
        {/* Images */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          <div className="hidden md:flex flex-col gap-3 w-20 flex-shrink-0">
            {images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`aspect-[3/4] overflow-hidden border-2 transition-all duration-200 ${activeImg === i ? 'border-gold-400' : 'border-transparent'}`}>
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main image */}
          <div className="flex-1">
            <div className="relative aspect-[3/4] overflow-hidden bg-cream">
              <img src={images[activeImg]?.url} alt={product.name} className="w-full h-full object-cover" />
              {product.isOnSale && product.salePercentage && (
                <div className="absolute top-4 left-4">
                  <span className="badge-sale">−{product.salePercentage}%</span>
                </div>
              )}
              {product.isNew && (
                <div className="absolute top-4 left-4">
                  <span className="badge-gold">New</span>
                </div>
              )}
            </div>
            {/* Mobile thumbnails */}
            <div className="flex md:hidden gap-2 mt-3 overflow-x-auto scrollbar-hide">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 aspect-[3/4] flex-shrink-0 border-2 overflow-hidden ${activeImg === i ? 'border-gold-400' : 'border-transparent'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          {product.category && (
            <Link to={`/shop/${product.category.slug}`} className="text-xs tracking-widest uppercase text-gold-600 font-sans hover:text-gold-700 transition-colors">
              {product.category.name}
            </Link>
          )}

          <h1 className="font-display text-3xl md:text-4xl font-light leading-tight">{product.name}</h1>

          {/* Ratings */}
          {product.ratings?.count > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= Math.round(product.ratings.average) ? '#c9a96e' : 'none'} stroke={s <= Math.round(product.ratings.average) ? '#c9a96e' : '#ccc'} />)}
              </div>
              <span className="text-sm text-obsidian-400 font-sans">{product.ratings.average.toFixed(1)} ({product.ratings.count} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className={`font-display text-3xl ${product.isOnSale ? 'text-red-600' : 'text-obsidian'}`}>
              ${price?.toFixed(2)}
            </span>
            {product.isOnSale && product.basePrice && (
              <span className="font-display text-xl text-obsidian-300 line-through">${product.basePrice.toFixed(2)}</span>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-sm text-obsidian-600 font-sans leading-relaxed border-l-2 border-gold-300 pl-4">{product.shortDescription}</p>
          )}

          <div className="divider-gold" />

          {/* Color */}
          {product.colors?.length > 0 && (
            <div>
              <p className="text-xs tracking-widest uppercase font-sans mb-3">
                Color: <span className="text-gold-600">{selectedColor || 'Select'}</span>
              </p>
              <div className="flex gap-2">
                {product.colors.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(selectedColor === c.name ? '' : c.name)}
                    title={c.name}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${selectedColor === c.name ? 'border-gold-500 scale-110' : 'border-white shadow-md hover:border-obsidian-300'}`}
                    style={{ backgroundColor: c.hex || '#999' }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {product.sizes?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs tracking-widest uppercase font-sans">
                  Size: <span className="text-gold-600">{selectedSize || 'Select'}</span>
                </p>
                <button className="text-xs text-obsidian-400 font-sans underline hover:text-gold-600 transition-colors">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                    className={`min-w-[44px] h-11 px-3 text-sm font-sans border transition-all duration-150 ${selectedSize === s ? 'border-obsidian bg-obsidian text-white' : 'border-obsidian-200 hover:border-obsidian text-obsidian-600'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add */}
          <div className="flex gap-3">
            <div className="flex items-center border border-obsidian-200">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-11 h-12 flex items-center justify-center text-obsidian-400 hover:text-obsidian transition-colors text-lg">−</button>
              <span className="w-10 text-center font-sans text-sm">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock || 10, q + 1))} className="w-11 h-12 flex items-center justify-center text-obsidian-400 hover:text-obsidian transition-colors text-lg">+</button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={cartLoading || product.stock === 0}
              className="flex-1 btn-primary disabled:opacity-60"
            >
              {product.stock === 0 ? 'Out of Stock' : cartLoading ? 'Adding...' : 'Add to Bag'}
            </button>
            <button
              onClick={handleWishlist}
              className={`w-12 h-12 border flex items-center justify-center transition-all duration-200 ${inWishlist ? 'border-red-300 bg-red-50 text-red-500' : 'border-obsidian-200 hover:border-obsidian text-obsidian-400'}`}
            >
              <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>

          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-xs text-amber-600 font-sans flex items-center gap-1.5"><AlertTriangle size={12} /> Only {product.stock} left in stock</p>
          )}

          {/* Delivery info */}
          <div className="space-y-3 pt-2">
            {[
              { icon: Truck, text: 'Complimentary shipping on orders over $500' },
              { icon: RotateCcw, text: 'Free returns within 30 days' },
              { icon: Shield, text: 'Authenticity guaranteed' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-xs text-obsidian-500 font-sans">
                <Icon size={14} className="text-gold-500 flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs: Details / Material / Reviews */}
      <div className="mt-16 border-t border-obsidian-100">
        <div className="flex gap-0 border-b border-obsidian-100">
          {[
            { key: 'details', label: 'Product Details' },
            { key: 'material', label: 'Material & Care' },
            { key: 'reviews', label: `Reviews (${reviews.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-6 py-4 text-xs tracking-widest uppercase font-sans border-b-2 -mb-px transition-all duration-200 ${activeTab === t.key ? 'border-gold-500 text-gold-600' : 'border-transparent text-obsidian-400 hover:text-obsidian'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="py-8 max-w-2xl">
          {activeTab === 'details' && (
            <div>
              <p className="text-sm text-obsidian-600 font-sans leading-relaxed mb-6">{product.description}</p>
              {product.features?.length > 0 && (
                <ul className="space-y-2">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-sans text-obsidian-600">
                      <Check size={14} className="text-gold-500 mt-0.5 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'material' && (
            <div>
              {product.material && (
                <p className="text-sm text-obsidian-600 font-sans leading-relaxed mb-6">
                  <strong className="text-obsidian">Material: </strong>{product.material}
                </p>
              )}
              {product.careInstructions?.length > 0 && (
                <ul className="space-y-2">
                  {product.careInstructions.map((c, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-sans text-obsidian-600">
                      <span className="text-gold-500">◈</span> {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {reviews.length === 0 ? (
                <p className="text-sm text-obsidian-400 font-sans">No reviews yet. Be the first to share your experience.</p>
              ) : (
                <div className="space-y-8">
                  {reviews.map(r => (
                    <div key={r._id} className="border-b border-obsidian-100 pb-8">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-sans font-medium text-sm">{r.user?.firstName} {r.user?.lastName}</p>
                          <div className="flex gap-0.5 mt-1">
                            {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= r.rating ? '#c9a96e' : 'none'} stroke={s <= r.rating ? '#c9a96e' : '#ccc'} />)}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-obsidian-400 font-sans">{new Date(r.createdAt).toLocaleDateString()}</p>
                          {r.isVerifiedPurchase && <span className="text-[10px] text-green-600 font-sans flex items-center gap-1"><CheckCircle2 size={11} /> Verified Purchase</span>}
                        </div>
                      </div>
                      <h4 className="font-sans font-medium text-sm mb-1">{r.title}</h4>
                      <p className="text-sm text-obsidian-600 font-sans leading-relaxed">{r.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {product.relatedProducts?.length > 0 && (
        <section className="mt-16 border-t border-obsidian-100 pt-16">
          <h2 className="section-title mb-10">You May Also Like</h2>
          <div className="product-grid">
            {product.relatedProducts.slice(0, 4).map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
