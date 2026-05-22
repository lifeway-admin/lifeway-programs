import { useEffect, useState } from 'react'
import { Shield, Download, Eye, X, ChevronRight, FileText } from 'lucide-react'
import api from '../api'

const CATEGORY_COLORS = {
  'Required by Law': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Strongly Recommended': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Patient Forms': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

function DocViewer({ doc, onClose }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = doc.category === 'Patient Forms'
      ? `/docs/forms/${doc.filename}`
      : `/docs/${doc.filename}`
    api.get(url, { responseType: 'text' })
      .then(r => setContent(typeof r.data === 'string' ? r.data : JSON.stringify(r.data)))
      .catch(() => setContent('Unable to load document.'))
      .finally(() => setLoading(false))
  }, [doc.filename, doc.category])

  function download() {
    const blob = new Blob([content], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = doc.filename
    a.click()
  }

  // Simple markdown → JSX renderer
  function renderMarkdown(text) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-2">{line.slice(2)}</h1>
      if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-5 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">{line.slice(3)}</h2>
      if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold text-gray-800 dark:text-gray-100 mt-4 mb-1">{line.slice(4)}</h3>
      if (line.startsWith('#### ')) return <h4 key={i} className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-3 mb-1">{line.slice(5)}</h4>
      if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-lifeway-pink pl-4 my-3 text-gray-600 dark:text-gray-400 italic text-sm">{line.slice(2)}</blockquote>
      if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-5 text-sm text-gray-700 dark:text-gray-300 list-disc my-0.5">{line.slice(2)}</li>
      if (line.match(/^\d+\. /)) return <li key={i} className="ml-5 text-sm text-gray-700 dark:text-gray-300 list-decimal my-0.5">{line.replace(/^\d+\. /, '')}</li>
      if (line.startsWith('| ')) {
        const cells = line.split('|').filter(c => c.trim() !== '').map(c => c.trim())
        const isSeparator = cells.every(c => /^[-:]+$/.test(c))
        if (isSeparator) return null
        return (
          <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
            {cells.map((c, j) => (
              <td key={j} className="py-1.5 px-3 text-sm text-gray-700 dark:text-gray-300 align-top">{c}</td>
            ))}
          </tr>
        )
      }
      if (line.startsWith('---')) return <hr key={i} className="border-gray-200 dark:border-gray-700 my-4" />
      if (line.trim() === '') return <div key={i} className="h-2" />
      // Bold/italic inline
      const formatted = line
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs font-mono">$1</code>')
      return <p key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed my-1" dangerouslySetInnerHTML={{ __html: formatted }} />
    }).filter(Boolean)
  }

  // Group consecutive <tr> into tables
  function wrapTables(elements) {
    const result = []
    let tableRows = []
    elements.forEach((el, i) => {
      if (el?.type === 'tr') {
        tableRows.push(el)
      } else {
        if (tableRows.length > 0) {
          result.push(
            <div key={`table-${i}`} className="overflow-x-auto my-3">
              <table className="w-full text-left border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <tbody>{tableRows}</tbody>
              </table>
            </div>
          )
          tableRows = []
        }
        result.push(el)
      }
    })
    if (tableRows.length > 0) {
      result.push(
        <div key="table-end" className="overflow-x-auto my-3">
          <table className="w-full text-left border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <tbody>{tableRows}</tbody>
          </table>
        </div>
      )
    }
    return result
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{doc.title}</h2>
            <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[doc.category] || 'bg-gray-100 text-gray-600'}`}>
              {doc.category}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={download} className="btn-secondary flex items-center gap-1.5 text-sm">
              <Download size={14} /> Download
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-8 py-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lifeway-pink" />
            </div>
          ) : (
            <div>{wrapTables(renderMarkdown(content))}</div>
          )}
        </div>
      </div>
    </div>
  )
}

const SECTION_ORDER = ['Required by Law', 'Strongly Recommended', 'Patient Forms']

export default function Policies() {
  const [policies, setPolicies] = useState([])
  const [forms, setForms] = useState([])
  const [viewing, setViewing] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/docs/').catch(() => ({ data: [] })),
      api.get('/docs/forms/').catch(() => ({ data: [] })),
    ]).then(([p, f]) => {
      setPolicies(p.data)
      setForms(f.data)
    }).finally(() => setLoading(false))
  }, [])

  const allDocs = [...policies, ...forms]
  const grouped = allDocs.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  const orderedGroups = SECTION_ORDER.filter(c => grouped[c])

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-lifeway-light flex items-center justify-center">
            <Shield size={20} className="text-lifeway-pink" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Policies & Forms</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">HIPAA compliance documentation and patient-facing forms for Lifeway Programs, Inc.</p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-300">
          <strong>Action required before go-live:</strong> All documents marked "Required by Law" must be reviewed, dated, and signed by the Privacy Officer and Executive Director. Patient forms should be printed or collected via a digital signature tool before seeing real patients.
        </div>
      </div>

      {orderedGroups.map(category => {
        const docs = grouped[category]
        const isPatientForms = category === 'Patient Forms'
        return (
          <div key={category} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              {isPatientForms
                ? <FileText size={16} className="text-blue-500" />
                : <Shield size={16} className="text-lifeway-pink" />}
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{category}</h2>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[category] || ''}`}>
                {docs.length} document{docs.length !== 1 ? 's' : ''}
              </span>
            </div>
            {isPatientForms && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                These forms are completed by patients or their guardians at intake. Download to print or use with a digital signature service.
              </p>
            )}
            <div className="space-y-3">
              {docs.map(doc => (
                <div key={doc.filename} className="card p-5 flex items-start justify-between gap-4 hover:border-lifeway-pink/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{doc.title}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[doc.category] || 'bg-gray-100 text-gray-600'}`}>
                        {doc.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{doc.description}</p>
                  </div>
                  <button
                    onClick={() => setViewing(doc)}
                    className="flex items-center gap-1.5 text-sm font-medium text-lifeway-pink hover:text-lifeway-darkpink transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    <Eye size={15} /> View <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {viewing && <DocViewer doc={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}
