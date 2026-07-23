import { useState } from 'react'
import api from './api'

export default function CancelLookup({ t }) {
  const [confirmNum, setConfirmNum] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cancelled, setCancelled] = useState(false)

  async function lookup() {
    if (!confirmNum.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const { data } = await api.post('/public/lookup', { confirmation: confirmNum.trim().toUpperCase() })
      setResult(data)
    } catch {
      setError(t?.cancelNotFound || 'No appointment found with that confirmation number.')
    } finally {
      setLoading(false)
    }
  }

  async function cancel() {
    if (!result?.appointment_id) return
    setLoading(true)
    try {
      await api.patch(`/appointments/${result.appointment_id}`, { status: 'cancelled' })
      setCancelled(true)
    } catch {
      setError(t?.cancelError || 'Could not cancel the appointment. Please call us directly.')
    } finally {
      setLoading(false)
    }
  }

  const fmtDate = (s) => {
    try {
      return new Date(s).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long',
        day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    } catch { return s }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-lifeway-light flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-lifeway-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t?.cancelTitle || 'Manage Your Appointment'}</h1>
          <p className="text-gray-500 text-sm mt-1">{t?.cancelSub || 'Enter your confirmation number to cancel or reschedule.'}</p>
        </div>

        {cancelled ? (
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900">{t?.cancelConfirmed || 'Appointment Cancelled'}</p>
            <p className="text-sm text-gray-500">{t?.cancelConfirmedSub || 'Your appointment has been cancelled. We hope to see you again soon.'}</p>
            <a
              href="/"
              className="block w-full py-3 bg-lifeway-pink text-white font-semibold rounded-lg text-center hover:bg-lifeway-darkpink transition-colors text-sm"
            >
              {t?.bookNew || 'Book a New Appointment'}
            </a>
          </div>
        ) : (
          <>
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            {!result ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t?.confirmationNumber || 'Confirmation Number'}</label>
                  <input
                    type="text"
                    value={confirmNum}
                    onChange={e => setConfirmNum(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && lookup()}
                    placeholder="LW-123456"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lifeway-pink uppercase"
                  />
                </div>
                <button
                  onClick={lookup}
                  disabled={loading || !confirmNum.trim()}
                  className="w-full py-3 bg-lifeway-pink text-white font-semibold rounded-lg hover:bg-lifeway-darkpink disabled:opacity-50 transition-colors text-sm"
                >
                  {loading ? '...' : (t?.lookupBtn || 'Look Up My Appointment')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-lifeway-light border border-pink-100 rounded-xl p-4 space-y-2 text-sm">
                  <p className="font-semibold text-lifeway-darkpink text-xs uppercase tracking-wide">{t?.appointmentFound || 'Appointment Found'}</p>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t?.name || 'Name'}</span>
                    <span className="font-medium text-gray-900">{result.client_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t?.dateTime || 'Date & Time'}</span>
                    <span className="font-medium text-gray-900 text-right ml-4">{fmtDate(result.appointment_date)}</span>
                  </div>
                  {result.service_type && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t?.service || 'Service'}</span>
                      <span className="font-medium text-gray-900">{result.service_type}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t?.status || 'Status'}</span>
                    <span className="font-medium text-gray-900 capitalize">{result.status}</span>
                  </div>
                </div>
                {result.status === 'cancelled' ? (
                  <p className="text-center text-sm text-gray-500">{t?.alreadyCancelled || 'This appointment is already cancelled.'}</p>
                ) : (
                  <button
                    onClick={cancel}
                    disabled={loading}
                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    {loading ? '...' : (t?.cancelBtn || 'Cancel This Appointment')}
                  </button>
                )}
                <button
                  onClick={() => { setResult(null); setConfirmNum('') }}
                  className="w-full py-2 text-sm text-gray-400 hover:text-gray-600"
                >
                  ← {t?.back || 'Back'}
                </button>
              </div>
            )}
          </>
        )}

        <p className="text-center text-xs text-gray-400">
          {t?.needHelp || 'Need help?'}{' '}
          <a href="https://lifewayprograms.org" className="text-lifeway-pink hover:underline">lifewayprograms.org</a>
        </p>
      </div>
    </div>
  )
}
