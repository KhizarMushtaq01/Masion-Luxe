// ForgotPassword.jsx
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email }) => {
    setLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md bg-white p-10 shadow-luxury">
        <Link to="/sign-in" className="flex items-center gap-2 text-xs tracking-widest uppercase font-sans text-obsidian-400 hover:text-gold-600 transition-colors mb-8">
          <ArrowLeft size={12} /> Back to Sign In
        </Link>

        {!sent ? (
          <>
            <div className="w-14 h-14 bg-gold-50 flex items-center justify-center mb-6">
              <Mail size={24} className="text-gold-500" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-3xl mb-2">Forgot Password?</h1>
            <p className="text-sm text-obsidian-400 font-sans mb-8">Enter your email address and we'll send you a link to reset your password.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-2">Email Address</label>
                <input type="email" {...register('email', { required: 'Email is required' })}
                  className={`input-luxury-box w-full ${errors.email ? 'border-red-400' : ''}`} placeholder="your@email.com" />
                {errors.email && <p className="text-xs text-red-500 font-sans mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail size={28} className="text-green-500" />
            </div>
            <h2 className="font-display text-3xl mb-3">Check Your Email</h2>
            <p className="text-sm text-obsidian-400 font-sans mb-8">If that email address is registered with us, you will receive a password reset link shortly.</p>
            <Link to="/sign-in" className="btn-primary w-full inline-flex justify-center">Return to Sign In</Link>
          </div>
        )}
      </div>
    </div>
  )
}
