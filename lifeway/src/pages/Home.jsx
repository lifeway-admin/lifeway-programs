import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Phone, MapPin, Clock, ArrowRight, CheckCircle, Star, Heart, Calendar, Brain, Activity, Users, Briefcase, Sparkles } from 'lucide-react'
import { TestimonialsColumn } from '../components/ui/testimonials-columns-1'
import { fadeUp } from '../lib/animations'
import { useLanguage } from '../context/LanguageContext'
import i18n from '../lib/i18n/home'

const SERVICE_ICONS = [Brain, Activity, Users, Briefcase, Sparkles]
const ACCESS_ICONS = [Calendar, Clock, Phone, Heart]

// Real Google reviews, kept in the reviewer's original words regardless of site language.
const testimonials = [
  { name: 'Leonardo F.', text: 'From the very first moment we walked in, Kylani made an incredible impression. Outstanding care and service for my whole family.', stars: 5 },
  { name: 'Sandra D.', text: 'Never seen anything like it, my mom got a referral the same day. All staff were nice, respectful, and professional.', stars: 5 },
  { name: 'Santiago S.', text: 'I have finally found the right place to keep up with my health. Very happy with all the staff members. Thank you!', stars: 5 },
  { name: 'Loraine L.', text: 'Cannot speak more highly of this place. Thank you for helping me, tremendously.', stars: 5 },
]

const testimonialColumns = [testimonials.slice(0, 2), testimonials.slice(2, 4)]

export default function Home() {
  const { lang } = useLanguage()
  const t = i18n[lang]
  const services = t.services.map((s, i) => ({ ...s, icon: SERVICE_ICONS[i] }))

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-lw-navy via-[#1e1645] to-[#2d1f4e] text-white overflow-hidden">
        {/* Aurora background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-lw-pink/20 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-[#2d1f4e]/70 blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-lw-pink/10 blur-3xl"
            animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <div className="absolute inset-0 bg-noise pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-lw-pink/20 text-lw-pink text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                <Heart size={12} /> {t.heroBadge}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                {t.heroTitle1}<br />
                <span className="text-lw-pink">{t.heroTitle2}</span>
              </h1>
              <p className="text-pink-200 italic text-base mb-6 leading-relaxed max-w-md">
                {t.heroQuote}
              </p>
              <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg">
                {t.heroBody}
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Link to="/book" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2">
                  <Calendar size={16} /> {t.takeFirstStep}
                </Link>
                <Link to="/services" className="border-2 border-white/30 text-white px-8 py-3.5 rounded-xl font-semibold hover:border-white transition-colors text-base flex items-center gap-2">
                  {t.ourServices} <ArrowRight size={16} />
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-2"><Clock size={14} className="text-lw-pink" /> {t.hours}</span>
                <span className="flex items-center gap-2"><Phone size={14} className="text-lw-pink" /> (888) 331-3060</span>
              </div>
            </div>

            {/* Appointment cards */}
            <div className="hidden md:block">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">{t.appointmentsAvailable}</p>
              <div className="space-y-3">
                {t.appointments.map(a => (
                  <Link
                    key={a}
                    to="/book"
                    className="flex items-center justify-between bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-4 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-lw-pink" />
                      <span className="text-sm font-medium">{t.receive} {a}</span>
                    </div>
                    <span className="text-xs text-lw-pink font-semibold bg-lw-pink/20 px-2.5 py-1 rounded-full group-hover:bg-lw-pink/30 transition-colors">
                      {t.noWaitlist}
                    </span>
                  </Link>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">{t.sameDayAvailable}</p>
            </div>
          </div>
        </div>

        {/* Warm wave transition */}
        <svg viewBox="0 0 1440 48" className="block w-full" preserveAspectRatio="none" style={{ marginBottom: '-1px' }}>
          <path fill="#fdf2f8" d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z" />
        </svg>
      </section>

      {/* Mission bar */}
      <section className="bg-lw-pink-light text-lw-navy">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p className="font-semibold text-center md:text-left italic">
            {t.missionQuote}
          </p>
          <div className="flex flex-wrap gap-6 text-lw-navy/70">
            <span className="flex items-center gap-2"><MapPin size={14} className="text-lw-pink" /> Homestead, FL</span>
            <span className="flex items-center gap-2"><MapPin size={14} className="text-lw-pink" /> Riverview, FL</span>
            <span className="flex items-center gap-2"><span className="font-bold">📱</span> {t.statewideTelehealth}</span>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="text-center mb-14">
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">{t.servicesEyebrow}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-lw-navy mt-2 mb-4">{t.servicesTitle}<br className="hidden md:block" /> {t.servicesTitleLine2}</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {t.servicesSub}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <motion.div
              key={s.key}
              className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group border border-gray-50"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              transition={{ ...fadeUp.show.transition, delay: (i % 3) * 0.1 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-lw-pink-light flex items-center justify-center mb-5">
                <s.icon size={26} className="text-lw-pink" />
              </div>
              <h3 className="text-lg font-bold text-lw-navy mb-3">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{s.desc}</p>
              <Link to="/services" className="text-lw-pink text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                {t.learnMore} <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why LifeWay */}
      <section className="bg-lw-warm">
        <div className="section">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
            >
              <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">{t.whyEyebrow}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-lw-navy mt-2 mb-6">{t.whyTitle1}<br />{t.whyTitle2}</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                {t.whyBody}
              </p>
              <ul className="space-y-3">
                {t.whyList.map(([title, desc]) => (
                  <li key={title} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-lw-pink flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-lw-navy text-sm">{title}</span>
                      <span className="text-gray-500 text-sm">, {desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <Link to="/about" className="btn-primary mt-8 inline-flex items-center gap-2">
                {t.ourStory} <ArrowRight size={16} />
              </Link>
            </motion.div>

            {/* Access features */}
            <div className="grid grid-cols-1 gap-4">
              {t.accessFeatures.map((f, i) => {
                const Icon = ACCESS_ICONS[i]
                return (
                  <motion.div
                    key={f.title}
                    className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-50 flex items-start gap-4"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeUp}
                    transition={{ ...fadeUp.show.transition, delay: i * 0.1 }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-lw-pink-light flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={18} className="text-lw-pink" />
                    </div>
                    <div>
                      <p className="font-semibold text-lw-navy text-sm mb-0.5">{f.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-lw-pink-light">
        <div className="section">
          {/* Header with aggregate rating */}
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 shadow-sm mb-6">
              <span className="font-bold text-lg" style={{ background: 'linear-gradient(135deg, #4285F4 25%, #EA4335 25%, #EA4335 50%, #FBBC05 50%, #FBBC05 75%, #34A853 75%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>G</span>
              <span className="text-gray-700 text-sm font-semibold">{t.googleReviews}</span>
              <span className="text-gray-300">·</span>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <span className="text-gray-700 text-sm font-bold">5.0</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-lw-navy mb-3">{t.testimonialsTitle}</h2>
            <p className="text-gray-500 max-w-md mx-auto">{t.testimonialsSub}</p>
          </motion.div>

          {/* Cards, vertical auto-scrolling columns */}
          <div className="flex justify-center gap-6 mb-10 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] max-h-[600px] overflow-hidden">
            <TestimonialsColumn testimonials={testimonialColumns[0]} duration={18} />
            <TestimonialsColumn testimonials={testimonialColumns[1]} duration={22} className="hidden sm:block" />
          </div>

          <div className="text-center">
            <a
              href="https://www.google.com/search?q=LifeWay+Center+reviews"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-lw-pink hover:text-lw-pink-dark transition-colors"
            >
              {t.readAllReviews} <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="relative bg-lw-navy text-white overflow-hidden">
        <div className="absolute inset-0 bg-noise pointer-events-none" />
        <div className="section relative z-10">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">{t.findUs}</span>
            <h2 className="text-3xl font-bold mt-2">{t.locationsTitle}</h2>
            <p className="text-gray-400 mt-3 text-sm">{t.locationsSub}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { title: 'Homestead, FL', body: <>15300 SW 288th Street<br />Homestead, FL 33033</> },
              { title: 'Riverview, FL', body: <>10621 Tucker Jones Rd<br />Riverview, FL 33578</> },
            ].map((loc, i) => (
              <motion.div
                key={loc.title}
                className="rounded-3xl p-8 bg-white/10 hover:bg-white/15 transition-colors"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                transition={{ ...fadeUp.show.transition, delay: i * 0.1 }}
              >
                <MapPin size={28} className="text-lw-pink mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">{loc.title}</h3>
                <p className="text-gray-300 text-sm">{loc.body}</p>
              </motion.div>
            ))}
            <motion.div
              className="bg-lw-pink/20 border border-lw-pink/30 rounded-3xl p-8"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              transition={{ ...fadeUp.show.transition, delay: 0.2 }}
            >
              <Phone size={28} className="text-lw-pink mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">{t.callOrText}</h3>
              <a href="tel:8883313060" className="text-lw-pink font-bold text-xl">(888) 331-3060</a>
              <p className="text-gray-400 text-sm mt-2">{t.hours}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-lw-pink-dark">
        <motion.div
          className="max-w-4xl mx-auto px-6 py-20 text-center text-white"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.ctaTitle}</h2>
          <p className="text-pink-100 mb-8 text-lg max-w-xl mx-auto leading-relaxed">
            {t.ctaBody}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/book" className="bg-white text-lw-pink font-bold px-8 py-3.5 rounded-xl hover:bg-pink-50 transition-colors flex items-center gap-2">
              <Calendar size={16} /> {t.takeFirstStep}
            </Link>
            <Link to="/contact" className="border-2 border-white text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors">
              {t.talkToUsFirst}
            </Link>
          </div>
          <p className="text-pink-200 text-sm mt-6">{t.ctaFooter}</p>
        </motion.div>
      </section>
    </div>
  )
}
