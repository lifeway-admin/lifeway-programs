import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const titles = {
  '/': 'LifeWay Center — Healing, Hope & Dignity for All',
  '/about': 'About Us | LifeWay Center',
  '/services': 'Our Services | LifeWay Center',
  '/team': 'Our Team | LifeWay Center',
  '/contact': 'Contact Us | LifeWay Center',
  '/book': 'Book an Appointment | LifeWay Center',
  '/donate': 'Donate | LifeWay Center',
  '/faq': 'Frequently Asked Questions | LifeWay Center',
  '/privacy': 'Privacy Policy | LifeWay Center',
  '/hipaa': 'HIPAA Notice of Privacy Practices | LifeWay Center',
}

export default function PageTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = titles[pathname] || 'LifeWay Center'
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
