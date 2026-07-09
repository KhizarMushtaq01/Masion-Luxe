import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Tag } from 'lucide-react'
import { adminAPI, categoryAPI } from '../../services/api'
import toast from 'react-hot-toast'

// ─── AdminCoupons ─────────────────────────────────────────────────────────────
export function AdminCoupons() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editCoupon, setEditCoupon] = useState(null)
  const [form, setForm] = useState({ code:'', discountType:'percentage', discountValue:'', minOrderAmount:'', maxUses:'', validUntil:'', isActive:true, description:'' })
  const [saving, setSaving] = useState(false)

  const { data } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => adminAPI.getCoupons().then(r => r.data),
  })

  const resetForm = () => { setForm({ code:'', discountType:'percentage', discountValue:'', minOrderAmount:'', maxUses:'', validUntil:'', isActive:true, description:'' }); setEditCoupon(null); setShowForm(false) }

  const openEdit = (c) => {
    setEditCoupon(c)
    setForm({ code:c.code, discountType:c.discountType, discountValue:c.discountValue, minOrderAmount:c.minOrderAmount||'', maxUses:c.maxUses||'', validUntil:c.validUntil?new Date(c.validUntil).toISOString().split('T')[0]:'', isActive:c.isActive, description:c.description||'' })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.code || !form.discountValue) { toast.error('Code and discount value are required'); return }
    setSaving(true)
    try {
      const payload = { ...form, discountValue: Number(form.discountValue), minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0, maxUses: form.maxUses ? Number(form.maxUses) : undefined, code: form.code.toUpperCase() }
      if (editCoupon) {
        await adminAPI.updateCoupon(editCoupon._id, payload)
        toast.success('Coupon updated.')
      } else {
        await adminAPI.createCoupon(payload)
        toast.success('Coupon created.')
      }
      await qc.invalidateQueries(['admin-coupons'])
      resetForm()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon.')
    } finally { setSaving(false) }
  }

  const toggleActive = async (c) => {
    try {
      await adminAPI.updateCoupon(c._id, { isActive: !c.isActive })
      await qc.invalidateQueries(['admin-coupons'])
      toast.success(`Coupon ${!c.isActive ? 'activated' : 'deactivated'}.`)
    } catch { toast.error('Failed to update.') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Coupons</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary text-xs py-2.5 flex items-center gap-2">
          <Plus size={14}/> New Coupon
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 shadow-luxury border border-obsidian-50 space-y-4">
          <h3 className="font-display text-xl">{editCoupon ? 'Edit Coupon' : 'Create Coupon'}</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { l:'Code', k:'code', placeholder:'SUMMER20' },
              { l:'Description', k:'description', placeholder:'Optional description' },
            ].map(f => (
              <div key={f.k}>
                <label className="block text-xs tracking-widests uppercase font-sans text-obsidian-500 mb-1.5">{f.l}</label>
                <input value={form[f.k]} onChange={e => setForm({...form,[f.k]:e.target.value})} placeholder={f.placeholder} className="input-luxury-box w-full text-sm" />
              </div>
            ))}
            <div>
              <label className="block text-xs tracking-widests uppercase font-sans text-obsidian-500 mb-1.5">Discount Type</label>
              <select value={form.discountType} onChange={e => setForm({...form,discountType:e.target.value})} className="input-luxury-box w-full text-sm">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            {[
              { l:`Discount Value (${form.discountType==='percentage'?'%':'$'})`, k:'discountValue', type:'number', placeholder:'20' },
              { l:'Min Order Amount ($)', k:'minOrderAmount', type:'number', placeholder:'0' },
              { l:'Max Uses', k:'maxUses', type:'number', placeholder:'Unlimited' },
              { l:'Valid Until', k:'validUntil', type:'date' },
            ].map(f => (
              <div key={f.k}>
                <label className="block text-xs tracking-widests uppercase font-sans text-obsidian-500 mb-1.5">{f.l}</label>
                <input type={f.type||'text'} value={form[f.k]} onChange={e => setForm({...form,[f.k]:e.target.value})} placeholder={f.placeholder} className="input-luxury-box w-full text-sm" />
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form,isActive:e.target.checked})} className="accent-gold-500" />
            <span className="text-sm font-sans">Active</span>
          </label>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-2.5 disabled:opacity-60">{saving ? 'Saving...' : 'Save Coupon'}</button>
            <button onClick={resetForm} className="btn-outline text-xs py-2.5">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow-luxury border border-obsidian-50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-obsidian text-white">
              {['Code','Type','Value','Min Order','Uses','Valid Until','Status','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] tracking-widests uppercase font-sans">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-obsidian-50">
            {data?.coupons?.map(c => (
              <tr key={c._id} className="hover:bg-cream transition-colors">
                <td className="px-4 py-3"><span className="font-sans font-medium text-sm flex items-center gap-2"><Tag size={12} className="text-gold-500"/>{c.code}</span></td>
                <td className="px-4 py-3"><span className="text-xs font-sans capitalize">{c.discountType}</span></td>
                <td className="px-4 py-3"><span className="text-sm font-sans font-medium">{c.discountType==='percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}</span></td>
                <td className="px-4 py-3"><span className="text-sm font-sans">${c.minOrderAmount||0}</span></td>
                <td className="px-4 py-3"><span className="text-sm font-sans">{c.usedCount} {c.maxUses ? `/ ${c.maxUses}` : '/ ∞'}</span></td>
                <td className="px-4 py-3"><span className="text-xs text-obsidian-400 font-sans">{c.validUntil ? new Date(c.validUntil).toLocaleDateString() : '—'}</span></td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 font-sans ${c.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="p-1 text-obsidian-400 hover:text-gold-600 transition-colors"><Pencil size={13}/></button>
                    <button onClick={() => toggleActive(c)} className={`text-xs font-sans tracking-widests uppercase ${c.isActive ? 'text-red-500 hover:text-red-600' : 'text-green-600 hover:text-green-700'} transition-colors`}>{c.isActive ? 'Disable' : 'Enable'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
