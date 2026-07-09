import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, MapPin, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { AccountLayout } from '../../components/auth/AccountLayout'
import { userAPI } from '../../services/api'
import toast from 'react-hot-toast'

function AddressForm({ initial, onSave, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initial || {} })
  const [saving, setSaving] = useState(false)

  const onSubmit = async (data) => {
    setSaving(true)
    try { await onSave(data) }
    finally { setSaving(false) }
  }

  const F = ({ n, l, half, type='text', opts }) => (
    <div className={half ? '' : 'md:col-span-2'}>
      <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-2">{l}</label>
      {opts ? (
        <select {...register(n)} className="input-luxury-box w-full">
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} {...register(n, { required: 'Required' })}
          className={`input-luxury-box w-full ${errors[n] ? 'border-red-400' : ''}`} />
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-cream p-6">
      <div className="grid md:grid-cols-2 gap-4">
        <F n="label" l="Address Label" half />
        <F n="firstName" l="First Name" half />
        <F n="lastName" l="Last Name" half />
        <F n="address1" l="Street Address" />
        <F n="address2" l="Apt / Suite (optional)" />
        <F n="city" l="City" half />
        <F n="state" l="State / Province" half />
        <F n="postalCode" l="Postal Code" half />
        <F n="country" l="Country" half opts={['US','GB','FR','DE','IT','ES','CA','AU','AE','JP']} />
        <F n="phone" l="Phone" half />
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" {...register('isDefault')} className="accent-gold-500" />
        <span className="text-sm font-sans text-obsidian-600">Set as default address</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Address'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>
      </div>
    </form>
  )
}

export default function AccountAddresses() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => userAPI.getAddresses().then(r => r.data),
  })

  const addresses = data?.addresses || []

  const handleAdd = async (formData) => {
    try {
      await userAPI.addAddress(formData)
      await qc.invalidateQueries(['addresses'])
      setShowForm(false)
      toast.success('Address added.')
    } catch { toast.error('Failed to add address.') }
  }

  const handleEdit = async (formData) => {
    try {
      await userAPI.updateAddress(editId, formData)
      await qc.invalidateQueries(['addresses'])
      setEditId(null)
      toast.success('Address updated.')
    } catch { toast.error('Failed to update address.') }
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await userAPI.deleteAddress(id)
      await qc.invalidateQueries(['addresses'])
      toast.success('Address removed.')
    } catch { toast.error('Failed to remove address.') }
    finally { setDeleting(null) }
  }

  return (
    <AccountLayout title="My Addresses">
      {isLoading ? (
        <div className="space-y-4">{Array(2).fill(0).map((_,i) => <div key={i} className="h-36 skeleton"/>)}</div>
      ) : (
        <div className="space-y-4">
          {addresses.map(addr => (
            <div key={addr._id} className={`relative border-2 p-5 transition-all ${addr.isDefault ? 'border-gold-300 bg-gold-50' : 'border-obsidian-100'}`}>
              {addr.isDefault && (
                <span className="absolute top-4 right-4 flex items-center gap-1.5 text-[10px] tracking-widest uppercase font-sans text-gold-600">
                  <Check size={10} /> Default
                </span>
              )}
              {editId === addr._id ? (
                <AddressForm
                  initial={addr}
                  onSave={handleEdit}
                  onCancel={() => setEditId(null)}
                />
              ) : (
                <>
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin size={16} className="text-gold-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-sans font-medium text-sm text-obsidian mb-0.5">
                        {addr.label || 'Address'}
                      </p>
                      <p className="text-sm text-obsidian-600 font-sans">{addr.firstName} {addr.lastName}</p>
                      <p className="text-sm text-obsidian-500 font-sans">{addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}</p>
                      <p className="text-sm text-obsidian-500 font-sans">{addr.city}, {addr.state} {addr.postalCode}, {addr.country}</p>
                      {addr.phone && <p className="text-sm text-obsidian-400 font-sans">{addr.phone}</p>}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setEditId(addr._id)} className="flex items-center gap-1.5 text-xs tracking-widest uppercase font-sans text-obsidian-500 hover:text-gold-600 transition-colors">
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(addr._id)} disabled={deleting === addr._id}
                      className="flex items-center gap-1.5 text-xs tracking-widest uppercase font-sans text-obsidian-400 hover:text-red-500 transition-colors disabled:opacity-50">
                      <Trash2 size={12} /> {deleting === addr._id ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Add new */}
          {showForm ? (
            <AddressForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
          ) : (
            <button onClick={() => setShowForm(true)}
              className="w-full border-2 border-dashed border-obsidian-200 hover:border-gold-300 hover:bg-gold-50 p-6 flex items-center justify-center gap-3 transition-all group">
              <Plus size={18} className="text-obsidian-300 group-hover:text-gold-500 transition-colors" />
              <span className="text-sm font-sans text-obsidian-400 group-hover:text-obsidian transition-colors">Add New Address</span>
            </button>
          )}
        </div>
      )}
    </AccountLayout>
  )
}
