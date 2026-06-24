import { Link } from 'react-router-dom'
import { Mail, ArrowRight } from 'lucide-react'

const team = [
  {
    name: 'Mayelin Lima',
    credentials: 'LCSW',
    title: 'Founder & Executive Director',
    dept: 'Leadership',
    bio: 'With over 20 years of clinical and community health experience, Mayelin leads LifeWay Center with humility and bold faith. Bilingual and deeply compassionate, she believes that every soul we serve carries divine potential waiting to be unlocked.',
    initials: 'ML',
  },
]

const roles = [
  'Licensed Clinical Social Workers (LCSW)',
  'Licensed Mental Health Counselors (LMHC)',
  'Psychiatrists & ARNPs',
  'Case Managers',
  'Addiction Recovery Specialists',
  'Peer Support Specialists',
  'Bilingual Counselors (English/Spanish)',
  'Community Health Workers',
]

export default function Team() {
  return (
    <div>
      {/* Header */}
      <section className="bg-lw-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">The People Behind Our Mission</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-5">Our Team</h1>
          <p className="text-gray-300 max-w-xl mx-auto text-lg leading-relaxed">
            Dedicated professionals who combine clinical excellence with compassion, faith, and a deep commitment to the communities we serve.
          </p>
        </div>
      </section>

      <section className="section">
        {/* Founder spotlight */}
        <div className="bg-lw-pink-light rounded-3xl p-10 mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">Our Founder</span>
              <h2 className="text-3xl font-bold text-lw-navy mt-2 mb-1">{team[0].name}, {team[0].credentials}</h2>
              <p className="text-lw-pink font-medium mb-5">{team[0].title}</p>
              <p className="text-gray-600 leading-relaxed mb-6">{team[0].bio}</p>
              <blockquote className="border-l-4 border-lw-pink pl-5 italic text-gray-500 text-sm">
                "Every soul we serve carries divine potential waiting to be unlocked."
              </blockquote>
            </div>
            <div className="flex flex-col items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-lw-pink flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                ML
              </div>
              <div className="grid grid-cols-3 gap-4 text-center w-full">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-2xl font-bold text-lw-pink">20+</p>
                  <p className="text-xs text-gray-500 mt-1">Years Experience</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-2xl font-bold text-lw-pink">2</p>
                  <p className="text-xs text-gray-500 mt-1">Locations</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-2xl font-bold text-lw-pink">EN/ES</p>
                  <p className="text-xs text-gray-500 mt-1">Bilingual</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our team of providers */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-lw-navy mb-3">Our Providers & Staff</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Our multidisciplinary team includes licensed professionals across mental health, medical, social services, and spiritual care.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-16">
          {roles.map(role => (
            <div key={role} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-lw-pink flex-shrink-0" />
              <span className="text-gray-700 text-sm font-medium">{role}</span>
            </div>
          ))}
        </div>

        {/* Community values strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { icon: '🤝', label: 'Compassionate', desc: 'Every team member leads with empathy first' },
            { icon: '🌎', label: 'Multicultural', desc: 'Fluent in English & Spanish, rooted in community' },
            { icon: '🎓', label: 'Credentialed', desc: 'Licensed professionals across every discipline' },
            { icon: '✝️', label: 'Faith-Rooted', desc: 'Clinical excellence grounded in biblical values' },
          ].map(v => (
            <div key={v.label} className="bg-white rounded-3xl p-6 text-center shadow-sm border border-gray-50">
              <p className="text-3xl mb-3">{v.icon}</p>
              <p className="font-bold text-lw-navy text-sm mb-1">{v.label}</p>
              <p className="text-xs text-gray-400 leading-snug">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Join the team */}
        <div className="bg-lw-navy rounded-3xl p-10 text-white text-center">
          <Mail size={32} className="text-lw-pink mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Join Our Team</h2>
          <p className="text-gray-300 max-w-lg mx-auto mb-8 leading-relaxed">
            We're always looking for passionate, compassionate professionals to join our mission. Whether you're a clinician, case manager, volunteer, or community health worker — there may be a place for you at LifeWay.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
              View Opportunities <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="border-2 border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:border-white transition-colors text-sm">
              Volunteer With Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
