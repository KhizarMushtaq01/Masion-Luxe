import { useState } from 'react'
import { HelpCircle, ChevronDown, Package, Truck, RotateCcw, CreditCard, UserCircle } from 'lucide-react'

const categories = [
  {
    title: 'Orders',
    icon: Package,
    items: [
      { q: 'How do I place an order?', a: 'Browse our collections, select your size and colour, then add the item to your bag. Follow the checkout steps to enter your shipping and payment details and confirm your order.' },
      { q: 'Can I change or cancel my order?', a: 'We process orders quickly, but if you contact us within 1 hour of placing your order, we will do our best to accommodate changes or cancellations before it ships.' },
      { q: 'How can I track my order?', a: 'Once your order ships, you will receive a confirmation email with a tracking link. You can also view live tracking from My Account under "Order Tracking".' },
    ],
  },
  {
    title: 'Shipping & Delivery',
    icon: Truck,
    items: [
      { q: 'How long does delivery take?', a: 'Domestic UK orders arrive within 3 – 5 business days with Standard Shipping, or 1 – 2 business days with Express. International delivery ranges from 2 – 12 business days depending on destination and method.' },
      { q: 'Do you ship internationally?', a: 'Yes, we ship to over 80 countries worldwide. Duties and taxes for international orders are calculated at checkout where applicable.' },
      { q: 'Is shipping free?', a: 'Standard UK shipping is complimentary on orders over £250. See our full Shipping & Returns page for rates by region.' },
    ],
  },
  {
    title: 'Returns & Refunds',
    icon: RotateCcw,
    items: [
      { q: 'What is your return policy?', a: 'Items may be returned within 30 days of delivery, provided they are unworn, unwashed, and have original tags attached. Final sale items are not eligible for return.' },
      { q: 'How long do refunds take?', a: 'Once your return is received and inspected, refunds are issued to your original payment method within 5 – 7 business days.' },
      { q: 'Can I exchange an item?', a: 'We do not offer direct exchanges. Please place a new order for the item you would like and return the original for a refund.' },
    ],
  },
  {
    title: 'Payments',
    icon: CreditCard,
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, American Express, and PayPal. All transactions are encrypted and processed securely.' },
      { q: 'Is my payment information secure?', a: 'Yes. We never store your full card details. All payments are processed through PCI-compliant payment providers with industry-standard encryption.' },
    ],
  },
  {
    title: 'Account & Membership',
    icon: UserCircle,
    items: [
      { q: 'Do I need an account to place an order?', a: 'Yes, creating an account lets us keep your order history, addresses, and wishlist in one place, and speeds up future checkouts.' },
      { q: 'How do I reset my password?', a: 'Select "Forgot password" on the sign-in page and follow the instructions sent to your registered email address.' },
    ],
  },
]

export default function FAQ() {
  const [openKey, setOpenKey] = useState('Orders-0')

  return (
    <div className="page-container py-16 md:py-20">
      <div className="max-w-3xl mx-auto text-center mb-14">
        <p className="section-subtitle mb-3">We're Here to Help</p>
        <h1 className="section-title mb-5">Frequently Asked Questions</h1>
        <p className="font-sans text-sm md:text-base text-obsidian-600 leading-relaxed">
          Answers to the questions we hear most. Can't find what you're looking for? <a href="/contact" className="text-gold-600 hover:underline">Contact our Client Services team</a>.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-14">
        {categories.map((cat) => (
          <section key={cat.title}>
            <div className="flex items-center gap-3 mb-5">
              <cat.icon size={18} className="text-gold-500" />
              <h2 className="text-xs tracking-widest uppercase text-gold-600 font-sans">{cat.title}</h2>
            </div>
            <div className="border-t border-obsidian-100">
              {cat.items.map((item, i) => {
                const key = `${cat.title}-${i}`
                const isOpen = openKey === key
                return (
                  <div key={key} className="border-b border-obsidian-100">
                    <button
                      onClick={() => setOpenKey(isOpen ? null : key)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 py-5 text-left"
                    >
                      <span className="font-display text-base md:text-lg text-obsidian">{item.q}</span>
                      <ChevronDown size={18} className={`text-gold-500 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <p className="text-sm text-obsidian-600 font-sans leading-relaxed pb-5 pr-8">{item.a}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="max-w-3xl mx-auto mt-16 pt-10 border-t border-obsidian-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <HelpCircle size={20} className="text-gold-500 flex-shrink-0" />
          <p className="text-sm text-obsidian-600 font-sans">Still have questions? Our team responds within 24 hours.</p>
        </div>
        <a href="/contact" className="btn-outline-gold whitespace-nowrap">Contact Us</a>
      </div>
    </div>
  )
}
