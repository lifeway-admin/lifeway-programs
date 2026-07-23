import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Phone, MapPin, Clock, ArrowRight, CheckCircle, Star, Heart, Calendar, Brain, Activity, Users, Briefcase, Sparkles, Shield } from 'lucide-react'
import { TestimonialsColumn } from '../components/ui/testimonials-columns-1'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const services = [
  { icon: Brain, title: 'Mental Health', desc: 'Individual, family & group therapy. Christian counseling, trauma care, grief support, and more, for children, teens, and adults.' },
  { icon: Activity, title: 'Medical & Wellness', desc: 'Primary care, preventive health, lab testing, nutrition coaching, and IV wellness therapy. Telehealth available.' },
  { icon: Users, title: 'Social Services', desc: 'Case management, housing, food support, utility assistance, referrals, and community resources.' },
  { icon: Briefcase, title: 'Employment Support', desc: 'Job placement, vocational counseling, life skills, and financial coaching to help you build stability.' },
  { icon: Sparkles, title: 'Spiritual Care', desc: 'Faith-based inner healing, spiritual assessment, pastoral support, and prayer, healing the whole person.' },
  { icon: Shield, title: 'Addiction Recovery', desc: 'Outpatient and intensive outpatient programs, dual diagnosis support, and 12-step program referrals.' },
]

const testimonials = [
  { name: 'Leonardo F.', text: 'From the very first moment we walked in, Kylani made an incredible impression. Outstanding care and service for my whole family.', stars: 5 },
  { name: 'Sandra D.', text: 'Never seen anything like it, my mom got a referral the same day. All staff were nice, respectful, and professional.', stars: 5 },
  { name: 'Santiago S.', text: 'I have finally found the right place to keep up with my health. Very happy with all the staff members. Thank you!', stars: 5 },
  { name: 'Loraine L.', text: 'Cannot speak more highly of this place. Thank you for helping me, tremendously.', stars: 5 },
]

const testimonialColumns = [testimonials.slice(0, 2), testimonials.slice(2, 4)]

const appointments = [
  'Health Support',
  'Mental Health Support',
  'Spiritual Support',
  'Resource Support',
  'IV Wellness Therapy',
]

export default function Home() {
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

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-lw-pink/20 text-lw-pink text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                <Heart size={12} /> Christian Holistic Care · Accessible to All
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
                Healing, Hope<br />
                <span className="text-lw-pink">& Dignity</span>
              </h1>
              <p className="text-pink-200 italic text-base mb-6 leading-relaxed max-w-md">
                "Because healing, hope, and dignity should be within everyone's reach."
              </p>
              <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg">
                You are seen. You are valued. You are not alone. We walk alongside you with compassionate, accessible care, no matter your story, your background, or where you are on your journey.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Link to="/book" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2">
                  <Calendar size={16} /> Take the First Step
                </Link>
                <Link to="/services" className="border-2 border-white/30 text-white px-8 py-3.5 rounded-xl font-semibold hover:border-white transition-colors text-base flex items-center gap-2">
                  Our Services <ArrowRight size={16} />
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-2"><Clock size={14} className="text-lw-pink" /> Mon–Sat · 9am–9pm</span>
                <span className="flex items-center gap-2"><Phone size={14} className="text-lw-pink" /> (888) 331-3060</span>
              </div>
            </div>

            {/* Appointment cards */}
            <div className="hidden md:block">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Appointments Available</p>
              <div className="space-y-3">
                {appointments.map(a => (
                  <Link
                    key={a}
                    to="/book"
                    className="flex items-center justify-between bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-4 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-lw-pink" />
                      <span className="text-sm font-medium">Receive {a}</span>
                    </div>
                    <span className="text-xs text-lw-pink font-semibold bg-lw-pink/20 px-2.5 py-1 rounded-full group-hover:bg-lw-pink/30 transition-colors">
                      No Waitlist
                    </span>
                  </Link>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">Same-day appointments available</p>
            </div>
          </div>
        </div>

        {/* Warm wave transition */}
        <svg viewBox="0 0 1440 48" className="block w-full" preserveAspectRatio="none" style={{ marginBottom: '-1px' }}>
          <path fill="#e91e8c" d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z" />
        </svg>
      </section>

      {/* Mission bar */}
      <section className="bg-lw-pink text-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p className="font-semibold text-center md:text-left italic">
            "Linking Individuals to Their Soaring Potential", Inspired by Isaiah 40:31
          </p>
          <div className="flex flex-wrap gap-6 text-pink-100">
            <span className="flex items-center gap-2"><MapPin size={14} /> Homestead, FL</span>
            <span className="flex items-center gap-2"><MapPin size={14} /> Riverview, FL</span>
            <span className="flex items-center gap-2"><span className="text-white font-bold">📱</span> Statewide Telehealth</span>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="text-center mb-14">
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">What We Offer</span>
          <h2 className="text-3xl md:text-4xl font-bold text-lw-navy mt-2 mb-4">Whatever You're Carrying,<br className="hidden md:block" /> We're Here</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            From grief and anxiety to housing challenges and addiction recovery, our team wraps around you and your family with real professional care and genuine love.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
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
                Learn more <ArrowRight size={14} />
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
              <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">Why LifeWay Center</span>
              <h2 className="text-3xl md:text-4xl font-bold text-lw-navy mt-2 mb-6">A Place Where You<br />Truly Belong</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                We're not just a clinic, we're a community. A Christ-centered family that sees you as a whole person, meets you without judgment, and walks with you every step of the way toward healing and wholeness.
              </p>
              <ul className="space-y-3">
                {[
                  ['Faith-Based Excellence', 'Clinical skill blended with biblical truth'],
                  ['Multicultural & Bilingual', 'Services available in English & Spanish'],
                  ['Holistic & Trauma-Informed', 'Healing the whole person, body, mind & spirit'],
                  ['Accessible to All', 'Medicaid, insurance, cash pay, sliding scale & scholarships'],
                  ['Easy to Access', 'Same-day appointments, telehealth & evening sessions'],
                ].map(([title, desc]) => (
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
                Our Story <ArrowRight size={16} />
              </Link>
            </motion.div>

            {/* Access features */}
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  icon: Calendar,
                  title: 'Same-Day Appointments',
                  desc: 'No long waitlists. We make space for you the moment you reach out, because healing shouldn\'t have to wait.',
                },
                {
                  icon: Clock,
                  title: 'Monday – Saturday, 9am – 9pm',
                  desc: 'Evening sessions available so care fits into your life, not the other way around.',
                },
                {
                  icon: Phone,
                  title: 'Statewide Telehealth',
                  desc: 'Serving all of Florida from wherever you are, secure video sessions on any device.',
                },
                {
                  icon: Heart,
                  title: 'Cost Is Never a Barrier',
                  desc: 'Medicaid, Medicare, private insurance, sliding scale fees, and scholarships, we find a way for everyone.',
                },
              ].map((f, i) => (
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
                    <f.icon size={18} className="text-lw-pink" />
                  </div>
                  <div>
                    <p className="font-semibold text-lw-navy text-sm mb-0.5">{f.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-lw-pink-light">
        <div className="section">
          {/* Header with aggregate rating */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-5 py-2.5 shadow-sm mb-6">
              <span className="font-bold text-lg" style={{ background: 'linear-gradient(135deg, #4285F4 25%, #EA4335 25%, #EA4335 50%, #FBBC05 50%, #FBBC05 75%, #34A853 75%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>G</span>
              <span className="text-gray-700 text-sm font-semibold">Google Reviews</span>
              <span className="text-gray-300">·</span>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <span className="text-gray-700 text-sm font-bold">5.0</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-lw-navy mb-3">Voices From Our Community</h2>
            <p className="text-gray-500 max-w-md mx-auto">Real experiences from the people we're honored to walk alongside</p>
          </div>

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
              Read all reviews on Google <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="bg-lw-navy text-white">
        <div className="section">
          <div className="text-center mb-12">
            <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">Find Us</span>
            <h2 className="text-3xl font-bold mt-2">Come As You Are, We're Close By</h2>
            <p className="text-gray-400 mt-3 text-sm">Two welcoming locations in South Florida, plus telehealth statewide</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 rounded-3xl p-8 hover:bg-white/15 transition-colors">
              <MapPin size={28} className="text-lw-pink mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Homestead, FL</h3>
              <p className="text-gray-300 text-sm">15300 SW 288th Street<br />Homestead, FL 33033</p>
            </div>
            <div className="bg-white/10 rounded-3xl p-8 hover:bg-white/15 transition-colors">
              <MapPin size={28} className="text-lw-pink mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Riverview, FL</h3>
              <p className="text-gray-300 text-sm">10621 Tucker Jones Rd<br />Riverview, FL 33578</p>
            </div>
            <div className="bg-lw-pink/20 border border-lw-pink/30 rounded-3xl p-8">
              <Phone size={28} className="text-lw-pink mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Call or Text Us</h3>
              <a href="tel:8883313060" className="text-lw-pink font-bold text-xl">(888) 331-3060</a>
              <p className="text-gray-400 text-sm mt-2">Mon–Sat · 9am–9pm</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-lw-pink">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">You Don't Have to Face This Alone</h2>
          <p className="text-pink-100 mb-8 text-lg max-w-xl mx-auto leading-relaxed">
            Taking that first step can feel hard. We promise to make everything after that easy, compassionate, confidential, and accessible.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/book" className="bg-white text-lw-pink font-bold px-8 py-3.5 rounded-xl hover:bg-pink-50 transition-colors flex items-center gap-2">
              <Calendar size={16} /> Take the First Step
            </Link>
            <Link to="/contact" className="border-2 border-white text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors">
              Talk to Us First
            </Link>
          </div>
          <p className="text-pink-200 text-sm mt-6">Same-day appointments available · No insurance required</p>
        </div>
      </section>
    </div>
  )
}
