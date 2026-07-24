import { Cookie, Settings2, ToggleLeft, Share2, Mail } from 'lucide-react'

const cookieTypes = [
  { name: 'Essential', required: true, desc: 'Necessary for the site to function — keeping you signed in, remembering your bag, and enabling secure checkout. These cannot be switched off.' },
  { name: 'Performance', required: false, desc: 'Help us understand how visitors interact with our site by collecting anonymous analytics, so we can improve navigation and page speed.' },
  { name: 'Functional', required: false, desc: 'Remember your preferences, such as region and currency, to give you a more personalised experience on return visits.' },
  { name: 'Targeting', required: false, desc: 'Used to deliver relevant advertising across other sites and measure the effectiveness of our marketing campaigns.' },
]

export default function CookiePolicy() {
  return (
    <div className="page-container py-16 md:py-20">
      <div className="max-w-3xl mx-auto text-center mb-6">
        <p className="section-subtitle mb-3">Legal</p>
        <h1 className="section-title mb-4">Cookie Policy</h1>
        <p className="text-xs text-obsidian-400 font-sans">Last updated: 1 July 2026</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="flex items-start gap-3 mb-14">
          <Cookie size={18} className="text-gold-500 mt-0.5 flex-shrink-0" />
          <p className="font-sans text-sm md:text-base text-obsidian-600 leading-relaxed">
            Cookies are small text files stored on your device when you visit our website. They help us run our site securely, remember your preferences, and understand how you shop with us.
          </p>
        </div>

        {/* Cookie types */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <Settings2 size={18} className="text-gold-500" />
            <h2 className="font-display text-xl md:text-2xl font-light text-obsidian">Types of Cookies We Use</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {cookieTypes.map((c) => (
              <div key={c.name} className="border border-obsidian-100 p-5 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-lg text-obsidian">{c.name}</h3>
                  <span className={`text-[10px] tracking-widest uppercase font-sans px-2 py-1 ${c.required ? 'bg-obsidian text-white' : 'border border-gold-500 text-gold-600'}`}>
                    {c.required ? 'Always On' : 'Optional'}
                  </span>
                </div>
                <p className="text-sm text-obsidian-600 font-sans leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Managing cookies */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <ToggleLeft size={18} className="text-gold-500" />
            <h2 className="font-display text-xl md:text-2xl font-light text-obsidian">Managing Your Preferences</h2>
          </div>
          <p className="text-sm text-obsidian-600 font-sans leading-relaxed">
            You can accept or decline non-essential cookies at any time through the cookie banner shown on your first visit, or by adjusting your browser settings to block or delete cookies. Note that disabling essential cookies may affect site functionality, such as staying signed in or completing checkout.
          </p>
        </section>

        {/* Third party */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Share2 size={18} className="text-gold-500" />
            <h2 className="font-display text-xl md:text-2xl font-light text-obsidian">Third-Party Cookies</h2>
          </div>
          <p className="text-sm text-obsidian-600 font-sans leading-relaxed">
            Some cookies are placed by trusted third parties, such as payment providers and analytics services, to help us operate and improve our site. These providers have their own privacy and cookie policies governing their use of data.
          </p>
        </section>

        <div className="mt-16 pt-8 border-t border-obsidian-100 flex items-start gap-3">
          <Mail size={16} className="text-gold-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-obsidian-600 font-sans">
            Questions about our use of cookies? Email <a href="mailto:privacy@maisonluxe.com" className="text-gold-600 hover:underline">privacy@maisonluxe.com</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
