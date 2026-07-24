import { useEffect, useState } from 'react'
import { Plus, X, Clock, Check, Ban, CalendarOff } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import api from '../api'
import { useToast } from '../context/ToastContext'

const TYPE_LABELS = {
  vacation: 'Vacation',
  sick: 'Sick',
  personal: 'Personal',
  unpaid: 'Unpaid',
  bereavement: 'Bereavement',
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  denied: 'bg-red-100 text-red-700',
}

const STATUS_TABS = ['all', 'pending', 'approved', 'denied']

function RequestForm({ onSave, onClose, toast }) {
  const [form, setForm] = useState({ request_type: 'vacation', start_date: '', end_date: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/time-off/', form)
      toast('Time off requested.', 'success')
      onSave()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to submit request.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Request Time Off</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={submit} className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select className="input" value={form.request_type} onChange={set('request_type')}>
              {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
            <input className="input" type="date" value={form.start_date} onChange={set('start_date')} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date *</label>
            <input className="input" type="date" value={form.end_date} onChange={set('end_date')} required />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea className="input" rows={3} value={form.notes} onChange={set('notes')} placeholder="Optional details..." />
          </div>
          <p className="col-span-2 text-xs text-gray-400">Business days only (Mon-Fri, 8 hrs/day) — does not exclude company holidays.</p>
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Submitting…' : 'Submit Request'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TimeOff() {
  const { toast } = useToast()
  const isAdmin = localStorage.getItem('role') === 'admin'
  const [me, setMe] = useState(null)
  const [statusTab, setStatusTab] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        api.get('/time-off/me'),
        isAdmin ? api.get('/time-off/', { params: { status: 'pending' } }) : Promise.resolve(null),
      ])
      if (results[0].status === 'fulfilled') setMe(results[0].value.data)
      if (isAdmin && results[1].status === 'fulfilled' && results[1].value) setQueue(results[1].value.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function cancelRequest(id) {
    try {
      await api.delete(`/time-off/${id}`)
      toast('Request cancelled.', 'success')
      load()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to cancel.', 'error')
    }
  }

  async function decide(id, action) {
    try {
      await api.patch(`/time-off/${id}/${action}`, {})
      toast(`Request ${action === 'approve' ? 'approved' : 'denied'}.`, 'success')
      load()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to update request.', 'error')
    }
  }

  const requests = me?.requests || []
  const filtered = statusTab === 'all' ? requests : requests.filter(r => r.status === statusTab)

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>

  if (!me) {
    return (
      <div className="p-8">
        <div className="card text-center py-12">
          <CalendarOff size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">No staff record is linked to your account, so time off can't be tracked here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Time Off</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{requests.length} requests on file</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Request Time Off
        </button>
      </div>

      <div className="card mb-6 flex items-center gap-4 dark:bg-gray-800">
        <div className="w-12 h-12 rounded-full bg-lifeway-light flex items-center justify-center flex-shrink-0">
          <Clock size={20} className="text-lifeway-pink" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{me.balance_hours} hrs</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your available PTO balance</p>
        </div>
      </div>

      {isAdmin && queue.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Pending Approvals ({queue.length})</h2>
          <div className="space-y-2">
            {queue.map(r => (
              <div key={r.id} className="card p-4 dark:bg-gray-800 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-gray-900 dark:text-white">{r.staff_name}</span>
                    <span className={`badge ${STATUS_COLORS[r.status]}`}>{TYPE_LABELS[r.request_type] || r.request_type}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {r.start_date} → {r.end_date} · {r.hours_requested} hrs
                  </p>
                  {r.notes && <p className="text-sm text-gray-400 mt-0.5">{r.notes}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => decide(r.id, 'approve')} className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1">
                    <Check size={14} /> Approve
                  </button>
                  <button onClick={() => decide(r.id, 'deny')} className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-1">
                    <Ban size={14} /> Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">My Requests</h2>
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-4 w-fit">
        {STATUS_TABS.map(s => (
          <button
            key={s}
            onClick={() => setStatusTab(s)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${statusTab === s ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="card text-center py-12 dark:bg-gray-800">
            <p className="text-gray-400">No requests found.</p>
          </div>
        )}
        {filtered.map(r => (
          <div key={r.id} className="card p-4 dark:bg-gray-800 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="badge bg-gray-100 text-gray-600">{TYPE_LABELS[r.request_type] || r.request_type}</span>
                <span className={`badge ${STATUS_COLORS[r.status]}`}>{r.status}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{r.start_date} → {r.end_date} · {r.hours_requested} hrs</p>
              {r.notes && <p className="text-sm text-gray-400 mt-0.5">{r.notes}</p>}
              {r.status !== 'pending' && r.reviewed_by && (
                <p className="text-xs text-gray-400 mt-1">
                  {r.status === 'approved' ? 'Approved' : 'Denied'} by {r.reviewed_by}
                  {r.reviewed_at && ` ${formatDistanceToNow(new Date(r.reviewed_at), { addSuffix: true })}`}
                </p>
              )}
            </div>
            {r.status === 'pending' && (
              <button onClick={() => cancelRequest(r.id)} className="text-xs text-gray-500 hover:text-red-600 hover:underline flex-shrink-0">
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>

      {showForm && <RequestForm onSave={() => { setShowForm(false); load() }} onClose={() => setShowForm(false)} toast={toast} />}
    </div>
  )
}
