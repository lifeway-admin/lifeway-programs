import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import i18n from '../lib/i18n/hipaa'

const EFFECTIVE_DATE = 'May 27, 2026'
const ORG = 'LifeWay Center (Lifeway Programs, Inc.)'
const ADDRESS = '15300 SW 288th Street, Homestead, FL 33033'
const PHONE = '(888) 331-3060'
const FAX = '305-328-8345'

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-lw-navy mb-4 pb-2 border-b border-gray-100">{title}</h2>
      <div className="space-y-3 text-gray-600 leading-relaxed text-sm">{children}</div>
    </div>
  )
}

export default function Hipaa() {
  const { lang } = useLanguage()
  const t = i18n[lang]
  const s = t.sections

  return (
    <div>
      {/* Header */}
      <section className="bg-lw-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <FileText size={36} className="text-lw-pink mx-auto mb-4" />
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">{t.legalHipaa}</span>
          <h1 className="text-4xl font-bold mt-2 mb-3">{t.title}</h1>
          <p className="text-gray-300 max-w-xl mx-auto text-sm mt-3 leading-relaxed">
            {t.subtitle} <strong>{t.subtitleBold}</strong>
          </p>
          <p className="text-gray-400 text-xs mt-4">{t.effectiveDate} {EFFECTIVE_DATE}</p>
        </div>
      </section>

      <section className="section">
        <div className="max-w-3xl mx-auto">

          {/* Required HIPAA callout */}
          <div className="bg-lw-pink-light border border-pink-100 rounded-2xl p-6 mb-10 text-sm text-gray-600 leading-relaxed">
            <p className="font-semibold text-lw-navy mb-1">{t.commitmentTitle}</p>
            <p>
              {t.commitmentBody(ORG)}
            </p>
          </div>

          <Section title={s.s1.title}>
            <p>{s.s1.body}</p>
          </Section>

          <Section title={s.s2.title}>
            <p>{s.s2.intro}</p>
            {s.s2.subsections.map(sub => (
              <div key={sub.label}>
                <p className="font-semibold text-lw-navy mt-4">{sub.label}</p>
                <p>{sub.body}</p>
              </div>
            ))}
          </Section>

          <Section title={s.s3.title}>
            <p>{s.s3.intro}</p>
            <ul className="list-disc pl-5 space-y-1.5">
              {s.s3.items.map(item => <li key={item}>{item}</li>)}
            </ul>
            <p className="mt-3">{s.s3.footer}</p>
          </Section>

          <Section title={s.s4.title}>
            <p>{s.s4.intro}</p>
            <ul className="list-disc pl-5 space-y-1.5">
              {s.s4.items.map(item => <li key={item}>{item}</li>)}
            </ul>
          </Section>

          <Section title={s.s5.title}>
            <p>{s.s5.intro}</p>
            {s.s5.subsections.map(sub => (
              <div key={sub.label}>
                <p className="font-semibold text-lw-navy mt-4">{sub.label}</p>
                <p>{sub.body}</p>
              </div>
            ))}
          </Section>

          <Section title={s.s6.title}>
            <p>{s.s6.intro}</p>
            <ul className="list-disc pl-5 space-y-1.5">
              {s.s6.items.map(item => <li key={item}>{item}</li>)}
            </ul>
            <p className="mt-3">{s.s6.footer}</p>
          </Section>

          <Section title={s.s7.title}>
            <p>{s.s7.intro}</p>
            <div className="bg-white border border-gray-100 rounded-xl p-5 mt-3 space-y-1">
              <p className="font-semibold text-lw-navy">{s.s7.withUs}</p>
              <p>{ADDRESS}</p>
              <p>{s.s7.phoneLabel} <a href="tel:8883313060" className="text-lw-pink hover:underline">{PHONE}</a></p>
              <p>{s.s7.faxLabel} {FAX}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5 mt-3 space-y-1">
              <p className="font-semibold text-lw-navy">{s.s7.withHhs}</p>
              <p>U.S. Department of Health and Human Services</p>
              <p>200 Independence Avenue, S.W., Washington, D.C. 20201</p>
              <p><a href="https://www.hhs.gov/ocr/privacy/hipaa/complaints/" target="_blank" rel="noreferrer" className="text-lw-pink hover:underline">hhs.gov/ocr/privacy/hipaa/complaints</a></p>
              <p>{s.s7.tollFree}</p>
            </div>
          </Section>

          <Section title={s.s8.title}>
            <p>
              {s.s8.intro}
            </p>
            <div className="bg-white border border-gray-100 rounded-xl p-5 mt-3">
              <p className="font-semibold text-lw-navy">{ORG}, {s.s8.privacyOfficer}</p>
              <p>{ADDRESS}</p>
              <p>{s.s8.phoneLabel} <a href="tel:8883313060" className="text-lw-pink hover:underline">{PHONE}</a></p>
              <p className="mt-2">
                <Link to="/contact" className="text-lw-pink font-semibold hover:underline">{s.s8.sendMessage}</Link>
              </p>
            </div>
          </Section>

          <div className="border-t border-gray-100 pt-8 text-xs text-gray-400 space-y-2">
            <p>{t.effectiveDate} {EFFECTIVE_DATE}</p>
            <p>
              {t.disclaimer}
            </p>
            <p>
              <Link to="/privacy" className="text-lw-pink hover:underline">{t.viewPrivacyPolicy}</Link>
            </p>
          </div>

        </div>
      </section>
    </div>
  )
}
