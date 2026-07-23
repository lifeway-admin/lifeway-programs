import { useState } from 'react'
import { Sparkles, Send, Copy, Check } from 'lucide-react'
import { useToast } from '../context/ToastContext'

const TOOLS = [
  { id: 'social', label: 'Social Media Post', desc: 'Facebook, Instagram, LinkedIn, Twitter' },
  { id: 'email', label: 'Email Campaign', desc: 'Newsletters, appeals, announcements' },
  { id: 'blog', label: 'SEO Blog Post', desc: 'Keyword-optimized articles' },
  { id: 'lead', label: 'Lead Follow-up', desc: 'Personalized inquiry responses' },
  { id: 'ads', label: 'Google Ads', desc: 'Headlines, descriptions, keywords' },
  { id: 'calendar', label: 'Content Calendar', desc: 'Monthly posting plan' },
]

const SERVICES = ['Mental Health', 'Medical', 'Social Services', 'Spiritual Support', 'Employment', 'Food Support', 'Wellness', 'Donations']
const PLATFORMS = ['Facebook', 'Instagram', 'LinkedIn', 'Twitter']

export default function AIAgent() {
  const { toast } = useToast()
  const [tool, setTool] = useState('social')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    platform: 'Facebook', topic: '', service: '',
    audience: '', subject_hint: '', keywords: '',
    inquiry_type: '', language: 'english',
    month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function generate() {
    setLoading(true)
    setResult('')
    try {
      const payload = { tool, ...form }
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      setResult(data.content || data.detail || 'Error generating content.')
      if (data.content) toast('Content generated.', 'success')
      else toast('Generation failed. Check your API key.', 'error')
    } catch {
      setResult('Error connecting to AI service. Make sure ANTHROPIC_API_KEY is set.')
      toast('Generation failed. Check your API key.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    toast('Copied to clipboard.', 'info')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles size={24} className="text-lifeway-pink" /> AI Marketing Agent
        </h1>
        <p className="text-gray-500 mt-1">Generate content powered by Claude AI for Lifeway Programs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tool selector */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-3">Choose a tool</p>
          {TOOLS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTool(t.id); setResult('') }}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                tool === t.id
                  ? 'border-lifeway-pink bg-lifeway-light'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <p className={`font-medium text-sm ${tool === t.id ? 'text-lifeway-pink' : 'text-gray-900'}`}>{t.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="card space-y-4">
          <p className="font-semibold text-gray-900">{TOOLS.find(t => t.id === tool)?.label}</p>

          {tool === 'social' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select className="input" value={form.platform} onChange={set('platform')}>
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic / Message *</label>
                <textarea className="input" rows={3} placeholder="e.g. Raising awareness about mental health services..." value={form.topic} onChange={set('topic')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Focus</label>
                <select className="input" value={form.service} onChange={set('service')}>
                  <option value="">Any</option>
                  {SERVICES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </>
          )}

          {tool === 'email' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type *</label>
                <input className="input" placeholder="e.g. Year-end donation appeal" value={form.audience} onChange={set('campaign_type')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience *</label>
                <input className="input" placeholder="e.g. Past donors, new clients" value={form.audience} onChange={set('audience')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Hint</label>
                <input className="input" placeholder="e.g. Holiday giving, impact update" value={form.subject_hint} onChange={set('subject_hint')} />
              </div>
            </>
          )}

          {tool === 'blog' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blog Topic *</label>
                <input className="input" placeholder="e.g. How to access mental health support in Miami" value={form.topic} onChange={set('topic')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Keywords</label>
                <input className="input" placeholder="e.g. mental health nonprofit, community health" value={form.keywords} onChange={set('keywords')} />
              </div>
            </>
          )}

          {tool === 'lead' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inquiry Type *</label>
                <input className="input" placeholder="e.g. mental health therapy, food assistance" value={form.inquiry_type} onChange={set('inquiry_type')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select className="input" value={form.language} onChange={set('language')}>
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                </select>
              </div>
            </>
          )}

          {tool === 'ads' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service to Advertise *</label>
                <select className="input" value={form.service} onChange={set('service')}>
                  <option value="">Select...</option>
                  {SERVICES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Goal</label>
                <select className="input" value={form.topic} onChange={set('topic')}>
                  <option value="appointments">Book Appointments</option>
                  <option value="awareness">Brand Awareness</option>
                  <option value="donations">Donations</option>
                  <option value="volunteers">Recruit Volunteers</option>
                </select>
              </div>
            </>
          )}

          {tool === 'calendar' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <input className="input" value={form.month} onChange={set('month')} placeholder="e.g. June 2026" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Services to Highlight</label>
                <input className="input" placeholder="e.g. Mental Health, Food Support" value={form.topic} onChange={set('topic')} />
              </div>
            </>
          )}

          <button onClick={generate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            <Send size={16} />
            {loading ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>

        {/* Output */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-900">Generated Content</p>
            {result && (
              <button onClick={copy} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                {copied ? <><Check size={14} className="text-green-500" /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
            )}
          </div>
          <div className="flex-1 min-h-64">
            {loading && (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-lifeway-pink border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loading && !result && (
              <div className="flex items-center justify-center h-32 text-gray-300">
                <Sparkles size={32} />
              </div>
            )}
            {result && (
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{result}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
