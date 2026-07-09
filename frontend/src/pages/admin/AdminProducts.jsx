import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search, Eye, EyeOff } from 'lucide-react'
import { productAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminProducts() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', { page, search }],
    queryFn: () => productAPI.getProducts({ page, limit: 20, search: search || undefined }).then(r => r.data),
  })

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"? It will be hidden from the store.`)) return
    setDeleting(id)
    try {
      await productAPI.deleteProduct(id)
      await qc.invalidateQueries(['admin-products'])
      toast.success('Product deactivated.')
    } catch { toast.error('Failed to deactivate product.') }
    finally { setDeleting(null) }
  }

  const totalPages = data?.pagination?.pages || 1

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="text-sm text-obsidian-400 font-sans">{data?.pagination?.total || 0} products total</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary text-xs py-2.5 flex items-center gap-2 self-start">
          <Plus size={14} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-obsidian-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 border border-obsidian-200 text-sm font-sans focus:outline-none focus:border-gold-400 bg-white" />
      </div>

      {/* Table */}
      <div className="bg-white shadow-luxury border border-obsidian-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-obsidian text-white">
                {['Product','Category','Price','Stock','Status','Sales','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] tracking-widest uppercase font-sans font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-50">
              {isLoading ? (
                Array(8).fill(0).map((_,i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-8 skeleton rounded"/></td></tr>
                ))
              ) : data?.products?.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-obsidian-400 font-sans text-sm">No products found</td></tr>
              ) : (
                data.products.map(p => (
                  <tr key={p._id} className="hover:bg-cream transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-cream flex-shrink-0 overflow-hidden">
                          <img src={p.images?.[0]?.url || ''} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-sans font-medium truncate max-w-[180px]">{p.name}</p>
                          <p className="text-xs text-obsidian-400 font-sans capitalize">{p.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-sans text-obsidian-500">{p.category?.name || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        {p.isOnSale ? (
                          <>
                            <p className="text-sm font-sans font-medium text-red-600">${p.salePrice?.toFixed(2)}</p>
                            <p className="text-xs text-obsidian-400 line-through">${p.basePrice?.toFixed(2)}</p>
                          </>
                        ) : (
                          <p className="text-sm font-sans">${p.basePrice?.toFixed(2)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-sans font-medium ${p.stock === 0 ? 'text-red-600' : p.stock < 5 ? 'text-amber-600' : 'text-green-600'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.isActive ? <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 font-sans">Active</span> : <span className="text-[10px] px-2 py-0.5 bg-red-50 text-red-600 font-sans">Inactive</span>}
                        {p.isNew && <span className="text-[10px] px-2 py-0.5 bg-gold-50 text-gold-700 font-sans">New</span>}
                        {p.isFeatured && <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 font-sans">Featured</span>}
                        {p.isBestseller && <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 font-sans">Bestseller</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-sans">{p.soldCount || 0}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/products/${p.slug || p._id}`} target="_blank"
                          className="p-1.5 text-obsidian-400 hover:text-gold-600 transition-colors" title="View">
                          <Eye size={14} />
                        </Link>
                        <Link to={`/admin/products/${p._id}/edit`}
                          className="p-1.5 text-obsidian-400 hover:text-gold-600 transition-colors" title="Edit">
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => handleDelete(p._id, p.name)} disabled={deleting === p._id}
                          className="p-1.5 text-obsidian-400 hover:text-red-500 transition-colors disabled:opacity-50" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-obsidian-50 flex items-center justify-between">
            <p className="text-xs text-obsidian-400 font-sans">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p=>p-1)} className="btn-outline text-xs py-1.5 px-3 disabled:opacity-40">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(p=>p+1)} className="btn-outline text-xs py-1.5 px-3 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
