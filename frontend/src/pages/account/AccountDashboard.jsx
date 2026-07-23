// AccountDashboard.jsx
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingBag, Heart, MapPin, Clock, TrendingUp, AlertTriangle } from 'lucide-react'
import { AccountLayout } from '../../components/auth/AccountLayout'
import { orderAPI, userAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  out_for_delivery: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  return_requested: 'bg-orange-100 text-orange-700',
  returned: 'bg-gray-100 text-gray-600',
}

export default function AccountDashboard() {
  const { user } = useAuthStore()
  const { data: ordersData } = useQuery({
    queryKey: ['my-orders', { page: 1, limit: 3 }],
    queryFn: () => orderAPI.getMyOrders({ page: 1, limit: 3 }).then(r => r.data),
  })

  const stats = [
    { label: 'Total Orders', value: user?.totalOrders || 0, icon: ShoppingBag, href: '/account/orders' },
    { label: 'Loyalty Points', value: user?.loyaltyPoints || 0, icon: TrendingUp, href: '/account' },
    { label: 'Total Spent', value: `$${(user?.totalSpent || 0).toFixed(2)}`, icon: TrendingUp, href: '/account/orders' },
  ]

  return (
    <AccountLayout>
      <h1 className="font-display text-3xl mb-2">Welcome back, {user?.firstName}.</h1>
      {!user?.isEmailVerified && (
        <div className="bg-amber-50 border border-amber-200 p-4 mb-6 flex items-center gap-3">
          <span className="text-amber-600 text-sm font-sans flex items-center gap-1.5"><AlertTriangle size={14} /> Please verify your email address to unlock all features.</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(s => (
          <Link key={s.label} to={s.href} className="bg-cream p-5 hover:bg-gold-50 transition-colors group">
            <p className="text-xs tracking-widest uppercase font-sans text-obsidian-400 mb-2">{s.label}</p>
            <p className="font-display text-3xl text-obsidian group-hover:text-gold-600 transition-colors">{s.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Recent Orders</h2>
          <Link to="/account/orders" className="text-xs tracking-widest uppercase font-sans text-gold-600 hover:text-gold-700 transition-colors">View All</Link>
        </div>

        {!ordersData?.orders?.length ? (
          <div className="bg-cream p-8 text-center">
            <ShoppingBag size={32} className="text-obsidian-200 mx-auto mb-3" strokeWidth={1} />
            <p className="text-obsidian-400 font-sans text-sm">No orders yet.</p>
            <Link to="/shop" className="btn-primary mt-4 text-xs py-2.5 px-6 inline-flex">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {ordersData.orders.map(order => (
              <Link key={order._id} to={`/account/orders/${order._id}`}
                className="flex items-center justify-between p-4 bg-cream hover:bg-gold-50 transition-colors group">
                <div>
                  <p className="font-sans text-sm font-medium">#{order.orderNumber}</p>
                  <p className="text-xs text-obsidian-400 font-sans mt-0.5">{order.items?.length} item(s) · {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2.5 py-1 font-sans tracking-wide capitalize ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                    {order.orderStatus?.replace('_', ' ')}
                  </span>
                  <span className="font-display text-lg">${order.total?.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'My Wishlist', href: '/account/wishlist', icon: Heart },
          { label: 'My Addresses', href: '/account/addresses', icon: MapPin },
          { label: 'Activity', href: '/account/security', icon: Clock },
        ].map(({ label, href, icon: Icon }) => (
          <Link key={href} to={href} className="flex items-center gap-3 p-4 border border-obsidian-100 hover:border-gold-300 hover:bg-gold-50 transition-all group">
            <Icon size={18} className="text-obsidian-300 group-hover:text-gold-500 transition-colors" strokeWidth={1.5} />
            <span className="text-sm font-sans text-obsidian-600 group-hover:text-obsidian">{label}</span>
          </Link>
        ))}
      </div>
    </AccountLayout>
  )
}
