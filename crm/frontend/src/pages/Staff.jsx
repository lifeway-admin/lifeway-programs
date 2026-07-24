import { useEffect, useState } from 'react'
import { Plus, X, Mail } from 'lucide-react'
import api from '../api'
import { useToast } from '../context/ToastContext'

const ROLE_COLORS = {
  therapist: 'bg-purple-100 text-purple-700',
  physician: 'bg-blue-100 text-blue-700',
  social_worker: 'bg-green-100 text-green-700',
  admin: 'bg-gray-100 text-gray-700',
  volunteer: 'bg-yellow-100 text-yellow-700',
  intern: 'bg-orange-100 text-orange-700',
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function StaffForm({ initial, allStaff, onSave, onClose, toast }) {
  const [form, setForm] = useState(initial || {
    first_name: '', last_name: '', email: '', phone: '',
    role: 'therapist', department: '', title: '',
    is_active: true, is_volunteer: false, bio: '',
    manager_id: '', pto_balance_hours: 0,
  })

  async function submit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      manager_id: form.manager_id ? parseInt(form.manager_id) : null,
      pto_balance_hours: form.pto_balance_hours === '' ? 0 : parseFloat(form.pto_balance_hours),
    }
    try {
      if (initial?.id) {
        await api.patch(`/staff/${initial.id}`, payload)
        toast('Staff member updated.', 'success')
      } else {
        await api.post('/staff/', payload)
        toast('Staff member added.', 'success')
      }
      onSave()
    } catch {
      toast('Failed to save.', 'error')
    }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const toggle = (k) => () => setForm(f => ({ ...f, [k]: !f[k] }))

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-semibold text-lg">{initial?.id ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={submit} className="p-6 grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label><input className="input" value={form.first_name} onChange={set('first_name')} required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label><input className="input" value={form.last_name} onChange={set('last_name')} required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input className="input" type="email" value={form.email} onChange={set('email')} required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select className="input" value={form.role} onChange={set('role')} required>
              <option value="therapist">Therapist</option>
              <option value="physician">Physician</option>
              <option value="social_worker">Social Worker</option>
              <option value="admin">Admin</option>
              <option value="volunteer">Volunteer</option>
              <option value="intern">Intern</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Department</label><input className="input" value={form.department} onChange={set('department')} /></div>
          <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input className="input" value={form.title} onChange={set('title')} /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reports To</label>
            <select className="input" value={form.manager_id || ''} onChange={set('manager_id')}>
              <option value="">None</option>
              {(allStaff || []).filter(s => s.id !== initial?.id).map(s => (
                <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PTO Balance (hours)</label>
            <input className="input" type="number" step="0.5" min="0" value={form.pto_balance_hours ?? 0} onChange={set('pto_balance_hours')} />
          </div>
          <div className="col-span-2 flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={toggle('is_active')} className="rounded" /> Active
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.is_volunteer} onChange={toggle('is_volunteer')} className="rounded" /> Volunteer
            </label>
          </div>
          <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Bio</label><textarea className="input" rows={3} value={form.bio} onChange={set('bio')} /></div>
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}


function InviteModal({ onClose, toast }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('staff')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await api.post('/staff/invite', { email, role })
      setSent(data)
      toast('Invitation sent!', 'success')
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to send invite.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-semibold text-lg">Invite Staff Member</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="p-6">
          {sent ? (
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={22} className="text-green-600" />
              </div>
              <p className="text-center text-gray-700 text-sm mb-1 font-medium">Invitation sent to <span className="text-pink-600">{email}</span></p>
              <p className="text-center text-gray-400 text-xs mb-4">Link expires in 48 hours.</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 break-all">{sent.invite_url}</div>
              <button onClick={onClose} className="w-full mt-4 btn-primary">Done</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="therapist@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select className="input" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="readonly">Read Only</option>
                </select>
              </div>
              <p className="text-xs text-gray-400">The person will receive an email with a secure link to set up their account. The link expires in 48 hours.</p>
              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Sending…' : 'Send Invitation'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


function AvailabilityModal({ staff, onClose, toast }) {
  // slots[dayIndex] = { enabled, startHour, endHour }
  const [slots, setSlots] = useState(
    DAY_NAMES.map((_, i) => ({ enabled: i < 5, startHour: 9, endHour: 17 }))
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get(`/staff/${staff.id}/availability`)
      .then(({ data }) => {
        if (data.length > 0) {
          const next = DAY_NAMES.map((_, i) => ({ enabled: false, startHour: 9, endHour: 17 }))
          data.forEach(s => {
            next[s.day_of_week] = { enabled: true, startHour: s.start_hour, endHour: s.end_hour }
          })
          setSlots(next)
        }
      })
      .finally(() => setLoading(false))
  }, [staff.id])

  async function save() {
    setSaving(true)
    const payload = slots
      .map((s, i) => s.enabled ? { day_of_week: i, start_hour: s.startHour, end_hour: s.endHour } : null)
      .filter(Boolean)
    try {
      await api.put(`/staff/${staff.id}/availability`, { slots: payload })
      toast('Availability saved.', 'success')
      onClose()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to save.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const hourOptions = Array.from({ length: 25 }, (_, i) => i)
  const fmt = h => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="font-semibold text-lg">Set Availability</h2>
            <p className="text-xs text-gray-400 mt-0.5">{staff.first_name} {staff.last_name}</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500" /></div>
          ) : (
            <div className="space-y-3">
              {DAY_NAMES.map((day, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${slots[i].enabled ? 'border-pink-200 bg-pink-50' : 'border-gray-100 bg-gray-50'}`}>
                  <input
                    type="checkbox"
                    checked={slots[i].enabled}
                    onChange={e => setSlots(s => s.map((x, j) => j === i ? { ...x, enabled: e.target.checked } : x))}
                    className="rounded border-gray-300 text-pink-500 flex-shrink-0"
                  />
                  <span className="text-sm font-medium text-gray-700 w-24 flex-shrink-0">{day}</span>
                  {slots[i].enabled ? (
                    <div className="flex items-center gap-2 flex-1">
                      <select
                        className="input py-1 text-xs flex-1"
                        value={slots[i].startHour}
                        onChange={e => setSlots(s => s.map((x, j) => j === i ? { ...x, startHour: parseInt(e.target.value) } : x))}
                      >
                        {hourOptions.filter(h => h < slots[i].endHour).map(h => (
                          <option key={h} value={h}>{fmt(h)}</option>
                        ))}
                      </select>
                      <span className="text-xs text-gray-400">to</span>
                      <select
                        className="input py-1 text-xs flex-1"
                        value={slots[i].endHour}
                        onChange={e => setSlots(s => s.map((x, j) => j === i ? { ...x, endHour: parseInt(e.target.value) } : x))}
                      >
                        {hourOptions.filter(h => h > slots[i].startHour).map(h => (
                          <option key={h} value={h}>{fmt(h)}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Not available</span>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save Availability'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


export default function Staff() {
  const { toast } = useToast()
  const [staff, setStaff] = useState([])
  const [roleFilter, setRoleFilter] = useState('')
  const [volunteersOnly, setVolunteersOnly] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [showInvite, setShowInvite] = useState(false)
  const [availFor, setAvailFor] = useState(null)

  async function load() {
    const params = { active_only: true }
    if (roleFilter) params.role = roleFilter
    if (volunteersOnly) params.volunteers_only = true
    const { data } = await api.get('/staff/', { params })
    setStaff(data)
  }

  useEffect(() => { load() }, [roleFilter, volunteersOnly])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff & Volunteers</h1>
          <p className="text-gray-500 mt-1">{staff.length} members</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowInvite(true)} className="btn-secondary flex items-center gap-2">
            <Mail size={16} /> Invite
          </button>
          <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Member
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <select className="input w-48" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="therapist">Therapists</option>
          <option value="physician">Physicians</option>
          <option value="social_worker">Social Workers</option>
          <option value="admin">Admin</option>
          <option value="volunteer">Volunteers</option>
          <option value="intern">Interns</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={volunteersOnly} onChange={e => setVolunteersOnly(e.target.checked)} className="rounded" />
          Volunteers only
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.length === 0 && <p className="text-gray-400 col-span-3 py-12 text-center">No staff members found.</p>}
        {staff.map(s => (
          <div key={s.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-lifeway-light flex items-center justify-center text-lifeway-pink font-bold text-sm">
                {s.first_name[0]}{s.last_name[0]}
              </div>
              <span className={`badge ${ROLE_COLORS[s.role] || 'bg-gray-100 text-gray-600'}`}>{s.role.replace('_', ' ')}</span>
            </div>
            <h3 className="font-semibold text-gray-900">{s.first_name} {s.last_name}</h3>
            <p className="text-sm text-gray-500">{s.title || s.department || '—'}</p>
            <p className="text-xs text-gray-400 mt-1">{s.email}</p>
            {s.is_volunteer && <span className="badge bg-yellow-100 text-yellow-700 mt-2">Volunteer</span>}
            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
              <button onClick={() => { setEditing(s); setShowForm(true) }} className="text-lifeway-pink hover:underline text-xs">Edit</button>
              <button onClick={() => setAvailFor(s)} className="text-gray-500 hover:text-gray-700 hover:underline text-xs">Availability</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && <StaffForm initial={editing} allStaff={staff} onSave={() => { setShowForm(false); load() }} onClose={() => setShowForm(false)} toast={toast} />}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} toast={toast} />}
      {availFor && <AvailabilityModal staff={availFor} onClose={() => setAvailFor(null)} toast={toast} />}
    </div>
  )
}
