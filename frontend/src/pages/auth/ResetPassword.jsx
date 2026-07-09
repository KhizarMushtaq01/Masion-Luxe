// ResetPassword.jsx
import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async ({ password, confirmPassword }) => {
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await authAPI.resetPassword(token, password)
      toast.success('Password reset successfully!')
      navigate('/sign-in')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired reset link.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md bg-white p-10 shadow-luxury">
        <Link to="/" className="font-display text-2xl tracking-luxury block text-center mb-8">MAISON LUXE</Link>
        <h1 className="font-display text-3xl mb-2 text-center">Reset Password</h1>
        <p className="text-sm text-obsidian-400 font-sans mb-8 text-center">Enter your new password below.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {[
            { n: 'password', l: 'New Password' },
            { n: 'confirmPassword', l: 'Confirm Password' },
          ].map(f => (
            <div key={f.n}>
              <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-2">{f.l}</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'}
                  {...register(f.n, { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
                  className={`input-luxury-box w-full pr-10 ${errors[f.n] ? 'border-red-400' : ''}`} placeholder="••••••••" />
                {f.n === 'password' && (
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-obsidian-400">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
              {errors[f.n] && <p className="text-xs text-red-500 font-sans mt-1">{errors[f.n].message}</p>}
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
