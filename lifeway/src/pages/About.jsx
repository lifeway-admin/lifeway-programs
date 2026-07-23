import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { fadeUp } from '../lib/animations'

const values = [
  { title: 'Faith-Based Excellence', desc: 'We blend clinical skill with biblical truth, believing that lasting transformation is both professional and spiritual.' },
  { title: 'Multicultural & Bilingual', desc: 'We proudly serve our diverse community in English and Spanish, honoring every culture and background.' },
  { title: 'Holistic & Trauma-Informed', desc: 'We treat the whole person, body, mind, and spirit, using evidence-based, trauma-informed approaches.' },
  { title: 'Accessible to All', desc: 'We accept Medicaid, insurance, cash pay, and offer sliding scale fees and scholarships so cost is never a barrier.' },
  { title: 'Compassion First', desc: 'We meet every person with empathy, dignity, and respect, no matter their background or circumstances.' },
  { title: 'Community-Rooted', desc: 'We are deeply embedded in the communities we serve, with two physical locations and statewide telehealth.' },
]

export default function About() {
  return (
    <div>
      {/* Header */}
      <section className="relative bg-lw-navy text-white overflow-hidden">
        <div className="absolute inset-0 bg-noise pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">Who We Are</span>
              <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6 leading-tight">
                A Christ-Centered<br />Movement of Healing
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                At LifeWay Center, we are more than just a behavioral health organization, we are a Christ-centered movement of healing, hope, and holistic transformation.
              </p>
              <blockquote className="border-l-4 border-lw-pink pl-5 italic text-pink-200 text-base">
                "They will soar on wings like eagles…"<br />
                <span className="text-sm text-gray-400 not-italic mt-1 block">Isaiah 40:31</span>
              </blockquote>
            </div>
            <div className="hidden md:flex flex-col gap-4">
              <blockquote className="bg-white/10 rounded-2xl p-6 border-l-4 border-lw-pink">
                <p className="text-pink-100 italic leading-relaxed">"We are more than a clinic, we are a Christ-centered movement of healing, hope, and holistic transformation for every person who walks through our doors."</p>
              </blockquote>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[['20+', 'Years'], ['2', 'Locations'], ['EN·ES', 'Bilingual']].map(([v, l]) => (
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
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">Our Mission</span>
          <h2 className="text-3xl md:text-4xl font-bold text-lw-navy mt-2 mb-6">
            Linking Individuals to Their Soaring Potential
          </h2>
          <p className="text-gray-500 leading-relaxed text-lg mb-6">
            We exist to empower people of all ages to heal, grow, and thrive, mentally, emotionally, physically, and spiritually. We combine professional expertise with biblical wisdom and deep compassion, because we know true transformation happens from the inside out.
          </p>
          <p className="text-gray-500 leading-relaxed">
            As a nonprofit, multicultural, and spiritually grounded agency, we serve children, families, and individuals with high-quality clinical care that addresses the whole person, body, mind, and spirit.
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
              <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">Our Founder</span>
              <h2 className="text-3xl font-bold text-lw-navy mt-2 mb-4">Mayelin Lima, LCSW</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our founder, Mayelin Lima, LCSW, brings over 20 years of clinical and community health experience. Bilingual and deeply compassionate, Mayelin leads with humility and bold faith, believing that every soul we serve carries divine potential waiting to be unlocked.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Her vision for LifeWay Center was born from a conviction that quality mental health, medical, and social services should be freely accessible to everyone, regardless of income, background, or circumstance.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-lw-pink-dark rounded-2xl p-6 text-white">
                <p className="text-4xl font-bold mb-1">20+</p>
                <p className="font-semibold text-sm mb-1">Years of Clinical Experience</p>
                <p className="text-pink-100 text-xs leading-relaxed">Spanning community mental health, social services, trauma-informed care, and faith-based counseling across South Florida.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'LCSW', label: 'Florida Licensed', sub: 'Clinical Social Worker' },
                  { value: 'EN·ES', label: 'Bilingual', sub: 'English & Spanish' },
                  { value: '501c3', label: 'Nonprofit', sub: 'Accessible to All' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <p className="text-lw-pink font-bold text-sm mb-0.5">{s.value}</p>
                    <p className="text-lw-navy text-xs font-semibold">{s.label}</p>
                    <p className="text-gray-400 text-xs">{s.sub}</p>
                  </div>
                ))}
              </div>
              <blockquote className="border-l-4 border-lw-pink pl-4 italic text-gray-500 text-sm leading-relaxed">
                "Every soul we serve carries divine potential waiting to be unlocked."
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
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">What Guides Us</span>
          <h2 className="text-3xl font-bold text-lw-navy mt-2">Our Core Values</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {values.map((v, i) => (
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
          <h3 className="text-xl font-bold text-lw-navy mb-2">Want the Full Picture?</h3>
          <p className="text-gray-500 mb-5">Explore our complete range of mental health, medical, social, and spiritual services.</p>
          <Link to="/services" className="btn-primary inline-flex items-center gap-2">
            View All Services <ArrowRight size={16} />
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
          <h2 className="text-3xl font-bold mb-4">Ready to Heal, Grow, and Soar?</h2>
          <p className="text-pink-100 mb-8">Let us walk with you, clinically, spiritually, and compassionately.</p>
          <Link to="/book" className="bg-white text-lw-pink font-bold px-8 py-3.5 rounded-lg hover:bg-pink-50 transition-colors inline-flex items-center gap-2">
            Book an Appointment <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
