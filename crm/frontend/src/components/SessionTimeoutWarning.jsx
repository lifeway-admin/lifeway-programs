import { useState, useEffect } from 'react'
import { AlertTriangle, X, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function getExpiry() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp ? payload.exp * 1000 : null
  } catch { return null }
}

export default function SessionTimeoutWarning() {
  const [minutesLeft, setMinutesLeft] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    function check() {
      const exp = getExpiry()
      if (!exp) return
      const ms = exp - Date.now()
      const mins = Math.floor(ms / 60000)
      if (mins <= 10) setMinutesLeft(mins)
      else setMinutesLeft(null)
    }
    check()
    const id = setInterval(check, 60000)
    return () => clearInterval(id)
  }, [])

  if (minutesLeft === null || dismissed) return null

  const isUrgent = minutesLeft <= 2
  const borderColor = isUrgent ? 'border-red-400' : 'border-yellow-400'
  const iconColor = isUrgent ? 'text-red-500' : 'text-yellow-500'

  return (
    <div className={`fixed bottom-4 right-4 z-50 card max-w-sm shadow-xl border-l-4 ${borderColor} p-4`}>
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className={`${iconColor} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {isUrgent ? 'Session expiring now' : 'Session expiring soon'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {minutesLeft <= 0 ? 'Your session has expired.' : `${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''} remaining.`}
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setDismissed(true)}
              className="text-xs btn-secondary px-2 py-1"
            >
              Dismiss
            </button>
            <button
              onClick={() => { localStorage.removeItem('token'); navigate('/login') }}
              className="text-xs btn-primary px-2 py-1 flex items-center gap-1"
            >
              <LogOut size={12} /> Log out
            </button>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
