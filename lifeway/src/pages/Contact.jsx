import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import i18n from '../lib/i18n/contact'

const ITEM_ICONS = [Phone, Clock, MapPin, MapPin, Mail, Mail]
const ITEM_LINKS = ['tel:8883313060', null, null, null, 'mailto:support@lifewayprograms.org', null]

export default function Contact() {
  const { lang } = useLanguage()
  const t = i18n[lang]
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
      setError(t.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-lw-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">{t.eyebrow}</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-5">{t.title}</h1>
          <p className="text-gray-300 max-w-xl mx-auto text-lg leading-relaxed">
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* Quick contact bar */}
      <section className="bg-lw-pink-dark text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap justify-center gap-8 text-sm">
          <a href="tel:8883313060" className="flex items-center gap-2 hover:text-pink-200 transition-colors font-semibold">
            <Phone size={15} /> (888) 331-3060
          </a>
          <span className="flex items-center gap-2">
            <Clock size={15} /> {t.hours}
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={15} /> {t.locationsLine}
          </span>
        </div>
      </section>

      <section className="section">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Contact info */}
          <div>
            <h2 className="text-2xl font-bold text-lw-navy mb-8">{t.howToReach}</h2>
            <div className="space-y-6 mb-8">
              {t.items.map((item, idx) => {
                const Icon = ITEM_ICONS[idx]
                const link = ITEM_LINKS[idx]
                return (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-lw-pink-light flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-lw-pink" />
                    </div>
                    <div>
                      <p className="font-semibold text-lw-navy text-sm mb-1">{item.title}</p>
                      {item.lines.map((l, i) => (
                        link && i === 0
                          ? <a key={l} href={link} className="block text-sm text-lw-pink font-semibold hover:underline">{l}</a>
                          : <p key={l} className="text-gray-500 text-sm">{l}</p>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Social */}
            <div className="bg-lw-pink-light rounded-xl p-5">
              <p className="font-semibold text-lw-navy text-sm mb-3">{t.followUs}</p>
              <a href="https://instagram.com/lifewaycenter_org" target="_blank" rel="noreferrer"
                className="text-lw-pink text-sm font-medium hover:underline">
                {t.onInstagram}
              </a>
            </div>
          </div>

          {/* Form */}
          <div>
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <CheckCircle size={48} className="text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-lw-navy mb-2">{t.messageReceived}</h3>
                <p className="text-gray-500">{t.thankYou} <a href="tel:8883313060" className="text-lw-pink font-semibold">(888) 331-3060</a>.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <h2 className="text-2xl font-bold text-lw-navy mb-6">{t.sendMessage}</h2>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1.5">{t.fullName}</label>
                    <input id="contact-name" required value={form.name} onChange={set('name')}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lw-pink focus:ring-1 focus:ring-lw-pink" />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1.5">{t.email}</label>
                    <input id="contact-email" required type="email" value={form.email} onChange={set('email')}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lw-pink focus:ring-1 focus:ring-lw-pink" />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1.5">{t.phone}</label>
                  <input id="contact-phone" value={form.phone} onChange={set('phone')}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lw-pink focus:ring-1 focus:ring-lw-pink" />
                </div>
                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-1.5">{t.helpTopic}</label>
                  <select id="contact-subject" required value={form.subject} onChange={set('subject')}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lw-pink">
                    <option value="">{t.selectTopic}</option>
                    {t.topics.map(topic => <option key={topic}>{topic}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1.5">{t.message}</label>
                  <textarea id="contact-message" required rows={5} value={form.message} onChange={set('message')}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lw-pink resize-none" />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-60">
                  <Send size={16} /> {loading ? t.sending : t.send}
                </button>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 leading-relaxed">
                  <strong>{t.privacyLabel}</strong> {t.privacyBody} <a href="tel:8883313060" className="font-semibold hover:underline">(888) 331-3060</a> {t.privacyBody2}
                </div>
                <p className="text-xs text-gray-400 text-center">
                  {t.respondTime}
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
