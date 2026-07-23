import { useLanguage } from '../context/LanguageContext'

export default function LangToggle({ className = '' }) {
  const { lang, setLang } = useLanguage()

  return (
    <div className={`flex rounded-full overflow-hidden border-2 border-lw-pink text-xs font-bold flex-shrink-0 ${className}`}>
      <button
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 transition-colors ${lang === 'en' ? 'bg-lw-pink text-white' : 'bg-transparent text-lw-pink hover:bg-lw-pink-light'}`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('es')}
        className={`px-2.5 py-1 transition-colors ${lang === 'es' ? 'bg-lw-pink text-white' : 'bg-transparent text-lw-pink hover:bg-lw-pink-light'}`}
      >
        ES
      </button>
    </div>
  )
}
