import { Link } from 'react-router-dom'
import { Phone, MapPin, Clock, ArrowRight, CheckCircle, Star, Heart, Calendar } from 'lucide-react'

const services = [
  { img: '/images/icons/mental-health.png', title: 'Mental Health', desc: 'Individual, family & group therapy. Christian counseling, trauma care, grief support, and more — for children, teens, and adults.' },
  { img: '/images/icons/wellness.png', title: 'Medical & Wellness', desc: 'Primary care, preventive health, lab testing, nutrition coaching, and IV wellness therapy. Telehealth available.' },
  { img: '/images/icons/resource.png', title: 'Social Services', desc: 'Case management, housing, food support, utility assistance, referrals, and community resources.' },
  { img: '/images/icons/employment.png', title: 'Employment Support', desc: 'Job placement, vocational counseling, life skills, and financial coaching to help you build stability.' },
  { img: '/images/icons/referral.png', title: 'Spiritual Care', desc: 'Faith-based inner healing, spiritual assessment, pastoral support, and prayer — healing the whole person.' },
  { img: '/images/icons/wellness.png', title: 'Addiction Recovery', desc: 'Outpatient and intensive outpatient programs, dual diagnosis support, and 12-step program referrals.' },
]

const testimonials = [
  { name: 'Leonardo F.', text: 'From the very first moment we walked in, Kylani made an incredible impression. Outstanding care and service for my whole family.', stars: 5 },
  { name: 'Sandra D.', text: 'Never seen anything like it — my mom got a referral the same day. All staff were nice, respectful, and professional.', stars: 5 },
  { name: 'Santiago S.', text: 'I have finally found the right place to keep up with my health. Very happy with all the staff members. Thank you!', stars: 5 },
  { name: 'Loraine L.', text: 'Cannot speak more highly of this place. Thank you for helping me, tremendously.', stars: 5 },
]

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
      <section className="bg-gradient-to-br from-lw-navy via-[#1e1645] to-[#2d1f4e] text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-lw-pink/20 text-lw-pink text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                <Heart size={12} /> Christian Holistic Care
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Healing, Hope &<br />
                <span className="text-lw-pink">Dignity — Free</span><br />
                for All
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-4 max-w-lg">
                At LifeWay Center, we are a Christian faith-based 501(c)(3) nonprofit committed to offering free therapeutic, wellness, and social service support to individuals and families in need.
              </p>
              <p className="text-lw-pink font-semibold italic mb-8 text-sm">
                "…because healing, hope, and dignity should never come with a price tag."
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Link to="/book" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2">
                  <Calendar size={16} /> Book Free Appointment
                </Link>
                <Link to="/services" className="border-2 border-white/30 text-white px-8 py-3.5 rounded-lg font-semibold hover:border-white transition-colors text-base flex items-center gap-2">
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
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Free Appointments Available</p>
              <div className="space-y-3">
                {appointments.map(a => (
                  <Link
                    key={a}
                    to="/book"
                    className="flex items-center justify-between bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-5 py-4 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-lw-pink" />
                      <span className="text-sm font-medium">Receive {a}</span>
                    </div>
                    <span className="text-xs text-lw-pink font-semibold bg-lw-pink/20 px-2.5 py-1 rounded-full group-hover:bg-lw-pink/30 transition-colors">
                      Free Appointment
                    </span>
                  </Link>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">You're just a click away</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission bar */}
      <section className="bg-lw-pink text-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p className="font-semibold text-center md:text-left italic">
            "Linking Individuals to Their Soaring Potential" — Inspired by Isaiah 40:31
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
          <h2 className="text-3xl md:text-4xl font-bold text-lw-navy mt-2 mb-4">Holistic Care for the Whole Person</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            We combine professional clinical expertise with biblical wisdom and deep compassion — addressing body, mind, and spirit.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(s => (
            <div key={s.title} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-lw-pink-light flex items-center justify-center mb-5 overflow-hidden">
                <img src={s.img} alt={s.title} className="w-8 h-8 object-contain" onError={e => { e.target.style.display='none' }} />
              </div>
              <h3 className="text-lg font-bold text-lw-navy mb-3">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{s.desc}</p>
              <Link to="/services" className="text-lw-pink text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn more <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Why LifeWay */}
      <section className="bg-lw-pink-light">
        <div className="section">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">Why LifeWay Center</span>
              <h2 className="text-3xl md:text-4xl font-bold text-lw-navy mt-2 mb-6">Care That Meets You Where You Are</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                We are a Christ-centered movement of healing, hope, and holistic transformation — serving children, families, and individuals with high-quality clinical care that addresses the whole person.
              </p>
              <ul className="space-y-3">
                {[
                  ['Faith-Based Excellence', 'Clinical skill blended with biblical truth'],
                  ['Multicultural & Bilingual', 'Services available in English & Spanish'],
                  ['Holistic & Trauma-Informed', 'Healing the whole person — body, mind & spirit'],
                  ['Accessible to All', 'Medicaid, insurance, cash pay, sliding scale & scholarships'],
                  ['Easy to Access', 'Same-day appointments, telehealth & evening sessions'],
                  ['Truly Free', 'Because healing and dignity should never have a price tag'],
                ].map(([title, desc]) => (
                  <li key={title} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-lw-pink flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-lw-navy text-sm">{title}</span>
                      <span className="text-gray-500 text-sm"> — {desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <Link to="/about" className="btn-primary mt-8 inline-flex items-center gap-2">
                Our Story <ArrowRight size={16} />
              </Link>
            </div>

            {/* Real photo */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <img src="/images/photos/event1.jpg" alt="LifeWay Community" className="rounded-2xl w-full h-48 object-cover" />
                <img src="/images/photos/event2.jpg" alt="LifeWay Team" className="rounded-2xl w-full h-48 object-cover" />
                <img src="/images/photos/event3.jpg" alt="LifeWay Programs" className="rounded-2xl w-full h-48 object-cover" />
                <img src="/images/photos/event4.jpg" alt="LifeWay Community" className="rounded-2xl w-full h-48 object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="text-center mb-12">
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">Google Reviews</span>
          <h2 className="text-3xl md:text-4xl font-bold text-lw-navy mt-2 mb-2">What Our Clients Say</h2>
          <p className="text-gray-500">Real experiences from the people we serve</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
              <p className="font-semibold text-lw-navy text-sm">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Locations */}
      <section className="bg-lw-navy text-white">
        <div className="section">
          <div className="text-center mb-12">
            <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">Find Us</span>
            <h2 className="text-3xl font-bold mt-2">Two Locations + Statewide Telehealth</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 rounded-2xl p-8">
              <MapPin size={28} className="text-lw-pink mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Homestead, FL</h3>
              <p className="text-gray-300 text-sm">15300 SW 288th Street<br />Homestead, FL 33033</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-8">
              <MapPin size={28} className="text-lw-pink mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Riverview, FL</h3>
              <p className="text-gray-300 text-sm">10621 Tucker Jones Rd<br />Riverview, FL 33578</p>
            </div>
            <div className="bg-lw-pink/20 border border-lw-pink/30 rounded-2xl p-8">
              <Phone size={28} className="text-lw-pink mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Call or Text</h3>
              <a href="tel:8883313060" className="text-lw-pink font-bold text-xl">(888) 331-3060</a>
              <p className="text-gray-400 text-sm mt-2">Mon–Sat · 9am–9pm</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-lw-pink">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Heal, Grow, and Soar?</h2>
          <p className="text-pink-100 mb-8 text-lg">Let us walk with you — clinically, spiritually, and compassionately.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/book" className="bg-white text-lw-pink font-bold px-8 py-3.5 rounded-lg hover:bg-pink-50 transition-colors flex items-center gap-2">
              <Calendar size={16} /> Book Free Appointment
            </Link>
            <Link to="/contact" className="border-2 border-white text-white font-bold px-8 py-3.5 rounded-lg hover:bg-white/10 transition-colors">
              Contact Us
            </Link>
          </div>
          <p className="text-pink-200 text-sm mt-6">You're just a click away · Same-day appointments available</p>
        </div>
      </section>
    </div>
  )
}
