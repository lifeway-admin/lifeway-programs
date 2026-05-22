import { useState, useEffect, useRef } from 'react'
import api from './api'

const INTAKE_FORMS = [
  { filename: '01_consent_for_treatment.md', title: 'Consent for Treatment' },
  { filename: '02_financial_responsibility_agreement.md', title: 'Financial Responsibility Agreement' },
  { filename: '04_telehealth_consent.md', title: 'Telehealth Informed Consent' },
]

function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-xl font-bold text-gray-900 mt-5 mb-2">{line.slice(2)}</h1>)
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-base font-bold text-gray-800 mt-4 mb-1.5 border-b border-gray-200 pb-1">{line.slice(3)}</h2>)
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-sm font-semibold text-gray-800 mt-3 mb-1">{line.slice(4)}</h3>)
    } else if (line.startsWith('> ')) {
      elements.push(<blockquote key={i} className="border-l-4 border-pink-300 pl-3 my-2 text-gray-600 italic text-xs" dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />)
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(<li key={i} className="ml-4 text-xs text-gray-700 list-disc my-0.5" dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />)
    } else if (/^\d+\. /.test(line)) {
      elements.push(<li key={i} className="ml-4 text-xs text-gray-700 list-decimal my-0.5" dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^\d+\. /, '')) }} />)
    } else if (line.startsWith('---')) {
      elements.push(<hr key={i} className="border-gray-200 my-3" />)
    } else if (line.startsWith('| ')) {
      const cells = line.split('|').filter(c => c.trim() !== '').map(c => c.trim())
      const isSep = cells.every(c => /^[-:]+$/.test(c))
      if (!isSep) {
        elements.push(
          <tr key={i} className="border-b border-gray-100">
            {cells.map((c, j) => <td key={j} className="py-1 px-2 text-xs text-gray-700 align-top">{c}</td>)}
          </tr>
        )
      }
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1.5" />)
    } else {
      elements.push(
        <p key={i} className="text-xs text-gray-700 leading-relaxed my-1"
          dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      )
    }
    i++
  }

  // Wrap consecutive <tr> in a table
  const result = []
  let rows = []
  elements.forEach((el, idx) => {
    if (el?.type === 'tr') {
      rows.push(el)
    } else {
      if (rows.length) {
        result.push(
          <div key={`t${idx}`} className="overflow-x-auto my-2">
            <table className="w-full text-left border border-gray-200 rounded overflow-hidden">
              <tbody>{rows}</tbody>
            </table>
          </div>
        )
        rows = []
      }
      result.push(el)
    }
  })
  if (rows.length) {
    result.push(
      <div key="tend" className="overflow-x-auto my-2">
        <table className="w-full text-left border border-gray-200 rounded overflow-hidden"><tbody>{rows}</tbody></table>
      </div>
    )
  }
  return result
}

function formatInline(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:#f3f4f6;padding:0 2px;border-radius:3px;font-size:11px;">$1</code>')
}

export default function IntakeFormSigner({ clientId, appointmentId, patientEmail, patientName, onComplete, onSkip }) {
  const [formIndex, setFormIndex] = useState(0)
  const [content, setContent] = useState('')
  const [loadingContent, setLoadingContent] = useState(true)
  const [scrolledToBottom, setScrolledToBottom] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [signature, setSignature] = useState('')
  const [signatures, setSignatures] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const bodyRef = useRef(null)

  const currentForm = INTAKE_FORMS[formIndex]
  const isLast = formIndex === INTAKE_FORMS.length - 1
  const canSign = scrolledToBottom && agreed && signature.trim().length >= 2

  // Load form content whenever formIndex changes
  useEffect(() => {
    setContent('')
    setLoadingContent(true)
    setScrolledToBottom(false)
    setAgreed(false)
    setSignature('')
    api.get(`/public/forms-content/${currentForm.filename}`, { responseType: 'text' })
      .then(r => setContent(typeof r.data === 'string' ? r.data : ''))
      .catch(() => setContent('Unable to load form content. Please try again.'))
      .finally(() => setLoadingContent(false))
  }, [formIndex, currentForm.filename])

  function handleScroll() {
    const el = bodyRef.current
    if (!el) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) setScrolledToBottom(true)
  }

  function handleSign() {
    const newSig = { form_filename: currentForm.filename, form_title: currentForm.title, signer_name: signature.trim() }
    const allSigs = [...signatures, newSig]

    if (!isLast) {
      setSignatures(allSigs)
      setFormIndex(i => i + 1)
      if (bodyRef.current) bodyRef.current.scrollTop = 0
      return
    }

    // Submit all signatures
    setSubmitting(true)
    setError(null)
    api.post('/public/sign-forms', {
      client_id: clientId,
      appointment_id: appointmentId || null,
      signatures: allSigs,
      patient_email: patientEmail,
      patient_name: patientName,
    })
      .then(() => onComplete(allSigs))
      .catch(() => setError('Could not save signatures. Please try again.'))
      .finally(() => setSubmitting(false))
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              {INTAKE_FORMS.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all ${idx < formIndex ? 'bg-green-400 w-6' : idx === formIndex ? 'bg-pink-500 w-8' : 'bg-gray-200 w-6'}`} />
              ))}
            </div>
            <h2 className="text-base font-bold text-gray-900">{currentForm.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Form {formIndex + 1} of {INTAKE_FORMS.length}</p>
          </div>
          <button
            onClick={onSkip}
            className="text-xs text-gray-400 hover:text-gray-600 underline ml-4 flex-shrink-0"
          >
            Sign in-office
          </button>
        </div>

        {/* Scroll hint */}
        {!scrolledToBottom && !loadingContent && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-1.5 flex-shrink-0">
            <p className="text-xs text-amber-700 font-medium">↓ Scroll to the bottom to unlock the signature field</p>
          </div>
        )}

        {/* Form content */}
        <div
          ref={bodyRef}
          onScroll={handleScroll}
          className="overflow-y-auto flex-1 px-6 py-4"
        >
          {loadingContent ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
            </div>
          ) : (
            <div>{renderMarkdown(content)}</div>
          )}
        </div>

        {/* Signature area */}
        <div className="border-t border-gray-200 px-6 py-4 space-y-3 flex-shrink-0 bg-gray-50 rounded-b-2xl">
          {error && <p className="text-xs text-red-600">{error}</p>}

          <label className={`flex items-start gap-3 cursor-pointer ${!scrolledToBottom ? 'opacity-40 pointer-events-none' : ''}`}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 rounded border-gray-300"
            />
            <span className="text-xs text-gray-700 leading-snug">
              I have read and understood this form and agree to its terms.
            </span>
          </label>

          <div className={!scrolledToBottom ? 'opacity-40 pointer-events-none' : ''}>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Type your full legal name as your electronic signature *
            </label>
            <input
              type="text"
              value={signature}
              onChange={e => setSignature(e.target.value)}
              placeholder="Your full legal name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium italic"
            />
            <p className="text-xs text-gray-400 mt-1">
              Signed on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <button
            disabled={!canSign || submitting}
            onClick={handleSign}
            className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Saving...</>
            ) : isLast ? 'Sign & Submit All Forms' : `Sign & Continue →`}
          </button>
        </div>
      </div>
    </div>
  )
}
