import { useState, useEffect } from 'react'
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const API = 'http://localhost:8000'
const PER_PAGE = 50

function typeBadge(type) {
  const map = {
    client: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    ticket: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    appointment: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    donation: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  }
  return map[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
}

function actionBadge(action) {
  const map = {
    created: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    updated: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    status_changed: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    assigned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    note_added: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  }
  return map[action] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
}

function fmtDate(s) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default function AuditLog() {
  const token = localStorage.getItem('token')
  const [logs, setLogs] = useState([])
  const [filtered, setFiltered] = useState([])
  const [entityFilter, setEntityFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    fetch(`${API}/activity`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setLogs).catch(() => {})
  }, [token])

  useEffect(() => {
    let f = logs
    if (entityFilter !== 'all') f = f.filter(l => l.entity_type === entityFilter)
    if (search) {
      const s = search.toLowerCase()
      f = f.filter(l => l.actor?.toLowerCase().includes(s) || l.detail?.toLowerCase().includes(s) || l.action?.toLowerCase().includes(s))
    }
    setFiltered(f)
    setPage(0)
  }, [logs, entityFilter, search])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const pageItems = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  return (
    <div className="max-w-6xl mx-auto px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <FileText size={24} className="text-lifeway-pink" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Log</h1>
        <span className="text-sm text-gray-400">{filtered.length} entries</span>
      </div>

      <div className="flex gap-3">
        <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="input">
          <option value="all">All types</option>
          <option value="client">Client</option>
          <option value="ticket">Ticket</option>
          <option value="appointment">Appointment</option>
          <option value="donation">Donation</option>
        </select>
        <input
          type="text"
          placeholder="Search by actor or detail..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input flex-1"
        />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Time</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Action</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {pageItems.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">No activity found.</td></tr>
            ) : pageItems.map(log => (
              <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{fmtDate(log.created_at)}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${typeBadge(log.entity_type)}`}>{log.entity_type}</span>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {log.entity_type === 'client' ? (
                    <Link to={`/clients/${log.entity_id}`} className="text-lifeway-pink hover:underline">#{log.entity_id}</Link>
                  ) : log.entity_type === 'ticket' ? (
                    <Link to="/tickets" className="text-lifeway-pink hover:underline">#{log.entity_id}</Link>
                  ) : `#${log.entity_id}`}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${actionBadge(log.action)}`}>{log.action?.replace(/_/g, ' ')}</span>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{log.actor}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">{log.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Page {page + 1} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-secondary px-3 py-1.5 disabled:opacity-40"><ChevronLeft size={16} /></button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="btn-secondary px-3 py-1.5 disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  )
}
