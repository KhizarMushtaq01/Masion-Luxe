import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, X } from 'lucide-react'
import { categoryAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminCategories() {
  const qc = useQueryClient()
  const [form, setForm] = useState({ name:'', description:'', gender:'all', sortOrder:0 })
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  const { data } = useQuery({
    queryKey:['categories'],
    queryFn:() => categoryAPI.getCategories().then(r=>r.data),
  })

  const reset = () => { setForm({ name:'', description:'', gender:'all', sortOrder:0 }); setEditId(null) }

  const openEdit = (c) => { setEditId(c._id); setForm({ name:c.name, description:c.description||'', gender:c.gender||'all', sortOrder:c.sortOrder||0 }) }

  const handleSave = async () => {
    if(!form.name) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      if(editId) { await categoryAPI.updateCategory(editId, form); toast.success('Category updated.') }
      else { await categoryAPI.createCategory(form); toast.success('Category created.') }
      await qc.invalidateQueries(['categories'])
      reset()
    } catch(err) { toast.error(err.response?.data?.message || 'Failed.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id,name) => {
    if(!window.confirm(`Deactivate "${name}"?`)) return
    try {
      await categoryAPI.deleteCategory(id)
      await qc.invalidateQueries(['categories'])
      toast.success('Category deactivated.')
    } catch { toast.error('Failed to deactivate.') }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Categories</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="bg-white p-6 shadow-luxury border border-obsidian-50 space-y-4">
            <h3 className="font-display text-lg">{editId ? 'Edit Category' : 'New Category'}</h3>
            {[{l:'Name *',k:'name'},{l:'Description',k:'description'}].map(f=>(
              <div key={f.k}>
                <label className="block text-xs tracking-widests uppercase font-sans text-obsidian-500 mb-1.5">{f.l}</label>
                <input value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} className="input-luxury-box w-full text-sm"/>
              </div>
            ))}
            <div>
              <label className="block text-xs tracking-widests uppercase font-sans text-obsidian-500 mb-1.5">Gender</label>
              <select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})} className="input-luxury-box w-full text-sm">
                {['all','women','men','unisex','kids'].map(g=><option key={g} value={g} className="capitalize">{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs tracking-widests uppercase font-sans text-obsidian-500 mb-1.5">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={e=>setForm({...form,sortOrder:Number(e.target.value)})} className="input-luxury-box w-full text-sm"/>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-2.5 disabled:opacity-60">{saving?'Saving...':editId?'Update':'Create'}</button>
              {editId && <button onClick={reset} className="btn-outline text-xs py-2.5">Cancel</button>}
            </div>
          </div>
        </div>
        <div className="bg-white shadow-luxury border border-obsidian-50">
          <table className="w-full">
            <thead><tr className="bg-obsidian text-white">{['Name','Gender','Sort','Actions'].map(h=><th key={h} className="text-left px-4 py-3 text-[10px] tracking-widests uppercase font-sans">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-obsidian-50">
              {data?.categories?.map(c=>(
                <tr key={c._id} className="hover:bg-cream transition-colors">
                  <td className="px-4 py-3"><p className="text-sm font-sans font-medium">{c.name}</p><p className="text-xs text-obsidian-400 font-sans">{c.description}</p></td>
                  <td className="px-4 py-3"><span className="text-xs font-sans capitalize">{c.gender}</span></td>
                  <td className="px-4 py-3"><span className="text-sm font-sans">{c.sortOrder}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={()=>openEdit(c)} className="p-1 text-obsidian-400 hover:text-gold-600 transition-colors"><Pencil size={13}/></button>
                      <button onClick={()=>handleDelete(c._id,c.name)} className="p-1 text-obsidian-400 hover:text-red-500 transition-colors"><X size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
