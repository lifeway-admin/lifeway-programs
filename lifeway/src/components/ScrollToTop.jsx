import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-5 z-40 w-10 h-10 bg-lw-navy text-white rounded-full shadow-lg flex items-center justify-center hover:bg-lw-pink transition-colors md:bottom-8"
      aria-label="Scroll to top"
    >
      <ChevronUp size={18} />
    </button>
  )
}
