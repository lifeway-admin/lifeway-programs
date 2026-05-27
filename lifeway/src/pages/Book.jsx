import { useEffect } from 'react'
import { Heart } from 'lucide-react'

const BOOKING_URL = import.meta.env.VITE_BOOKING_URL || 'http://localhost:5174'

export default function Book() {
  useEffect(() => {
    window.location.href = BOOKING_URL
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-lw-pink-light flex items-center justify-center mx-auto mb-4">
          <Heart size={20} className="text-lw-pink animate-pulse" />
        </div>
        <p className="text-gray-500 text-sm">Redirecting to booking portal...</p>
      </div>
    </div>
  )
}
