import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { orderAPI } from '../../services/api'

export default function OrderSuccess() {
  const { id } = useParams()
  const { data } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderAPI.getOrder(id).then(r => r.data),
  })
  const order = data?.order

  return (
    <div className="page-container py-20 max-w-2xl mx-auto text-center">
      <div className="flex justify-center mb-8">
        <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle size={48} className="text-green-500" strokeWidth={1.5} />
        </div>
      </div>

      <p className="text-xs tracking-widest uppercase text-gold-600 font-sans mb-3">Order Confirmed</p>
      <h1 className="font-display text-4xl md:text-5xl mb-4">Thank You for Your Order</h1>
      <p className="text-obsidian-500 font-sans text-sm leading-relaxed mb-8 max-w-md mx-auto">
        Your order has been placed successfully. A confirmation email has been sent to you with your order details.
      </p>

      {order && (
        <div className="bg-cream p-8 text-left mb-8 space-y-6">
          <div className="text-center border-b border-obsidian-200 pb-5">
            <p className="text-xs text-obsidian-400 font-sans tracking-widest uppercase mb-1">Order Number</p>
            <p className="font-display text-3xl text-gold-600">{order.orderNumber}</p>
          </div>

          <div className="space-y-4">
            {order.items?.map(item => (
              <div key={item._id} className="flex gap-4 items-center">
                <div className="w-14 h-16 bg-white flex-shrink-0 overflow-hidden">
                  <img src={item.image || item.product?.images?.[0]?.url || ''} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-sans text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-obsidian-400 font-sans">{[item.size, item.color].filter(Boolean).join(' · ')} × {item.quantity}</p>
                </div>
                <span className="font-sans text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-obsidian-200 pt-4 flex justify-between items-center">
            <span className="text-xs tracking-widest uppercase font-sans">Total Paid</span>
            <span className="font-display text-2xl">${order.total?.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/account/orders" className="btn-primary">
          <Package size={14} /> Track Your Order
        </Link>
        <Link to="/shop" className="btn-outline">
          Continue Shopping <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
