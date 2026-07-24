import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronRight } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import useAuthStore from '../../store/authStore'
import { orderAPI, paymentAPI, settingsAPI } from '../../services/api'
import toast from 'react-hot-toast'
import StripeCardForm from '../../components/checkout/StripeCardForm'
import PayPalPaymentButton from '../../components/checkout/PayPalPaymentButton'

const steps = ['Shipping', 'Payment', 'Review']

export default function Checkout() {
  const [step, setStep] = useState(0)
  const [shippingData, setShippingData] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [placing, setPlacing] = useState(false)
  const [pendingOrder, setPendingOrder] = useState(null)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const { cart, getSubtotal, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsAPI.getSettings().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })
  const settings = settingsData?.settings || { taxRate: 0.08, freeShippingThreshold: 500, standardShippingCost: 25 }

  const subtotal = getSubtotal()
  const discount = cart?.discountAmount || 0
  const shipping = (subtotal - discount) >= settings.freeShippingThreshold ? 0 : settings.standardShippingCost
  const tax = (subtotal - discount) * settings.taxRate
  const total = subtotal - discount + shipping + tax

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
    }
  })

  const onShippingSubmit = (data) => {
    setShippingData(data)
    setStep(1)
  }

  const placeOrder = async () => {
    setPlacing(true)
    try {
      const orderData = {
        items: cart.items.map(item => ({
          product: item.product._id,
          name: item.product.name,
          image: item.product.images?.[0]?.url,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.price || item.product.salePrice || item.product.basePrice,
        })),
        shippingAddress: shippingData,
        paymentMethod,
        subtotal,
        shippingCost: shipping,
        taxAmount: tax,
        discountAmount: discount,
        couponCode: cart.couponCode,
        total,
      }

      const { data } = await orderAPI.createOrder(orderData)
      await clearCart()
      toast.success('Order placed successfully!')
      navigate(`/order-success/${data.order._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  const buildOrderPayload = () => ({
    items: cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images?.[0]?.url,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: item.price || item.product.salePrice || item.product.basePrice,
    })),
    shippingAddress: shippingData,
    paymentMethod,
    subtotal,
    shippingCost: shipping,
    taxAmount: tax,
    discountAmount: discount,
    couponCode: cart.couponCode,
    total,
  })

  const goToPayment = async () => {
    if (paymentMethod === 'cod') {
      setStep(2)
      return
    }
    if (pendingOrder) {
      // Already created an order for this checkout attempt — don't create another.
      setStep(2)
      return
    }
    setCreatingOrder(true)
    try {
      const { data } = await orderAPI.createOrder(buildOrderPayload())
      setPendingOrder(data.order)
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start checkout. Please try again.')
    } finally {
      setCreatingOrder(false)
    }
  }

  const InputField = ({ label, name, type = 'text', validation = {}, half = false }) => (
    <div className={half ? 'col-span-1' : 'col-span-2'}>
      <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-2">{label}</label>
      <input type={type} {...register(name, validation)}
        className={`input-luxury-box w-full ${errors[name] ? 'border-red-400' : ''}`} />
      {errors[name] && <p className="text-xs text-red-500 font-sans mt-1">{errors[name].message}</p>}
    </div>
  )

  return (
    <div className="page-container py-12">
      <div className="max-w-5xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl tracking-luxury">MAISON LUXE</h1>
          <div className="divider-gold mt-3 max-w-16 mx-auto" />
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 text-xs tracking-widest uppercase font-sans transition-colors ${i === step ? 'text-gold-600 font-medium' : i < step ? 'text-obsidian cursor-pointer hover:text-gold-600' : 'text-obsidian-300'}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${i === step ? 'border-gold-500 bg-gold-50' : i < step ? 'border-obsidian bg-obsidian text-white' : 'border-obsidian-200'}`}>
                  {i < step ? <Check size={12} /> : i + 1}
                </span>
                {s}
              </button>
              {i < steps.length - 1 && <div className={`w-16 h-px mx-3 transition-colors ${i < step ? 'bg-gold-400' : 'bg-obsidian-200'}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-12">
          {/* Left */}
          <div>
            {/* Step 0: Shipping */}
            {step === 0 && (
              <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-6">
                <h2 className="font-display text-2xl">Shipping Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="First Name" name="firstName" half validation={{ required: 'Required' }} />
                  <InputField label="Last Name" name="lastName" half validation={{ required: 'Required' }} />
                  <InputField label="Email" name="email" type="email" validation={{ required: 'Required' }} />
                  <InputField label="Phone" name="phone" half />
                  <InputField label="Address" name="address1" validation={{ required: 'Required' }} />
                  <InputField label="Apartment / Suite (optional)" name="address2" />
                  <InputField label="City" name="city" half validation={{ required: 'Required' }} />
                  <InputField label="State / Province" name="state" half validation={{ required: 'Required' }} />
                  <InputField label="Postal Code" name="postalCode" half validation={{ required: 'Required' }} />
                  <div className="col-span-1">
                    <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-2">Country</label>
                    <select {...register('country', { required: true })} className="input-luxury-box w-full">
                      {['US','GB','FR','DE','IT','ES','CA','AU','JP','AE'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full">
                  Continue to Payment <ChevronRight size={14} />
                </button>
              </form>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { value: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Amex, Discover' },
                    { value: 'paypal', label: 'PayPal', desc: 'You will be redirected to PayPal' },
                    { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                  ].map(m => (
                    <label key={m.value} className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-all ${paymentMethod === m.value ? 'border-gold-400 bg-gold-50' : 'border-obsidian-100 hover:border-obsidian-300'}`}>
                      <input type="radio" value={m.value} checked={paymentMethod === m.value} onChange={e => setPaymentMethod(e.target.value)} className="accent-gold-500" />
                      <div>
                        <p className="font-sans text-sm font-medium">{m.label}</p>
                        <p className="font-sans text-xs text-obsidian-400">{m.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="btn-outline flex-1">Back</button>
                  <button onClick={goToPayment} disabled={creatingOrder} className="btn-primary flex-1 disabled:opacity-60">
                    {creatingOrder ? 'Preparing Checkout...' : 'Review Order'} <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && shippingData && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl">Review Your Order</h2>

                <div className="bg-cream p-5 space-y-2">
                  <h4 className="text-xs tracking-widest uppercase font-sans text-obsidian-400 mb-3">Shipping to</h4>
                  <p className="font-sans text-sm">{shippingData.firstName} {shippingData.lastName}</p>
                  <p className="font-sans text-sm text-obsidian-600">{shippingData.address1}{shippingData.address2 ? `, ${shippingData.address2}` : ''}</p>
                  <p className="font-sans text-sm text-obsidian-600">{shippingData.city}, {shippingData.state} {shippingData.postalCode}, {shippingData.country}</p>
                  <p className="font-sans text-sm text-obsidian-600">{shippingData.phone}</p>
                </div>

                <div className="bg-cream p-5">
                  <h4 className="text-xs tracking-widest uppercase font-sans text-obsidian-400 mb-3">Payment</h4>
                  <p className="font-sans text-sm capitalize">{paymentMethod.replace('_', ' ')}</p>
                </div>

                {paymentMethod === 'cod' ? (
                  <>
                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
                      <button onClick={placeOrder} disabled={placing} className="btn-gold flex-1 disabled:opacity-60">
                        {placing ? 'Placing Order...' : 'Place Order'}
                      </button>
                    </div>
                  </>
                ) : paymentMethod === 'card' && pendingOrder ? (
                  <>
                    <StripeCardForm orderId={pendingOrder._id} onPaid={() => { clearCart(); navigate(`/order-success/${pendingOrder._id}`) }} />
                    <button onClick={() => setStep(1)} className="btn-outline w-full">Back</button>
                  </>
                ) : paymentMethod === 'paypal' && pendingOrder ? (
                  <>
                    <PayPalPaymentButton orderId={pendingOrder._id} onPaid={() => { clearCart(); navigate(`/order-success/${pendingOrder._id}`) }} />
                    <button onClick={() => setStep(1)} className="btn-outline w-full">Back</button>
                  </>
                ) : null}

                <p className="text-xs text-obsidian-400 font-sans text-center">
                  By placing your order you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="bg-cream p-6 h-fit space-y-4">
            <h3 className="font-display text-xl">Order Summary</h3>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {cart?.items?.map(item => {
                const p = item.product
                const price = item.price || p?.salePrice || p?.basePrice || 0
                return (
                  <div key={item._id} className="flex gap-3 items-center">
                    <div className="relative w-14 h-16 flex-shrink-0 bg-white overflow-hidden">
                      <img src={p?.images?.[0]?.url || ''} alt={p?.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold-500 text-white text-[9px] flex items-center justify-center">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-sans font-medium truncate">{p?.name}</p>
                      {item.size && <p className="text-xs text-obsidian-400 font-sans">Size: {item.size}</p>}
                    </div>
                    <span className="text-sm font-sans font-medium flex-shrink-0">${(price * item.quantity).toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
            <div className="h-px bg-obsidian-200" />
            <div className="space-y-2 text-sm font-sans">
              <div className="flex justify-between"><span className="text-obsidian-500">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−${discount.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span className="text-obsidian-500">Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
              <div className="flex justify-between"><span className="text-obsidian-500">Tax ({(settings.taxRate * 100).toFixed(0)}%)</span><span>${tax.toFixed(2)}</span></div>
            </div>
            <div className="h-px bg-obsidian-200" />
            <div className="flex justify-between items-center">
              <span className="text-xs tracking-widest uppercase font-sans font-medium">Total</span>
              <span className="font-display text-2xl">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
