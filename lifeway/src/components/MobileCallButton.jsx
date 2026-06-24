import { Phone } from 'lucide-react'

export default function MobileCallButton() {
  return (
    <a
      href="tel:8883313060"
      className="fixed bottom-5 right-5 z-40 md:hidden flex items-center gap-2 bg-lw-pink text-white px-5 py-3 rounded-full shadow-xl font-semibold text-sm hover:bg-lw-pink-dark transition-colors"
      aria-label="Call LifeWay Center"
    >
      <Phone size={16} />
      (888) 331-3060
    </a>
  )
}
