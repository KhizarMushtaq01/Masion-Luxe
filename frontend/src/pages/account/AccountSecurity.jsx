import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Shield, Lock, Clock } from 'lucide-react'
import { AccountLayout } from '../../components/auth/AccountLayout'
import { authAPI, userAPI } from '../../services/api'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export default function AccountSecurity() {
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm()

  const { data: activityData } = useQuery({
    queryKey: ['activity'],
    queryFn: () => userAPI.getActivity().then(r => r.data),
  })

  const onChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) { toast.error('Passwords do not match'); return }
    setSaving(true)
    try {
      await authAPI.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword })
      toast.success('Password changed. A confirmation email has been sent.')
      reset()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.')
    } finally { setSaving(false) }
  }

  const ACTION_LABELS = {
    'user.login': 'Signed in',
    'user.register': 'Account created',
    'user.password_changed': 'Password changed',
    'user.password_reset': 'Password reset',
    'user.profile_updated': 'Profile updated',
    'user.avatar_changed': 'Profile photo changed',
    'order.created': 'Order placed',
  }

  return (
    <AccountLayout title="Security">
      {/* Change password */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <Lock size={18} className="text-gold-500" />
          <h2 className="font-display text-xl">Change Password</h2>
        </div>

        <form onSubmit={handleSubmit(onChangePassword)} className="space-y-5 max-w-md">
          {[
            { n: 'currentPassword', l: 'Current Password' },
            { n: 'newPassword', l: 'New Password' },
            { n: 'confirmPassword', l: 'Confirm New Password' },
          ].map(f => (
            <div key={f.n}>
              <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-2">{f.l}</label>
              <input type="password"
                {...register(f.n, {
                  required: 'Required',
                  ...(f.n === 'newPassword' ? { minLength: { value: 8, message: 'Min 8 characters' } } : {})
                })}
                className={`input-luxury-box w-full ${errors[f.n] ? 'border-red-400' : ''}`}
                placeholder="••••••••" />
              {errors[f.n] && <p className="text-xs text-red-500 font-sans mt-1">{errors[f.n].message}</p>}
            </div>
          ))}
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Activity log */}
      <div className="border-t border-obsidian-100 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <Clock size={18} className="text-gold-500" />
          <h2 className="font-display text-xl">Recent Activity</h2>
        </div>

        {!activityData?.logs?.length ? (
          <p className="text-sm text-obsidian-400 font-sans">No recent activity found.</p>
        ) : (
          <div className="space-y-0 border border-obsidian-100">
            {activityData.logs.slice(0, 20).map((log, i) => (
              <div key={log._id} className={`flex items-center justify-between p-4 ${i < activityData.logs.length - 1 ? 'border-b border-obsidian-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gold-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-sans">{ACTION_LABELS[log.action] || log.action}</p>
                    {log.ip && <p className="text-xs text-obsidian-400 font-sans">IP: {log.ip}</p>}
                  </div>
                </div>
                <p className="text-xs text-obsidian-400 font-sans">
                  {new Date(log.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric' })} · {new Date(log.createdAt).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  )
}
