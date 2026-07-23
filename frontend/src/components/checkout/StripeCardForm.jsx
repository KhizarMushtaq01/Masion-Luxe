import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { paymentAPI } from '../../services/api'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

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

export default function StripeCardForm({ orderId, amount, onPaid }) {
  const [clientSecret, setClientSecret] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    paymentAPI.createIntent(amount, orderId).then(({ data }) => setClientSecret(data.clientSecret))
  }, [orderId, amount])

  if (!clientSecret) {
    return <div className="h-40 skeleton" />
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <InnerForm onPaid={onPaid} submitting={submitting} setSubmitting={setSubmitting} />
    </Elements>
  )
}
