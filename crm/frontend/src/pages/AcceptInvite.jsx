import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function AcceptInvite() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [invite, setInvite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ first_name: '', last_name: '', username: '', password: '', confirm: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    axios.get(`${API}/public/invite/${token}`)
      .then(r => setInvite(r.data))
      .catch(e => setError(e.response?.data?.detail || 'This invitation is invalid or has expired.'))
      .finally(() => setLoading(false))
  }, [token])

  async function submit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setError('')
    setSubmitting(true)
    try {
      await axios.post(`${API}/public/invite/${token}/accept`, {
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        password: form.password,
      })
      setDone(true)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to create account. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
    </div>
  )

  if (done) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Account Created!</h1>
        <p className="text-gray-500 text-sm mb-6">Your Lifeway Programs account is ready. You can now log in.</p>
        <button onClick={() => navigate('/login')} className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg text-sm transition-colors">
          Go to Login
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-pink-500 px-8 py-6">
          <h1 className="text-white text-xl font-bold">You're Invited</h1>
          <p className="text-pink-100 text-sm mt-1">Lifeway Programs Staff Portal</p>
        </div>

        <div className="p-8">
          {error && !invite ? (
            <div className="text-center">
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-4">{error}</p>
            </div>
          ) : (
            <>
              {invite && (
                <div className="bg-pink-50 border border-pink-200 rounded-lg px-4 py-3 mb-6 text-sm text-pink-900">
                  <span className="font-semibold">{invite.invited_by}</span> has invited you to join as a{' '}
                  <span className="font-semibold capitalize">{invite.role.replace('_', ' ')}</span>.
                </div>
              )}

              {error && <p className="text-red-600 text-xs mb-4 bg-red-50 border border-red-200 rounded p-2">{error}</p>}

              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">First Name *</label>
                    <input className="input" value={form.first_name} onChange={set('first_name')} required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name *</label>
                    <input className="input" value={form.last_name} onChange={set('last_name')} required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <input className="input bg-gray-50" value={invite?.email || ''} disabled />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Username *</label>
                  <input className="input" value={form.username} onChange={set('username')} required autoComplete="username" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password *</label>
                  <input className="input" type="password" value={form.password} onChange={set('password')} required autoComplete="new-password" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password *</label>
                  <input className="input" type="password" value={form.confirm} onChange={set('confirm')} required autoComplete="new-password" />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating account…' : 'Create Account & Join'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
