import { useEffect, useState } from 'react'
import { FolderOpen, Download, Upload, X, Trash2, Pencil, FileText } from 'lucide-react'
import api from '../api'
import { useToast } from '../context/ToastContext'

const CATEGORIES = ['Handbook', 'SOP', 'Onboarding', 'HR Forms', 'Other']

const CATEGORY_COLORS = {
  Handbook: 'bg-purple-100 text-purple-700',
  SOP: 'bg-blue-100 text-blue-700',
  Onboarding: 'bg-green-100 text-green-700',
  'HR Forms': 'bg-amber-100 text-amber-700',
  Other: 'bg-gray-100 text-gray-600',
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function UploadModal({ onSave, onClose, toast }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!file) return
    setSubmitting(true)
    const formData = new FormData()
    formData.append('title', title)
    formData.append('category', category)
    formData.append('description', description)
    formData.append('file', file)
    try {
      await api.post('/hr-documents/', formData)
      toast('Document uploaded.', 'success')
      onSave()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to upload document.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Upload Document</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea className="input" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File *</label>
            <input
              className="input"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.md"
              onChange={e => setFile(e.target.files?.[0] || null)}
              required
            />
            <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, PowerPoint, images, or text. Max 25 MB.</p>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Uploading…' : 'Upload'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditModal({ doc, onSave, onClose, toast }) {
  const [title, setTitle] = useState(doc.title)
  const [description, setDescription] = useState(doc.description || '')
  const [category, setCategory] = useState(doc.category)

  async function submit(e) {
    e.preventDefault()
    try {
      await api.patch(`/hr-documents/${doc.id}`, { title, description, category })
      toast('Document updated.', 'success')
      onSave()
    } catch {
      toast('Failed to update document.', 'error')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Edit Document</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea className="input" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Documents() {
  const { toast } = useToast()
  const isAdmin = localStorage.getItem('role') === 'admin'
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [editing, setEditing] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/hr-documents/')
      setDocs(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function download(doc) {
    try {
      const res = await api.get(`/hr-documents/${doc.id}/download`, { responseType: 'blob' })
      const blob = new Blob([res.data])
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = doc.original_filename
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      toast('Failed to download document.', 'error')
    }
  }

  async function remove(doc) {
    if (!confirm(`Delete "${doc.title}"? This can't be undone.`)) return
    try {
      await api.delete(`/hr-documents/${doc.id}`)
      toast('Document deleted.', 'success')
      load()
    } catch {
      toast('Failed to delete document.', 'error')
    }
  }

  const grouped = docs.reduce((acc, d) => {
    if (!acc[d.category]) acc[d.category] = []
    acc[d.category].push(d)
    return acc
  }, {})
  const orderedGroups = CATEGORIES.filter(c => grouped[c]?.length)

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lifeway-light flex items-center justify-center">
            <FolderOpen size={20} className="text-lifeway-pink" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Employee handbook, SOPs, and internal HR forms.</p>
          </div>
        </div>
        {isAdmin && (
          <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2">
            <Upload size={16} /> Upload
          </button>
        )}
      </div>

      {docs.length === 0 && (
        <div className="card text-center py-12">
          <FileText size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">No documents uploaded yet.</p>
        </div>
      )}

      {orderedGroups.map(category => (
        <div key={category} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{category}</h2>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[category]}`}>
              {grouped[category].length} document{grouped[category].length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-3">
            {grouped[category].map(doc => (
              <div key={doc.id} className="card p-5 flex items-start justify-between gap-4 hover:border-lifeway-pink/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{doc.title}</h3>
                  {doc.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{doc.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">{doc.original_filename} · {formatSize(doc.file_size_bytes)} · uploaded by {doc.uploaded_by}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button onClick={() => download(doc)} className="flex items-center gap-1.5 text-sm font-medium text-lifeway-pink hover:text-lifeway-darkpink transition-colors">
                    <Download size={15} /> Download
                  </button>
                  {isAdmin && (
                    <>
                      <button onClick={() => setEditing(doc)} className="text-gray-400 hover:text-gray-600"><Pencil size={15} /></button>
                      <button onClick={() => remove(doc)} className="text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showUpload && <UploadModal onSave={() => { setShowUpload(false); load() }} onClose={() => setShowUpload(false)} toast={toast} />}
      {editing && <EditModal doc={editing} onSave={() => { setEditing(null); load() }} onClose={() => setEditing(null)} toast={toast} />}
    </div>
  )
}
