import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

export default function VerifyEmail() {
  const { token } = useParams()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    authAPI.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md bg-white p-12 shadow-luxury text-center">
        <Link to="/" className="font-display text-2xl tracking-luxury block mb-10">MAISON LUXE</Link>

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader size={40} className="text-gold-500 animate-spin" strokeWidth={1.5} />
            <p className="font-display text-2xl">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={56} className="text-green-500 mx-auto mb-6" strokeWidth={1.5} />
            <h1 className="font-display text-3xl mb-3">Email Verified!</h1>
            <p className="text-sm text-obsidian-400 font-sans mb-8">Your email has been successfully verified. Welcome to Maison Luxe.</p>
            <Link to="/" className="btn-gold w-full inline-flex justify-center">Start Shopping</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={56} className="text-red-400 mx-auto mb-6" strokeWidth={1.5} />
            <h1 className="font-display text-3xl mb-3">Verification Failed</h1>
            <p className="text-sm text-obsidian-400 font-sans mb-8">The verification link is invalid or has expired. Please request a new one.</p>
            <Link to="/sign-in" className="btn-primary w-full inline-flex justify-center">Return to Sign In</Link>
          </>
        )}
      </div>
    </div>
  )
}
