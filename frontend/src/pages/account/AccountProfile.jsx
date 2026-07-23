import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Camera, Save } from 'lucide-react'
import { AccountLayout } from '../../components/auth/AccountLayout'
import { userAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function AccountProfile() {
  const { user, updateUser } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: user?.gender || '',
    }
  })

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const { data: res } = await userAPI.updateProfile(data)
      updateUser(res.user)
      toast.success('Profile updated successfully.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.')
    } finally { setSaving(false) }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    try {
      const { data } = await userAPI.updateAvatar(file)
      updateUser({ avatar: data.avatar })
      toast.success('Profile photo updated.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update photo.')
    } finally {
      setAvatarLoading(false)
    }
  }

  const Field = ({ label, name, type = 'text', validation = {} }) => (
    <div>
      <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-2">{label}</label>
      <input type={type} {...register(name, validation)} className={`input-luxury-box w-full ${errors[name] ? 'border-red-400' : ''}`} />
      {errors[name] && <p className="text-xs text-red-500 font-sans mt-1">{errors[name].message}</p>}
    </div>
  )

  return (
    <AccountLayout title="My Profile">
      {/* Avatar */}
      <div className="flex items-center gap-6 mb-10 pb-8 border-b border-obsidian-100">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gold-gradient flex items-center justify-center">
            {user?.avatar?.url
              ? <img src={user.avatar.url} alt="" className="w-full h-full object-cover" />
              : <span className="font-display text-3xl text-white">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            }
          </div>
          <label className={`absolute bottom-0 right-0 w-8 h-8 bg-obsidian flex items-center justify-center cursor-pointer hover:bg-gold-600 transition-colors rounded-full ${avatarLoading ? 'opacity-60 pointer-events-none' : ''}`}>
            <Camera size={14} className="text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
        </div>
        <div>
          <p className="font-display text-xl">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-obsidian-400 font-sans">{user?.email}</p>
          {!user?.isEmailVerified && (
            <span className="text-xs text-amber-600 font-sans bg-amber-50 px-2 py-0.5 mt-1 inline-block">Email not verified</span>
          )}
          {user?.isEmailVerified && (
            <span className="text-xs text-green-600 font-sans mt-1 inline-block">✓ Verified</span>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="First Name" name="firstName" validation={{ required: 'First name is required' }} />
          <Field label="Last Name" name="lastName" validation={{ required: 'Last name is required' }} />
          <Field label="Phone Number" name="phone" type="tel" />
          <Field label="Date of Birth" name="dateOfBirth" type="date" />
        </div>

        <div>
          <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-2">Gender</label>
          <select {...register('gender')} className="input-luxury-box w-full md:w-64">
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        {/* Read-only email */}
        <div>
          <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-2">Email Address</label>
          <input value={user?.email} readOnly className="input-luxury-box w-full bg-obsidian-50 text-obsidian-400 cursor-not-allowed" />
          <p className="text-xs text-obsidian-400 font-sans mt-1">Email address cannot be changed. Contact support if needed.</p>
        </div>

        {/* Preferences */}
        <div className="pt-4 border-t border-obsidian-100">
          <h3 className="font-display text-xl mb-4">Communication Preferences</h3>
          <div className="space-y-3">
            {[
              { n: 'newsletter', l: 'Receive our newsletter with new collections and exclusive offers' },
            ].map(p => (
              <label key={p.n} className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" {...register(`preferences.${p.n}`)} defaultChecked={user?.preferences?.[p.n]} className="mt-0.5 accent-gold-500" />
                <span className="text-sm font-sans text-obsidian-600">{p.l}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={saving || !isDirty} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Member since */}
      <div className="mt-8 pt-6 border-t border-obsidian-100 flex items-center justify-between text-xs font-sans text-obsidian-400">
        <span>Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { month:'long', year:'numeric' })}</span>
        <span className="text-gold-600">{user?.loyaltyPoints || 0} loyalty points</span>
      </div>
    </AccountLayout>
  )
}
