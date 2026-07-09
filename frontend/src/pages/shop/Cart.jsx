// Cart.jsx
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '../../store/cartStore'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function Cart() {
  const { cart, removeItem, updateItem, getSubtotal, applyCoupon } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [coupon, setCoupon] = useState('')
  const [applying, setApplying] = useState(false)

  const subtotal = getSubtotal()
  const discount = cart?.discountAmount || 0
  const shipping = subtotal - discount >= 500 ? 0 : 25
  const total = subtotal - discount + shipping

  const handleCoupon = async () => {
    if (!coupon.trim()) return
    setApplying(true)
    const result = await applyCoupon(coupon)
    setApplying(false)
    if (result.success) toast.success(result.message)
    else toast.error(result.message)
  }

  if (!cart?.items?.length) return (
    <div className="page-container py-24 text-center">
      <ShoppingBag size={64} className="text-obsidian-200 mx-auto mb-6" strokeWidth={0.8} />
      <h1 className="font-display text-4xl mb-3">Your Bag is Empty</h1>
      <p className="text-obsidian-400 font-sans text-sm mb-8">Discover our latest collections and find your perfect piece.</p>
      <Link to="/shop" className="btn-primary">Continue Shopping</Link>
    </div>
  )

  return (
    <div className="page-container py-12">
      <h1 className="font-display text-4xl mb-10">Shopping Bag</h1>
      <div className="grid lg:grid-cols-[1fr_380px] gap-12">
        {/* Items */}
        <div>
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_40px] text-xs tracking-widest uppercase font-sans text-obsidian-400 border-b border-obsidian-100 pb-3 mb-4 gap-4">
            <span>Product</span><span className="text-center">Size</span><span className="text-center">Qty</span><span className="text-right">Price</span><span />
          </div>
          {cart.items.map(item => {
            const p = item.product
            const price = item.price || p?.salePrice || p?.basePrice || 0
            return (
              <div key={item._id} className="grid md:grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 items-center py-5 border-b border-obsidian-100">
                <div className="flex gap-4">
                  <Link to={`/products/${p?.slug || p?._id}`} className="w-20 h-24 flex-shrink-0 bg-cream overflow-hidden">
                    <img src={p?.images?.[0]?.url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&q=80'} alt={p?.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="min-w-0 py-1">
                    <p className="text-xs text-gold-600 font-sans uppercase tracking-widest mb-1">{p?.category?.name}</p>
                    <Link to={`/products/${p?.slug || p?._id}`} className="font-sans text-sm font-medium hover:text-gold-600 transition-colors">{p?.name}</Link>
                    <p className="text-xs text-obsidian-400 font-sans mt-1 md:hidden">{[item.size, item.color].filter(Boolean).join(' · ')}</p>
                    <p className="text-sm font-medium mt-1 md:hidden">${(price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
                <div className="hidden md:block text-center text-sm font-sans text-obsidian-500">{[item.size, item.color].filter(Boolean).join(' / ') || '—'}</div>
                <div className="flex items-center justify-center gap-0 border border-obsidian-200 w-fit mx-auto">
                  <button onClick={() => updateItem(item._id, item.quantity - 1)} className="w-8 h-9 flex items-center justify-center hover:bg-cream transition-colors"><Minus size={12} /></button>
                  <span className="w-8 text-center text-sm font-sans">{item.quantity}</span>
                  <button onClick={() => updateItem(item._id, item.quantity + 1)} className="w-8 h-9 flex items-center justify-center hover:bg-cream transition-colors"><Plus size={12} /></button>
                </div>
                <div className="hidden md:block text-right text-sm font-sans font-medium">${(price * item.quantity).toFixed(2)}</div>
                <button onClick={() => removeItem(item._id)} className="text-obsidian-300 hover:text-red-500 transition-colors justify-self-end">
                  <Trash2 size={15} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-cream p-6 space-y-4">
            <h3 className="font-display text-2xl">Order Summary</h3>
            <div className="space-y-3 text-sm font-sans">
              <div className="flex justify-between"><span className="text-obsidian-500">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−${discount.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span className="text-obsidian-500">Shipping</span><span>{shipping === 0 ? <span className="text-green-600">Complimentary</span> : `$${shipping.toFixed(2)}`}</span></div>
            </div>
            <div className="h-px bg-obsidian-200" />
            <div className="flex justify-between items-center">
              <span className="text-xs tracking-widest uppercase font-sans">Total</span>
              <span className="font-display text-2xl">${total.toFixed(2)}</span>
            </div>

            {/* Coupon */}
            <div className="flex gap-0 border border-obsidian-200">
              <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Coupon code"
                className="flex-1 px-3 py-2.5 text-xs font-sans bg-transparent focus:outline-none" />
              <button onClick={handleCoupon} disabled={applying} className="px-4 text-xs font-sans tracking-widest uppercase text-white bg-obsidian hover:bg-obsidian-700 transition-colors disabled:opacity-60 flex items-center gap-1">
                <Tag size={12} />{applying ? '...' : 'Apply'}
              </button>
            </div>

            <button onClick={() => user ? navigate('/checkout') : navigate('/sign-in?redirect=/checkout')} className="btn-primary w-full">
              Proceed to Checkout <ArrowRight size={14} />
            </button>
            <Link to="/shop" className="block text-center text-xs tracking-widest uppercase font-sans text-obsidian-400 hover:text-gold-600 transition-colors py-1">
              Continue Shopping
            </Link>
          </div>

          <div className="space-y-3 px-2">
            {['Secure 256-bit SSL encryption', 'Free shipping on orders over $500', '30-day free returns'].map(t => (
              <p key={t} className="text-xs text-obsidian-400 font-sans flex items-center gap-2">
                <span className="text-gold-500">✦</span>{t}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
