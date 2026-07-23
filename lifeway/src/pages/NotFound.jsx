import { Link } from 'react-router-dom'
import { ArrowRight, Heart } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import i18n from '../lib/i18n/notFound'

export default function NotFound() {
  const { lang } = useLanguage()
  const t = i18n[lang]

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-lw-pink-light flex items-center justify-center mx-auto mb-6">
          <Heart size={28} className="text-lw-pink" />
        </div>
        <h1 className="text-6xl font-bold text-lw-navy mb-3">404</h1>
        <h2 className="text-2xl font-bold text-lw-navy mb-3">{t.title}</h2>
        <p className="text-gray-500 leading-relaxed mb-8">
          {t.body}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            {t.backHome} <ArrowRight size={16} />
          </Link>
          <Link to="/contact" className="btn-outline inline-flex items-center gap-2">
            {t.contactUs}
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-8">
          {t.needHelp}{' '}
          <a href="tel:8883313060" className="text-lw-pink font-semibold hover:underline">(888) 331-3060</a>
        </p>
      </div>
    </div>
  )
}
