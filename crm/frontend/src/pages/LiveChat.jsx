import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, UserCheck, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import api from '../api'
import { useToast } from '../context/ToastContext'

const STATUS_TABS = ['waiting', 'active', 'closed']

const STATUS_COLORS = {
  waiting: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
}

function SessionList({ sessions, selectedId, onSelect, statusTab, setStatusTab }) {
  return (
    <div className="w-80 border-r border-gray-100 dark:border-gray-700 flex flex-col flex-shrink-0">
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 m-3">
        {STATUS_TABS.map(s => (
          <button
            key={s}
            onClick={() => setStatusTab(s)}
            className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${statusTab === s ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1.5">
        {sessions.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No {statusTab} conversations.</p>
        )}
        {sessions.map(s => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`w-full text-left p-3 rounded-xl border transition-colors ${
              selectedId === s.id
                ? 'border-lifeway-pink bg-lifeway-light dark:bg-gray-700'
                : 'border-gray-100 dark:border-gray-700 hover:border-lifeway-pink/30 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-medium text-sm text-gray-900 dark:text-white truncate">{s.visitor_name}</span>
              <span className={`badge ${STATUS_COLORS[s.status]} flex-shrink-0`}>{s.status}</span>
            </div>
            <p className="text-xs text-gray-400">
              {s.assigned_staff_name ? `with ${s.assigned_staff_name}` : 'unclaimed'} · {formatDistanceToNow(new Date(s.last_message_at), { addSuffix: true })}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

function ChatThread({ sessionId, onChanged, toast }) {
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const lastIdRef = useRef(0)
  const endRef = useRef(null)

  async function loadSession() {
    try {
      const { data } = await api.get(`/chat/sessions/${sessionId}`)
      setSession(data)
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to load this conversation.', 'error')
    }
  }

  useEffect(() => {
    let cancelled = false
    setSession(null)
    setMessages([])
    lastIdRef.current = 0
    ;(async () => {
      try {
        const { data } = await api.get(`/chat/sessions/${sessionId}`)
        if (!cancelled) setSession(data)
      } catch (err) {
        if (!cancelled) toast(err.response?.data?.detail || 'Failed to load this conversation.', 'error')
      }
    })()
    return () => { cancelled = true }
  }, [sessionId])

  useEffect(() => {
    let cancelled = false
    async function poll() {
      try {
        const { data } = await api.get(`/chat/sessions/${sessionId}/messages`, { params: { after_id: lastIdRef.current } })
        if (data.length > 0 && !cancelled) {
          lastIdRef.current = data[data.length - 1].id
          setMessages(prev => [...prev, ...data])
        }
      } catch {}
    }
    poll()
    const interval = setInterval(poll, 4000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [sessionId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function claim() {
    try {
      await api.post(`/chat/sessions/${sessionId}/claim`)
      toast('Conversation claimed.', 'success')
      loadSession()
      onChanged()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to claim.', 'error')
    }
  }

  async function close() {
    try {
      await api.patch(`/chat/sessions/${sessionId}/close`)
      toast('Conversation closed.', 'success')
      loadSession()
      onChanged()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to close.', 'error')
    }
  }

  async function send(e) {
    e.preventDefault()
    if (!input.trim()) return
    const content = input.trim()
    setInput('')
    try {
      const { data } = await api.post(`/chat/sessions/${sessionId}/messages`, { content })
      lastIdRef.current = data.id
      setMessages(prev => [...prev, data])
      loadSession()
      onChanged()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to send message.', 'error')
    }
  }

  if (!session) return <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{session.visitor_name}</p>
          <p className="text-xs text-gray-400">{session.visitor_email}</p>
        </div>
        <div className="flex items-center gap-2">
          {!session.assigned_staff_name && session.status !== 'closed' && (
            <button onClick={claim} className="btn-secondary text-sm flex items-center gap-1.5 py-1.5 px-3">
              <UserCheck size={14} /> Claim
            </button>
          )}
          {session.status !== 'closed' && (
            <button onClick={close} className="btn-secondary text-sm flex items-center gap-1.5 py-1.5 px-3 text-red-600">
              <XCircle size={14} /> Close
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender_role === 'staff' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-sm leading-snug ${m.sender_role === 'staff' ? 'bg-lifeway-pink text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="border-t border-gray-100 dark:border-gray-700 p-4 flex gap-2">
        <input
          className="input flex-1"
          placeholder="Type a reply..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={session.status === 'closed'}
        />
        <button
          type="submit"
          disabled={session.status === 'closed' || !input.trim()}
          className="btn-primary flex items-center gap-1.5 disabled:opacity-40"
        >
          <Send size={15} /> Send
        </button>
      </form>
    </div>
  )
}

export default function LiveChat() {
  const { toast } = useToast()
  const [statusTab, setStatusTab] = useState('waiting')
  const [sessions, setSessions] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const { data } = await api.get('/chat/sessions', { params: { status: statusTab } })
      setSessions(data)
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to load conversations.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [statusTab])

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>

  return (
    <div className="h-[calc(100vh-57px)] flex flex-col">
      <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-lifeway-light flex items-center justify-center">
          <MessageCircle size={20} className="text-lifeway-pink" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Live Chat</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{sessions.length} {statusTab} conversations</p>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <SessionList sessions={sessions} selectedId={selectedId} onSelect={setSelectedId} statusTab={statusTab} setStatusTab={setStatusTab} />
        {selectedId ? (
          <ChatThread sessionId={selectedId} onChanged={load} toast={toast} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to view the thread.
          </div>
        )}
      </div>
    </div>
  )
}
