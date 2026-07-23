import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { fadeUp } from '../lib/animations'
import { useLanguage } from '../context/LanguageContext'
import i18n from '../lib/i18n/about'

export default function About() {
  const { lang } = useLanguage()
  const t = i18n[lang]

  return (
    <div>
      {/* Header */}
      <section className="relative bg-lw-navy text-white overflow-hidden">
        <div className="absolute inset-0 bg-noise pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">{t.whoWeAre}</span>
              <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6 leading-tight">
                {t.heroTitle1}<br />{t.heroTitle2}
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {t.heroBody}
              </p>
              <blockquote className="border-l-4 border-lw-pink pl-5 italic text-pink-200 text-base">
                "{t.heroVerse}"<br />
                <span className="text-sm text-gray-400 not-italic mt-1 block">Isaiah 40:31</span>
              </blockquote>
            </div>
            <div className="hidden md:flex flex-col gap-4">
              <blockquote className="bg-white/10 rounded-2xl p-6 border-l-4 border-lw-pink">
                <p className="text-pink-100 italic leading-relaxed">"{t.heroQuoteBox}"</p>
              </blockquote>
              <div className="grid grid-cols-3 gap-3 text-center">
                {t.stats.map(([v, l]) => (
                  <div key={l} className="bg-white/10 rounded-xl p-4">
                    <p className="text-lw-pink font-bold text-xl">{v}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-20"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">{t.ourMission}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-lw-navy mt-2 mb-6">
            {t.missionTitle}
          </h2>
          <p className="text-gray-500 leading-relaxed text-lg mb-6">
            {t.missionBody1}
          </p>
          <p className="text-gray-500 leading-relaxed">
            {t.missionBody2}
          </p>
        </motion.div>

        {/* Founder */}
        <motion.div
          className="bg-lw-pink-light rounded-3xl p-10 mb-20"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">{t.ourFounder}</span>
              <h2 className="text-3xl font-bold text-lw-navy mt-2 mb-4">{t.founderName}</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {t.founderBody1}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {t.founderBody2}
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-lw-pink-dark rounded-2xl p-6 text-white">
                <p className="text-4xl font-bold mb-1">20+</p>
                <p className="font-semibold text-sm mb-1">{t.yearsExperience}</p>
                <p className="text-pink-100 text-xs leading-relaxed">{t.yearsExperienceDesc}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {t.credStats.map(s => (
                  <div key={s.label} className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <p className="text-lw-pink font-bold text-sm mb-0.5">{s.value}</p>
                    <p className="text-lw-navy text-xs font-semibold">{s.label}</p>
                    <p className="text-gray-400 text-xs">{s.sub}</p>
                  </div>
                ))}
              </div>
              <blockquote className="border-l-4 border-lw-pink pl-4 italic text-gray-500 text-sm leading-relaxed">
                "{t.founderQuote}"
              </blockquote>
            </div>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">{t.whatGuidesUs}</span>
          <h2 className="text-3xl font-bold text-lw-navy mt-2">{t.coreValues}</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {t.values.map((v, i) => (
            <motion.div
              key={v.title}
              className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              transition={{ ...fadeUp.show.transition, delay: (i % 3) * 0.1 }}
            >
              <CheckCircle size={20} className="text-lw-pink mb-3" />
              <h3 className="font-bold text-lw-navy mb-2">{v.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Explore services CTA */}
        <motion.div
          className="text-center bg-white border border-gray-100 rounded-2xl p-8 shadow-sm"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <h3 className="text-xl font-bold text-lw-navy mb-2">{t.fullPictureTitle}</h3>
          <p className="text-gray-500 mb-5">{t.fullPictureBody}</p>
          <Link to="/services" className="btn-primary inline-flex items-center gap-2">
            {t.viewAllServices} <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="bg-lw-pink-dark">
        <motion.div
          className="max-w-4xl mx-auto px-6 py-16 text-center text-white"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <h2 className="text-3xl font-bold mb-4">{t.ctaTitle}</h2>
          <p className="text-pink-100 mb-8">{t.ctaBody}</p>
          <Link to="/book" className="bg-white text-lw-pink font-bold px-8 py-3.5 rounded-lg hover:bg-pink-50 transition-colors inline-flex items-center gap-2">
            {t.bookAppointment} <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
