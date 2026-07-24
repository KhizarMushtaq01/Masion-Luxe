import { Scale, ShoppingBag, Copyright, AlertTriangle, Gavel, RefreshCw, Mail } from 'lucide-react'

const sections = [
  {
    icon: Scale,
    title: '1. Acceptance of Terms',
    body: [
      'By accessing or using the Maison Luxe website, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our site.',
    ],
  },
  {
    icon: ShoppingBag,
    title: '2. Orders & Payment',
    body: [
      'All orders are subject to acceptance and product availability. We reserve the right to refuse or cancel any order at our discretion, including in cases of suspected fraud or pricing errors.',
      'Prices are listed in the currency displayed at checkout and are subject to change without notice. Payment must be received in full before an order is dispatched.',
    ],
  },
  {
    icon: Copyright,
    title: '3. Intellectual Property',
    body: [
      'All content on this site — including images, text, logos, and designs — is the property of Maison Luxe and protected by copyright and trademark law. It may not be reproduced or used without our written consent.',
    ],
  },
  {
    icon: AlertTriangle,
    title: '4. Limitation of Liability',
    body: [
      'Maison Luxe shall not be liable for any indirect, incidental, or consequential damages arising from your use of our site or products, to the fullest extent permitted by law.',
    ],
  },
  {
    icon: Gavel,
    title: '5. Governing Law',
    body: [
      'These Terms are governed by the laws of England and Wales. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.',
    ],
  },
  {
    icon: RefreshCw,
    title: '6. Changes to These Terms',
    body: [
      'We may revise these Terms at any time. Continued use of the site after changes are posted constitutes acceptance of the revised Terms.',
    ],
  },
]

export default function TermsOfService() {
  return (
    <div className="page-container py-16 md:py-20">
      <div className="max-w-3xl mx-auto text-center mb-6">
        <p className="section-subtitle mb-3">Legal</p>
        <h1 className="section-title mb-4">Terms of Service</h1>
        <p className="text-xs text-obsidian-400 font-sans">Last updated: 1 July 2026</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <p className="font-sans text-sm md:text-base text-obsidian-600 leading-relaxed mb-14 text-center">
          These Terms of Service govern your use of the Maison Luxe website and any purchases made through it. Please read them carefully.
        </p>

        <div className="space-y-12">
          {sections.map((s) => (
            <section key={s.title}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center bg-obsidian-50 flex-shrink-0">
                  <s.icon size={16} className="text-gold-500" />
                </div>
                <h2 className="font-display text-xl md:text-2xl font-light text-obsidian">{s.title}</h2>
              </div>
              <div className="space-y-3 md:pl-[52px]">
                {s.body.map((p, i) => (
                  <p key={i} className="text-sm text-obsidian-600 font-sans leading-relaxed">{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-obsidian-100 flex items-start gap-3">
          <Mail size={16} className="text-gold-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-obsidian-600 font-sans">
            Questions about these Terms? Contact us at <a href="mailto:legal@maisonluxe.com" className="text-gold-600 hover:underline">legal@maisonluxe.com</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
