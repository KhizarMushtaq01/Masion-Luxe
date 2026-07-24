import { Shield, Database, Share2, Lock, UserCheck, Cookie, RefreshCw, Mail } from 'lucide-react'

const sections = [
  {
    icon: Database,
    title: '1. Information We Collect',
    body: [
      'We collect information you provide directly, such as your name, email address, shipping address, and payment details when you create an account or place an order.',
      'We also automatically collect certain data through cookies and similar technologies, including your IP address, browser type, device information, and browsing behaviour on our site.',
    ],
  },
  {
    icon: UserCheck,
    title: '2. How We Use Your Information',
    body: [
      'To process and fulfil your orders, including shipping, payment processing, and customer support.',
      'To personalise your shopping experience and recommend products relevant to your interests.',
      'To send order confirmations, shipping updates, and — with your consent — marketing communications about new collections and offers.',
      'To improve our website, prevent fraud, and comply with legal obligations.',
    ],
  },
  {
    icon: Share2,
    title: '3. How We Share Your Information',
    body: [
      'We share information with trusted third parties who help us operate our business, including payment processors (Stripe, PayPal), shipping carriers, and email service providers, solely to the extent necessary to perform their services.',
      'We do not sell your personal information to third parties.',
    ],
  },
  {
    icon: Cookie,
    title: '4. Cookies',
    body: [
      'We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how you use our site. See our full Cookie Policy for details and how to manage your preferences.',
    ],
  },
  {
    icon: Lock,
    title: '5. Data Security',
    body: [
      'We implement industry-standard technical and organisational measures, including encryption in transit and at rest, to protect your personal information from unauthorised access, alteration, or disclosure.',
    ],
  },
  {
    icon: Shield,
    title: '6. Your Rights',
    body: [
      'Depending on your location, you may have the right to access, correct, delete, or export your personal data, and to object to or restrict certain processing.',
      'To exercise any of these rights, please contact us at privacy@maisonluxe.com and we will respond within 30 days.',
    ],
  },
  {
    icon: RefreshCw,
    title: '7. Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. Material changes will be communicated via email or a notice on our site prior to taking effect.',
    ],
  },
]

export default function PrivacyPolicy() {
  return (
    <div className="page-container py-16 md:py-20">
      <div className="max-w-3xl mx-auto text-center mb-6">
        <p className="section-subtitle mb-3">Legal</p>
        <h1 className="section-title mb-4">Privacy Policy</h1>
        <p className="text-xs text-obsidian-400 font-sans">Last updated: 1 July 2026</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <p className="font-sans text-sm md:text-base text-obsidian-600 leading-relaxed mb-14 text-center">
          At Maison Luxe, we respect your privacy and are committed to protecting your personal data. This policy explains what information we collect, how we use it, and the choices you have.
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
            Questions about this policy? Reach our privacy team at <a href="mailto:privacy@maisonluxe.com" className="text-gold-600 hover:underline">privacy@maisonluxe.com</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
