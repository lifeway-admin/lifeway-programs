import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
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

function StaffForm({ initial, onSave, onClose, toast }) {
  const [form, setForm] = useState(initial || {
    first_name: '', last_name: '', email: '', phone: '',
    role: 'therapist', department: '', title: '',
    is_active: true, is_volunteer: false, bio: '',
  })

  async function submit(e) {
    e.preventDefault()
    try {
      if (initial?.id) {
        await api.patch(`/staff/${initial.id}`, form)
        toast('Staff member updated.', 'success')
      } else {
        await api.post('/staff/', form)
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

export default function Staff() {
  const { toast } = useToast()
  const [staff, setStaff] = useState([])
  const [roleFilter, setRoleFilter] = useState('')
  const [volunteersOnly, setVolunteersOnly] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

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
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Member
        </button>
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
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
              <button onClick={() => { setEditing(s); setShowForm(true) }} className="text-lifeway-pink hover:underline text-xs">Edit</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && <StaffForm initial={editing} onSave={() => { setShowForm(false); load() }} onClose={() => setShowForm(false)} toast={toast} />}
    </div>
  )
}
