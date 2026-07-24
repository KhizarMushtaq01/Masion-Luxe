import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { settingsAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const qc = useQueryClient()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsAPI.getSettings().then(r => r.data),
  })

  useEffect(() => {
    if (data?.settings) setForm(data.settings)
  }, [data])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: res } = await settingsAPI.updateSettings(form)
      setForm(res.settings)
      await qc.invalidateQueries(['settings'])
      toast.success('Settings updated.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings.')
    } finally { setSaving(false) }
  }

  if (isLoading || !form) {
    return <div className="space-y-4">{Array(3).fill(0).map((_, i) => <div key={i} className="h-32 skeleton" />)}</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Settings</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 shadow-luxury border border-obsidian-50 space-y-4">
          <h3 className="font-display text-lg">Store Info</h3>
          <div>
            <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-1.5">Store Name</label>
            <input value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })} className="input-luxury-box w-full text-sm" />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-1.5">Support Email</label>
            <input value={form.supportEmail} onChange={e => setForm({ ...form, supportEmail: e.target.value })} className="input-luxury-box w-full text-sm" />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-1.5">Support Phone</label>
            <input value={form.supportPhone} onChange={e => setForm({ ...form, supportPhone: e.target.value })} className="input-luxury-box w-full text-sm" />
          </div>
        </div>

        <div className="bg-white p-6 shadow-luxury border border-obsidian-50 space-y-4">
          <h3 className="font-display text-lg">Tax & Shipping</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-1.5">Tax Rate (%)</label>
              <input type="number" step="0.01" value={Math.round(form.taxRate * 10000) / 100} onChange={e => setForm({ ...form, taxRate: Number(e.target.value) / 100 })} className="input-luxury-box w-full text-sm" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-1.5">Standard Shipping ($)</label>
              <input type="number" step="0.01" value={form.standardShippingCost} onChange={e => setForm({ ...form, standardShippingCost: Number(e.target.value) })} className="input-luxury-box w-full text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-1.5">Free Shipping Threshold ($)</label>
            <input type="number" step="0.01" value={form.freeShippingThreshold} onChange={e => setForm({ ...form, freeShippingThreshold: Number(e.target.value) })} className="input-luxury-box w-full text-sm" />
          </div>
        </div>

        <div className="bg-white p-6 shadow-luxury border border-obsidian-50 space-y-4 md:col-span-2">
          <h3 className="font-display text-lg">Social Links</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {['instagram', 'facebook', 'pinterest'].map(key => (
              <div key={key}>
                <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-1.5">{key}</label>
                <input value={form.socialLinks?.[key] || ''} onChange={e => setForm({ ...form, socialLinks: { ...form.socialLinks, [key]: e.target.value } })} className="input-luxury-box w-full text-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
        <Save size={14} /> {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}
