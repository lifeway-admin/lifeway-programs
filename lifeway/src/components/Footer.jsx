import { Link } from 'react-router-dom'
import { Phone, MapPin, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-lw-navy text-white">
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <img src="/images/logo.png" alt="LifeWay Center" className="h-9 w-auto" onError={e => { e.target.style.display='none' }} />
            <div>
              <p className="font-bold text-lg leading-tight">LifeWay Center</p>
              <p className="text-lw-pink text-xs font-semibold uppercase tracking-wider">Christian Holistic Care</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-5">
            A faith-based 501(c)(3) nonprofit committed to offering free therapeutic, wellness, and social service support to individuals and families in need. Healing, hope, and dignity — free for all.
          </p>
          <p className="text-gray-500 text-xs italic mb-5">"Linking Individuals to Their Soaring Potential" — Isaiah 40:31</p>
          <div className="flex gap-3">
            <a href="https://instagram.com/lifewaycenter_org" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-lw-pink px-3 py-2 rounded-lg transition-colors text-xs font-semibold">
              @lifewaycenter_org
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">Quick Links</h4>
          <ul className="space-y-2.5">
            {[['/', 'Home'], ['/about', 'About Us'], ['/services', 'Services'], ['/team', 'Our Team'], ['/donate', 'Donate'], ['/contact', 'Contact']].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="text-sm text-gray-300 hover:text-lw-pink transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">Find Us</h4>
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
              <Clock size={15} className="text-lw-pink flex-shrink-0" />
              <span>Mon–Sat · 9am–9pm</span>
            </li>
          </ul>
          <Link to="/book" className="mt-6 btn-primary text-sm py-2.5 px-5 inline-block">
            Book Free Appointment
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} LifeWay Center — Lifeway Programs, Inc. All rights reserved. · 501(c)(3) Nonprofit</span>
          <div className="flex gap-4">
            <a href={`${import.meta.env.VITE_CRM_URL || 'http://localhost:5173'}`}
              className="hover:text-gray-300 transition-colors">
              Staff Login
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
