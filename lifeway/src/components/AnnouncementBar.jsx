import { useState } from 'react'
import { X, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('announcement-dismissed') === 'true'
  )

  if (dismissed) return null

  function dismiss() {
    sessionStorage.setItem('announcement-dismissed', 'true')
    setDismissed(true)
  }

  return (
    <div className="bg-lw-navy text-white text-xs py-2 px-4 flex items-center justify-center gap-3 relative">
      <span className="inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Now accepting new patients · Same-day appointments available
      </span>
      <Link to="/book" className="hidden sm:inline-flex items-center gap-1 bg-lw-pink text-white px-3 py-1 rounded-full font-semibold hover:bg-lw-pink-dark transition-colors">
        <Calendar size={10} /> Book Now
      </Link>
      <button
        onClick={dismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  )
}
