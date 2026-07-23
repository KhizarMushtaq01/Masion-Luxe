import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!['/sign-in', '/register'].includes(window.location.pathname)) {
        window.location.href = '/sign-in'
      }
    }
    return Promise.reject(err)
  }
)

export default api

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  changePassword: (data) => api.put('/auth/change-password', data),
}

// ─── Users ────────────────────────────────────────────────────────────────────
export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  updateAvatar: (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.put('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  getWishlist: () => api.get('/users/wishlist'),
  toggleWishlist: (productId) => api.post(`/users/wishlist/${productId}`),
  getActivity: () => api.get('/users/activity'),
}

// ─── Products ─────────────────────────────────────────────────────────────────
export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getCollections: () => api.get('/products/collections'),
  search: (q, limit) => api.get('/products/search', { params: { q, limit } }),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
}

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateItem: (itemId, data) => api.put(`/cart/item/${itemId}`, data),
  removeItem: (itemId) => api.delete(`/cart/item/${itemId}`),
  clearCart: () => api.delete('/cart'),
  applyCoupon: (code) => api.post('/cart/coupon', { code }),
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  requestReturn: (id, reason) => api.put(`/orders/${id}/return`, { reason }),
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewAPI = {
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  createReview: (data) => api.post('/reviews', data),
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
export const newsletterAPI = {
  subscribe: (email) => api.post('/newsletter/subscribe', { email }),
}

// ─── Payment ──────────────────────────────────────────────────────────────────
export const paymentAPI = {
  createIntent: (amount) => api.post('/payment/create-intent', { amount }),
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  banUser: (id, data) => api.put(`/admin/users/${id}/ban`, data),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  getReviews: (params) => api.get('/admin/reviews', { params }),
  approveReview: (id, data) => api.put(`/admin/reviews/${id}/approve`, data),
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  getActivityLogs: (params) => api.get('/admin/activity-logs', { params }),
  getAnalytics: (params) => api.get('/analytics/overview', { params }),
}
