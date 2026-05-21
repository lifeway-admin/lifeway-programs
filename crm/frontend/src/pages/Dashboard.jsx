import { useEffect, useState } from 'react'
import { Users, Calendar, DollarSign, UserCheck, Plus, X, Tag } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import StatCard from '../components/StatCard'
import api from '../api'
import { useToast } from '../context/ToastContext'

const SERVICE_DATA = [
  { name: 'Mental Health', value: 142, fill: '#c52177' },
  { name: 'Medical', value: 98, fill: '#7c3aed' },
  { name: 'Social', value: 87, fill: '#2563eb' },
  { name: 'Spiritual', value: 54, fill: '#d97706' },
  { name: 'Food', value: 76, fill: '#16a34a' },
  { name: 'Employment', value: 63, fill: '#0891b2' },
  { name: 'Wellness', value: 45, fill: '#db2777' },
]

const SERVICES = ['mental_health', 'medical', 'social', 'spiritual', 'food', 'employment', 'housing', 'wellness']

function QuickClientModal({ onClose, onSave }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', primary_service: '', case_status: 'active' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  async function submit(e) {
    e.preventDefault()
    await api.post('/clients/', form)
    onSave()
  }
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white">New Client</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label><input className="input" value={form.first_name} onChange={set('first_name')} required /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label><input className="input" value={form.last_name} onChange={set('last_name')} required /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input className="input" type="email" value={form.email} onChange={set('email')} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Service</label>
            <select className="input" value={form.primary_service} onChange={set('primary_service')}>
              <option value="">Select...</option>
              {SERVICES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add Client</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function QuickApptModal({ onClose, onSave }) {
  const [form, setForm] = useState({ client_id: '', appointment_date: '', appointment_type: 'intake', status: 'scheduled' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  async function submit(e) {
    e.preventDefault()
    await api.post('/appointments/', { ...form, client_id: Number(form.client_id) })
    onSave()
  }
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Schedule Appointment</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client ID *</label><input className="input" type="number" value={form.client_id} onChange={set('client_id')} required /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time *</label><input className="input" type="datetime-local" value={form.appointment_date} onChange={set('appointment_date')} required /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select className="input" value={form.appointment_type} onChange={set('appointment_type')}>
              <option value="intake">Intake</option>
              <option value="therapy">Therapy</option>
              <option value="medical">Medical</option>
              <option value="social">Social Services</option>
              <option value="follow_up">Follow-up</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Schedule</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState(null)
  const [todayAppts, setTodayAppts] = useState([])
  const [alerts, setAlerts] = useState({ birthdays_this_week: [], expiring_insurance: [] })
  const [loading, setLoading] = useState(true)
  const [showClientModal, setShowClientModal] = useState(false)
  const [showApptModal, setShowApptModal] = useState(false)

  async function load() {
    try {
      const [s, a] = await Promise.all([
        api.get('/dashboard'),
        api.get('/appointments/today'),
      ])
      setStats(s.data)
      setTodayAppts(a.data)
    } finally {
      setLoading(false)
    }
    api.get('/dashboard/alerts').then(r => setAlerts(r.data)).catch(() => {})
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="p-8 text-gray-400 dark:text-gray-500">Loading...</div>

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowClientModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={15} /> New Client
          </button>
          <button onClick={() => setShowApptModal(true)} className="btn-secondary flex items-center gap-2">
            <Plus size={15} /> Schedule Appointment
          </button>
        </div>
      </div>

      {(alerts.birthdays_this_week.length > 0 || alerts.expiring_insurance.length > 0) && (
        <div className="card p-5 border-l-4 border-yellow-400 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔔</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">Alerts</h3>
          </div>
          <div className="space-y-2">
            {alerts.birthdays_this_week.map(c => (
              <div key={`bday-${c.id}`} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">🎂 <strong>{c.name}</strong>'s birthday is this week</span>
                <a href={`/clients/${c.id}`} className="text-lifeway-pink hover:underline text-xs">View →</a>
              </div>
            ))}
            {alerts.expiring_insurance.map(c => (
              <div key={`ins-${c.id}`} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">📋 <strong>{c.name}</strong>'s insurance expires {new Date(c.insurance_expiry).toLocaleDateString()}</span>
                <a href={`/clients/${c.id}`} className="text-lifeway-pink hover:underline text-xs">View →</a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Clients" value={stats.total_clients} sub={`${stats.active_clients} active`} icon={Users} color="pink" />
        <StatCard label="Appointments Today" value={stats.appointments_today} sub={`${stats.total_appointments} total`} icon={Calendar} color="blue" />
        <StatCard label="Total Raised" value={`$${stats.total_donations?.toLocaleString() ?? 0}`} sub={`$${stats.donations_this_month?.toLocaleString() ?? 0} this month`} icon={DollarSign} color="green" />
        <StatCard label="Staff" value={stats.total_staff} sub={`${stats.active_volunteers} volunteers`} icon={UserCheck} color="purple" />
        <StatCard label="Open Tickets" value={stats.open_tickets ?? '—'} sub="support tickets" icon={Tag} color="pink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar chart */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Clients by Service</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SERVICE_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: '#f9e8f2' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {SERVICE_DATA.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Today's appointments */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-lifeway-pink" /> Today's Appointments
          </h2>
          {todayAppts.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm">No appointments scheduled today.</p>
          ) : (
            <div className="space-y-3">
              {todayAppts.map(a => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Client #{a.client_id}</p>
                    <p className="text-xs text-gray-400">{a.service_type || a.appointment_type || 'General'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(a.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <span className={`badge ${a.status === 'completed' ? 'bg-green-100 text-green-700' : a.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {a.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showClientModal && (
        <QuickClientModal
          onClose={() => setShowClientModal(false)}
          onSave={() => { setShowClientModal(false); load(); toast('Client added.', 'success') }}
        />
      )}
      {showApptModal && (
        <QuickApptModal
          onClose={() => setShowApptModal(false)}
          onSave={() => { setShowApptModal(false); load(); toast('Appointment scheduled.', 'success') }}
        />
      )}
    </div>
  )
}
