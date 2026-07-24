import { useEffect, useState } from 'react'
import { ListChecks, Plus, X, CheckCircle2, Circle } from 'lucide-react'
import api from '../api'
import { useToast } from '../context/ToastContext'

function TaskList({ checklist, onToggle, canEdit }) {
  return (
    <ul className="space-y-2">
      {checklist.tasks.map(task => (
        <li key={task.id} className="flex items-start gap-3">
          <button
            onClick={() => canEdit && onToggle(task)}
            disabled={!canEdit}
            className={`mt-0.5 flex-shrink-0 ${canEdit ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {task.is_done
              ? <CheckCircle2 size={18} className="text-green-500" />
              : <Circle size={18} className="text-gray-300" />}
          </button>
          <div className="min-w-0">
            <p className={`text-sm ${task.is_done ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>{task.label}</p>
            {task.is_done && task.completed_by && (
              <p className="text-xs text-gray-400">completed by {task.completed_by}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

function NewChecklistModal({ staffOptions, onSave, onClose, toast }) {
  const [staffId, setStaffId] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!staffId) return
    setSubmitting(true)
    try {
      await api.post('/onboarding/', { staff_id: Number(staffId), notes })
      toast('Onboarding checklist created.', 'success')
      onSave()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to create checklist.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white">New Onboarding Checklist</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Staff Member *</label>
            <select className="input" value={staffId} onChange={e => setStaffId(e.target.value)} required>
              <option value="">Select…</option>
              {staffOptions.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea className="input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional context for this hire..." />
          </div>
          <p className="text-xs text-gray-400">Seeds the standard 10-item onboarding task list. Custom tasks can be added afterward.</p>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Creating…' : 'Create Checklist'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ChecklistDetail({ checklistId, onClose, onChanged, toast }) {
  const [checklist, setChecklist] = useState(null)
  const [newTask, setNewTask] = useState('')

  async function load() {
    const { data } = await api.get(`/onboarding/${checklistId}`)
    setChecklist(data)
  }

  useEffect(() => { load() }, [checklistId])

  async function toggle(task) {
    await api.patch(`/onboarding/tasks/${task.id}`, { is_done: !task.is_done })
    load()
    onChanged()
  }

  async function addTask(e) {
    e.preventDefault()
    if (!newTask.trim()) return
    try {
      await api.post(`/onboarding/${checklistId}/tasks`, { label: newTask.trim() })
      setNewTask('')
      load()
      onChanged()
    } catch {
      toast('Failed to add task.', 'error')
    }
  }

  if (!checklist) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{checklist.staff_name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{checklist.percent_complete}% complete</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="p-6">
          {checklist.notes && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 italic">{checklist.notes}</p>}
          <TaskList checklist={checklist} onToggle={toggle} canEdit={true} />
          <form onSubmit={addTask} className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <input className="input flex-1" placeholder="Add a custom task..." value={newTask} onChange={e => setNewTask(e.target.value)} />
            <button type="submit" className="btn-secondary">Add</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function Onboarding() {
  const { toast } = useToast()
  const isAdmin = localStorage.getItem('role') === 'admin'
  const [myChecklist, setMyChecklist] = useState(null)
  const [allChecklists, setAllChecklists] = useState([])
  const [staffOptions, setStaffOptions] = useState([])
  const [showNew, setShowNew] = useState(false)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const results = await Promise.allSettled([
      api.get('/onboarding/me'),
      isAdmin ? api.get('/onboarding/') : Promise.resolve(null),
      isAdmin ? api.get('/staff/', { params: { active_only: true } }) : Promise.resolve(null),
    ])
    setMyChecklist(results[0].status === 'fulfilled' ? results[0].value.data : null)
    if (isAdmin) {
      setAllChecklists(results[1].status === 'fulfilled' && results[1].value ? results[1].value.data : [])
      setStaffOptions(results[2].status === 'fulfilled' && results[2].value ? results[2].value.data : [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleMyTask(task) {
    await api.patch(`/onboarding/tasks/${task.id}`, { is_done: !task.is_done })
    load()
  }

  const eligibleStaff = staffOptions.filter(s => !allChecklists.some(c => c.staff_id === s.id))

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-lifeway-light flex items-center justify-center">
          <ListChecks size={20} className="text-lifeway-pink" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Onboarding</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">New-hire checklists and paperwork tracking.</p>
        </div>
      </div>

      {myChecklist && (
        <div className="card mb-8 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">My Onboarding</h2>
            <span className="badge bg-lifeway-light text-lifeway-pink">{myChecklist.percent_complete}% complete</span>
          </div>
          <TaskList checklist={myChecklist} onToggle={toggleMyTask} canEdit={true} />
        </div>
      )}

      {isAdmin && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">All Checklists ({allChecklists.length})</h2>
            <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={15} /> New Checklist
            </button>
          </div>
          {allChecklists.length === 0 ? (
            <div className="card text-center py-12 dark:bg-gray-800">
              <p className="text-gray-400">No onboarding checklists yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allChecklists.map(c => (
                <div key={c.id} onClick={() => setSelected(c.id)} className="card p-4 cursor-pointer hover:shadow-md hover:border-lifeway-pink/30 transition-all dark:bg-gray-800 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">{c.staff_name}</p>
                    {c.notes && <p className="text-xs text-gray-400 truncate">{c.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-lifeway-pink" style={{ width: `${c.percent_complete}%` }} />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 w-10 text-right">{c.percent_complete}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!isAdmin && !myChecklist && (
        <div className="card text-center py-12">
          <p className="text-gray-400">No onboarding checklist has been assigned to you yet.</p>
        </div>
      )}

      {showNew && <NewChecklistModal staffOptions={eligibleStaff} onSave={() => { setShowNew(false); load() }} onClose={() => setShowNew(false)} toast={toast} />}
      {selected && <ChecklistDetail checklistId={selected} onClose={() => setSelected(null)} onChanged={load} toast={toast} />}
    </div>
  )
}
