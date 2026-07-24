import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { paymentAPI } from '../../services/api'

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null

const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#c9a96e',
    colorBackground: '#ffffff',
    colorText: '#0a0a0a',
    fontFamily: 'Jost, sans-serif',
    borderRadius: '0px',
  }
}

function InnerForm({ onPaid, submitting, setSubmitting }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')

  const handlePay = async () => {
    if (!stripe || !elements) return
    setSubmitting(true)
    setError('')
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })
    if (confirmError) {
      setError(confirmError.message || 'Payment failed. Please check your card details.')
      setSubmitting(false)
      return
    }
    onPaid()
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      {error && <p className="text-xs text-red-500 font-sans">{error}</p>}
      <button type="button" onClick={handlePay} disabled={submitting || !stripe} className="btn-gold w-full disabled:opacity-60">
        {submitting ? 'Processing Payment...' : 'Pay Now'}
      </button>
    </div>
  )
}

export default function StripeCardForm({ orderId, onPaid }) {
  const [clientSecret, setClientSecret] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoadError('')
    setClientSecret(null)
    paymentAPI.createIntent(orderId)
      .then(({ data }) => {
        if (!cancelled) setClientSecret(data.clientSecret)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.response?.data?.message || 'Failed to load payment form. Please try again.')
      })
    return () => { cancelled = true }
  }, [orderId, retryKey])

  if (loadError) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-red-500 font-sans">{loadError}</p>
        <button type="button" onClick={() => setRetryKey(k => k + 1)} className="btn-outline w-full text-xs">
          Retry
        </button>
      </div>
    )
  }

  if (!clientSecret) {
    return <div className="h-40 skeleton" />
  }

  if (!stripePromise) {
    return <p className="text-xs text-obsidian-400 font-sans">Card payments are not configured in this environment.</p>
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <InnerForm onPaid={onPaid} submitting={submitting} setSubmitting={setSubmitting} />
    </Elements>
  )
}
