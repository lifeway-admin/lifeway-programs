import { useState } from 'react'
import { Heart, CheckCircle } from 'lucide-react'

const API = 'http://localhost:8000'
const SERVICES = [
  'Individual Therapy',
  'Family Counseling',
  'Group Therapy',
  'Substance Abuse Recovery',
  'Crisis Intervention',
  'Community Outreach',
  'Mental Health Assessment',
]

export default function IntakeForm() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', primary_service: '', notes: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/public/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Submission failed')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again or call us directly.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="card max-w-md w-full p-10 text-center space-y-4">
          <CheckCircle size={48} className="text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Thank You!</h2>
          <p className="text-gray-600 dark:text-gray-300">Your information has been received. A member of our team will reach out to you shortly.</p>
          <p className="text-sm text-gray-400">Lifeway Programs — Restoring hope, transforming lives.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="card max-w-lg w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-lifeway-pink mb-1">
            <Heart size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lifeway Programs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Fill out the form below and our team will be in touch.</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-300">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
              <input required value={form.first_name} onChange={set('first_name')} className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
              <input required value={form.last_name} onChange={set('last_name')} className="input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" value={form.email} onChange={set('email')} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={set('phone')} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Interest</label>
            <select value={form.primary_service} onChange={set('primary_service')} className="input w-full">
              <option value="">Select a service...</option>
              {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message / Notes</label>
            <textarea rows={3} value={form.notes} onChange={set('notes')} className="input w-full resize-none" placeholder="Tell us how we can help..." />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">Your information is kept confidential and secure.</p>
      </div>
    </div>
  )
}
