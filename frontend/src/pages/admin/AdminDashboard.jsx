import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { TrendingUp, TrendingDown, Users, ShoppingBag, Package, DollarSign, AlertTriangle, Star } from 'lucide-react'
import { adminAPI } from '../../services/api'

const STATUS_COLORS = {
  pending:'#f59e0b', pending_payment:'#f59e0b', confirmed:'#3b82f6', processing:'#6366f1',
  shipped:'#8b5cf6', delivered:'#10b981', cancelled:'#ef4444'
}

function StatCard({ label, value, sub, icon: Icon, trend, color = 'gold' }) {
  const positive = parseFloat(trend) >= 0
  return (
    <div className="bg-white p-6 shadow-luxury border border-obsidian-50">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 flex items-center justify-center ${color === 'gold' ? 'bg-gold-50' : 'bg-obsidian-50'}`}>
          <Icon size={18} className={color === 'gold' ? 'text-gold-500' : 'text-obsidian-400'} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-sans ${positive ? 'text-green-600' : 'text-red-500'}`}>
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(parseFloat(trend))}%
          </span>
        )}
      </div>
      <p className="text-xs tracking-widest uppercase font-sans text-obsidian-400 mb-1">{label}</p>
      <p className="font-display text-3xl text-obsidian">{value}</p>
      {sub && <p className="text-xs text-obsidian-400 font-sans mt-1">{sub}</p>}
    </div>
  )
}

const PIE_COLORS = ['#c9a96e','#0a0a0a','#6366f1','#10b981','#f59e0b']

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard().then(r => r.data),
    refetchInterval: 60000,
  })

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_,i) => <div key={i} className="h-32 skeleton"/>)}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {Array(2).fill(0).map((_,i) => <div key={i} className="h-64 skeleton"/>)}
      </div>
    </div>
  )

  const { stats, recentOrders = [], lowStockProducts = [], topProducts = [], revenueData = [] } = data || {}

  return (
    <div className="space-y-6">
      {/* Alert banners */}
      {stats?.lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm font-sans text-amber-700">
            {stats.lowStockCount} product{stats.lowStockCount > 1 ? 's are' : ' is'} low on stock.{' '}
            <Link to="/admin/products?lowStock=true" className="underline hover:text-amber-800">View products →</Link>
          </p>
        </div>
      )}
      {stats?.pendingReviews > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 flex items-center gap-3">
          <Star size={16} className="text-blue-500 flex-shrink-0" />
          <p className="text-sm font-sans text-blue-700">
            {stats.pendingReviews} review{stats.pendingReviews > 1 ? 's' : ''} awaiting approval.{' '}
            <Link to="/admin/reviews" className="underline hover:text-blue-800">Review now →</Link>
          </p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Monthly Revenue" value={`$${(stats?.monthlyRevenue || 0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`}
          sub={`${stats?.revenueGrowth > 0 ? '+' : ''}${stats?.revenueGrowth || 0}% vs last month`}
          icon={DollarSign} trend={stats?.revenueGrowth} />
        <StatCard label="Monthly Orders" value={stats?.monthlyOrders || 0}
          sub={`${stats?.ordersGrowth > 0 ? '+' : ''}${stats?.ordersGrowth || 0}% vs last month`}
          icon={ShoppingBag} trend={stats?.ordersGrowth} />
        <StatCard label="Total Customers" value={(stats?.totalUsers || 0).toLocaleString()} icon={Users} color="dark" />
        <StatCard label="Active Products" value={(stats?.totalProducts || 0).toLocaleString()} icon={Package} color="dark" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white p-6 shadow-luxury border border-obsidian-50">
          <h3 className="font-display text-xl mb-1">Revenue (Last 30 Days)</h3>
          <p className="text-xs text-obsidian-400 font-sans mb-5">Daily sales performance</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" />
              <XAxis dataKey="_id" tick={{ fontSize: 11, fontFamily: 'Jost' }} tickFormatter={v => v?.slice(5)} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'Jost' }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, 'Revenue']} labelStyle={{ fontFamily: 'Jost', fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="#c9a96e" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#c9a96e' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top categories pie */}
        <div className="bg-white p-6 shadow-luxury border border-obsidian-50">
          <h3 className="font-display text-xl mb-1">Top Products</h3>
          <p className="text-xs text-obsidian-400 font-sans mb-5">By units sold</p>
          <div className="space-y-3">
            {topProducts.slice(0,5).map((p,i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-12 bg-cream flex-shrink-0 overflow-hidden">
                  <img src={p.product?.images?.[0]?.url || ''} alt={p.product?.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-sans font-medium truncate">{p.product?.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 bg-obsidian-100 rounded-full">
                      <div className="h-1 bg-gold-gradient rounded-full" style={{ width: `${Math.min(100,(p.totalSold / (topProducts[0]?.totalSold || 1))*100)}%` }} />
                    </div>
                    <span className="text-[10px] font-sans text-obsidian-400 flex-shrink-0">{p.totalSold}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white p-6 shadow-luxury border border-obsidian-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs tracking-widest uppercase font-sans text-gold-600 hover:text-gold-700 transition-colors">View All</Link>
          </div>
          <div className="space-y-0">
            {recentOrders.slice(0,6).map(order => (
              <Link key={order._id} to={`/admin/orders`}
                className="flex items-center justify-between py-3 border-b border-obsidian-50 last:border-0 hover:bg-cream -mx-2 px-2 transition-colors">
                <div>
                  <p className="text-sm font-sans font-medium">#{order.orderNumber}</p>
                  <p className="text-xs text-obsidian-400 font-sans">{order.user?.firstName} {order.user?.lastName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] px-2 py-0.5 font-sans capitalize rounded"
                    style={{ background: `${STATUS_COLORS[order.orderStatus]}20`, color: STATUS_COLORS[order.orderStatus] }}>
                    {order.orderStatus?.replace('_',' ')}
                  </span>
                  <span className="font-display text-base">${order.total?.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-white p-6 shadow-luxury border border-obsidian-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl">Low Stock Alert</h3>
            <Link to="/admin/products" className="text-xs tracking-widest uppercase font-sans text-gold-600 hover:text-gold-700 transition-colors">Manage</Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-obsidian-400 font-sans py-4">All products are well-stocked.</p>
          ) : (
            <div className="space-y-0">
              {lowStockProducts.map(p => (
                <div key={p._id} className="flex items-center gap-3 py-3 border-b border-obsidian-50 last:border-0">
                  <div className="w-10 h-12 bg-cream flex-shrink-0 overflow-hidden">
                    <img src={p.images?.[0]?.url || ''} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans font-medium truncate">{p.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-16 h-1 bg-obsidian-100 rounded-full">
                        <div className="h-1 bg-red-400 rounded-full" style={{ width: `${Math.min(100,(p.stock/10)*100)}%` }} />
                      </div>
                      <span className={`text-xs font-sans font-medium ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                        {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
