import { useState } from 'react'
import api from './api'

export default function ReturnPatientModal({ onFound, onClose, t }) {
  const [email, setEmail] = useState('')
  const [dob, setDob] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function lookup() {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const params = { email }
      if (dob) params.dob = dob
      const { data } = await api.get('/public/patient-lookup', { params })
      onFound(data)
      onClose()
    } catch (e) {
      const msg = e?.response?.data?.detail
      if (msg?.includes('Date of birth is required')) {
        setError(t?.dobRequired || 'Please enter your date of birth to verify your identity.')
      } else {
        setError(t?.notFound || 'No record found. Please check your email and date of birth.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{t?.returningTitle || 'Welcome Back'}</h2>
          <p className="text-sm text-gray-500 mt-1">{t?.returningSub || 'Enter your email and date of birth to look up your information.'}</p>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">{t?.emailLabel || 'Email Address'}</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lifeway-pink"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">{t?.dob || 'Date of Birth'}</label>
          <input
            type="date"
            value={dob}
            onChange={e => setDob(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lifeway-pink"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
            {t?.cancel || 'Cancel'}
          </button>
          <button
            onClick={lookup}
            disabled={loading || !email.trim()}
            className="flex-1 py-2.5 bg-lifeway-pink text-white rounded-lg text-sm font-semibold hover:bg-lifeway-darkpink disabled:opacity-50"
          >
            {loading ? '...' : (t?.lookupBtn || 'Look Up My Info')}
          </button>
        </div>
      </div>
    </div>
  )
}
