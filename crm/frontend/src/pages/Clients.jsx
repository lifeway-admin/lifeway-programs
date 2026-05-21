import { useEffect, useState } from 'react'
import { Search, Plus, X, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useToast } from '../context/ToastContext'

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-gray-100 text-gray-600',
}

const SERVICES = ['mental_health', 'medical', 'social', 'spiritual', 'food', 'employment', 'housing', 'wellness']
const PAGE_SIZE = 20

function ClientForm({ initial, onSave, onClose }) {
  const { toast } = useToast()
  const [form, setForm] = useState(initial || {
    first_name: '', last_name: '', email: '', phone: '',
    address: '', case_status: 'active', primary_service: '',
    insurance: '', notes: '', emergency_contact_name: '', emergency_contact_phone: '',
  })
  const [duplicates, setDuplicates] = useState([])

  async function submit(e) {
    e.preventDefault()
    try {
      if (initial?.id) {
        await api.patch(`/clients/${initial.id}`, form)
        toast('Client updated.', 'success')
      } else {
        await api.post('/clients/', form)
        toast('Client added successfully.', 'success')
      }
      onSave()
    } catch {
      toast('Failed to save client.', 'error')
    }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function checkDuplicates() {
    if (initial?.id) return
    const { first_name, last_name, email } = form
    if (!first_name && !last_name && !email) return
    try {
      const params = {}
      if (first_name || last_name) params.name = `${first_name} ${last_name}`.trim()
      if (email) params.email = email
      const { data } = await api.get('/clients/duplicates', { params })
      setDuplicates(data)
    } catch {}
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{initial?.id ? 'Edit Client' : 'Add Client'}</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={submit} className="p-6 grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label><input className="input" value={form.first_name} onChange={set('first_name')} required /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label><input className="input" value={form.last_name} onChange={set('last_name')} required onBlur={checkDuplicates} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input className="input" type="email" value={form.email} onChange={set('email')} onBlur={checkDuplicates} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
          <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label><input className="input" value={form.address} onChange={set('address')} /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select className="input" value={form.case_status} onChange={set('case_status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Service</label>
            <select className="input" value={form.primary_service} onChange={set('primary_service')}>
              <option value="">Select...</option>
              {SERVICES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Insurance</label><input className="input" value={form.insurance} onChange={set('insurance')} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Contact</label><input className="input" value={form.emergency_contact_name} onChange={set('emergency_contact_name')} /></div>
          <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label><textarea className="input" rows={3} value={form.notes} onChange={set('notes')} /></div>
          {duplicates.length > 0 && (
            <div className="col-span-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg px-4 py-3 space-y-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">⚠ Possible duplicate{duplicates.length > 1 ? 's' : ''} found:</p>
              {duplicates.slice(0, 2).map(d => (
                <div key={d.id} className="flex items-center justify-between text-xs text-yellow-700 dark:text-yellow-400">
                  <span>{d.first_name} {d.last_name}{d.email ? ` (${d.email})` : ''}</span>
                  <a href={`/clients/${d.id}`} target="_blank" rel="noreferrer" className="underline">View →</a>
                </div>
              ))}
              <p className="text-xs text-yellow-600 dark:text-yellow-500">You can still submit if this is a new client.</p>
            </div>
          )}
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Client</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Clients() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [clients, setClients] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(new Set())
  const [bulkStatus, setBulkStatus] = useState('')

  async function load() {
    const params = { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }
    if (statusFilter) params.status = statusFilter
    if (search) params.search = search
    try {
      const { data } = await api.get('/clients/', { params })
      if (Array.isArray(data)) {
        setClients(data)
        setTotal(data.length)
      } else {
        setClients(data.results || data)
        setTotal(data.count || (data.results?.length ?? 0))
      }
    } catch {
      setClients([])
      setTotal(0)
    }
  }

  useEffect(() => { load() }, [search, statusFilter, page])
  useEffect(() => { setPage(1) }, [search, statusFilter])

  async function deleteClient(id) {
    if (!confirm('Delete this client?')) return
    await api.delete(`/clients/${id}`)
    toast('Client deleted.', 'success')
    load()
  }

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === clients.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(clients.map(c => c.id)))
    }
  }

  async function applyBulkStatus() {
    if (!bulkStatus || selected.size === 0) return
    await Promise.all([...selected].map(id => api.patch(`/clients/${id}`, { case_status: bulkStatus })))
    toast(`Updated ${selected.size} clients.`, 'success')
    setSelected(new Set())
    setBulkStatus('')
    load()
  }

  function exportSelected() {
    const rows = clients.filter(c => selected.has(c.id))
    const header = 'ID,First Name,Last Name,Email,Phone,Status,Service,Intake Date'
    const csv = [header, ...rows.map(c =>
      `${c.id},"${c.first_name}","${c.last_name}","${c.email || ''}","${c.phone || ''}","${c.case_status}","${c.primary_service || ''}","${c.intake_date || ''}"`)
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'clients_selected.csv'
    a.click()
    toast(`Exported ${selected.size} clients.`, 'info')
  }

  async function exportAll() {
    try {
      const res = await api.get('/clients/export/csv', { responseType: 'blob' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(res.data)
      a.download = 'clients.csv'
      a.click()
      toast('Export complete.', 'info')
    } catch {
      // Fallback: build CSV from loaded data
      const { data } = await api.get('/clients/')
      const rows = Array.isArray(data) ? data : (data.results || [])
      const header = 'ID,First Name,Last Name,Email,Phone,Status,Service,Intake Date'
      const csv = [header, ...rows.map(c =>
        `${c.id},"${c.first_name}","${c.last_name}","${c.email || ''}","${c.phone || ''}","${c.case_status}","${c.primary_service || ''}","${c.intake_date || ''}"`)
      ].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'clients.csv'
      a.click()
      toast('Export complete.', 'info')
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const start = (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, total)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{total} records</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportAll} className="btn-secondary flex items-center gap-2">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Client
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-lifeway-light dark:bg-gray-700 rounded-lg">
          <span className="text-sm font-medium text-lifeway-pink">{selected.size} selected</span>
          <select className="input w-40 py-1" value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}>
            <option value="">Change status...</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="closed">Closed</option>
          </select>
          <button onClick={applyBulkStatus} disabled={!bulkStatus} className="btn-primary py-1 text-xs">Apply</button>
          <button onClick={exportSelected} className="btn-secondary py-1 text-xs flex items-center gap-1"><Download size={13} /> Export Selected</button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-gray-400 hover:text-gray-600 ml-auto">Clear</button>
        </div>
      )}

      <div className="card p-0 overflow-hidden dark:bg-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" checked={selected.size === clients.length && clients.length > 0} onChange={toggleAll} className="rounded" />
              </th>
              <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Name</th>
              <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Contact</th>
              <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Service</th>
              <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Status</th>
              <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Intake Date</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {clients.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No clients found.</td></tr>
            )}
            {clients.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-4">
                  <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="rounded" />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  <button
                    onClick={() => navigate(`/clients/${c.id}`)}
                    className="hover:text-lifeway-pink hover:underline transition-colors text-left"
                  >
                    {c.first_name} {c.last_name}
                  </button>
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{c.email || c.phone || '—'}</td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 capitalize">{c.primary_service?.replace('_', ' ') || '—'}</td>
                <td className="px-6 py-4"><span className={`badge ${STATUS_COLORS[c.case_status]}`}>{c.case_status}</span></td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{c.intake_date ? new Date(c.intake_date).toLocaleDateString() : '—'}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setEditing(c); setShowForm(true) }} className="text-lifeway-pink hover:underline text-xs">Edit</button>
                    <button onClick={() => deleteClient(c.id)} className="text-red-400 hover:underline text-xs">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {start}–{end} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary p-2 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300 px-2">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary p-2 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {showForm && <ClientForm initial={editing} onSave={() => { setShowForm(false); load() }} onClose={() => setShowForm(false)} />}
    </div>
  )
}
