import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Calendar, Users, Clock, CheckCircle, AlertCircle, Settings2, CalendarDays } from 'lucide-react'
import api from '../api'

const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  no_show: 'bg-red-100 text-red-700',
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function AvailabilityPanel({ staffId }) {
  const [slots, setSlots] = useState(
    DAY_NAMES.map((_, i) => ({ enabled: i < 5, startHour: 9, endHour: 17 }))
  )
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get(`/staff/${staffId}/availability`).then(({ data }) => {
      if (data.length > 0) {
        const next = DAY_NAMES.map(() => ({ enabled: false, startHour: 9, endHour: 17 }))
        data.forEach(s => { next[s.day_of_week] = { enabled: true, startHour: s.start_hour, endHour: s.end_hour } })
        setSlots(next)
      }
      setLoaded(true)
    })
  }, [staffId])

  async function save() {
    setSaving(true)
    setSaved(false)
    const payload = slots
      .map((s, i) => s.enabled ? { day_of_week: i, start_hour: s.startHour, end_hour: s.endHour } : null)
      .filter(Boolean)
    await api.put(`/staff/${staffId}/availability`, { slots: payload })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const fmt = h => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`
  const hourOptions = Array.from({ length: 25 }, (_, i) => i)

  if (!loaded) return <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500" /></div>

  return (
    <div>
      <div className="space-y-2">
        {DAY_NAMES.map((day, i) => (
          <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${slots[i].enabled ? 'border-pink-200 bg-pink-50' : 'border-gray-100 bg-gray-50'}`}>
            <input
              type="checkbox"
              checked={slots[i].enabled}
              onChange={e => setSlots(s => s.map((x, j) => j === i ? { ...x, enabled: e.target.checked } : x))}
              className="rounded border-gray-300 text-pink-500"
            />
            <span className="text-xs font-semibold text-gray-600 w-20 flex-shrink-0">{day.slice(0, 3)}</span>
            {slots[i].enabled ? (
              <div className="flex items-center gap-1.5 flex-1">
                <select className="input py-1 text-xs flex-1" value={slots[i].startHour}
                  onChange={e => setSlots(s => s.map((x, j) => j === i ? { ...x, startHour: parseInt(e.target.value) } : x))}>
                  {hourOptions.filter(h => h < slots[i].endHour).map(h => <option key={h} value={h}>{fmt(h)}</option>)}
                </select>
                <span className="text-xs text-gray-400">–</span>
                <select className="input py-1 text-xs flex-1" value={slots[i].endHour}
                  onChange={e => setSlots(s => s.map((x, j) => j === i ? { ...x, endHour: parseInt(e.target.value) } : x))}>
                  {hourOptions.filter(h => h > slots[i].startHour).map(h => <option key={h} value={h}>{fmt(h)}</option>)}
                </select>
              </div>
            ) : (
              <span className="text-xs text-gray-400 italic">Off</span>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="mt-4 w-full py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Availability'}
      </button>
    </div>
  )
}


function GoogleCalendarCard({ staffId }) {
  const [status, setStatus] = useState(null)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    api.get('/staff/me/google/status').then(r => setStatus(r.data)).catch(() => {})
  }, [])

  const justConnected = searchParams.get('calendar') === 'connected'

  function connect() {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/staff/me/google/auth`
  }

  async function disconnect() {
    await api.delete('/staff/me/google/disconnect')
    setStatus(s => ({ ...s, connected: false }))
  }

  if (!status) return null

  return (
    <div className={`rounded-xl border p-4 ${status.connected || justConnected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center gap-2 mb-2">
        <CalendarDays size={16} className={status.connected || justConnected ? 'text-green-600' : 'text-gray-400'} />
        <span className="text-sm font-semibold text-gray-800">Google Calendar</span>
        {(status.connected || justConnected) && (
          <span className="ml-auto text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full">Connected</span>
        )}
      </div>
      {status.connected || justConnected ? (
        <div>
          <p className="text-xs text-gray-500 mb-3">Your personal Google Calendar is linked. Busy times are automatically excluded from patient booking slots.</p>
          <button onClick={disconnect} className="text-xs text-red-500 hover:text-red-700 underline">Disconnect</button>
        </div>
      ) : (
        <div>
          <p className="text-xs text-gray-500 mb-3">Link your Google Calendar so patients can only book during your actually available hours.</p>
          {status.error ? (
            <p className="text-xs text-amber-600">{status.error}</p>
          ) : (
            <button onClick={connect} className="w-full py-1.5 border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Connect Google Calendar
            </button>
          )}
        </div>
      )}
    </div>
  )
}


export default function MySchedule() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAvail, setShowAvail] = useState(false)

  useEffect(() => {
    api.get('/appointments/my-schedule')
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  if (!data || !data.staff_found) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="card p-8 text-center">
          <AlertCircle size={40} className="text-amber-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No Staff Record Linked</h2>
          <p className="text-sm text-gray-500">
            {data?.message || 'Your user account is not linked to a staff profile. Contact your administrator.'}
          </p>
          <p className="text-xs text-gray-400 mt-4">
            To fix: have an admin ensure your user email matches the email on your staff record under{' '}
            <Link to="/staff" className="text-lifeway-pink hover:underline">Staff & Volunteers</Link>.
          </p>
        </div>
      </div>
    )
  }

  const { staff, appointments_today, appointments_this_week, upcoming, my_clients } = data
  const todayAppts = upcoming.filter(a => a.is_today)
  const laterAppts = upcoming.filter(a => !a.is_today)

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lifeway-light flex items-center justify-center">
            <Calendar size={20} className="text-lifeway-pink" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
            <p className="text-gray-500 text-sm">
              {staff.title ? `${staff.title} ` : ''}{staff.first_name} {staff.last_name} · {staff.role.replace('_', ' ')}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAvail(v => !v)}
          className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-colors ${showAvail ? 'bg-pink-50 border-pink-300 text-pink-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
        >
          <Settings2 size={15} /> Availability
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <div className="text-2xl font-bold text-gray-900">{appointments_today}</div>
          <div className="text-sm text-gray-500 mt-1">Today</div>
        </div>
        <div className="card p-5">
          <div className="text-2xl font-bold text-gray-900">{appointments_this_week}</div>
          <div className="text-sm text-gray-500 mt-1">This Week</div>
        </div>
        <div className="card p-5">
          <div className="text-2xl font-bold text-gray-900">{my_clients.length}</div>
          <div className="text-sm text-gray-500 mt-1">Active Clients</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
              <Clock size={14} /> Today
            </h2>
            {todayAppts.length === 0 ? (
              <div className="card p-6 text-center">
                <CheckCircle size={28} className="text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No appointments today</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayAppts.map(a => (
                  <Link key={a.id} to={`/clients/${a.client_id}`}
                    className="card p-4 flex items-center gap-4 hover:border-lifeway-pink/30 transition-colors block">
                    <div className="text-center w-14 flex-shrink-0">
                      <div className="text-lg font-bold text-lifeway-pink leading-none">{fmtTime(a.appointment_date)}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">{a.client_name}</div>
                      <div className="text-xs text-gray-500 capitalize mt-0.5">
                        {(a.service_type || '').replace('_', ' ')}
                        {a.confirmation_number && <span className="ml-2 text-gray-400">{a.confirmation_number}</span>}
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[a.status] || ''}`}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming */}
          {laterAppts.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                <Calendar size={14} /> Upcoming This Week
              </h2>
              <div className="space-y-2">
                {laterAppts.map(a => (
                  <Link key={a.id} to={`/clients/${a.client_id}`}
                    className="card p-4 flex items-center gap-4 hover:border-lifeway-pink/30 transition-colors block">
                    <div className="text-center w-14 flex-shrink-0">
                      <div className="text-xs font-semibold text-gray-500 uppercase">{fmtDate(a.appointment_date).split(',')[0]}</div>
                      <div className="text-sm font-bold text-gray-700">{fmtTime(a.appointment_date)}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">{a.client_name}</div>
                      <div className="text-xs text-gray-500 capitalize mt-0.5">
                        {(a.service_type || '').replace('_', ' ')}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0">
                      {fmtDate(a.appointment_date).split(', ')[1]}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Availability panel */}
          {showAvail && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                <Settings2 size={14} /> My Availability
              </h2>
              <div className="card p-4">
                <AvailabilityPanel staffId={staff.id} />
              </div>
            </div>
          )}

          {/* Google Calendar */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Calendar Sync</h2>
            <GoogleCalendarCard staffId={staff.id} />
          </div>

          {/* My Clients */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
              <Users size={14} /> My Clients
            </h2>
            {my_clients.length === 0 ? (
              <div className="card p-5 text-center">
                <p className="text-sm text-gray-400">No clients assigned yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {my_clients.map(c => (
                  <Link key={c.id} to={`/clients/${c.id}`}
                    className="card p-3 flex items-center gap-3 hover:border-lifeway-pink/30 transition-colors block">
                    <div className="w-8 h-8 rounded-full bg-lifeway-light flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-lifeway-pink">
                        {c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{c.name}</div>
                      {c.primary_service && (
                        <div className="text-xs text-gray-400 capitalize">{c.primary_service.replace('_', ' ')}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
