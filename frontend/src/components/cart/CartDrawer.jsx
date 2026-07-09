import { Link, useNavigate } from 'react-router-dom'
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import useAuthStore from '../../store/authStore'

export default function CartDrawer() {
  const { cart, isOpen, closeCart, removeItem, updateItem, getSubtotal, getItemCount } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const subtotal = getSubtotal()
  const itemCount = getItemCount()

  const handleCheckout = () => {
    closeCart()
    if (!user) navigate('/sign-in?redirect=/checkout')
    else navigate('/checkout')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeCart} />
      <div className="relative w-full max-w-md bg-white h-full flex flex-col animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-obsidian-100">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} strokeWidth={1.5} />
            <h2 className="font-display text-xl">Your Bag {itemCount > 0 && <span className="text-gold-500">({itemCount})</span>}</h2>
          </div>
          <button onClick={closeCart} className="p-1 hover:text-gold-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {!cart?.items?.length ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <ShoppingBag size={48} className="text-obsidian-200" strokeWidth={1} />
              <div>
                <p className="font-display text-2xl text-obsidian-400 mb-2">Your bag is empty</p>
                <p className="text-sm text-obsidian-400 font-sans">Discover our latest collections</p>
              </div>
              <button onClick={() => { closeCart(); navigate('/shop') }} className="btn-primary mt-2">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-0">
              {cart.items.map((item) => {
                const product = item.product
                const price = item.price || product?.salePrice || product?.basePrice || 0
                const image = product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&q=80'

                return (
                  <div key={item._id} className="flex gap-4 px-6 py-4 border-b border-obsidian-50 hover:bg-cream/50 transition-colors">
                    <Link to={`/products/${product?.slug || product?._id}`} onClick={closeCart} className="w-20 h-24 flex-shrink-0 overflow-hidden bg-cream">
                      <img src={image} alt={product?.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link to={`/products/${product?.slug || product?._id}`} onClick={closeCart}
                            className="text-sm font-sans font-medium hover:text-gold-600 transition-colors line-clamp-2">
                            {product?.name}
                          </Link>
                          {(item.size || item.color) && (
                            <p className="text-xs text-obsidian-400 font-sans mt-0.5">
                              {[item.size, item.color].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                        <button onClick={() => removeItem(item._id)} className="text-obsidian-300 hover:text-red-500 transition-colors ml-2 flex-shrink-0">
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-obsidian-200">
                          <button onClick={() => updateItem(item._id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-obsidian-500 hover:text-obsidian transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="w-7 text-center text-sm font-sans">{item.quantity}</span>
                          <button onClick={() => updateItem(item._id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-obsidian-500 hover:text-obsidian transition-colors">
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="text-sm font-sans font-medium">${(price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart?.items?.length > 0 && (
          <div className="border-t border-obsidian-100 p-6 space-y-4">
            {cart.discountAmount > 0 && (
              <div className="flex justify-between text-sm font-sans">
                <span className="text-green-600">Coupon Discount</span>
                <span className="text-green-600">−${cart.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-xs tracking-widest uppercase font-sans text-obsidian-500">Subtotal</span>
              <span className="font-display text-2xl">${(subtotal - (cart.discountAmount || 0)).toFixed(2)}</span>
            </div>
            <p className="text-xs text-obsidian-400 font-sans">Shipping and taxes calculated at checkout.</p>
            <button onClick={handleCheckout} className="btn-primary w-full">
              Proceed to Checkout
            </button>
            <Link to="/cart" onClick={closeCart} className="block text-center text-xs tracking-widest uppercase font-sans text-obsidian-500 hover:text-gold-600 transition-colors py-1">
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
