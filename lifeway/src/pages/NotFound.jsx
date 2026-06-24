import { Link } from 'react-router-dom'
import { ArrowRight, Heart } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-lw-pink-light flex items-center justify-center mx-auto mb-6">
          <Heart size={28} className="text-lw-pink" />
        </div>
        <h1 className="text-6xl font-bold text-lw-navy mb-3">404</h1>
        <h2 className="text-2xl font-bold text-lw-navy mb-3">Page Not Found</h2>
        <p className="text-gray-500 leading-relaxed mb-8">
          The page you're looking for doesn't exist. But we're here — let us help you find what you need.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            Back to Home <ArrowRight size={16} />
          </Link>
          <Link to="/contact" className="btn-outline inline-flex items-center gap-2">
            Contact Us
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-8">
          Need help right away? Call us at{' '}
          <a href="tel:8883313060" className="text-lw-pink font-semibold hover:underline">(888) 331-3060</a>
        </p>
      </div>
    </div>
  )
}
