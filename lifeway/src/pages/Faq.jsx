import { useState } from 'react'
import { ChevronDown, Phone, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const faqs = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'How much do your services cost?',
        a: 'For qualifying individuals and families, our core services come at no cost, funded through grants and donations as a 501(c)(3) nonprofit. For those with insurance, we bill Medicaid, Medicare, and select private plans. We also offer sliding scale fees and scholarships so cost is never a barrier to care.',
      },
      {
        q: 'How do I book an appointment?',
        a: 'You can book online through our booking page, it takes about 5 minutes. Choose your service, preferred provider, and a time that works for you. Same-day appointments are often available. You can also call or text us at (888) 331-3060 and we\'ll help you get set up.',
      },
      {
        q: 'Do I need a referral?',
        a: 'No referral is needed. You can reach out to us directly and we\'ll help match you with the right provider and service for your needs.',
      },
      {
        q: 'How quickly can I be seen?',
        a: 'We offer same-day and next-day appointments in many cases. Evening and Saturday sessions are also available so care fits around your schedule, not the other way around.',
      },
    ],
  },
  {
    category: 'Insurance & Payment',
    items: [
      {
        q: 'What insurance do you accept?',
        a: (
          <>
            We accept a wide range of Medicaid Managed Medical Assistance (MMA) plans, Medicare Advantage plans, and ACA
            Marketplace plans, including Aetna, UnitedHealthcare, Humana, Cigna, Molina Healthcare, Oscar, Anthem / Wellpoint,
            AmeriHealth, and TRICARE. See our{' '}
            <Link to="/insurances" className="text-lw-pink font-semibold hover:underline">full list of accepted plans</Link>{' '}
            for details. We also accept cash pay and offer sliding scale fees based on income. If you're unsure whether your
            plan is accepted or active, contact us and we'll run a quick insurance eligibility check for you.
          </>
        ),
      },
      {
        q: 'What if I don\'t have insurance?',
        a: 'No insurance? No problem. We offer sliding scale fees based on your income, scholarships, and in many cases no-cost services for qualifying individuals. We believe healing and dignity should never depend on what\'s in your wallet.',
      },
      {
        q: 'Will I be billed without knowing?',
        a: 'Never. We are transparent about any costs before your appointment. If there\'s a fee associated with your visit, we\'ll discuss it with you upfront.',
      },
    ],
  },
  {
    category: 'Services & Care',
    items: [
      {
        q: 'Do you offer telehealth?',
        a: 'Yes. We offer secure telehealth video sessions via Google Meet statewide across Florida. Telehealth is available for mental health counseling, psychiatric services, and medical consultations. You\'ll receive a Google Meet link after booking.',
      },
      {
        q: 'Do you provide services in Spanish?',
        a: 'Absolutely. We are a fully bilingual organization. Our founder, clinical staff, and support team serve clients in both English and Spanish (English/Español). We are proud to serve our diverse South Florida community.',
      },
      {
        q: 'Do you treat children and teens?',
        a: 'Yes. We provide individual therapy for children, teens, and adults, as well as family counseling and parenting support. A parent or legal guardian must provide consent for minors receiving services.',
      },
      {
        q: 'What is your approach to mental health treatment?',
        a: 'We use evidence-based, trauma-informed approaches that honor the whole person, body, mind, and spirit. Our clinical work is grounded in compassion and, for clients who wish it, integrated with faith-based and Christian counseling. You are always in control of what your care looks like.',
      },
      {
        q: 'Can I get help with housing, food, or other social needs?',
        a: 'Yes. Our Social Services & Case Management team can connect you with food assistance, housing navigation, utility programs, employment support, benefits enrollment, and community referrals. We see social needs as health needs.',
      },
    ],
  },
  {
    category: 'Privacy & Confidentiality',
    items: [
      {
        q: 'Is what I share kept confidential?',
        a: 'Yes. Everything you share with your provider is protected under HIPAA and Florida law. We will not share your information without your written consent, except in very limited circumstances required by law (such as imminent safety concerns or mandatory reporting). See our HIPAA Notice of Privacy Practices for full details.',
      },
      {
        q: 'Is telehealth secure?',
        a: 'Yes. Our telehealth sessions are conducted via Google Meet, which uses encrypted video connections. We recommend joining from a private location where you feel comfortable speaking freely.',
      },
      {
        q: 'I\'m in crisis right now. What should I do?',
        a: 'If you are in immediate danger, call 911. For mental health crisis support, call or text 988 (Suicide & Crisis Lifeline), available 24/7, free, and confidential. You can also call us at (888) 331-3060 during our hours (Mon–Sat, 9am–9pm) and we will do our best to help.',
      },
    ],
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-5 flex items-start justify-between gap-4 group"
      >
        <span className={`font-semibold text-sm leading-relaxed transition-colors ${open ? 'text-lw-pink' : 'text-lw-navy group-hover:text-lw-pink'}`}>
          {q}
        </span>
        <ChevronDown
          size={18}
          className={`text-lw-pink flex-shrink-0 mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="text-gray-500 text-sm leading-relaxed pb-5 pr-8">
          {a}
        </p>
      )}
    </div>
  )
}

export default function Faq() {
  return (
    <div>
      {/* Header */}
      <section className="bg-lw-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <span className="text-lw-pink text-sm font-semibold uppercase tracking-wider">We Have Answers</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-300 max-w-xl mx-auto leading-relaxed">
            Everything you need to know before reaching out. Still have questions? We're just a call away.
          </p>
          <a href="tel:8883313060" className="inline-flex items-center gap-2 mt-6 text-lw-pink font-semibold hover:text-pink-300 transition-colors">
            <Phone size={16} /> (888) 331-3060
          </a>
        </div>
      </section>

      <section className="section">
        <div className="max-w-3xl mx-auto">
          {faqs.map(group => (
            <div key={group.category} className="mb-12">
              <h2 className="text-sm font-bold text-lw-pink uppercase tracking-wider mb-4">{group.category}</h2>
              <div className="bg-white rounded-3xl shadow-sm px-6 divide-y divide-gray-50">
                {group.items.map(item => (
                  <FaqItem key={item.q} {...item} />
                ))}
              </div>
            </div>
          ))}

          {/* Still have questions */}
          <div className="bg-lw-navy rounded-3xl p-10 text-white text-center mt-4">
            <h2 className="text-2xl font-bold mb-3">Still Have Questions?</h2>
            <p className="text-gray-300 mb-7 max-w-sm mx-auto">
              Our team is happy to walk you through anything. Reach out and we'll get back to you the same day.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
                Send a Message <ArrowRight size={16} />
              </Link>
              <a href="tel:8883313060" className="border-2 border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:border-white transition-colors inline-flex items-center gap-2">
                <Phone size={16} /> Call Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
