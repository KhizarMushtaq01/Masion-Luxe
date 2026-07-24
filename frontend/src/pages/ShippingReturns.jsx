import { Truck, Globe, RotateCcw, PackageCheck, Clock, ShieldCheck } from 'lucide-react'

const shippingOptions = [
  { method: 'Standard Shipping', region: 'Domestic (UK)', time: '3 – 5 business days', cost: 'Free over £250 · £8 otherwise' },
  { method: 'Express Shipping', region: 'Domestic (UK)', time: '1 – 2 business days', cost: '£18' },
  { method: 'Standard International', region: 'Europe', time: '5 – 8 business days', cost: '£20' },
  { method: 'Standard International', region: 'Rest of World', time: '7 – 12 business days', cost: '£30' },
  { method: 'Express International', region: 'Worldwide', time: '2 – 4 business days', cost: '£45' },
]

const returnSteps = [
  { icon: PackageCheck, title: 'Request a Return', desc: 'Sign in to My Account and select "Order Tracking" to initiate a return within 30 days of delivery.' },
  { icon: RotateCcw, title: 'Pack Your Item', desc: 'Place the item in its original packaging with all tags attached and include the return slip.' },
  { icon: Truck, title: 'Ship It Back', desc: 'Use the prepaid return label we provide, or drop it at any of our flagship boutiques.' },
  { icon: ShieldCheck, title: 'Receive Your Refund', desc: 'Once inspected, refunds are issued to your original payment method within 5 – 7 business days.' },
]

export default function ShippingReturns() {
  return (
    <div className="page-container py-16 md:py-20">
      <div className="max-w-3xl mx-auto text-center mb-14">
        <p className="section-subtitle mb-3">Client Services</p>
        <h1 className="section-title mb-5">Shipping &amp; Returns</h1>
        <p className="font-sans text-sm md:text-base text-obsidian-600 leading-relaxed">
          Every Maison Luxe order is packaged with care and shipped with full tracking. If something isn't right, our returns process is simple and free within the UK.
        </p>
      </div>

      {/* Shipping rates */}
      <section className="mb-20">
        <div className="flex items-center gap-3 mb-6">
          <Globe size={20} className="text-gold-500" />
          <h2 className="font-display text-2xl md:text-3xl font-light text-obsidian">Shipping Rates &amp; Timelines</h2>
        </div>
        <div className="overflow-x-auto border border-obsidian-100">
          <table className="w-full text-left font-sans text-sm min-w-[560px]">
            <thead>
              <tr className="bg-obsidian-50 text-xs tracking-widest uppercase text-obsidian-500">
                <th className="px-4 md:px-6 py-4">Method</th>
                <th className="px-4 md:px-6 py-4">Region</th>
                <th className="px-4 md:px-6 py-4">Delivery Time</th>
                <th className="px-4 md:px-6 py-4">Cost</th>
              </tr>
            </thead>
            <tbody>
              {shippingOptions.map((o, i) => (
                <tr key={i} className="border-t border-obsidian-100">
                  <td className="px-4 md:px-6 py-4 text-obsidian font-medium">{o.method}</td>
                  <td className="px-4 md:px-6 py-4 text-obsidian-600">{o.region}</td>
                  <td className="px-4 md:px-6 py-4 text-obsidian-600">{o.time}</td>
                  <td className="px-4 md:px-6 py-4 text-obsidian-600">{o.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="flex items-start gap-2 text-xs text-obsidian-500 font-sans mt-4">
          <Clock size={14} className="text-gold-500 mt-0.5 flex-shrink-0" />
          Orders are processed within 24 hours on business days. Delivery times begin once your order has shipped and may vary during peak seasons or customs clearance for international orders.
        </p>
      </section>

      {/* Returns process */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <RotateCcw size={20} className="text-gold-500" />
          <h2 className="font-display text-2xl md:text-3xl font-light text-obsidian">Returns &amp; Exchanges</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {returnSteps.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="w-11 h-11 flex items-center justify-center border border-gold-500 text-gold-500 mb-4">
                <s.icon size={18} />
              </div>
              <p className="text-xs tracking-widest uppercase text-gold-600 font-sans mb-1.5">Step 0{i + 1}</p>
              <h3 className="font-display text-lg text-obsidian mb-2">{s.title}</h3>
              <p className="text-sm text-obsidian-600 font-sans leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-obsidian-50 p-6 md:p-8 space-y-3 font-sans text-sm text-obsidian-600 leading-relaxed">
          <p><strong className="text-obsidian">Eligibility:</strong> items must be unworn, unwashed, and returned within 30 days of delivery with original tags and packaging intact.</p>
          <p><strong className="text-obsidian">Final sale items:</strong> items marked "Final Sale," personalised pieces, and swimwear/undergarments cannot be returned or exchanged.</p>
          <p><strong className="text-obsidian">Exchanges:</strong> to exchange for a different size or colour, place a new order and return the original item for a refund.</p>
        </div>
      </section>
    </div>
  )
}
