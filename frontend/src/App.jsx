import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useAuthStore from './store/authStore'
import { useCartStore, useWishlistStore } from './store/cartStore'
import { userAPI } from './services/api'
import Layout from './components/layout/Layout'
import AdminLayout from './components/layout/AdminLayout'
import LoadingScreen from './components/common/LoadingScreen'

// ─── Lazy pages ───────────────────────────────────────────────────────────────
const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/shop/Shop'))
const ProductDetail = lazy(() => import('./pages/shop/ProductDetail'))
const Cart = lazy(() => import('./pages/shop/Cart'))
const Checkout = lazy(() => import('./pages/shop/Checkout'))
const OrderSuccess = lazy(() => import('./pages/shop/OrderSuccess'))
const Wishlist = lazy(() => import('./pages/shop/Wishlist'))
const SearchResults = lazy(() => import('./pages/shop/SearchResults'))

// Auth
const SignIn = lazy(() => import('./pages/auth/SignIn'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'))

// Account
const AccountDashboard = lazy(() => import('./pages/account/AccountDashboard'))
const AccountOrders = lazy(() => import('./pages/account/AccountOrders'))
const AccountOrderDetail = lazy(() => import('./pages/account/AccountOrderDetail'))
const AccountProfile = lazy(() => import('./pages/account/AccountProfile'))
const AccountAddresses = lazy(() => import('./pages/account/AccountAddresses'))
const AccountSecurity = lazy(() => import('./pages/account/AccountSecurity'))
const AccountWishlist = lazy(() => import('./pages/account/AccountWishlist'))

// Brand
const WorldOfMaison = lazy(() => import('./pages/WorldOfMaison'))
const Lookbook = lazy(() => import('./pages/Lookbook'))
const About = lazy(() => import('./pages/About'))
const Sustainability = lazy(() => import('./pages/Sustainability'))
const Contact = lazy(() => import('./pages/Contact'))
const ShippingReturns = lazy(() => import('./pages/ShippingReturns'))
const SizeGuide = lazy(() => import('./pages/SizeGuide'))
const FAQ = lazy(() => import('./pages/FAQ'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'))
const Accessibility = lazy(() => import('./pages/Accessibility'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'))
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminActivityLogs = lazy(() => import('./pages/admin/AdminActivityLogs'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))

// ─── Protected Routes ─────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { token, user } = useAuthStore()
  const location = useLocation()
  if (!token || !user) return <Navigate to={`/sign-in?redirect=${location.pathname}`} replace />
  return children
}

function AdminRoute({ children }) {
  const { user, token } = useAuthStore()
  if (!token || !user) return <Navigate to="/sign-in" replace />
  if (!['admin', 'superadmin'].includes(user.role)) return <Navigate to="/" replace />
  return children
}

function GuestRoute({ children }) {
  const { token } = useAuthStore()
  if (token) return <Navigate to="/" replace />
  return children
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { token, refreshUser } = useAuthStore()
  const { fetchCart } = useCartStore()
  const { setItems } = useWishlistStore()

  useEffect(() => {
    if (token) {
      refreshUser()
      fetchCart()
      userAPI.getWishlist().then(({ data }) => {
        setItems(data.wishlist.map(p => p._id || p))
      }).catch(() => {})
    }
  }, [token])

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* ─── Public / Shop ─────────────────────────────────────── */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:category" element={<Shop />} />
          <Route path="/shop/:gender/:category" element={<Shop />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/world-of-maison" element={<WorldOfMaison />} />
          <Route path="/lookbook" element={<Lookbook />} />
          <Route path="/about" element={<About />} />
          <Route path="/sustainability" element={<Sustainability />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shipping-returns" element={<ShippingReturns />} />
          <Route path="/size-guide" element={<SizeGuide />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/accessibility" element={<Accessibility />} />

          {/* Checkout — protected */}
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />

          {/* Account — protected */}
          <Route path="/account" element={<ProtectedRoute><AccountDashboard /></ProtectedRoute>} />
          <Route path="/account/orders" element={<ProtectedRoute><AccountOrders /></ProtectedRoute>} />
          <Route path="/account/orders/:id" element={<ProtectedRoute><AccountOrderDetail /></ProtectedRoute>} />
          <Route path="/account/profile" element={<ProtectedRoute><AccountProfile /></ProtectedRoute>} />
          <Route path="/account/addresses" element={<ProtectedRoute><AccountAddresses /></ProtectedRoute>} />
          <Route path="/account/security" element={<ProtectedRoute><AccountSecurity /></ProtectedRoute>} />
          <Route path="/account/wishlist" element={<ProtectedRoute><AccountWishlist /></ProtectedRoute>} />
        </Route>

        {/* ─── Auth (no layout chrome) ────────────────────────────── */}
        <Route path="/sign-in" element={<GuestRoute><SignIn /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* ─── Admin ──────────────────────────────────────────────── */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="activity-logs" element={<AdminActivityLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
