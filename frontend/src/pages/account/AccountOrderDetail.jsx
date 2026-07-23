import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Package, Truck, Check, Clock, XCircle, RotateCcw, CheckCircle2 } from 'lucide-react'
import { AccountLayout } from '../../components/auth/AccountLayout'
import { orderAPI } from '../../services/api'
import toast from 'react-hot-toast'

const TIMELINE = [
  { status: 'pending',          label: 'Order Placed',      icon: Clock },
  { status: 'confirmed',        label: 'Confirmed',         icon: Check },
  { status: 'processing',       label: 'Processing',        icon: Package },
  { status: 'shipped',          label: 'Shipped',           icon: Truck },
  { status: 'out_for_delivery', label: 'Out for Delivery',  icon: Truck },
  { status: 'delivered',        label: 'Delivered',         icon: Check },
]

const STATUS_ORDER = ['pending','confirmed','processing','shipped','out_for_delivery','delivered']

export default function AccountOrderDetail() {
  const { id } = useParams()
  const qc = useQueryClient()
  const [cancelling, setCancelling] = useState(false)
  const [returning, setReturning] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderAPI.getOrder(id).then(r => r.data),
  })
  const order = data?.order

  const currentStep = STATUS_ORDER.indexOf(order?.orderStatus)
  const canCancel = ['pending','confirmed'].includes(order?.orderStatus)
  const canReturn = order?.orderStatus === 'delivered'

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await orderAPI.cancelOrder(id, cancelReason)
      await qc.invalidateQueries(['order', id])
      await qc.invalidateQueries(['my-orders'])
      toast.success('Order cancelled successfully.')
      setShowCancelModal(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order.')
    } finally { setCancelling(false) }
  }

  const handleReturn = async () => {
    setReturning(true)
    try {
      await orderAPI.requestReturn(id, 'Customer requested return')
      await qc.invalidateQueries(['order', id])
      toast.success('Return request submitted.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request return.')
    } finally { setReturning(false) }
  }

  if (isLoading) return (
    <AccountLayout><div className="space-y-4">{Array(4).fill(0).map((_,i) => <div key={i} className="h-20 skeleton rounded"/>)}</div></AccountLayout>
  )

  if (!order) return (
    <AccountLayout><p className="text-obsidian-400 font-sans">Order not found.</p></AccountLayout>
  )

  return (
    <AccountLayout>
      <div className="flex items-center gap-4 mb-8">
        <Link to="/account/orders" className="text-obsidian-400 hover:text-gold-600 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-3xl">Order #{order.orderNumber}</h1>
          <p className="text-xs text-obsidian-400 font-sans mt-0.5">
            Placed {new Date(order.createdAt).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>
      </div>

      {/* Timeline */}
      {!['cancelled','return_requested','returned'].includes(order.orderStatus) && (
        <div className="bg-cream p-6 mb-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-px bg-obsidian-200 z-0" />
            <div className="absolute top-5 left-0 h-px bg-gold-400 z-0 transition-all duration-700"
              style={{ width: `${currentStep >= 0 ? (currentStep / (TIMELINE.length - 1)) * 100 : 0}%` }} />
            {TIMELINE.map((step, i) => {
              const done = i <= currentStep
              const active = i === currentStep
              const Icon = step.icon
              return (
                <div key={step.status} className="flex flex-col items-center gap-2 z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${done ? 'bg-gold-gradient border-gold-400 text-white' : 'bg-white border-obsidian-200 text-obsidian-300'} ${active ? 'scale-110 shadow-gold' : ''}`}>
                    <Icon size={14} />
                  </div>
                  <p className={`text-[10px] tracking-wide font-sans text-center hidden md:block ${done ? 'text-gold-600 font-medium' : 'text-obsidian-400'}`}>{step.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Cancelled/Returned banner */}
      {['cancelled','return_requested','returned'].includes(order.orderStatus) && (
        <div className={`p-4 mb-6 flex items-center gap-3 ${order.orderStatus === 'cancelled' ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'}`}>
          <XCircle size={18} className={order.orderStatus === 'cancelled' ? 'text-red-500' : 'text-orange-500'} />
          <div>
            <p className={`text-sm font-sans font-medium ${order.orderStatus === 'cancelled' ? 'text-red-700' : 'text-orange-700'}`}>
              {order.orderStatus === 'cancelled' ? 'Order Cancelled' : order.orderStatus === 'return_requested' ? 'Return Requested' : 'Order Returned'}
            </p>
            {order.cancelReason && <p className="text-xs font-sans text-obsidian-500 mt-0.5">{order.cancelReason}</p>}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Items */}
        <div>
          <h2 className="font-display text-xl mb-4">Items Ordered</h2>
          <div className="border border-obsidian-100">
            {order.items?.map((item, i) => (
              <div key={i} className={`flex gap-4 p-4 ${i < order.items.length - 1 ? 'border-b border-obsidian-50' : ''}`}>
                <div className="w-16 h-20 bg-cream flex-shrink-0 overflow-hidden">
                  <img src={item.product?.images?.[0]?.url || item.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=150&q=80'}
                    alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-sans text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-obsidian-400 font-sans mt-0.5">{[item.size, item.color].filter(Boolean).join(' · ')}</p>
                  <p className="text-xs text-obsidian-400 font-sans">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-sans text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-xs text-obsidian-400 font-sans">${item.price?.toFixed(2)} each</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            {canCancel && (
              <button onClick={() => setShowCancelModal(true)} className="btn-outline text-xs py-2.5 px-5 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400">
                Cancel Order
              </button>
            )}
            {canReturn && (
              <button onClick={handleReturn} disabled={returning} className="btn-outline text-xs py-2.5 px-5 disabled:opacity-60 flex items-center gap-2">
                <RotateCcw size={13} /> {returning ? 'Requesting...' : 'Request Return'}
              </button>
            )}
            {order.trackingUrl && (
              <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2">
                <Truck size={13} /> Track Shipment
              </a>
            )}
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-4">
          <div className="bg-cream p-5">
            <h3 className="font-display text-lg mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm font-sans">
              <div className="flex justify-between"><span className="text-obsidian-500">Subtotal</span><span>${order.subtotal?.toFixed(2)}</span></div>
              {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−${order.discountAmount?.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span className="text-obsidian-500">Shipping</span><span>{order.shippingCost === 0 ? 'Complimentary' : `$${order.shippingCost?.toFixed(2)}`}</span></div>
              {order.taxAmount > 0 && <div className="flex justify-between"><span className="text-obsidian-500">Tax</span><span>${order.taxAmount?.toFixed(2)}</span></div>}
            </div>
            <div className="h-px bg-obsidian-200 my-3" />
            <div className="flex justify-between items-center">
              <span className="text-xs tracking-widest uppercase font-sans">Total</span>
              <span className="font-display text-2xl">${order.total?.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-cream p-5">
            <h3 className="font-display text-lg mb-3">Shipping Address</h3>
            <div className="text-sm font-sans text-obsidian-600 space-y-0.5">
              <p className="font-medium text-obsidian">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
              <p>{order.shippingAddress?.address1}</p>
              {order.shippingAddress?.address2 && <p>{order.shippingAddress.address2}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
              <p>{order.shippingAddress?.country}</p>
              {order.shippingAddress?.phone && <p className="text-obsidian-400">{order.shippingAddress.phone}</p>}
            </div>
          </div>

          <div className="bg-cream p-5">
            <h3 className="font-display text-lg mb-3">Payment</h3>
            <p className="text-sm font-sans text-obsidian-600 capitalize">{order.paymentMethod?.replace('_',' ')}</p>
            <p className={`text-xs font-sans mt-1 ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
              {order.paymentStatus === 'paid' ? <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Payment confirmed</span> : `Status: ${order.paymentStatus}`}
            </p>
          </div>
        </div>
      </div>

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-white p-8 max-w-md w-full shadow-luxury-lg animate-scale-in">
            <h3 className="font-display text-2xl mb-2">Cancel Order</h3>
            <p className="text-sm text-obsidian-400 font-sans mb-5">Are you sure you want to cancel order #{order.orderNumber}? This action cannot be undone.</p>
            <div className="mb-5">
              <label className="block text-xs tracking-widest uppercase font-sans text-obsidian-500 mb-2">Reason (optional)</label>
              <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                className="input-luxury-box w-full h-20 resize-none" placeholder="Let us know why you're cancelling..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className="btn-outline flex-1">Keep Order</button>
              <button onClick={handleCancel} disabled={cancelling} className="flex-1 bg-red-600 text-white px-6 py-3.5 text-xs tracking-widest uppercase font-sans hover:bg-red-700 transition-colors disabled:opacity-60">
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  )
}
