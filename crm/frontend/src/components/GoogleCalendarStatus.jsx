import { useEffect, useState } from 'react'
import api from '../api'

export default function GoogleCalendarStatus() {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    api.get('/google/status')
      .then(r => setStatus(r.data))
      .catch(() => setStatus(null))
  }, [])

  if (!status) return null

  if (status.connected) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 dark:text-gray-400">
        <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
        Google Calendar synced
      </div>
    )
  }

  return (
    <a
      href="http://localhost:8000/google/auth"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
    >
      <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
      Connect Google Calendar
    </a>
  )
}
