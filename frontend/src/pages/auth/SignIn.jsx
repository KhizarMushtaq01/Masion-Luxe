// SignIn.jsx
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

// ?redirect= is attacker-controllable, so only same-site paths are honoured.
// "//evil.com" and "\\evil.com" are both protocol-relative once the browser
// normalises backslashes, which is how an open redirect sneaks past a naive
// "starts with /" check.
function safeRedirect(target) {
  if (!target || !target.startsWith('/')) return '/'
  if (/^[/\\]{2}/.test(target)) return '/'
  return target
}

export default function SignIn() {
  const [showPw, setShowPw] = useState(false)
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = safeRedirect(searchParams.get('redirect'))
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    const result = await login(data)
    if (result.success) { toast.success('Welcome back!'); navigate(redirect) }
    else toast.error(result.message)
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:block relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=90" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-obsidian/50" />
        <div className="absolute inset-0 flex flex-col justify-end p-16">
          <Link to="/" className="font-display text-4xl tracking-luxury text-white mb-6 block">MAISON LUXE</Link>
          <p className="font-display text-2xl text-white/90 font-light leading-relaxed">"Luxury is not about buying expensive things; it's about living in a way where you appreciate things."</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-md">
          <Link to="/" className="font-display text-2xl tracking-luxury block text-center mb-2 md:hidden">MAISON LUXE</Link>
          <p className="section-subtitle text-center mb-3">Welcome Back</p>
          <h1 className="font-display text-4xl text-center font-light mb-10">Sign In</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-2">Email Address</label>
              <input type="email" {...register('email', { required: 'Email is required' })}
                className={`input-luxury-box w-full ${errors.email ? 'border-red-400' : ''}`}
                placeholder="your@email.com" />
              {errors.email && <p className="text-xs text-red-500 font-sans mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} {...register('password', { required: 'Password is required' })}
                  className={`input-luxury-box w-full pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-obsidian-400 hover:text-obsidian transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 font-sans mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs font-sans text-gold-600 hover:text-gold-700 transition-colors">Forgot password?</Link>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full disabled:opacity-60">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-obsidian-400 font-sans">
              Don't have an account?{' '}
              <Link to="/register" className="text-gold-600 hover:text-gold-700 font-medium transition-colors">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
