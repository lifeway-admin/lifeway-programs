import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const pages = {
  '/': {
    title: 'LifeWay Center, Healing, Hope & Dignity for All',
    description: 'A faith-based 501(c)(3) nonprofit offering accessible mental health, medical, social, and spiritual care in Homestead and Riverview, FL, plus statewide telehealth.',
  },
  '/about': {
    title: 'About Us | LifeWay Center',
    description: 'Learn about LifeWay Center\'s Christ-centered mission, values, and holistic approach to mental health, medical, and social services in South Florida.',
  },
  '/services': {
    title: 'Our Services | LifeWay Center',
    description: 'Explore LifeWay Center\'s full range of services: mental health counseling, psychiatry, addiction recovery, medical and wellness care, and social services.',
  },
  '/insurances': {
    title: 'Insurances Accepted | LifeWay Center',
    description: 'See the Medicaid, Medicare, and Marketplace insurance plans LifeWay Center accepts, plus cash pay and sliding scale options.',
  },
  '/founder': {
    title: 'Our Founder | LifeWay Center',
    description: 'Meet Mayelin Lima, LCSW, founder and CEO of LifeWay Center, and the vision behind linking individuals to their soaring potential.',
  },
  '/team': {
    title: 'Our Team | LifeWay Center',
    description: 'Meet the Board of Directors, Executive, Director, and Medical teams behind LifeWay Center\'s compassionate, licensed care.',
  },
  '/contact': {
    title: 'Contact Us | LifeWay Center',
    description: 'Get in touch with LifeWay Center by phone, email, or our contact form. We respond within 1-2 business days.',
  },
  '/book': {
    title: 'Book an Appointment | LifeWay Center',
    description: 'Schedule an appointment with LifeWay Center, same-day availability often offered, in-person or via telehealth.',
  },
  '/donate': {
    title: 'Donate | LifeWay Center',
    description: 'Support LifeWay Center\'s mission with a tax-deductible donation. Every gift funds mental health, medical, and social service programs.',
  },
  '/faq': {
    title: 'Frequently Asked Questions | LifeWay Center',
    description: 'Answers to common questions about cost, insurance, booking, telehealth, and privacy at LifeWay Center.',
  },
  '/privacy': {
    title: 'Privacy Policy | LifeWay Center',
    description: 'LifeWay Center\'s privacy policy covering how we collect, use, and protect your information.',
  },
  '/hipaa': {
    title: 'HIPAA Notice of Privacy Practices | LifeWay Center',
    description: 'LifeWay Center\'s HIPAA Notice of Privacy Practices describing how protected health information is used and disclosed.',
  },
}

export default function PageTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    const page = pages[pathname]
    document.title = page?.title || 'LifeWay Center'

    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', page?.description || 'LifeWay Center, a faith-based nonprofit offering accessible mental health, medical, and social services in South Florida.')

    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
