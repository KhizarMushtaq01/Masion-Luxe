import { useState } from 'react'
import toast from 'react-hot-toast'
export default function Contact() {
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' })
  const handleSubmit = (e) => { e.preventDefault(); toast.success("Thank you! We'll be in touch within 24 hours."); setForm({ name:'', email:'', subject:'', message:'' }) }
  return (
    <div className="page-container py-20">
      <div className="grid lg:grid-cols-2 gap-20">
        <div>
          <p className="section-subtitle mb-3">Get in Touch</p>
          <h1 className="section-title mb-6">Contact Us</h1>
          <div className="space-y-6 font-sans text-sm text-obsidian-600 mb-10">
            <div><p className="text-xs tracking-widests uppercase text-obsidian font-medium mb-1">Client Services</p><p>Monday – Friday, 9am – 6pm GMT</p><p className="text-gold-600">hello@maisonluxe.com</p><p>+44 20 1234 5678</p></div>
            <div><p className="text-xs tracking-widests uppercase text-obsidian font-medium mb-1">Milan Flagship</p><p>Via Montenapoleone 8, 20121 Milano</p></div>
            <div><p className="text-xs tracking-widests uppercase text-obsidian font-medium mb-1">Paris Atelier</p><p>8 Rue du Faubourg Saint-Honoré, Paris</p></div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {[{l:'Name',k:'name',type:'text'},{l:'Email',k:'email',type:'email'},{l:'Subject',k:'subject',type:'text'}].map(f=>(
            <div key={f.k}>
              <label className="block text-xs tracking-widests uppercase font-sans text-obsidian-500 mb-1.5">{f.l}</label>
              <input type={f.type} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} required className="input-luxury-box w-full"/>
            </div>
          ))}
          <div>
            <label className="block text-xs tracking-widests uppercase font-sans text-obsidian-500 mb-1.5">Message</label>
            <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows={5} required className="input-luxury-box w-full resize-none"/>
          </div>
          <button type="submit" className="btn-primary w-full">Send Message</button>
        </form>
      </div>
    </div>
  )
}
