import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, X, Check, Phone, Mail, MapPin, Shield, Users, User, UserCheck, Tag, FileText, ChevronRight, Printer, CreditCard, Video, ExternalLink, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'
import { useToast } from '../context/ToastContext'

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-gray-100 text-gray-600',
}

const APPT_STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-yellow-100 text-yellow-700',
}

const PRIORITY_COLORS = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-gray-100 text-gray-600',
}

const SERVICES = ['mental_health', 'medical', 'social', 'spiritual', 'food', 'employment', 'housing', 'wellness']

function EditClientModal({ client, onSave, onClose, toast }) {
  const [form, setForm] = useState({
    first_name: client.first_name || '',
    last_name: client.last_name || '',
    email: client.email || '',
    phone: client.phone || '',
    address: client.address || '',
    case_status: client.case_status || 'active',
    primary_service: client.primary_service || '',
    insurance: client.insurance || '',
    emergency_contact_name: client.emergency_contact_name || '',
    emergency_contact_phone: client.emergency_contact_phone || '',
    notes: client.notes || '',
  })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    try {
      await api.patch(`/clients/${client.id}`, form)
      toast('Client updated.', 'success')
      onSave()
    } catch {
      toast('Failed to save client.', 'error')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Edit Client</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={submit} className="p-6 grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label><input className="input" value={form.first_name} onChange={set('first_name')} required /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label><input className="input" value={form.last_name} onChange={set('last_name')} required /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input className="input" type="email" value={form.email} onChange={set('email')} /></div>
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
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Contact Name</label><input className="input" value={form.emergency_contact_name} onChange={set('emergency_contact_name')} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Contact Phone</label><input className="input" value={form.emergency_contact_phone} onChange={set('emergency_contact_phone')} /></div>
          <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label><textarea className="input" rows={3} value={form.notes} onChange={set('notes')} /></div>
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-800 dark:text-gray-200">{value}</p>
      </div>
    </div>
  )
}

const AMOUNT_PRESETS = [2500, 5000, 10000, 15000, 25000]

function PaymentRequestModal({ client, onClose, toast }) {
  const [amountCents, setAmountCents] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [description, setDescription] = useState('Service Fee')
  const [sendEmail, setSendEmail] = useState(true)
  const [sendSms, setSendSms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const selectedCents = customAmount
    ? Math.round(parseFloat(customAmount) * 100)
    : amountCents

  async function submit(e) {
    e.preventDefault()
    if (!selectedCents || selectedCents < 100) {
      toast('Minimum amount is $1.00', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await api.post(`/clients/${client.id}/payment-request`, {
        amount_cents: selectedCents,
        description,
        send_email: sendEmail,
        send_sms: sendSms,
      })
      setResult(res.data)
      toast('Payment request sent!', 'success')
    } catch (err) {
      toast(err?.response?.data?.detail || 'Failed to send payment request.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-lifeway-pink" />
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Send Payment Request</h2>
          </div>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        {result ? (
          <div className="p-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <Check size={24} className="mx-auto text-green-500 mb-2" />
              <p className="font-semibold text-green-800">Payment request sent!</p>
              <p className="text-sm text-green-600 mt-1">{result.amount} requested from {client.first_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Checkout link</p>
              <a href={result.checkout_url} target="_blank" rel="noreferrer"
                className="text-sm text-lifeway-pink break-all hover:underline flex items-center gap-1">
                {result.checkout_url} <ExternalLink size={12} />
              </a>
            </div>
            <button onClick={onClose} className="btn-primary w-full">Done</button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {AMOUNT_PRESETS.map(cents => (
                  <button
                    key={cents}
                    type="button"
                    onClick={() => { setAmountCents(cents); setCustomAmount('') }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      amountCents === cents && !customAmount
                        ? 'bg-lifeway-pink text-white border-lifeway-pink'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-lifeway-pink'
                    }`}
                  >
                    ${(cents / 100).toFixed(0)}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Custom amount ($)"
                className="input"
                value={customAmount}
                onChange={e => { setCustomAmount(e.target.value); setAmountCents('') }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <input className="input" value={description} onChange={e => setDescription(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Send via</p>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)}
                  disabled={!client.email} className="rounded" />
                <span className={!client.email ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}>
                  Email {!client.email && '(no email on file)'}
                </span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={sendSms} onChange={e => setSendSms(e.target.checked)}
                  disabled={!client.phone} className="rounded" />
                <span className={!client.phone ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}>
                  SMS {!client.phone && '(no phone on file)'}
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? 'Sending...' : <><CreditCard size={15} /> Send Request</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ClientProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addRecentItem } = useRecentlyViewed()
  const { toast } = useToast()
  const [client, setClient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [tickets, setTickets] = useState([])
  const [tab, setTab] = useState('appointments')
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [notes, setNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)
  const [zoomLoading, setZoomLoading] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const [cr, ar] = await Promise.allSettled([
        api.get(`/clients/${id}`),
        api.get('/appointments/', { params: { client_id: id } }),
      ])
      if (cr.status === 'fulfilled') {
        const data = cr.value.data
        setClient(data)
        setNotes(data.notes || '')
        addRecentItem({ type: 'client', id: data.id, label: `${data.first_name} ${data.last_name}`, path: `/clients/${data.id}` })
      }
      if (ar.status === 'fulfilled') {
        const d = ar.value.data
        setAppointments(Array.isArray(d) ? d : (d.results || []))
      }

      // Tickets — graceful if endpoint doesn't exist
      try {
        const tr = await api.get('/tickets/', { params: { client_id: id } })
        const d = tr.data
        setTickets(Array.isArray(d) ? d : (d.results || []))
      } catch {
        setTickets([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function saveNotes() {
    try {
      await api.patch(`/clients/${id}`, { notes })
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2000)
      toast('Notes saved.', 'success')
    } catch {
      toast('Failed to save notes.', 'error')
    }
  }

  async function createZoom(apptId) {
    setZoomLoading(apptId)
    try {
      await api.post(`/appointments/${apptId}/zoom`)
      toast('Zoom meeting created.', 'success')
      load()
    } catch (err) {
      toast(err?.response?.data?.detail || 'Failed to create Zoom meeting.', 'error')
    } finally {
      setZoomLoading(null)
    }
  }

  async function removeZoom(apptId) {
    setZoomLoading(apptId)
    try {
      await api.delete(`/appointments/${apptId}/zoom`)
      toast('Zoom meeting removed.', 'success')
      load()
    } catch {
      toast('Failed to remove Zoom meeting.', 'error')
    } finally {
      setZoomLoading(null)
    }
  }

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>
  if (!client) return <div className="p-8 text-gray-400">Client not found.</div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 mb-4">
        <Link to="/clients" className="hover:text-lifeway-pink transition-colors">Clients</Link>
        <ChevronRight size={14} />
        <span className="text-gray-700 dark:text-gray-300 font-medium">{client.first_name} {client.last_name}</span>
      </div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/clients')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-lifeway-light flex items-center justify-center text-lifeway-pink font-bold text-lg">
              {client.first_name?.[0]}{client.last_name?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {client.first_name} {client.last_name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge ${STATUS_COLORS[client.case_status]}`}>{client.case_status}</span>
                {client.primary_service && (
                  <span className="badge bg-lifeway-light text-lifeway-pink capitalize">{client.primary_service.replace('_', ' ')}</span>
                )}
                {client.intake_date && (
                  <span className="text-xs text-gray-400">Intake: {new Date(client.intake_date).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="btn-secondary no-print flex items-center gap-2 text-sm"
        >
          <Printer size={15} />
          Print
        </button>
        <button
          onClick={() => setShowPayment(true)}
          className="no-print flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
        >
          <CreditCard size={15} /> Payment Request
        </button>
        <button onClick={() => setShowEdit(true)} className="btn-secondary flex items-center gap-2">
          <Edit2 size={15} /> Edit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Contact info */}
          <div className="card dark:bg-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <User size={16} className="text-lifeway-pink" /> Contact Info
            </h2>
            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              <InfoRow icon={Mail} label="Email" value={client.email} />
              <InfoRow icon={Phone} label="Phone" value={client.phone} />
              <InfoRow icon={MapPin} label="Address" value={client.address} />
            </div>
            {!client.email && !client.phone && !client.address && (
              <p className="text-sm text-gray-400">No contact info on file.</p>
            )}
          </div>

          {/* Insurance */}
          <div className="card dark:bg-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Shield size={16} className="text-lifeway-pink" /> Insurance
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">{client.insurance || 'Not recorded'}</p>
          </div>

          {/* Emergency contact */}
          <div className="card dark:bg-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Users size={16} className="text-lifeway-pink" /> Emergency Contact
            </h2>
            {client.emergency_contact_name ? (
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{client.emergency_contact_name}</p>
                {client.emergency_contact_phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{client.emergency_contact_phone}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No emergency contact on file.</p>
            )}
          </div>

          {/* Assigned staff */}
          <div className="card dark:bg-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <UserCheck size={16} className="text-lifeway-pink" /> Assigned Staff
            </h2>
            {client.assigned_staff_id ? (
              <p className="text-sm text-gray-700 dark:text-gray-300">Staff #{client.assigned_staff_id}</p>
            ) : (
              <p className="text-sm text-gray-400">Not assigned.</p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-4 w-fit">
            {[
              { id: 'appointments', label: 'Appointments', count: appointments.length },
              { id: 'tickets', label: 'Tickets', count: tickets.length },
              { id: 'notes', label: 'Notes' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.id ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {t.label}
                {t.count !== undefined && (
                  <span className={`text-xs rounded-full px-1.5 ${tab === t.id ? 'bg-lifeway-light text-lifeway-pink' : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Appointments tab */}
          {tab === 'appointments' && (
            <div className="card p-0 overflow-hidden dark:bg-gray-800">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">Date</th>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">Type</th>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                    <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">Zoom</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {appointments.length === 0 && (
                    <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">No appointments found.</td></tr>
                  )}
                  {appointments.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-5 py-3 text-gray-900 dark:text-white font-medium whitespace-nowrap">
                        {new Date(a.appointment_date).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          {a.is_telehealth && <Video size={13} className="text-blue-500 flex-shrink-0" />}
                          <span className="capitalize">{a.appointment_type || (a.is_telehealth ? 'Telehealth' : '—')}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3"><span className={`badge ${APPT_STATUS_COLORS[a.status]}`}>{a.status}</span></td>
                      <td className="px-5 py-3">
                        {a.zoom_join_url ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={a.zoom_join_url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline"
                            >
                              <Video size={12} /> Join
                            </a>
                            <button
                              onClick={() => removeZoom(a.id)}
                              disabled={zoomLoading === a.id}
                              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove Zoom"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : a.is_telehealth ? (
                          <button
                            onClick={() => createZoom(a.id)}
                            disabled={zoomLoading === a.id}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                            title="Create Zoom meeting"
                          >
                            <Plus size={12} /> Create
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tickets tab */}
          {tab === 'tickets' && (
            <div className="space-y-2">
              {tickets.length === 0 && (
                <div className="card dark:bg-gray-800 text-center py-10">
                  <Tag size={28} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 text-sm">No tickets found for this client.</p>
                </div>
              )}
              {tickets.map(t => (
                <div key={t.id} className="card p-4 dark:bg-gray-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">#{t.ticket_number}</span>
                        <span className={`badge ${PRIORITY_COLORS[t.priority] || 'bg-gray-100 text-gray-600'}`}>{t.priority}</span>
                        <span className={`badge ${
                          t.status === 'open' ? 'bg-blue-100 text-blue-700' :
                          t.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                          t.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{t.status?.replace('_', ' ')}</span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">{t.title}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes tab */}
          {tab === 'notes' && (
            <div className="card dark:bg-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText size={16} className="text-lifeway-pink" /> Case Notes
              </h3>
              <textarea
                className="input min-h-[200px] resize-y"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add case notes here..."
              />
              <div className="flex items-center gap-3 mt-3">
                <button onClick={saveNotes} className="btn-primary flex items-center gap-2">
                  <Check size={15} /> Save Notes
                </button>
                {notesSaved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <EditClientModal
          client={client}
          onSave={() => { setShowEdit(false); load() }}
          onClose={() => setShowEdit(false)}
          toast={toast}
        />
      )}

      {showPayment && (
        <PaymentRequestModal
          client={client}
          onClose={() => setShowPayment(false)}
          toast={toast}
        />
      )}
    </div>
  )
}
