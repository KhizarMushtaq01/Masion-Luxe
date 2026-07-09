import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { adminAPI } from '../../services/api'

const PIE_COLORS = ['#c9a96e','#0a0a0a','#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6']

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('30')

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', period],
    queryFn: () => adminAPI.getAnalytics({ period }).then(r => r.data),
  })

  const { salesByDay = [], salesByCategory = [], userGrowth = [] } = data || {}

  const totalRevenue = salesByDay.reduce((s, d) => s + (d.revenue || 0), 0)
  const totalOrders = salesByDay.reduce((s, d) => s + (d.orders || 0), 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Analytics</h1>
        <div className="flex gap-0 border border-obsidian-200">
          {[{v:'7',l:'7 days'},{v:'30',l:'30 days'},{v:'90',l:'90 days'}].map(p => (
            <button key={p.v} onClick={()=>setPeriod(p.v)}
              className={`px-4 py-2 text-xs tracking-widests uppercase font-sans transition-colors ${period===p.v ? 'bg-obsidian text-white' : 'text-obsidian-400 hover:text-obsidian'}`}>
              {p.l}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { l:'Total Revenue', v:`$${totalRevenue.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}` },
          { l:'Total Orders', v:totalOrders.toLocaleString() },
          { l:'Avg Order Value', v:`$${avgOrderValue.toFixed(2)}` },
        ].map(kpi => (
          <div key={kpi.l} className="bg-white p-5 shadow-luxury border border-obsidian-50 text-center">
            <p className="text-xs tracking-widests uppercase font-sans text-obsidian-400 mb-1">{kpi.l}</p>
            <p className="font-display text-3xl">{kpi.v}</p>
          </div>
        ))}
      </div>

      {/* Revenue over time */}
      <div className="bg-white p-6 shadow-luxury border border-obsidian-50">
        <h3 className="font-display text-xl mb-1">Revenue Over Time</h3>
        <p className="text-xs text-obsidian-400 font-sans mb-5">Last {period} days</p>
        {isLoading ? <div className="h-64 skeleton"/> : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesByDay}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c9a96e" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#c9a96e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3"/>
              <XAxis dataKey="_id" tick={{ fontSize:11, fontFamily:'Jost' }} tickFormatter={v=>v?.slice(5)}/>
              <YAxis tick={{ fontSize:11, fontFamily:'Jost' }} tickFormatter={v=>`$${v}`}/>
              <Tooltip formatter={(v)=>[`$${v.toFixed(2)}`,'Revenue']} labelStyle={{ fontFamily:'Jost', fontSize:12 }}/>
              <Area type="monotone" dataKey="revenue" stroke="#c9a96e" strokeWidth={2} fill="url(#revenueGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders over time */}
        <div className="bg-white p-6 shadow-luxury border border-obsidian-50">
          <h3 className="font-display text-xl mb-5">Orders Per Day</h3>
          {isLoading ? <div className="h-52 skeleton"/> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3"/>
                <XAxis dataKey="_id" tick={{ fontSize:10, fontFamily:'Jost' }} tickFormatter={v=>v?.slice(5)}/>
                <YAxis tick={{ fontSize:10, fontFamily:'Jost' }}/>
                <Tooltip labelStyle={{ fontFamily:'Jost', fontSize:11 }}/>
                <Bar dataKey="orders" fill="#0a0a0a" radius={[2,2,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue by category */}
        <div className="bg-white p-6 shadow-luxury border border-obsidian-50">
          <h3 className="font-display text-xl mb-5">Revenue by Category</h3>
          {isLoading ? <div className="h-52 skeleton"/> : salesByCategory.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-obsidian-300 font-sans text-sm">No data for this period</div>
          ) : (
            <div className="grid grid-cols-2 items-center gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={salesByCategory.slice(0,7)} dataKey="revenue" nameKey="_id" cx="50%" cy="50%" outerRadius={80} strokeWidth={2}>
                    {salesByCategory.slice(0,7).map((_,i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={(v)=>[`$${v.toFixed(2)}`,'Revenue']}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {salesByCategory.slice(0,7).map((c,i) => (
                  <div key={c._id || i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}/>
                    <p className="text-xs font-sans text-obsidian-600 truncate">{c._id || 'Uncategorised'}</p>
                    <p className="text-xs font-sans font-medium ml-auto flex-shrink-0">${c.revenue?.toFixed(0)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User growth */}
        <div className="bg-white p-6 shadow-luxury border border-obsidian-50">
          <h3 className="font-display text-xl mb-5">New Registrations</h3>
          {isLoading ? <div className="h-52 skeleton"/> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0a0a0a" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0a0a0a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3"/>
                <XAxis dataKey="_id" tick={{ fontSize:10, fontFamily:'Jost' }} tickFormatter={v=>v?.slice(5)}/>
                <YAxis tick={{ fontSize:10, fontFamily:'Jost' }}/>
                <Tooltip labelStyle={{ fontFamily:'Jost', fontSize:11 }}/>
                <Area type="monotone" dataKey="count" stroke="#0a0a0a" strokeWidth={2} fill="url(#userGrad)" name="New Users"/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category bar */}
        <div className="bg-white p-6 shadow-luxury border border-obsidian-50">
          <h3 className="font-display text-xl mb-5">Units Sold by Category</h3>
          {isLoading ? <div className="h-52 skeleton"/> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={salesByCategory.slice(0,7)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3"/>
                <XAxis type="number" tick={{ fontSize:10, fontFamily:'Jost' }}/>
                <YAxis type="category" dataKey="_id" tick={{ fontSize:10, fontFamily:'Jost' }} width={80}/>
                <Tooltip labelStyle={{ fontFamily:'Jost', fontSize:11 }}/>
                <Bar dataKey="count" fill="#c9a96e" radius={[0,2,2,0]} name="Units Sold"/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
