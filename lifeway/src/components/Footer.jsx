import { Link } from 'react-router-dom'
import { Phone, MapPin, Clock, Mail } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import shared from '../lib/i18n/shared'

export default function Footer() {
  const { lang } = useLanguage()
  const t = shared[lang]

  return (
    <footer className="bg-lw-navy text-white">
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <img src="/images/logo.png" alt="LifeWay Center" className="h-9 w-auto" onError={e => { e.target.style.display='none' }} />
            <div>
              <p className="font-bold text-lg leading-tight">LifeWay Center</p>
              <p className="text-lw-pink text-xs font-semibold uppercase tracking-wider">{t.footer.tagline}</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-5">
            {t.footer.blurb}
          </p>
          <p className="text-gray-500 text-xs italic mb-5">{t.footer.quote}</p>
          <div className="flex gap-3">
            <a href="https://instagram.com/lifewaycenter_org" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-lw-pink px-3 py-2 rounded-lg transition-colors text-xs font-semibold">
              @lifewaycenter_org
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">{t.footer.quickLinks}</h4>
          <ul className="space-y-2.5">
            {[['/', t.nav.home], ['/about', t.nav.about], ['/services', t.nav.services], ['/team', t.nav.team], ['/donate', t.nav.donate], ['/contact', t.nav.contact], ['/faq', t.nav.faq]].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="text-sm text-gray-300 hover:text-lw-pink transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">{t.footer.findUs}</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-2.5 text-sm text-gray-300">
              <MapPin size={15} className="text-lw-pink mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white text-xs mb-0.5">Homestead, FL</p>
                <p>15300 SW 288th Street<br />Homestead, FL 33033</p>
              </div>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-gray-300">
              <MapPin size={15} className="text-lw-pink mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white text-xs mb-0.5">Riverview / Tampa, FL</p>
                <p>10621 Tucker Jones Rd<br />Riverview, FL 33578</p>
              </div>
            </li>
            <li className="flex items-center gap-2.5 text-sm text-gray-300">
              <Phone size={15} className="text-lw-pink flex-shrink-0" />
              <a href="tel:8883313060" className="hover:text-lw-pink transition-colors font-semibold">(888) 331-3060</a>
            </li>
            <li className="flex items-center gap-2.5 text-sm text-gray-300">
              <Mail size={15} className="text-lw-pink flex-shrink-0" />
              <a href="mailto:support@lifewayprograms.org" className="hover:text-lw-pink transition-colors">support@lifewayprograms.org</a>
            </li>
            <li className="flex items-center gap-2.5 text-sm text-gray-300">
              <Clock size={15} className="text-lw-pink flex-shrink-0" />
              <span>Mon–Sat · 9am–9pm</span>
            </li>
          </ul>
          <Link to="/book" className="mt-6 btn-primary text-sm py-2.5 px-5 inline-block">
            {t.footer.bookAppointment}
          </Link>
        </div>
      </div>

      {/* Crisis resources */}
      <div className="border-t border-white/10 bg-lw-navy">
        <div className="max-w-6xl mx-auto px-6 py-3 text-center text-xs text-gray-500">
          <span>{t.footer.crisisText} <a href="tel:988" className="text-lw-pink font-semibold hover:underline">988</a> {t.footer.crisisLine} <a href="tel:911" className="text-lw-pink font-semibold hover:underline">911</a>.</span>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} LifeWay Center, Lifeway Programs, Inc. {t.footer.rights}</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">{t.footer.privacyPolicy}</Link>
            <Link to="/hipaa" className="hover:text-gray-300 transition-colors">{t.footer.hipaaNotice}</Link>
            <a href={`${import.meta.env.VITE_CRM_URL || 'http://localhost:5173'}`}
              className="hover:text-gray-300 transition-colors">
              {t.footer.staffLogin}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
