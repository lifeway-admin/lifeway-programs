import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeUp } from '../lib/animations'
import { useLanguage } from '../context/LanguageContext'
import i18n from '../lib/i18n/founder'

export default function Founder() {
  const { lang } = useLanguage()
  const t = i18n[lang]

  return (
    <div>
      {/* Header */}
      <section className="relative bg-lw-navy text-white overflow-hidden">
        <div className="absolute inset-0 bg-noise pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">{t.eyebrow}</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-5">{t.title}</h1>
          <p className="text-gray-300 max-w-xl mx-auto text-lg leading-relaxed">
            {t.subtitle}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="max-w-3xl mx-auto">
          <motion.div className="text-center mb-10" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <img
              src="/images/team/mayelin-lima.jpg"
              alt="Mayelin Lima"
              className="w-36 h-36 rounded-full border-4 border-lw-pink object-cover shadow-lg mx-auto mb-5"
            />
            <p className="font-bold text-lw-navy text-lg">Mayelin Lima</p>
            <p className="text-gray-500 text-sm">{t.role}</p>
            <p className="italic text-gray-500 text-sm mt-1">{t.verse}</p>
          </motion.div>

          <motion.p className="text-gray-600 leading-relaxed mb-8" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <strong className="text-lw-navy">Mayelin Lima</strong> {t.intro}
          </motion.p>

          <motion.div className="bg-lw-pink-light rounded-2xl px-6 py-5 text-center mb-8" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <p className="font-semibold text-lw-navy">{t.missionQuote}</p>
            <p className="text-xs text-gray-500 mt-1">{t.missionCaption}</p>
          </motion.div>

          <motion.div className="mb-10" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <h3 className="text-xl font-bold text-lw-navy mb-5">{t.journeyTitle}</h3>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="border-t-2 border-lw-pink pt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-lw-pink mb-2">{t.education}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{t.educationBody}</p>
              </div>
              <div className="border-t-2 border-lw-pink pt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-lw-pink mb-2">{t.leadership}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{t.leadershipBody}</p>
              </div>
              <div className="border-t-2 border-lw-pink pt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-lw-pink mb-2">{t.faithCommunity}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{t.faithCommunityBody}</p>
              </div>
            </div>
          </motion.div>

          <motion.blockquote className="border-l-4 border-lw-pink pl-5 italic text-gray-500 mb-8" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            "{t.quote}", Mayelin Lima
          </motion.blockquote>

          <motion.p className="text-gray-600 leading-relaxed" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            {t.closing1} <strong className="text-lw-navy">Lifeway Center</strong> {t.closing2}{' '}
            <Link to="/contact" className="text-lw-pink font-semibold hover:underline">{t.getInTouch}</Link>.
          </motion.p>
        </div>
      </section>
    </div>
  )
}
