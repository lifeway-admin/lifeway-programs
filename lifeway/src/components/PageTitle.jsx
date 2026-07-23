import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const pages = {
  en: {
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
  },
  es: {
    '/': {
      title: 'LifeWay Center, Sanación, Esperanza y Dignidad para Todos',
      description: 'Una organización sin fines de lucro 501(c)(3) de fe cristiana que ofrece atención accesible de salud mental, médica, social y espiritual en Homestead y Riverview, FL, además de telesalud en todo el estado.',
    },
    '/about': {
      title: 'Sobre Nosotros | LifeWay Center',
      description: 'Conozca la misión centrada en Cristo, los valores y el enfoque integral de LifeWay Center hacia la salud mental, médica y los servicios sociales en el sur de Florida.',
    },
    '/services': {
      title: 'Nuestros Servicios | LifeWay Center',
      description: 'Explore la gama completa de servicios de LifeWay Center: consejería de salud mental, psiquiatría, recuperación de adicciones, atención médica y de bienestar, y servicios sociales.',
    },
    '/insurances': {
      title: 'Seguros Aceptados | LifeWay Center',
      description: 'Consulte los planes de Medicaid, Medicare y del Mercado que acepta LifeWay Center, además de opciones de pago en efectivo y tarifa según ingresos.',
    },
    '/founder': {
      title: 'Nuestra Fundadora | LifeWay Center',
      description: 'Conozca a Mayelin Lima, LCSW, fundadora y directora ejecutiva de LifeWay Center, y la visión detrás de vincular a las personas con su potencial de volar alto.',
    },
    '/team': {
      title: 'Nuestro Equipo | LifeWay Center',
      description: 'Conozca a la Junta Directiva y a los equipos Ejecutivo, de Directores y Médico detrás de la atención compasiva y licenciada de LifeWay Center.',
    },
    '/contact': {
      title: 'Contáctenos | LifeWay Center',
      description: 'Comuníquese con LifeWay Center por teléfono, correo electrónico o nuestro formulario de contacto. Respondemos dentro de 1-2 días hábiles.',
    },
    '/book': {
      title: 'Reservar una Cita | LifeWay Center',
      description: 'Programe una cita con LifeWay Center, a menudo con disponibilidad el mismo día, en persona o por telesalud.',
    },
    '/donate': {
      title: 'Donar | LifeWay Center',
      description: 'Apoye la misión de LifeWay Center con una donación deducible de impuestos. Cada donativo financia programas de salud mental, médicos y de servicios sociales.',
    },
    '/faq': {
      title: 'Preguntas Frecuentes | LifeWay Center',
      description: 'Respuestas a preguntas comunes sobre costos, seguros, reservas, telesalud y privacidad en LifeWay Center.',
    },
    '/privacy': {
      title: 'Política de Privacidad | LifeWay Center',
      description: 'La política de privacidad de LifeWay Center sobre cómo recopilamos, usamos y protegemos su información.',
    },
    '/hipaa': {
      title: 'Aviso de Prácticas de Privacidad de HIPAA | LifeWay Center',
      description: 'El Aviso de Prácticas de Privacidad de HIPAA de LifeWay Center describe cómo se usa y divulga la información de salud protegida.',
    },
  },
}

export default function PageTitle() {
  const { pathname } = useLocation()
  const { lang } = useLanguage()

  useEffect(() => {
    const page = pages[lang][pathname]
    document.title = page?.title || 'LifeWay Center'

    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', page?.description || pages.en['/'].description)
    document.documentElement.lang = lang

    window.scrollTo(0, 0)
  }, [pathname, lang])

  return null
}
