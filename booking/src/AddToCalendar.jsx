import { useState } from 'react'

function makeICS({ name, datetime, durationMinutes = 60, service, provider, location }) {
  // datetime is an ISO string like "2025-03-15T10:00:00"
  const start = new Date(datetime)
  const end = new Date(start.getTime() + durationMinutes * 60000)

  const pad = n => String(n).padStart(2, '0')
  const fmt = d =>
    `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lifeway Programs//Booking//EN',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${service ? `${service} - ` : ''}Lifeway Programs Appointment`,
    `DESCRIPTION:Provider: ${provider || 'To Be Assigned'}\\nConfirmation: ${name}`,
    `LOCATION:${location || 'Lifeway Programs'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

function makeGoogleCalLink({ datetime, durationMinutes = 60, service, provider }) {
  const start = new Date(datetime)
  const end = new Date(start.getTime() + durationMinutes * 60000)
  const pad = n => String(n).padStart(2, '0')
  const fmt = d =>
    `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}Z`

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${service ? `${service} - ` : ''}Lifeway Programs Appointment`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `Provider: ${provider || 'To Be Assigned'}`,
    location: 'Lifeway Programs',
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

export default function AddToCalendar({ datetime, service, provider, confirmationNumber, t }) {
  // t is the translation object (for future i18n) — use English labels as fallback
  const label = t?.addToCalendar || 'Add to Calendar'
  const googleLabel = t?.googleCal || 'Google Calendar'
  const downloadLabel = t?.downloadIcs || 'Download .ics'
  const [open, setOpen] = useState(false)

  if (!datetime) return null

  function downloadICS() {
    const ics = makeICS({ name: confirmationNumber, datetime, service, provider })
    const blob = new Blob([ics], { type: 'text/calendar' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'lifeway-appointment.ics'
    a.click()
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full py-3 border-2 border-lifeway-pink text-lifeway-pink font-semibold rounded-lg hover:bg-lifeway-light transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {label}
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
          <a
            href={makeGoogleCalLink({ datetime, service, provider })}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-gray-700"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
            {googleLabel}
          </a>
          <button
            onClick={downloadICS}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-gray-700 border-t border-gray-100"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {downloadLabel}
          </button>
        </div>
      )}
    </div>
  )
}
