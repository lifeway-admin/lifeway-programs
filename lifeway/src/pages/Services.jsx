import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Brain, Activity, Shield, Heart, Users, Sparkles } from 'lucide-react'
import { fadeUp } from '../lib/animations'
import { useLanguage } from '../context/LanguageContext'
import i18n from '../lib/i18n/services'

const SERVICE_ICONS = [Brain, Activity, Shield, Heart, Users, Sparkles]

export default function Services() {
  const { lang } = useLanguage()
  const t = i18n[lang]
  const services = t.services.map((s, i) => ({ ...s, icon: SERVICE_ICONS[i] }))

  return (
    <div>
      {/* Header */}
      <section className="relative bg-lw-navy text-white overflow-hidden">
        <div className="absolute inset-0 bg-noise pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">{t.eyebrow}</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-5">{t.title}</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            {t.subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {t.tags.map(tag => (
              <span key={tag} className="bg-white/10 text-sm px-4 py-2 rounded-full text-gray-200">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="section">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((s, i) => (
            <motion.div
              key={s.key}
              className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              transition={{ ...fadeUp.show.transition, delay: (i % 3) * 0.1 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-lw-pink-light flex items-center justify-center mb-5 flex-shrink-0">
                <s.icon size={26} className="text-lw-pink" />
              </div>
              <h3 className="text-xl font-bold text-lw-navy mb-3">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{s.desc}</p>
              <ul className="space-y-2 mt-auto">
                {s.items.map(item => (
                  <li key={item} className="text-sm text-gray-600 flex items-start gap-2.5">
                    <CheckCircle size={14} className="text-lw-pink mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Psychosocial rehab callout */}
        <motion.div
          className="relative bg-lw-navy rounded-3xl p-10 text-white mb-16 overflow-hidden"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <div className="absolute inset-0 bg-noise pointer-events-none" />
          <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">{t.rehabEyebrow}</span>
              <h2 className="text-2xl font-bold mt-2 mb-4">{t.rehabTitle}</h2>
              <p className="text-gray-300 leading-relaxed">
                {t.rehabBody}
              </p>
            </div>
            <ul className="space-y-3">
              {t.rehabItems.map(item => (
                <li key={item} className="flex items-center gap-3 text-gray-200 text-sm">
                  <div className="w-2 h-2 rounded-full bg-lw-pink flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Insurance */}
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">{t.insuranceEyebrow}</span>
          <h2 className="text-3xl font-bold text-lw-navy mt-2 mb-4">{t.insuranceTitle}</h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-8">
            {t.insuranceBody1}{' '}
            <Link to="/contact" className="text-lw-pink font-semibold hover:underline">{t.contactUs}</Link> {t.insuranceBody2}
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto mb-10">
            {t.insuranceList.map(ins => (
              <div key={ins} className="bg-lw-pink-light border border-pink-100 rounded-lg px-5 py-2.5 text-sm font-medium text-lw-navy">
                {ins}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/book" className="btn-primary inline-flex items-center gap-2">
              {t.bookAppointment} <ArrowRight size={16} />
            </Link>
            <Link to="/insurances" className="btn-outline inline-flex items-center gap-2">
              {t.seeFullList} <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
