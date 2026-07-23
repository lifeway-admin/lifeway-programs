import { useState } from 'react'
import { ChevronDown, Phone, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import i18n from '../lib/i18n/faq'

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-5 flex items-start justify-between gap-4 group"
      >
        <span className={`font-semibold text-sm leading-relaxed transition-colors ${open ? 'text-lw-pink' : 'text-lw-navy group-hover:text-lw-pink'}`}>
          {q}
        </span>
        <ChevronDown
          size={18}
          className={`text-lw-pink flex-shrink-0 mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="text-gray-500 text-sm leading-relaxed pb-5 pr-8">
          {a}
        </p>
      )}
    </div>
  )
}

export default function Faq() {
  const { lang } = useLanguage()
  const t = i18n[lang]

  const insuranceAnswer = (
    <>
      {t.insuranceAnswerBefore}{' '}
      <Link to="/insurances" className="text-lw-pink font-semibold hover:underline">{t.insuranceAnswerLink}</Link>{' '}
      {t.insuranceAnswerAfter}
    </>
  )

  const groups = t.groups.map(g => ({
    ...g,
    items: g.items.map(item => item.a === null ? { ...item, a: insuranceAnswer } : item),
  }))

  return (
    <div>
      {/* Header */}
      <section className="bg-lw-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">{t.eyebrow}</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">{t.title}</h1>
          <p className="text-gray-300 max-w-xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
          <a href="tel:8883313060" className="inline-flex items-center gap-2 mt-6 text-lw-pink font-semibold hover:text-pink-300 transition-colors">
            <Phone size={16} /> (888) 331-3060
          </a>
        </div>
      </section>

      <section className="section">
        <div className="max-w-3xl mx-auto">
          {groups.map(group => (
            <div key={group.category} className="mb-12">
              <h2 className="text-sm font-bold text-lw-pink uppercase tracking-wider mb-4">{group.category}</h2>
              <div className="bg-white rounded-3xl shadow-sm px-6 divide-y divide-gray-50">
                {group.items.map(item => (
                  <FaqItem key={item.q} {...item} />
                ))}
              </div>
            </div>
          ))}

          {/* Still have questions */}
          <div className="bg-lw-navy rounded-3xl p-10 text-white text-center mt-4">
            <h2 className="text-2xl font-bold mb-3">{t.stillHaveQuestionsTitle}</h2>
            <p className="text-gray-300 mb-7 max-w-sm mx-auto">
              {t.stillHaveQuestionsBody}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
                {t.sendMessage} <ArrowRight size={16} />
              </Link>
              <a href="tel:8883313060" className="border-2 border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:border-white transition-colors inline-flex items-center gap-2">
                <Phone size={16} /> {t.callUs}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
