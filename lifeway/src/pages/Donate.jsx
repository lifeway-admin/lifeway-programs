import { useState } from 'react'
import { Heart, CheckCircle, ExternalLink } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import i18n from '../lib/i18n/donate'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const PRESETS = [10, 25, 50, 100, 250]

export default function Donate() {
  const { lang } = useLanguage()
  const t = i18n[lang]
  const [preset, setPreset] = useState(25)
  const [custom, setCustom] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [campaign, setCampaign] = useState('general')
  const [anonymous, setAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const amount = custom ? parseFloat(custom) : preset
  const amountCents = Math.round(amount * 100)
  const impact = t.impact.find(i => i.amount === preset)

  async function submit(e) {
    e.preventDefault()
    if (!amountCents || amountCents < 100) {
      setError(t.errorMin)
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/public/donate/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_cents: amountCents,
          donor_name: anonymous ? 'Anonymous' : name || 'Anonymous',
          donor_email: email || null,
          campaign,
        }),
      })
      const data = await res.json()
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        setError(t.errorGeneric)
      }
    } catch {
      setError(t.errorConnect)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-lw-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-lw-pink flex items-center justify-center mx-auto mb-5">
            <Heart size={26} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-5">{t.title}</h1>
          <p className="text-gray-300 max-w-xl mx-auto text-lg leading-relaxed">
            {t.subtitle}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Form */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-lw-navy mb-6">{t.chooseGift}</h2>
            <form onSubmit={submit} className="space-y-5">
              {/* Amount presets */}
              <div>
                <label htmlFor="donate-amount" className="block text-sm font-medium text-gray-700 mb-2">{t.donationAmount}</label>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {PRESETS.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => { setPreset(p); setCustom('') }}
                      className={`py-2.5 rounded-lg text-sm font-semibold border-2 transition-colors ${
                        preset === p && !custom
                          ? 'bg-lw-pink text-white border-lw-pink'
                          : 'border-gray-200 text-gray-700 hover:border-lw-pink'
                      }`}
                    >
                      ${p}
                    </button>
                  ))}
                </div>
                <input
                  id="donate-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder={t.customAmount}
                  value={custom}
                  onChange={e => { setCustom(e.target.value); setPreset(null) }}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lw-pink focus:ring-1 focus:ring-lw-pink"
                />
                {impact && !custom && (
                  <p className="text-xs text-lw-pink mt-2 font-medium">{impact.desc}</p>
                )}
              </div>

              {/* Campaign */}
              <div>
                <label htmlFor="donate-campaign" className="block text-sm font-medium text-gray-700 mb-1.5">{t.designateGift}</label>
                <select
                  id="donate-campaign"
                  value={campaign}
                  onChange={e => setCampaign(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lw-pink"
                >
                  {t.campaigns.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              {/* Donor info */}
              {!anonymous && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="donate-name" className="block text-sm font-medium text-gray-700 mb-1.5">{t.name}</label>
                    <input
                      id="donate-name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={t.yourName}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lw-pink"
                    />
                  </div>
                  <div>
                    <label htmlFor="donate-email" className="block text-sm font-medium text-gray-700 mb-1.5">{t.email}</label>
                    <input
                      id="donate-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t.forReceipt}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-lw-pink"
                    />
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} className="rounded" />
                {t.anonymous}
              </label>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
              >
                <Heart size={16} />
                {loading ? t.redirecting : `${t.donateSecurely} $${amount || '—'} ${t.securely}`}
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><ExternalLink size={11} /> {t.poweredByStripe}</span>
                <span>· {t.taxDeductible}</span>
                <span>· {t.secureCheckout}</span>
              </div>
            </form>
          </div>

          {/* Why donate */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-lw-navy mb-4">{t.yourImpact}</h2>
              <p className="text-gray-500 leading-relaxed">
                {t.impactBody}
              </p>
            </div>

            <div className="space-y-4">
              {t.impact.map(i => (
                <div key={i.amount} className="flex gap-4 items-start">
                  <div className="w-14 text-center flex-shrink-0">
                    <span className="text-lw-pink font-bold text-lg">${i.amount}</span>
                  </div>
                  <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                    <CheckCircle size={16} className="text-lw-pink flex-shrink-0" />
                    <p className="text-sm text-gray-600">{i.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-lw-navy rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-2">{t.taxDeductibleTitle}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {t.taxDeductibleBody}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
