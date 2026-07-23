import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Printer, MapPin, CreditCard, Clock } from 'lucide-react'
import { adminAPI } from '../../services/api'

export default function AdminOrderDetail() {
  const { id } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-order-detail', id],
    queryFn: () => adminAPI.getOrderDetail(id).then(r => r.data),
  })

  if (isLoading) return <div className="space-y-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-24 skeleton" />)}</div>

  const order = data?.order
  if (!order) return <p className="text-obsidian-400 font-sans">Order not found.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link to="/admin/orders" className="text-obsidian-400 hover:text-gold-600 transition-colors"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="font-display text-3xl">Order #{order.orderNumber}</h1>
            <p className="text-sm text-obsidian-400 font-sans capitalize">{order.orderStatus?.replace('_', ' ')}</p>
          </div>
        </div>
        <button onClick={() => window.print()} className="btn-outline text-xs flex items-center gap-2">
          <Printer size={14} /> Print Invoice
        </button>
      </div>

      <div id="invoice" className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 shadow-luxury border border-obsidian-50">
            <h3 className="font-display text-lg mb-4">Items</h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3 items-center border-b border-obsidian-50 last:border-0 pb-3 last:pb-0">
                  <div className="w-12 h-14 bg-cream flex-shrink-0 overflow-hidden">
                    <img src={item.product?.images?.[0]?.url || item.image || ''} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans font-medium truncate">{item.name}</p>
                    <p className="text-xs text-obsidian-400 font-sans">{item.size && `Size: ${item.size} · `}Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-sans font-medium flex-shrink-0">${item.totalPrice?.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="h-px bg-obsidian-100 my-4" />
            <div className="space-y-1.5 text-sm font-sans max-w-xs ml-auto">
              <div className="flex justify-between"><span className="text-obsidian-500">Subtotal</span><span>${order.subtotal?.toFixed(2)}</span></div>
              {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-${order.discountAmount.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span className="text-obsidian-500">Shipping</span><span>{order.shippingCost === 0 ? 'Free' : `$${order.shippingCost?.toFixed(2)}`}</span></div>
              <div className="flex justify-between"><span className="text-obsidian-500">Tax</span><span>${order.taxAmount?.toFixed(2)}</span></div>
              <div className="flex justify-between font-medium text-base pt-1 border-t border-obsidian-100"><span>Total</span><span>${order.total?.toFixed(2)}</span></div>
            </div>
          </div>

          <div className="bg-white p-6 shadow-luxury border border-obsidian-50 print:hidden">
            <div className="flex items-center gap-2 mb-4"><Clock size={16} className="text-gold-500" /><h3 className="font-display text-lg">Status Timeline</h3></div>
            <div className="space-y-3">
              {order.statusHistory?.slice().reverse().map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-sm font-sans">
                  <div className="w-2 h-2 rounded-full bg-gold-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="capitalize font-medium">{h.status.replace('_', ' ')}</p>
                    <p className="text-xs text-obsidian-400">{h.note} {h.updatedBy && `— ${h.updatedBy.firstName} ${h.updatedBy.lastName}`}</p>
                    <p className="text-xs text-obsidian-300">{new Date(h.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white p-5 shadow-luxury border border-obsidian-50">
            <h3 className="font-display text-lg mb-3">Customer</h3>
            <p className="text-sm font-sans font-medium">{order.user?.firstName} {order.user?.lastName}</p>
            <p className="text-sm text-obsidian-500 font-sans">{order.user?.email}</p>
            {order.user?.phone && <p className="text-sm text-obsidian-500 font-sans">{order.user.phone}</p>}
          </div>

          <div className="bg-white p-5 shadow-luxury border border-obsidian-50">
            <div className="flex items-center gap-2 mb-3"><MapPin size={16} className="text-gold-500" /><h3 className="font-display text-lg">Shipping Address</h3></div>
            <p className="text-sm font-sans">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
            <p className="text-sm text-obsidian-500 font-sans">{order.shippingAddress.address1}{order.shippingAddress.address2 ? `, ${order.shippingAddress.address2}` : ''}</p>
            <p className="text-sm text-obsidian-500 font-sans">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
            <p className="text-sm text-obsidian-500 font-sans">{order.shippingAddress.country}</p>
          </div>

          <div className="bg-white p-5 shadow-luxury border border-obsidian-50">
            <div className="flex items-center gap-2 mb-3"><CreditCard size={16} className="text-gold-500" /><h3 className="font-display text-lg">Payment</h3></div>
            <p className="text-sm font-sans capitalize">{order.paymentMethod}</p>
            <p className="text-xs text-obsidian-400 font-sans capitalize">{order.paymentStatus}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
