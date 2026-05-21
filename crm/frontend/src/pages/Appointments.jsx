import { useEffect, useState } from 'react'
import { Plus, X, Download, ChevronLeft, ChevronRight, List, Calendar as CalendarIcon } from 'lucide-react'
import api from '../api'
import { useToast } from '../context/ToastContext'

const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-yellow-100 text-yellow-700',
}

const PAGE_SIZE = 20

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8) // 8am to 6pm

function getWeekDates() {
  const now = new Date()
  const day = now.getDay() // 0=Sun
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function ApptForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    client_id: '', staff_id: '', appointment_date: '',
    duration_minutes: 60, appointment_type: '', service_type: '',
    status: 'scheduled', location: '', notes: '',
  })
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceCount, setRecurrenceCount] = useState(8)

  async function submit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      client_id: Number(form.client_id),
      is_recurring: isRecurring,
      recurrence_count: isRecurring ? recurrenceCount : 1,
      recurrence_interval_days: 7,
    }
    try {
      if (initial?.id) await api.patch(`/appointments/${initial.id}`, payload)
      else await api.post('/appointments/', payload)
      if (isRecurring) {
        onSave(`Created ${recurrenceCount} recurring appointments.`)
      } else {
        onSave()
      }
    } catch {
      onSave(null, true) // signal error to parent
    }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{initial?.id ? 'Edit Appointment' : 'Schedule Appointment'}</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={submit} className="p-6 grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client ID *</label><input className="input" type="number" value={form.client_id} onChange={set('client_id')} required /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Staff ID</label><input className="input" type="number" value={form.staff_id} onChange={set('staff_id')} /></div>
          <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time *</label><input className="input" type="datetime-local" value={form.appointment_date} onChange={set('appointment_date')} required /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select className="input" value={form.appointment_type} onChange={set('appointment_type')}>
              <option value="">Select...</option>
              <option value="intake">Intake</option>
              <option value="therapy">Therapy</option>
              <option value="medical">Medical</option>
              <option value="social">Social Services</option>
              <option value="follow_up">Follow-up</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select className="input" value={form.status} onChange={set('status')}>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (min)</label><input className="input" type="number" value={form.duration_minutes} onChange={set('duration_minutes')} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label><input className="input" value={form.location} onChange={set('location')} /></div>
          <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label><textarea className="input" rows={3} value={form.notes} onChange={set('notes')} /></div>
          <div className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={e => setIsRecurring(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="recurring" className="text-sm text-gray-700 dark:text-gray-300">Repeat weekly</label>
          </div>
          {isRecurring && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Number of sessions
              </label>
              <input
                type="number"
                min={2}
                max={52}
                value={recurrenceCount}
                onChange={e => setRecurrenceCount(Number(e.target.value))}
                className="input w-32"
              />
            </div>
          )}
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CalendarView({ appts, clientNames, staffNames }) {
  const weekDates = getWeekDates()

  function getApptForSlot(dayIndex, hour) {
    const day = weekDates[dayIndex]
    return appts.filter(a => {
      const d = new Date(a.appointment_date)
      return d.getDate() === day.getDate() &&
        d.getMonth() === day.getMonth() &&
        d.getFullYear() === day.getFullYear() &&
        d.getHours() === hour
    })
  }

  return (
    <div className="card p-0 overflow-hidden dark:bg-gray-800">
      <div className="grid" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-700 border-b border-r border-gray-100 dark:border-gray-600 p-2" />
        {DAYS.map((d, i) => (
          <div key={d} className="bg-gray-50 dark:bg-gray-700 border-b border-r border-gray-100 dark:border-gray-600 p-2 text-center">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{d}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{weekDates[i]?.getDate()}</p>
          </div>
        ))}
        {/* Time slots */}
        {HOURS.map(hour => (
          <>
            <div key={`time-${hour}`} className="border-b border-r border-gray-100 dark:border-gray-600 p-2 text-xs text-gray-400 bg-gray-50 dark:bg-gray-700 flex items-start">
              {hour}:00
            </div>
            {DAYS.map((_, dayIdx) => {
              const slots = getApptForSlot(dayIdx, hour)
              return (
                <div key={`slot-${dayIdx}-${hour}`} className="border-b border-r border-gray-100 dark:border-gray-600 p-1 min-h-[52px] relative">
                  {slots.map(a => (
                    <div key={a.id} className="bg-lifeway-light text-lifeway-pink rounded p-1 text-xs mb-1 truncate">
                      <p className="font-medium truncate">{a.appointment_type || 'Appt'}</p>
                      <p className="truncate text-gray-500">{clientNames[a.client_id] || `#${a.client_id}`}</p>
                    </div>
                  ))}
                </div>
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}

export default function Appointments() {
  const { toast } = useToast()
  const [appts, setAppts] = useState([])
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState('list')
  const [clientNames, setClientNames] = useState({})
  const [staffNames, setStaffNames] = useState({})

  async function load() {
    const params = { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }
    if (statusFilter) params.status = statusFilter
    const { data } = await api.get('/appointments/', { params })
    const list = Array.isArray(data) ? data : (data.results || data)
    const count = Array.isArray(data) ? data.length : (data.count || list.length)
    setAppts(list)
    setTotal(count)

    // Resolve client names
    const clientIds = [...new Set(list.map(a => a.client_id).filter(Boolean))]
    const staffIds = [...new Set(list.map(a => a.staff_id).filter(Boolean))]

    const clientMap = {}
    const staffMap = {}

    await Promise.allSettled(
      clientIds.map(id =>
        api.get(`/clients/${id}`).then(r => {
          clientMap[id] = `${r.data.first_name} ${r.data.last_name}`
        }).catch(() => {
          clientMap[id] = `Client #${id}`
        })
      )
    )
    await Promise.allSettled(
      staffIds.map(id =>
        api.get(`/staff/${id}`).then(r => {
          staffMap[id] = `${r.data.first_name} ${r.data.last_name}`
        }).catch(() => {
          staffMap[id] = `Staff #${id}`
        })
      )
    )

    setClientNames(clientMap)
    setStaffNames(staffMap)
  }

  useEffect(() => { load() }, [statusFilter, page])
  useEffect(() => { setPage(1) }, [statusFilter])

  async function deleteAppt(id) {
    if (!confirm('Delete this appointment?')) return
    try {
      await api.delete(`/appointments/${id}`)
      toast('Appointment deleted.', 'success')
      load()
    } catch {
      toast('Something went wrong.', 'error')
    }
  }

  async function exportCsv() {
    try {
      const res = await api.get('/appointments/export/csv', { responseType: 'blob' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(res.data)
      a.download = 'appointments.csv'
      a.click()
    } catch {
      const header = 'ID,Client,Date,Type,Status,Location'
      const csv = [header, ...appts.map(a =>
        `${a.id},"${clientNames[a.client_id] || `#${a.client_id}`}","${a.appointment_date}","${a.appointment_type || ''}","${a.status}","${a.location || ''}"`)
      ].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const el = document.createElement('a')
      el.href = URL.createObjectURL(blob)
      el.download = 'appointments.csv'
      el.click()
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const start = (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, total)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{total} records</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCsv} className="btn-secondary flex items-center gap-2">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Schedule
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-6 items-center">
        <select className="input w-48" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
        </select>
        <div className="ml-auto flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <List size={15} /> List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <CalendarIcon size={15} /> Week
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <CalendarView appts={appts} clientNames={clientNames} staffNames={staffNames} />
      ) : (
        <>
          <div className="card p-0 overflow-hidden dark:bg-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Date & Time</th>
                  <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Client</th>
                  <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Staff</th>
                  <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Type</th>
                  <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Location</th>
                  <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {appts.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No appointments found.</td></tr>
                )}
                {appts.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {new Date(a.appointment_date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{clientNames[a.client_id] || `Client #${a.client_id}`}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{a.staff_id ? (staffNames[a.staff_id] || `Staff #${a.staff_id}`) : '—'}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 capitalize">{a.appointment_type || '—'}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{a.location || '—'}</td>
                    <td className="px-6 py-4"><span className={`badge ${STATUS_COLORS[a.status]}`}>{a.status}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setEditing(a); setShowForm(true) }} className="text-lifeway-pink hover:underline text-xs">Edit</button>
                        <button onClick={() => deleteAppt(a.id)} className="text-red-400 hover:underline text-xs">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Showing {start}–{end} of {total}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary p-2 disabled:opacity-40">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300 px-2">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary p-2 disabled:opacity-40">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showForm && <ApptForm initial={editing} onSave={(msg, isError) => { if (isError) { toast('Something went wrong.', 'error'); return; } setShowForm(false); load(); toast(msg || (editing?.id ? 'Appointment updated.' : 'Appointment scheduled.'), 'success') }} onClose={() => setShowForm(false)} />}
    </div>
  )
}
