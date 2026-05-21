import { useEffect, useState } from 'react'
import { Plus, X, Search, ChevronDown, MessageSquare, Tag, AlertCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import api from '../api'
import { useToast } from '../context/ToastContext'

const PRIORITY_COLORS = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-gray-100 text-gray-600',
}

const TYPE_COLORS = {
  call: 'bg-purple-100 text-purple-700',
  email: 'bg-blue-100 text-blue-700',
  inquiry: 'bg-green-100 text-green-700',
  complaint: 'bg-red-100 text-red-700',
  follow_up: 'bg-yellow-100 text-yellow-700',
  internal: 'bg-gray-100 text-gray-600',
  walk_in: 'bg-teal-100 text-teal-700',
}

const STATUS_TABS = ['all', 'open', 'in_progress', 'resolved', 'closed']

function TicketForm({ onSave, onClose, toast }) {
  const [form, setForm] = useState({
    title: '', type: 'inquiry', priority: 'medium', channel: 'walk_in',
    description: '', client_id: '', assigned_to: '',
  })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    const payload = { ...form }
    if (payload.client_id) payload.client_id = Number(payload.client_id)
    else delete payload.client_id
    if (payload.assigned_to) payload.assigned_to = Number(payload.assigned_to)
    else delete payload.assigned_to
    try {
      await api.post('/tickets/', payload)
      toast('Ticket created.', 'success')
      onSave()
    } catch {
      toast('Failed to update ticket.', 'error')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white">New Ticket</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={submit} className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input className="input" value={form.title} onChange={set('title')} required placeholder="Brief description..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select className="input" value={form.type} onChange={set('type')}>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="inquiry">Inquiry</option>
              <option value="complaint">Complaint</option>
              <option value="follow_up">Follow Up</option>
              <option value="internal">Internal</option>
              <option value="walk_in">Walk In</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select className="input" value={form.priority} onChange={set('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Channel</label>
            <select className="input" value={form.channel} onChange={set('channel')}>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="walk_in">Walk In</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client ID</label>
            <input className="input" type="number" value={form.client_id} onChange={set('client_id')} placeholder="Optional" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign to (Staff ID)</label>
            <input className="input" type="number" value={form.assigned_to} onChange={set('assigned_to')} placeholder="Optional" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea className="input" rows={4} value={form.description} onChange={set('description')} placeholder="Detailed description..." />
          </div>
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Ticket</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CommentSection({ ticketId, toast }) {
  const [comments, setComments] = useState([])
  const [form, setForm] = useState({ author: '', content: '' })
  const [loading, setLoading] = useState(false)

  async function loadComments() {
    try {
      const { data } = await api.get(`/tickets/${ticketId}/comments/`)
      setComments(Array.isArray(data) ? data : (data.results || []))
    } catch {
      setComments([])
    }
  }

  useEffect(() => { loadComments() }, [ticketId])

  async function addComment(e) {
    e.preventDefault()
    if (!form.content.trim()) return
    setLoading(true)
    try {
      await api.post(`/tickets/${ticketId}/comments/`, form)
      setForm({ author: '', content: '' })
      loadComments()
      toast('Comment added.', 'success')
    } catch {
      toast('Failed to update ticket.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <MessageSquare size={16} className="text-lifeway-pink" /> Comments ({comments.length})
      </h3>
      <div className="space-y-3 mb-4">
        {comments.length === 0 && <p className="text-sm text-gray-400">No comments yet.</p>}
        {comments.map((c, i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{c.author || 'Anonymous'}</span>
              <span className="text-xs text-gray-400">{c.created_at ? formatDistanceToNow(new Date(c.created_at), { addSuffix: true }) : ''}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{c.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={addComment} className="space-y-2">
        <input
          className="input"
          placeholder="Your name (optional)"
          value={form.author}
          onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
        />
        <textarea
          className="input"
          rows={2}
          placeholder="Add a comment..."
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          required
        />
        <button type="submit" disabled={loading} className="btn-primary text-sm py-1.5">
          {loading ? 'Posting...' : 'Add Comment'}
        </button>
      </form>
    </div>
  )
}

function TicketDetail({ ticket, onClose, onUpdate, toast }) {
  const [status, setStatus] = useState(ticket.status)
  const [priority, setPriority] = useState(ticket.priority)
  const [saving, setSaving] = useState(false)

  async function save(field, value) {
    setSaving(true)
    try {
      await api.patch(`/tickets/${ticket.id}`, { [field]: value })
      toast('Ticket updated.', 'success')
      onUpdate()
    } catch {
      toast('Failed to update ticket.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function resolve() {
    await save('status', 'resolved')
    setStatus('resolved')
    toast('Ticket marked as resolved.', 'success')
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 w-full sm:rounded-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-400">#{ticket.ticket_number}</span>
            <span className={`badge ${TYPE_COLORS[ticket.type] || 'bg-gray-100 text-gray-600'}`}>{ticket.type}</span>
          </div>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{ticket.title}</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</label>
              <select
                className="input"
                value={status}
                onChange={e => { setStatus(e.target.value); save('status', e.target.value) }}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Priority</label>
              <select
                className="input"
                value={priority}
                onChange={e => { setPriority(e.target.value); save('priority', e.target.value) }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Channel</label>
              <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">{ticket.channel || '—'}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Client</label>
              <p className="text-sm text-gray-700 dark:text-gray-300">{ticket.client_id ? `#${ticket.client_id}` : '—'}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Assigned To</label>
              <p className="text-sm text-gray-700 dark:text-gray-300">{ticket.assigned_to ? `Staff #${ticket.assigned_to}` : 'Unassigned'}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Created</label>
              <p className="text-sm text-gray-700 dark:text-gray-300">{ticket.created_at ? formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true }) : '—'}</p>
            </div>
          </div>

          {ticket.description && (
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</label>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700 rounded-lg p-3">{ticket.description}</p>
            </div>
          )}

          {status !== 'resolved' && status !== 'closed' && (
            <button onClick={resolve} className="btn-primary mb-6 flex items-center gap-2">
              <AlertCircle size={15} /> Mark as Resolved
            </button>
          )}

          <CommentSection ticketId={ticket.id} toast={toast} />
        </div>
      </div>
    </div>
  )
}

export default function Tickets() {
  const { toast } = useToast()
  const [tickets, setTickets] = useState([])
  const [stats, setStats] = useState(null)
  const [statusTab, setStatusTab] = useState('all')
  const [priority, setPriority] = useState('')
  const [type, setType] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('lw_ticket_filters') || '{}')
      if (saved.status) setStatusTab(saved.status)
      if (saved.priority) setPriority(saved.priority)
      if (saved.type) setType(saved.type)
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('lw_ticket_filters', JSON.stringify({
      status: statusTab,
      priority: priority,
      type: type,
    }))
  }, [statusTab, priority, type])

  async function load() {
    setLoading(true)
    const params = {}
    if (statusTab !== 'all') params.status = statusTab
    if (priority) params.priority = priority
    if (type) params.type = type
    if (search) params.search = search
    try {
      const [tr, sr] = await Promise.allSettled([
        api.get('/tickets/', { params }),
        api.get('/tickets/stats'),
      ])
      if (tr.status === 'fulfilled') {
        const data = tr.value.data
        setTickets(Array.isArray(data) ? data : (data.results || []))
      }
      if (sr.status === 'fulfilled') setStats(sr.value.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusTab, priority, type, search])

  function openTicket(t) { setSelected(t) }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tickets</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{tickets.length} tickets</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Ticket
        </button>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Open', value: stats.open ?? '—', color: 'text-blue-600' },
            { label: 'In Progress', value: stats.in_progress ?? '—', color: 'text-yellow-600' },
            { label: 'Resolved', value: stats.resolved ?? '—', color: 'text-green-600' },
            { label: 'Closed', value: stats.closed ?? '—', color: 'text-gray-500' },
          ].map(s => (
            <div key={s.label} className="card dark:bg-gray-800 text-center py-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {STATUS_TABS.map(s => (
            <button
              key={s}
              onClick={() => setStatusTab(s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${statusTab === s ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <select className="input w-36 py-1.5" value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="input w-36 py-1.5" value={type} onChange={e => setType(e.target.value)}>
          <option value="">All types</option>
          <option value="call">Call</option>
          <option value="email">Email</option>
          <option value="inquiry">Inquiry</option>
          <option value="complaint">Complaint</option>
          <option value="follow_up">Follow Up</option>
          <option value="internal">Internal</option>
          <option value="walk_in">Walk In</option>
        </select>
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9 py-1.5"
            placeholder="Search tickets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Ticket list */}
      <div className="space-y-2">
        {loading && <div className="text-center py-12 text-gray-400">Loading...</div>}
        {!loading && tickets.length === 0 && (
          <div className="card text-center py-12 dark:bg-gray-800">
            <Tag size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400">No tickets found.</p>
          </div>
        )}
        {tickets.map(t => (
          <div
            key={t.id}
            onClick={() => openTicket(t)}
            className="card p-4 cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-800 hover:border-lifeway-pink dark:hover:border-lifeway-pink"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-mono text-gray-400">#{t.ticket_number}</span>
                  <span className={`badge ${TYPE_COLORS[t.type] || 'bg-gray-100 text-gray-600'}`}>{t.type?.replace('_', ' ')}</span>
                  <span className={`badge ${PRIORITY_COLORS[t.priority] || 'bg-gray-100 text-gray-600'}`}>{t.priority}</span>
                  <span className={`badge ${
                    t.status === 'open' ? 'bg-blue-100 text-blue-700' :
                    t.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                    t.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{t.status?.replace('_', ' ')}</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white truncate">{t.title}</p>
                {t.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{t.description}</p>}
              </div>
              <div className="text-right flex-shrink-0 text-xs text-gray-400 space-y-1">
                {t.assigned_to && <p>Staff #{t.assigned_to}</p>}
                {t.created_at && (
                  <p className="flex items-center gap-1 justify-end">
                    <Clock size={11} />
                    {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && <TicketForm onSave={() => { setShowForm(false); load() }} onClose={() => setShowForm(false)} toast={toast} />}
      {selected && <TicketDetail ticket={selected} onClose={() => setSelected(null)} onUpdate={() => { setSelected(null); load() }} toast={toast} />}
    </div>
  )
}
