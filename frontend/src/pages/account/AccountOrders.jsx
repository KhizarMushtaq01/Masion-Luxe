import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, ChevronRight, Search } from 'lucide-react'
import { AccountLayout } from '../../components/auth/AccountLayout'
import { orderAPI } from '../../services/api'

const STATUS_STYLES = {
  pending:          'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed:        'bg-blue-50 text-blue-700 border-blue-200',
  processing:       'bg-blue-50 text-blue-700 border-blue-200',
  shipped:          'bg-indigo-50 text-indigo-700 border-indigo-200',
  out_for_delivery: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered:        'bg-green-50 text-green-700 border-green-200',
  cancelled:        'bg-red-50 text-red-600 border-red-200',
  return_requested: 'bg-orange-50 text-orange-700 border-orange-200',
  returned:         'bg-gray-50 text-gray-500 border-gray-200',
}

const STATUS_LABELS = {
  pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing',
  shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered',
  cancelled: 'Cancelled', return_requested: 'Return Requested', returned: 'Returned',
}

const FILTER_TABS = [
  { key: '', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
]

export default function AccountOrders() {
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', { page, status: statusFilter }],
    queryFn: () => orderAPI.getMyOrders({ page, limit: 10, status: statusFilter || undefined }).then(r => r.data),
  })

  const orders = data?.orders || []
  const totalPages = data?.pagination?.pages || 1

  return (
    <AccountLayout title="My Orders">
      {/* Status tabs */}
      <div className="flex gap-0 border-b border-obsidian-100 mb-6 overflow-x-auto scrollbar-hide">
        {FILTER_TABS.map(t => (
          <button key={t.key} onClick={() => { setStatusFilter(t.key); setPage(1) }}
            className={`px-5 py-3 text-xs tracking-widest uppercase font-sans whitespace-nowrap border-b-2 -mb-px transition-all duration-200 ${
              statusFilter === t.key
                ? 'border-gold-500 text-gold-600'
                : 'border-transparent text-obsidian-400 hover:text-obsidian'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-24 skeleton rounded" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="text-obsidian-200 mx-auto mb-4" strokeWidth={1} />
          <p className="font-display text-2xl text-obsidian-300 mb-2">No orders found</p>
          <p className="text-sm text-obsidian-400 font-sans mb-6">
            {statusFilter ? `No ${STATUS_LABELS[statusFilter]?.toLowerCase()} orders.` : "You haven't placed any orders yet."}
          </p>
          <Link to="/shop" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Link key={order._id} to={`/account/orders/${order._id}`}
              className="block border border-obsidian-100 hover:border-gold-300 hover:shadow-luxury transition-all duration-200 group">
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Order info */}
                <div className="flex gap-4 items-start">
                  {/* Product thumbnails */}
                  <div className="flex -space-x-2">
                    {order.items?.slice(0, 3).map((item, i) => (
                      <div key={i} className="w-12 h-14 bg-cream border-2 border-white overflow-hidden flex-shrink-0">
                        <img src={item.product?.images?.[0]?.url || item.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&q=80'}
                          alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <div className="w-12 h-14 bg-obsidian-100 border-2 border-white flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-sans text-obsidian-500">+{order.items.length - 3}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-sans font-medium text-sm">Order #{order.orderNumber}</p>
                      <span className={`text-[10px] px-2 py-0.5 border font-sans tracking-wide ${STATUS_STYLES[order.orderStatus] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                        {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                      </span>
                    </div>
                    <p className="text-xs text-obsidian-400 font-sans">
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · Placed {new Date(order.createdAt).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                    {order.trackingNumber && (
                      <p className="text-xs text-gold-600 font-sans mt-0.5">Tracking: {order.trackingNumber}</p>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-6 md:flex-shrink-0">
                  <div className="text-right">
                    <p className="font-display text-xl">${order.total?.toFixed(2)}</p>
                    <p className="text-xs text-obsidian-400 font-sans capitalize">{order.paymentMethod}</p>
                  </div>
                  <ChevronRight size={16} className="text-obsidian-300 group-hover:text-gold-500 transition-colors hidden md:block" />
                </div>
              </div>
            </Link>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="btn-outline text-xs py-2 px-4 disabled:opacity-40">Prev</button>
              <span className="flex items-center text-sm font-sans text-obsidian-500 px-3">{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p+1)} className="btn-outline text-xs py-2 px-4 disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      )}
    </AccountLayout>
  )
}
