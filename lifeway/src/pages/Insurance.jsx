import { Link } from 'react-router-dom'
import { CheckCircle2, ArrowRight } from 'lucide-react'

const columns = [
  {
    title: 'Medicaid',
    sub: 'Managed Medical Assistance (MMA) Plans',
    plans: [
      'Aetna Better Health',
      'Simply Healthcare',
      'Humana Health Plan',
      'United Healthcare',
      'Molina Health Plan',
      'Community Care Plan',
      'Florida Community Care',
    ],
  },
  {
    title: 'Medicare',
    sub: 'Medicare Advantage Plans',
    plans: [
      'Aetna',
      'Avmed',
      'Care Plus Health Plan',
      'Cigna',
      'HealthSun Health Plan',
      'Humana Medical Plan',
      'Medica Healthcare',
      'Molina Healthcare',
      'Preferred Care Partners',
      'Simply Healthcare',
      'Solis Health Plan',
    ],
  },
  {
    title: 'Marketplace Plans',
    plans: [
      'Oscar',
      'Aetna CVS',
      'United',
      'Amerihealth',
      'Wellpoint',
      'Florida Blue / BCBS',
      'Commercial Plans',
      'Cigna',
      'ComPsych',
      'Tricare',
      'Healthy Kids',
    ],
  },
]

const logos = [
  { name: 'Aetna', src: '/images/insurers/aetna.svg', size: 'h-7', tilt: '-rotate-2' },
  { name: 'UnitedHealthcare', src: '/images/insurers/unitedhealthcare.svg', size: 'h-9', tilt: 'rotate-1' },
  { name: 'Humana', src: '/images/insurers/humana.svg', size: 'h-6', tilt: 'rotate-2' },
  { name: 'Cigna', src: '/images/insurers/cigna.png', size: 'h-10', tilt: '-rotate-1' },
  { name: 'Molina Healthcare', src: '/images/insurers/molina.svg', size: 'h-8', tilt: 'rotate-2' },
  { name: 'Oscar Health', src: '/images/insurers/oscar.svg', size: 'h-6', tilt: '-rotate-2' },
  { name: 'Anthem', src: '/images/insurers/anthem.png', size: 'h-7', tilt: 'rotate-1' },
  { name: 'AmeriHealth', src: '/images/insurers/amerihealth.svg', size: 'h-8', tilt: '-rotate-1' },
  { name: 'TRICARE', src: '/images/insurers/tricare.svg', size: 'h-9', tilt: 'rotate-2' },
]

export default function Insurance() {
  return (
    <div>
      {/* Header */}
      <section className="bg-lw-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">Coverage We Accept</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-5">Insurances Accepted</h1>
          <p className="text-gray-300 max-w-xl mx-auto text-lg leading-relaxed">
            We work with a wide range of Medicaid, Medicare, and Marketplace plans, and offer cash pay and sliding scale
            options for everyone else.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {columns.map(col => (
            <div key={col.title} className="card p-8">
              <h2 className="text-lg font-bold text-lw-pink uppercase tracking-wide text-center">{col.title}</h2>
              {col.sub && <p className="text-gray-500 text-sm text-center mt-1">{col.sub}</p>}
              <div className="w-12 h-px bg-gray-200 mx-auto my-4" />
              <ul className="space-y-2.5">
                {col.plans.map(plan => (
                  <li key={plan} className="flex items-center gap-2 text-sm text-lw-pink font-medium">
                    <CheckCircle2 size={16} className="flex-shrink-0" />
                    {plan}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Logo collage */}
        <div className="text-center mb-8">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Some of the Plans We Work With</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16 max-w-3xl mx-auto">
          {logos.map(logo => (
            <div
              key={logo.name}
              title={logo.name}
              className={`bg-white rounded-2xl shadow-sm border border-gray-50 px-6 py-5 flex items-center justify-center hover:shadow-md hover:scale-105 hover:rotate-0 transition-all ${logo.tilt}`}
            >
              <img src={logo.src} alt={logo.name} className={`${logo.size} w-auto object-contain`} />
            </div>
          ))}
        </div>

        {/* Note + CTA */}
        <div className="bg-lw-pink-light rounded-3xl p-8 text-center max-w-2xl mx-auto">
          <p className="text-gray-600 leading-relaxed mb-6">
            Don't see your plan listed, or not sure if your specific coverage is active? Contact us and our team will run an
            insurance eligibility check for you before your visit. We also accept cash pay and offer sliding scale fees and
            scholarships, so cost is never a barrier to care.
          </p>
          <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
            Check My Insurance Eligibility <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
