import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Check } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function Register() {
  const [showPw, setShowPw] = useState(false)
  const { register: registerUser, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const pw = watch('password', '')

  const pwChecks = [
    { label: 'At least 8 characters', ok: pw.length >= 8 },
    { label: 'Contains a number', ok: /\d/.test(pw) },
    { label: 'Contains a letter', ok: /[a-zA-Z]/.test(pw) },
  ]

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) { toast.error('Passwords do not match'); return }
    const result = await registerUser({ firstName: data.firstName, lastName: data.lastName, email: data.email, password: data.password })
    if (result.success) { toast.success('Account created! Please verify your email.'); navigate('/') }
    else toast.error(result.message)
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:block relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=90" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-obsidian/50" />
        <div className="absolute inset-0 flex flex-col justify-end p-16">
          <Link to="/" className="font-display text-4xl tracking-luxury text-white mb-6 block">MAISON LUXE</Link>
          <h2 className="font-display text-3xl text-white font-light mb-4">Join the Inner Circle</h2>
          <div className="space-y-3">
            {['Early access to new collections', 'Exclusive member events & previews', 'Personal styling service', 'Complimentary gift wrapping'].map(b => (
              <div key={b} className="flex items-center gap-3 text-white/80 font-sans text-sm">
                <Check size={14} className="text-gold-400 flex-shrink-0" /> {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          <Link to="/" className="font-display text-2xl tracking-luxury block text-center mb-2 md:hidden">MAISON LUXE</Link>
          <p className="section-subtitle text-center mb-3">Become a Member</p>
          <h1 className="font-display text-4xl text-center font-light mb-10">Create Account</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {[{ n: 'firstName', l: 'First Name' }, { n: 'lastName', l: 'Last Name' }].map(f => (
                <div key={f.n}>
                  <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-2">{f.l}</label>
                  <input {...register(f.n, { required: 'Required' })} className={`input-luxury-box w-full ${errors[f.n] ? 'border-red-400' : ''}`} />
                  {errors[f.n] && <p className="text-xs text-red-500 font-sans mt-1">{errors[f.n].message}</p>}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-2">Email Address</label>
              <input type="email" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                className={`input-luxury-box w-full ${errors.email ? 'border-red-400' : ''}`} placeholder="your@email.com" />
              {errors.email && <p className="text-xs text-red-500 font-sans mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
                  className={`input-luxury-box w-full pr-10 ${errors.password ? 'border-red-400' : ''}`} placeholder="Min. 8 characters" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-obsidian-400"><Eye size={16} /></button>
              </div>
              {pw && (
                <div className="mt-2 space-y-1">
                  {pwChecks.map(c => (
                    <div key={c.label} className={`flex items-center gap-2 text-xs font-sans transition-colors ${c.ok ? 'text-green-600' : 'text-obsidian-400'}`}>
                      <Check size={10} className={c.ok ? 'opacity-100' : 'opacity-30'} /> {c.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-2">Confirm Password</label>
              <input type="password" {...register('confirmPassword', { required: 'Please confirm your password' })}
                className={`input-luxury-box w-full ${errors.confirmPassword ? 'border-red-400' : ''}`} placeholder="••••••••" />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" {...register('newsletter')} defaultChecked className="mt-0.5 accent-gold-500" />
              <span className="text-xs text-obsidian-500 font-sans leading-relaxed">I'd like to receive updates about new collections, exclusive events, and special offers.</span>
            </label>

            <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-60">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className="text-xs text-center text-obsidian-400 font-sans">
              By creating an account, you agree to our{' '}
              <Link to="/contact#terms" className="text-gold-600 hover:underline">Terms</Link> and{' '}
              <Link to="/contact#privacy" className="text-gold-600 hover:underline">Privacy Policy</Link>.
            </p>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-obsidian-400 font-sans">
              Already a member?{' '}
              <Link to="/sign-in" className="text-gold-600 hover:text-gold-700 font-medium transition-colors">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
