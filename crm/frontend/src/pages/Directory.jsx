import { useEffect, useState } from 'react'
import { Users2, Mail, Phone } from 'lucide-react'
import api from '../api'

const ROLE_COLORS = {
  therapist: 'bg-purple-100 text-purple-700',
  physician: 'bg-blue-100 text-blue-700',
  social_worker: 'bg-green-100 text-green-700',
  admin: 'bg-gray-100 text-gray-700',
  volunteer: 'bg-yellow-100 text-yellow-700',
  intern: 'bg-orange-100 text-orange-700',
}

function PersonCard({ s }) {
  return (
    <div className="card dark:bg-gray-800">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-full bg-lifeway-light flex items-center justify-center text-lifeway-pink font-bold text-sm">
          {s.first_name[0]}{s.last_name[0]}
        </div>
        <span className={`badge ${ROLE_COLORS[s.role] || 'bg-gray-100 text-gray-600'}`}>{s.role.replace('_', ' ')}</span>
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white">{s.first_name} {s.last_name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{s.title || '—'}</p>
      <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700 space-y-1">
        {s.email && (
          <a href={`mailto:${s.email}`} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-lifeway-pink">
            <Mail size={12} /> {s.email}
          </a>
        )}
        {s.phone && (
          <a href={`tel:${s.phone}`} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-lifeway-pink">
            <Phone size={12} /> {s.phone}
          </a>
        )}
      </div>
    </div>
  )
}

function ReportingTree({ staff }) {
  const byManager = staff.reduce((acc, s) => {
    const key = s.manager_id || 'root'
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  const staffIds = new Set(staff.map(s => s.id))
  // Roots = no manager, or manager not present in the loaded staff set
  const roots = staff.filter(s => !s.manager_id || !staffIds.has(s.manager_id))

  function renderNode(s, depth, visited) {
    if (visited.has(s.id)) return null // guard against manager cycles
    const nextVisited = new Set(visited).add(s.id)
    const reports = byManager[s.id] || []
    return (
      <div key={s.id} style={{ marginLeft: depth * 24 }} className="mb-2">
        <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-lifeway-light flex items-center justify-center text-lifeway-pink font-bold text-xs flex-shrink-0">
            {s.first_name[0]}{s.last_name[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{s.first_name} {s.last_name}</p>
            <p className="text-xs text-gray-400">{s.title || s.role.replace('_', ' ')}</p>
          </div>
        </div>
        {reports.map(r => renderNode(r, depth + 1, nextVisited))}
      </div>
    )
  }

  if (roots.length === 0) {
    return <p className="text-gray-400 text-center py-12">No reporting lines set yet. Assign a manager to a staff member's profile to build the tree.</p>
  }

  return <div>{roots.map(s => renderNode(s, 0, new Set()))}</div>
}

export default function Directory() {
  const [staff, setStaff] = useState([])
  const [view, setView] = useState('department')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/staff/', { params: { active_only: true } })
      .then(({ data }) => setStaff(data))
      .finally(() => setLoading(false))
  }, [])

  const grouped = staff.reduce((acc, s) => {
    const dept = s.department || 'Unassigned'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(s)
    return acc
  }, {})
  const departments = Object.keys(grouped).sort()

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lifeway-light flex items-center justify-center">
            <Users2 size={20} className="text-lifeway-pink" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Directory</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{staff.length} active team members</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {['department', 'reporting'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === v ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {v === 'department' ? 'By Department' : 'Reporting Lines'}
            </button>
          ))}
        </div>
      </div>

      {view === 'department' ? (
        departments.map(dept => (
          <div key={dept} className="mb-10">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">{dept}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped[dept].map(s => <PersonCard key={s.id} s={s} />)}
            </div>
          </div>
        ))
      ) : (
        <ReportingTree staff={staff} />
      )}
    </div>
  )
}
