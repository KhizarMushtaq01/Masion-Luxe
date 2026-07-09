import { create } from 'zustand'
import { cartAPI } from '../services/api'

// ─── Cart Store ───────────────────────────────────────────────────────────────
export const useCartStore = create((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

  fetchCart: async () => {
    try {
      set({ isLoading: true })
      const { data } = await cartAPI.getCart()
      set({ cart: data.cart, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  addToCart: async (productData) => {
    try {
      set({ isLoading: true })
      const { data } = await cartAPI.addToCart(productData)
      set({ cart: data.cart, isLoading: false, isOpen: true })
      return { success: true }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, message: err.response?.data?.message || 'Failed to add to cart' }
    }
  },

  updateItem: async (itemId, quantity) => {
    try {
      const { data } = await cartAPI.updateItem(itemId, { quantity })
      set({ cart: data.cart })
    } catch {}
  },

  removeItem: async (itemId) => {
    try {
      const { data } = await cartAPI.removeItem(itemId)
      set({ cart: data.cart })
    } catch {}
  },

  clearCart: async () => {
    try {
      await cartAPI.clearCart()
      set({ cart: null })
    } catch {}
  },

  applyCoupon: async (code) => {
    try {
      const { data } = await cartAPI.applyCoupon(code)
      await get().fetchCart()
      return { success: true, message: data.message, discount: data.discount }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Invalid coupon' }
    }
  },

  getItemCount: () => {
    const { cart } = get()
    return cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  },

  getSubtotal: () => {
    const { cart } = get()
    return cart?.items?.reduce((sum, item) => {
      const price = item.price || item.product?.salePrice || item.product?.basePrice || 0
      return sum + price * item.quantity
    }, 0) || 0
  },
}))

// ─── UI Store ─────────────────────────────────────────────────────────────────
export const useUIStore = create((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  searchQuery: '',

  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  setSearchQuery: (q) => set({ searchQuery: q }),
}))

// ─── Wishlist Store ───────────────────────────────────────────────────────────
export const useWishlistStore = create((set, get) => ({
  items: [],

  setItems: (items) => set({ items: items.map(i => i._id || i) }),

  isInWishlist: (productId) => get().items.includes(productId?.toString()),

  toggle: (productId) => {
    const items = get().items
    const id = productId?.toString()
    if (items.includes(id)) {
      set({ items: items.filter(i => i !== id) })
    } else {
      set({ items: [...items, id] })
    }
  },
}))
