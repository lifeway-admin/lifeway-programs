import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle } from 'lucide-react'

const services = [
  {
    img: '/images/icons/mental-health.png',
    title: 'Mental Health Counseling',
    desc: 'Compassionate, evidence-based therapy for children, teens, and adults — rooted in both clinical expertise and faith.',
    items: [
      'Individual Therapy (Children, Teens, Adults)',
      'Family & Couples Counseling',
      'Pre-Engagement & Pre-Marital Therapy',
      'Christian Counseling & Inner Healing',
      'Grief & Trauma Therapy',
      'Parenting Support',
      "Men's & Women's Support Groups",
      'Group Therapy',
    ],
  },
  {
    img: '/images/icons/wellness.png',
    title: 'Psychiatry & Case Management',
    desc: 'Comprehensive psychiatric and care coordination services to support your mental and overall health.',
    items: [
      'Psychiatric Evaluations',
      'Medication Management',
      'ARNP Services for Adults',
      'Case Management (housing, finances, medical)',
      'Community Referral Services',
    ],
  },
  {
    img: '/images/icons/wellness.png',
    title: 'Addiction Recovery & Dual Diagnosis',
    desc: 'Structured outpatient programs with clinical and spiritual support for lasting recovery.',
    items: [
      'Individual Outpatient Substance Abuse Counseling',
      'Intensive Outpatient Program (IOP) – 9+ hrs/week',
      '12-Step Program Referrals (AA, NA, Al-Anon)',
      'Co-Occurring Mental Health & Substance Use Support',
      'Relapse Prevention',
    ],
  },
  {
    img: '/images/icons/wellness.png',
    title: 'Medical & Integrative Wellness',
    desc: 'Primary care and integrative wellness services addressing your full physical health.',
    items: [
      'Walk-In Non-Emergency Sick Visits (Homestead)',
      'Lab Testing & Preventive Health',
      'Wellness Planning & Nutrition Coaching',
      'Male & Female Pelvic Exams (by consent)',
      'Telehealth Medical Consultations',
      'IV Wellness Therapy',
    ],
  },
  {
    img: '/images/icons/resource.png',
    title: 'Social Services & Case Management',
    desc: 'Connecting you to the resources, support systems, and services you need to thrive.',
    items: [
      'Food Support & Distribution',
      'Housing Assistance & Navigation',
      'Utility Assistance Programs',
      'Employment Support & Referrals',
      'Benefits Enrollment',
      'Community Resource Referrals',
    ],
  },
  {
    img: '/images/icons/referral.png',
    title: 'Spiritual Care & Support',
    desc: 'Faith-based healing that honors the whole person — spirit, soul, and body.',
    items: [
      'Christian Counseling & Inner Healing',
      'Spiritual Assessment & Support',
      'Prayer & Pastoral Care',
      'Faith-Based Support Groups',
      'Psychosocial Rehabilitation',
      'Life Skills & Independent Living Support',
    ],
  },
]

const insurance = ['Medicaid', 'Medicare', 'Blue Cross', 'Aetna', 'United Health', 'Cigna', 'Humana', 'Self-Pay / Sliding Scale']

export default function Services() {
  return (
    <div>
      {/* Header */}
      <section className="bg-lw-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">Comprehensive Holistic Care</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-5">Our Services</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            We offer a full spectrum of mental health, medical, social, and spiritual services — all free or low-cost, because dignity should never have a price tag.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {['Mental Health', 'Medical', 'Wellness', 'Social Services', 'Spiritual Care', 'Addiction Recovery'].map(tag => (
              <span key={tag} className="bg-white/10 text-sm px-4 py-2 rounded-full text-gray-200">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="section">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map(s => (
            <div key={s.title} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="w-14 h-14 rounded-2xl bg-lw-pink-light flex items-center justify-center mb-5 overflow-hidden flex-shrink-0">
                <img src={s.img} alt={s.title} className="w-8 h-8 object-contain"
                  onError={e => { e.target.style.display = 'none' }} />
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
            </div>
          ))}
        </div>

        {/* Psychosocial rehab callout */}
        <div className="bg-lw-navy rounded-3xl p-10 text-white mb-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">Psychosocial Rehabilitation</span>
              <h2 className="text-2xl font-bold mt-2 mb-4">Building Skills for Independent Living</h2>
              <p className="text-gray-300 leading-relaxed">
                Our psychosocial rehabilitation program helps individuals develop life skills, integrate into the community, and work toward vocational goals — all with clinical guidance and compassionate support.
              </p>
            </div>
            <ul className="space-y-3">
              {['Life Skills & Independent Living Support', 'Community Integration', 'Vocational Referrals', 'Behavioral Health Education', 'Relapse Prevention'].map(item => (
                <li key={item} className="flex items-center gap-3 text-gray-200 text-sm">
                  <div className="w-2 h-2 rounded-full bg-lw-pink flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Insurance */}
        <div className="text-center">
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">Payment & Insurance</span>
          <h2 className="text-3xl font-bold text-lw-navy mt-2 mb-4">We Accept Most Insurance Plans</h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-8">
            We accept Medicaid, Medicare, and select private insurance. Sliding scale fees, scholarships, and cash pay options are available so cost is never a barrier to care.
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto mb-10">
            {insurance.map(ins => (
              <div key={ins} className="bg-lw-pink-light border border-pink-100 rounded-lg px-5 py-2.5 text-sm font-medium text-lw-navy">
                {ins}
              </div>
            ))}
          </div>
          <Link to="/book" className="btn-primary inline-flex items-center gap-2">
            Book Free Appointment <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
