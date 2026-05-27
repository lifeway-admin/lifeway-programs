import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle } from 'lucide-react'

const values = [
  { title: 'Faith-Based Excellence', desc: 'We blend clinical skill with biblical truth, believing that lasting transformation is both professional and spiritual.' },
  { title: 'Multicultural & Bilingual', desc: 'We proudly serve our diverse community in English and Spanish, honoring every culture and background.' },
  { title: 'Holistic & Trauma-Informed', desc: 'We treat the whole person — body, mind, and spirit — using evidence-based, trauma-informed approaches.' },
  { title: 'Accessible to All', desc: 'We accept Medicaid, insurance, cash pay, and offer sliding scale fees and scholarships so cost is never a barrier.' },
  { title: 'Compassion First', desc: 'We meet every person with empathy, dignity, and respect — no matter their background or circumstances.' },
  { title: 'Community-Rooted', desc: 'We are deeply embedded in the communities we serve, with two physical locations and statewide telehealth.' },
]

const services_summary = [
  { category: 'Mental Health Counseling', items: ['Individual Therapy (Children, Teens, Adults)', 'Family & Couples Counseling', 'Pre-Engagement & Pre-Marital Therapy', 'Christian Counseling & Inner Healing', 'Grief, Trauma, Parenting & Support Groups', 'Group Therapy'] },
  { category: 'Psychiatry & Case Management', items: ['Psychiatric Evaluations & Medication Management', 'ARNP Services for Adults', 'Case Management for housing, finances & medical care', 'Community Referrals'] },
  { category: 'Addiction Recovery', items: ['Individual Outpatient Substance Abuse Counseling', 'Intensive Outpatient Program (IOP) – 9+ hrs/week', '12-Step Program Referrals (AA, NA, Al-Anon)', 'Dual Diagnosis Support'] },
  { category: 'Medical & Integrative Wellness', items: ['Walk-In Non-Emergency Sick Visits (Homestead)', 'Lab Testing & Preventive Health', 'Wellness Planning & Nutrition Coaching', 'Telehealth Medical Consultations'] },
]

export default function About() {
  return (
    <div>
      {/* Header */}
      <section className="bg-lw-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">Who We Are</span>
              <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6 leading-tight">
                A Christ-Centered<br />Movement of Healing
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                At LifeWay Center, we are more than just a behavioral health organization — we are a Christ-centered movement of healing, hope, and holistic transformation.
              </p>
              <blockquote className="border-l-4 border-lw-pink pl-5 italic text-pink-200 text-base">
                "They will soar on wings like eagles…"<br />
                <span className="text-sm text-gray-400 not-italic mt-1 block">— Isaiah 40:31</span>
              </blockquote>
            </div>
            <div className="hidden md:block">
              <img src="/images/photos/about-banner.jpg" alt="About LifeWay Center"
                className="rounded-2xl w-full h-80 object-cover opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">Our Mission</span>
          <h2 className="text-3xl md:text-4xl font-bold text-lw-navy mt-2 mb-6">
            Linking Individuals to Their Soaring Potential
          </h2>
          <p className="text-gray-500 leading-relaxed text-lg mb-6">
            We exist to empower people of all ages to heal, grow, and thrive — mentally, emotionally, physically, and spiritually. We combine professional expertise with biblical wisdom and deep compassion, because we know true transformation happens from the inside out.
          </p>
          <p className="text-gray-500 leading-relaxed">
            As a nonprofit, multicultural, and spiritually grounded agency, we serve children, families, and individuals with high-quality clinical care that addresses the whole person — body, mind, and spirit.
          </p>
        </div>

        {/* Founder */}
        <div className="bg-lw-pink-light rounded-3xl p-10 mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">Our Founder</span>
              <h2 className="text-3xl font-bold text-lw-navy mt-2 mb-4">Mayelin Lima, LCSW</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our founder, Mayelin Lima, LCSW, brings over 20 years of clinical and community health experience. Bilingual and deeply compassionate, Mayelin leads with humility and bold faith — believing that every soul we serve carries divine potential waiting to be unlocked.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Her vision for LifeWay Center was born from a conviction that quality mental health, medical, and social services should be freely accessible to everyone — regardless of income, background, or circumstance.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="/images/photos/event5.jpg" alt="LifeWay Programs" className="rounded-2xl w-full h-44 object-cover" />
              <img src="/images/photos/event6.jpg" alt="LifeWay Community" className="rounded-2xl w-full h-44 object-cover" />
              <div className="col-span-2 bg-lw-pink rounded-2xl p-6 text-white text-center">
                <p className="text-3xl font-bold mb-1">20+</p>
                <p className="text-pink-100 text-sm">Years of Clinical Experience</p>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="text-center mb-12">
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">What Guides Us</span>
          <h2 className="text-3xl font-bold text-lw-navy mt-2">Our Core Values</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {values.map(v => (
            <div key={v.title} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <CheckCircle size={20} className="text-lw-pink mb-3" />
              <h3 className="font-bold text-lw-navy mb-2">{v.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Services snapshot */}
        <div className="text-center mb-12">
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">What We Provide</span>
          <h2 className="text-3xl font-bold text-lw-navy mt-2">Our Programs & Services</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {services_summary.map(s => (
            <div key={s.category} className="bg-lw-navy rounded-2xl p-8 text-white">
              <h3 className="font-bold text-lw-pink mb-5 text-lg">{s.category}</h3>
              <ul className="space-y-2.5">
                {s.items.map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-lw-pink mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-lw-pink">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Heal, Grow, and Soar?</h2>
          <p className="text-pink-100 mb-8">Let us walk with you — clinically, spiritually, and compassionately.</p>
          <Link to="/book" className="bg-white text-lw-pink font-bold px-8 py-3.5 rounded-lg hover:bg-pink-50 transition-colors inline-flex items-center gap-2">
            Book Free Appointment <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
