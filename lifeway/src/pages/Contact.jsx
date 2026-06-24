import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API}/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to send')
      setSent(true)
    } catch {
      setError('Something went wrong. Please call us at (888) 331-3060.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-lw-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">We're Here for You</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-5">Contact Us</h1>
          <p className="text-gray-300 max-w-xl mx-auto text-lg leading-relaxed">
            Reaching out is the first step. We make everything after that easy.
          </p>
        </div>
      </section>

      {/* Quick contact bar */}
      <section className="bg-lw-pink text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap justify-center gap-8 text-sm">
          <a href="tel:8883313060" className="flex items-center gap-2 hover:text-pink-200 transition-colors font-semibold">
            <Phone size={15} /> (888) 331-3060
          </a>
          <span className="flex items-center gap-2">
            <Clock size={15} /> Mon–Sat · 9am–9pm
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={15} /> Homestead & Riverview, FL · Statewide Telehealth
          </span>
        </div>
      </section>

      <section className="section">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Contact info */}
          <div>
            <h2 className="text-2xl font-bold text-lw-navy mb-8">How to Reach Us</h2>
            <div className="space-y-6 mb-8">
              {[
                {
                  icon: Phone,
                  title: 'Call or Text',
                  lines: ['(888) 331-3060', '305-328-8345 (Fax)'],
                  link: 'tel:8883313060',
                },
                {
                  icon: Clock,
                  title: 'Hours',
                  lines: ['Monday – Saturday: 9am – 9pm', 'Evening sessions available'],
                },
                {
                  icon: MapPin,
                  title: 'Homestead Office',
                  lines: ['15300 SW 288th Street', 'Homestead, FL 33033'],
                },
                {
                  icon: MapPin,
                  title: 'Riverview / Tampa Office',
                  lines: ['10621 Tucker Jones Rd', 'Riverview, FL 33578'],
                },
                {
                  icon: Mail,
                  title: 'Telehealth',
                  lines: ['Statewide telehealth services available', 'Same-day appointments offered'],
                },
              ].map(item => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-lw-pink-light flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-lw-pink" />
                  </div>
                  <div>
                    <p className="font-semibold text-lw-navy text-sm mb-1">{item.title}</p>
                    {item.lines.map((l, i) => (
                      item.link && i === 0
                        ? <a key={l} href={item.link} className="block text-sm text-lw-pink font-semibold hover:underline">{l}</a>
                        : <p key={l} className="text-gray-500 text-sm">{l}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="bg-lw-pink-light rounded-xl p-5">
              <p className="font-semibold text-lw-navy text-sm mb-3">Follow Us</p>
              <a href="https://instagram.com/lifewaycenter_org" target="_blank" rel="noreferrer"
                className="text-lw-pink text-sm font-medium hover:underline">
                @lifewaycenter_org on Instagram
              </a>
            </div>
          </div>

          {/* Form */}
          <div>
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <CheckCircle size={48} className="text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-lw-navy mb-2">Message Received!</h3>
                <p className="text-gray-500">Thank you for reaching out. We'll get back to you within 1–2 business days. You can also call or text us at <a href="tel:8883313060" className="text-lw-pink font-semibold">(888) 331-3060</a>.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <h2 className="text-2xl font-bold text-lw-navy mb-6">Send a Message</h2>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                    <input required value={form.name} onChange={set('name')}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lw-pink focus:ring-1 focus:ring-lw-pink" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                    <input required type="email" value={form.email} onChange={set('email')}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lw-pink focus:ring-1 focus:ring-lw-pink" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input value={form.phone} onChange={set('phone')}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lw-pink focus:ring-1 focus:ring-lw-pink" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">What can we help with? *</label>
                  <select required value={form.subject} onChange={set('subject')}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lw-pink">
                    <option value="">Select a topic...</option>
                    <option>Mental Health Services</option>
                    <option>Medical / Wellness Services</option>
                    <option>Social Services / Case Management</option>
                    <option>Addiction Recovery</option>
                    <option>Spiritual Support</option>
                    <option>Appointment Request</option>
                    <option>Insurance / Payment Question</option>
                    <option>Volunteer / Employment</option>
                    <option>General Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                  <textarea required rows={5} value={form.message} onChange={set('message')}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lw-pink resize-none" />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-60">
                  <Send size={16} /> {loading ? 'Sending…' : 'Send Message'}
                </button>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 leading-relaxed">
                  <strong>Privacy notice:</strong> For your protection, please do not include sensitive health information in this form. Call us directly at <a href="tel:8883313060" className="font-semibold hover:underline">(888) 331-3060</a> for clinical or health-related inquiries.
                </div>
                <p className="text-xs text-gray-400 text-center">
                  We respond to messages within 1–2 business days.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
