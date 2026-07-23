import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, ChevronDown } from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

// ─── Shared table wrapper ─────────────────────────────────────────────────────
function AdminTable({ headers, children, pagination, onPageChange }) {
  return (
    <div className="bg-white shadow-luxury border border-obsidian-50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-obsidian text-white">
              {headers.map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] tracking-widest uppercase font-sans font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-obsidian-50">{children}</tbody>
        </table>
      </div>
      {pagination && pagination.pages > 1 && (
        <div className="px-4 py-3 border-t border-obsidian-50 flex items-center justify-between">
          <p className="text-xs text-obsidian-400 font-sans">Page {pagination.page} of {pagination.pages} — {pagination.total} total</p>
          <div className="flex gap-2">
            <button disabled={pagination.page === 1} onClick={() => onPageChange(pagination.page - 1)} className="btn-outline text-xs py-1.5 px-3 disabled:opacity-40">Prev</button>
            <button disabled={pagination.page === pagination.pages} onClick={() => onPageChange(pagination.page + 1)} className="btn-outline text-xs py-1.5 px-3 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── AdminOrders ──────────────────────────────────────────────────────────────
const ORDER_STATUSES = ['pending','pending_payment','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','return_requested','returned']
const STATUS_COLORS_MAP = {
  pending:'amber', pending_payment:'amber', confirmed:'blue', processing:'indigo', shipped:'violet',
  out_for_delivery:'purple', delivered:'green', cancelled:'red', return_requested:'orange', returned:'gray'
}

export function AdminOrders() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [showModal, setShowModal] = useState(null)
  const [statusForm, setStatusForm] = useState({ status:'', note:'', trackingNumber:'', trackingUrl:'', estimatedDelivery:'' })
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', { page, search, status: statusFilter }],
    queryFn: () => adminAPI.getAllOrders({ page, limit: 20, search: search || undefined, status: statusFilter || undefined }).then(r => r.data),
  })

  const openModal = (order) => {
    setShowModal(order)
    setStatusForm({ status: order.orderStatus, note:'', trackingNumber: order.trackingNumber||'', trackingUrl: order.trackingUrl||'', estimatedDelivery:'' })
  }

  const handleUpdateStatus = async () => {
    setUpdatingId(showModal._id)
    try {
      await adminAPI.updateOrderStatus(showModal._id, statusForm)
      await qc.invalidateQueries(['admin-orders'])
      toast.success('Order status updated. Email notification sent.')
      setShowModal(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.')
    } finally { setUpdatingId(null) }
  }

  const colorClass = (status) => {
    const c = STATUS_COLORS_MAP[status] || 'gray'
    const map = { amber:'bg-amber-50 text-amber-700', blue:'bg-blue-50 text-blue-700', indigo:'bg-indigo-50 text-indigo-700', violet:'bg-violet-50 text-violet-700', purple:'bg-purple-50 text-purple-700', green:'bg-green-50 text-green-700', red:'bg-red-50 text-red-600', orange:'bg-orange-50 text-orange-700', gray:'bg-gray-50 text-gray-500' }
    return map[c] || map.gray
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Orders</h1>
          <p className="text-sm text-obsidian-400 font-sans">{data?.pagination?.total || 0} orders total</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian-400" />
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search order number..."
            className="w-full pl-10 pr-4 py-2.5 border border-obsidian-200 text-sm font-sans focus:outline-none focus:border-gold-400 bg-white" />
        </div>
        <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1)}}
          className="input-luxury-box text-sm py-2.5 px-4 w-48">
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.replace('_',' ')}</option>)}
        </select>
      </div>

      <AdminTable headers={['Order','Customer','Items','Total','Status','Date','Action']}
        pagination={data?.pagination ? { ...data.pagination, page } : null} onPageChange={setPage}>
        {isLoading ? (
          Array(8).fill(0).map((_,i) => <tr key={i}><td colSpan={7}><div className="h-10 skeleton m-3 rounded"/></td></tr>)
        ) : data?.orders?.map(order => (
          <tr key={order._id} className="hover:bg-cream transition-colors">
            <td className="px-4 py-3">
              <p className="text-sm font-sans font-medium">#{order.orderNumber}</p>
              {order.trackingNumber && <p className="text-xs text-gold-600 font-sans">Track: {order.trackingNumber}</p>}
            </td>
            <td className="px-4 py-3">
              <p className="text-sm font-sans">{order.user?.firstName} {order.user?.lastName}</p>
              <p className="text-xs text-obsidian-400 font-sans truncate max-w-[140px]">{order.user?.email}</p>
            </td>
            <td className="px-4 py-3"><span className="text-sm font-sans">{order.items?.length}</span></td>
            <td className="px-4 py-3"><span className="font-display text-base">${order.total?.toFixed(2)}</span></td>
            <td className="px-4 py-3">
              <span className={`text-[10px] px-2 py-0.5 font-sans capitalize ${colorClass(order.orderStatus)}`}>
                {order.orderStatus?.replace('_',' ')}
              </span>
            </td>
            <td className="px-4 py-3"><p className="text-xs text-obsidian-400 font-sans">{new Date(order.createdAt).toLocaleDateString()}</p></td>
            <td className="px-4 py-3">
              <button onClick={() => openModal(order)} className="text-xs tracking-widest uppercase font-sans text-gold-600 hover:text-gold-700 transition-colors">
                Update
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>

      {/* Update status modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(null)} />
          <div className="relative bg-white p-7 max-w-md w-full shadow-luxury-lg animate-scale-in">
            <h3 className="font-display text-2xl mb-1">Update Order Status</h3>
            <p className="text-sm text-obsidian-400 font-sans mb-5">#{showModal.orderNumber} — {showModal.user?.firstName} {showModal.user?.lastName}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widests uppercase font-sans text-obsidian-500 mb-1.5">New Status</label>
                <select value={statusForm.status} onChange={e => setStatusForm({...statusForm, status:e.target.value})}
                  className="input-luxury-box w-full text-sm capitalize">
                  {ORDER_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.replace('_',' ')}</option>)}
                </select>
              </div>
              {['shipped','out_for_delivery'].includes(statusForm.status) && (
                <>
                  <div>
                    <label className="block text-xs tracking-widests uppercase font-sans text-obsidian-500 mb-1.5">Tracking Number</label>
                    <input value={statusForm.trackingNumber} onChange={e => setStatusForm({...statusForm,trackingNumber:e.target.value})} className="input-luxury-box w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widests uppercase font-sans text-obsidian-500 mb-1.5">Tracking URL</label>
                    <input value={statusForm.trackingUrl} onChange={e => setStatusForm({...statusForm,trackingUrl:e.target.value})} className="input-luxury-box w-full text-sm" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widests uppercase font-sans text-obsidian-500 mb-1.5">Estimated Delivery</label>
                    <input type="date" value={statusForm.estimatedDelivery} onChange={e => setStatusForm({...statusForm,estimatedDelivery:e.target.value})} className="input-luxury-box w-full text-sm" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs tracking-widests uppercase font-sans text-obsidian-500 mb-1.5">Note (internal)</label>
                <input value={statusForm.note} onChange={e => setStatusForm({...statusForm,note:e.target.value})} className="input-luxury-box w-full text-sm" placeholder="Optional internal note..." />
              </div>
            </div>

            <p className="text-xs text-obsidian-400 font-sans mt-3">An email notification will be sent to the customer.</p>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(null)} className="btn-outline flex-1 text-xs">Cancel</button>
              <button onClick={handleUpdateStatus} disabled={!!updatingId} className="btn-gold flex-1 text-xs disabled:opacity-60">
                {updatingId ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── AdminUsers ───────────────────────────────────────────────────────────────
export function AdminUsers() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', { page, search }],
    queryFn: () => adminAPI.getUsers({ page, limit: 20, search: search || undefined }).then(r => r.data),
  })

  const handleBan = async (user) => {
    const confirm = window.confirm(`${user.isBanned ? 'Unban' : 'Ban'} ${user.firstName} ${user.lastName}?`)
    if (!confirm) return
    try {
      await adminAPI.banUser(user._id, { isBanned: !user.isBanned, banReason: user.isBanned ? '' : 'Banned by admin' })
      await qc.invalidateQueries(['admin-users'])
      toast.success(`User ${user.isBanned ? 'unbanned' : 'banned'}.`)
    } catch { toast.error('Failed to update user.') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Users</h1>
          <p className="text-sm text-obsidian-400 font-sans">{data?.pagination?.total || 0} registered members</p>
        </div>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian-400"/>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2.5 border border-obsidian-200 text-sm font-sans focus:outline-none focus:border-gold-400 bg-white" />
      </div>

      <AdminTable headers={['User','Role','Orders','Spent','Joined','Status','Action']}
        pagination={data?.pagination ? {...data.pagination, page} : null} onPageChange={setPage}>
        {isLoading ? (
          Array(8).fill(0).map((_,i) => <tr key={i}><td colSpan={7}><div className="h-10 skeleton m-3 rounded"/></td></tr>)
        ) : data?.users?.map(user => (
          <tr key={user._id} className="hover:bg-cream transition-colors">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-white text-xs font-display flex-shrink-0 overflow-hidden">
                  {user.avatar?.url ? <img src={user.avatar.url} alt="" className="w-full h-full object-cover"/> : `${user.firstName?.[0]}${user.lastName?.[0]}`}
                </div>
                <div>
                  <p className="text-sm font-sans font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-obsidian-400 font-sans truncate max-w-[160px]">{user.email}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3">
              <span className={`text-[10px] px-2 py-0.5 font-sans ${user.role==='admin'||user.role==='superadmin' ? 'bg-gold-50 text-gold-700' : 'bg-obsidian-50 text-obsidian-500'}`}>{user.role}</span>
            </td>
            <td className="px-4 py-3"><span className="text-sm font-sans">{user.totalOrders||0}</span></td>
            <td className="px-4 py-3"><span className="text-sm font-sans">${(user.totalSpent||0).toFixed(2)}</span></td>
            <td className="px-4 py-3"><p className="text-xs text-obsidian-400 font-sans">{new Date(user.createdAt).toLocaleDateString()}</p></td>
            <td className="px-4 py-3">
              <div className="space-y-0.5">
                <span className={`block text-[10px] px-2 py-0.5 font-sans w-fit ${user.isBanned ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>{user.isBanned ? 'Banned' : 'Active'}</span>
                {!user.isEmailVerified && <span className="block text-[10px] text-amber-600 font-sans">Email unverified</span>}
              </div>
            </td>
            <td className="px-4 py-3">
              <button onClick={() => handleBan(user)}
                className={`text-xs tracking-widests uppercase font-sans transition-colors ${user.isBanned ? 'text-green-600 hover:text-green-700' : 'text-red-500 hover:text-red-600'}`}>
                {user.isBanned ? 'Unban' : 'Ban'}
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  )
}

// ─── AdminReviews ─────────────────────────────────────────────────────────────
export function AdminReviews() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('false')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', { page, approved: filter }],
    queryFn: () => adminAPI.getReviews({ page, limit: 20, approved: filter }).then(r => r.data),
  })

  const handleApprove = async (id, approve) => {
    try {
      await adminAPI.approveReview(id, { isApproved: approve })
      await qc.invalidateQueries(['admin-reviews'])
      toast.success(approve ? 'Review approved.' : 'Review hidden.')
    } catch { toast.error('Failed to update review.') }
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl">Reviews</h1>

      <div className="flex gap-0 border-b border-obsidian-100">
        {[{v:'false',l:'Pending'},{v:'true',l:'Approved'},{v:'',l:'All'}].map(t => (
          <button key={t.v} onClick={() => {setFilter(t.v);setPage(1)}}
            className={`px-5 py-2.5 text-xs tracking-widest uppercase font-sans border-b-2 -mb-px transition-all ${filter===t.v ? 'border-gold-500 text-gold-600' : 'border-transparent text-obsidian-400 hover:text-obsidian'}`}>
            {t.l}
          </button>
        ))}
      </div>

      <AdminTable headers={['Product','Customer','Rating','Review','Verified','Date','Action']}
        pagination={data?.pagination ? {...data.pagination, page} : null} onPageChange={setPage}>
        {isLoading ? (
          Array(6).fill(0).map((_,i) => <tr key={i}><td colSpan={7}><div className="h-10 skeleton m-3 rounded"/></td></tr>)
        ) : data?.reviews?.length === 0 ? (
          <tr><td colSpan={7} className="px-4 py-12 text-center text-obsidian-400 font-sans text-sm">No reviews found</td></tr>
        ) : data?.reviews?.map(r => (
          <tr key={r._id} className="hover:bg-cream transition-colors">
            <td className="px-4 py-3">
              <p className="text-sm font-sans font-medium truncate max-w-[140px]">{r.product?.name}</p>
            </td>
            <td className="px-4 py-3">
              <p className="text-sm font-sans">{r.user?.firstName} {r.user?.lastName}</p>
              <p className="text-xs text-obsidian-400 font-sans truncate max-w-[120px]">{r.user?.email}</p>
            </td>
            <td className="px-4 py-3">
              <div className="flex">
                {[1,2,3,4,5].map(s => <span key={s} className={`text-xs ${s<=r.rating?'text-gold-500':'text-obsidian-200'}`}>★</span>)}
              </div>
            </td>
            <td className="px-4 py-3">
              <p className="text-sm font-sans font-medium">{r.title}</p>
              <p className="text-xs text-obsidian-400 font-sans line-clamp-2 max-w-[200px]">{r.body}</p>
            </td>
            <td className="px-4 py-3">
              {r.isVerifiedPurchase && <span className="text-xs text-green-600 font-sans">✓ Verified</span>}
            </td>
            <td className="px-4 py-3"><p className="text-xs text-obsidian-400 font-sans">{new Date(r.createdAt).toLocaleDateString()}</p></td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                {!r.isApproved ? (
                  <button onClick={() => handleApprove(r._id, true)} className="text-xs font-sans text-green-600 hover:text-green-700 tracking-widests uppercase transition-colors">Approve</button>
                ) : (
                  <button onClick={() => handleApprove(r._id, false)} className="text-xs font-sans text-red-500 hover:text-red-600 tracking-widests uppercase transition-colors">Hide</button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  )
}
