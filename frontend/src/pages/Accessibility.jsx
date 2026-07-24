import { Accessibility as AccessibilityIcon, Eye, Keyboard, Ear, MessageSquare, Mail } from 'lucide-react'

const commitments = [
  { icon: Eye, title: 'Visual Accessibility', desc: 'We maintain strong colour contrast, resizable text, and descriptive alt text for images so our site remains legible for low-vision users and screen reader software.' },
  { icon: Keyboard, title: 'Keyboard Navigation', desc: 'Every interactive element — menus, forms, and the checkout flow — can be reached and operated using a keyboard alone, with visible focus states throughout.' },
  { icon: Ear, title: 'Assistive Technology', desc: 'We build with semantic HTML and ARIA labelling so screen readers and other assistive technologies can accurately interpret our content and controls.' },
  { icon: MessageSquare, title: 'Clear Communication', desc: 'We write in plain language and provide clear error messages and instructions across forms, checkout, and account management.' },
]

export default function Accessibility() {
  return (
    <div className="page-container py-16 md:py-20">
      <div className="max-w-3xl mx-auto text-center mb-14">
        <div className="w-14 h-14 rounded-full bg-obsidian-50 flex items-center justify-center mx-auto mb-6">
          <AccessibilityIcon size={24} className="text-gold-500" />
        </div>
        <p className="section-subtitle mb-3">Our Commitment</p>
        <h1 className="section-title mb-5">Accessibility Statement</h1>
        <p className="font-sans text-sm md:text-base text-obsidian-600 leading-relaxed">
          Maison Luxe is committed to ensuring digital accessibility for all our clients, including those with disabilities. We continually work to improve the user experience for everyone and apply relevant accessibility standards.
        </p>
      </div>

      <section className="max-w-4xl mx-auto mb-16">
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-10">
          {commitments.map((c) => (
            <div key={c.title} className="flex gap-5">
              <div className="w-11 h-11 flex items-center justify-center border border-gold-500 text-gold-500 flex-shrink-0">
                <c.icon size={18} />
              </div>
              <div>
                <h3 className="font-display text-lg text-obsidian mb-1.5">{c.title}</h3>
                <p className="text-sm text-obsidian-600 font-sans leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto space-y-6 border-t border-obsidian-100 pt-12">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-light text-obsidian mb-2">Conformance Standard</h2>
          <p className="text-sm text-obsidian-600 font-sans leading-relaxed">
            We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA. These guidelines explain how to make web content more accessible for people with a wide range of disabilities.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl md:text-2xl font-light text-obsidian mb-2">Ongoing Efforts</h2>
          <p className="text-sm text-obsidian-600 font-sans leading-relaxed">
            Accessibility is an ongoing effort. We regularly review our site with automated tools and manual testing, and we welcome feedback that helps us identify areas for improvement.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto mt-14 pt-8 border-t border-obsidian-100 flex items-start gap-3">
        <Mail size={16} className="text-gold-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-obsidian-600 font-sans">
          If you encounter any barriers while using our site, please let us know at <a href="mailto:accessibility@maisonluxe.com" className="text-gold-600 hover:underline">accessibility@maisonluxe.com</a> — we aim to respond within 2 business days.
        </p>
      </div>
    </div>
  )
}
