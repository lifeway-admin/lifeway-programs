import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import shared from '../lib/i18n/shared'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STILL_WAITING_THRESHOLD_MS = 5 * 60 * 1000

export default function ChatWidget() {
  const { lang } = useLanguage()
  const t = shared[lang].chat

  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState('intake') // intake | chatting
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [visitorToken, setVisitorToken] = useState(null)
  const [status, setStatus] = useState('waiting')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const [hoursInfo, setHoursInfo] = useState(null) // null until fetched: { is_open, hours_text }
  const [chatStartedAt, setChatStartedAt] = useState(null)
  const [stillWaiting, setStillWaiting] = useState(false)
  const lastIdRef = useRef(0)
  const messagesEndRef = useRef(null)

  // Restore an in-progress conversation on mount
  useEffect(() => {
    const savedId = sessionStorage.getItem('lw_chat_session_id')
    const savedToken = sessionStorage.getItem('lw_chat_token')
    const savedStartedAt = sessionStorage.getItem('lw_chat_started_at')
    if (savedId && savedToken) {
      setSessionId(Number(savedId))
      setVisitorToken(savedToken)
      setPhase('chatting')
      if (savedStartedAt) setChatStartedAt(Number(savedStartedAt))
    }
  }, [])

  // Fetch business-hours status the first time the widget is opened
  useEffect(() => {
    if (!open || hoursInfo) return
    fetch(`${API}/public/chat/hours?lang=${lang}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (data) setHoursInfo(data) })
      .catch(() => {})
  }, [open, hoursInfo, lang])

  // Poll for status + new messages while the panel is open
  useEffect(() => {
    if (!open || phase !== 'chatting' || !sessionId || !visitorToken) return
    let cancelled = false

    async function poll() {
      try {
        const statusRes = await fetch(`${API}/public/chat/sessions/${sessionId}`, {
          headers: { 'X-Chat-Token': visitorToken },
        })
        if (statusRes.ok && !cancelled) {
          const data = await statusRes.json()
          setStatus(data.status)
          setStillWaiting(
            data.status === 'waiting' && !!chatStartedAt && (Date.now() - chatStartedAt) > STILL_WAITING_THRESHOLD_MS
          )
        }
        const msgRes = await fetch(`${API}/public/chat/sessions/${sessionId}/messages?after_id=${lastIdRef.current}`, {
          headers: { 'X-Chat-Token': visitorToken },
        })
        if (msgRes.ok && !cancelled) {
          const newMsgs = await msgRes.json()
          if (newMsgs.length > 0) {
            lastIdRef.current = newMsgs[newMsgs.length - 1].id
            setMessages(prev => [...prev, ...newMsgs])
          }
        }
      } catch {}
    }

    poll()
    const interval = setInterval(poll, 4000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [open, phase, sessionId, visitorToken, chatStartedAt])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const phoneDigitCount = (phone.match(/\d/g) || []).length
  const canStart = name.trim().length > 0 && EMAIL_RE.test(email) && phoneDigitCount >= 7

  async function startChat(e) {
    e.preventDefault()
    if (!canStart) return
    setStarting(true)
    setError('')
    try {
      const res = await fetch(`${API}/public/chat/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitor_name: name.trim(), visitor_email: email.trim(), visitor_phone: phone.trim() }),
      })
      if (!res.ok) {
        setError(t.errorGeneric)
        return
      }
      const data = await res.json()
      const startedAt = Date.now()
      setSessionId(data.session_id)
      setVisitorToken(data.visitor_token)
      setChatStartedAt(startedAt)
      sessionStorage.setItem('lw_chat_session_id', data.session_id)
      sessionStorage.setItem('lw_chat_token', data.visitor_token)
      sessionStorage.setItem('lw_chat_started_at', String(startedAt))
      setPhase('chatting')
    } catch {
      setError(t.errorGeneric)
    } finally {
      setStarting(false)
    }
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim() || !sessionId) return
    const content = input.trim()
    setInput('')
    setError('')
    try {
      const res = await fetch(`${API}/public/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Chat-Token': visitorToken },
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        const msg = await res.json()
        lastIdRef.current = msg.id
        setMessages(prev => [...prev, msg])
      } else {
        setError(t.errorSend)
        setInput(content)
      }
    } catch {
      setError(t.errorSend)
      setInput(content)
    }
  }

  const statusLine = status === 'closed' ? t.ended : (status === 'active') ? `${t.chattingWith} Lifeway Support` : t.waiting

  return (
    <div className="fixed bottom-24 right-5 md:bottom-5 z-40">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={t.bubbleLabel}
          className="w-14 h-14 rounded-full bg-lw-pink text-white shadow-xl flex items-center justify-center hover:bg-lw-pink-dark transition-colors"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {open && (
        <div className="w-80 sm:w-96 h-[28rem] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          <div className="bg-lw-navy text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div>
              <p className="font-semibold text-sm">{t.title}</p>
              {phase === 'chatting' && <p className="text-xs text-gray-300 mt-0.5">{statusLine}</p>}
            </div>
            <button onClick={() => setOpen(false)} aria-label={t.close}>
              <X size={18} className="text-gray-300 hover:text-white transition-colors" />
            </button>
          </div>

          {phase === 'intake' ? (
            <form onSubmit={startChat} className="p-4 flex-1 flex flex-col gap-3">
              {hoursInfo && !hoursInfo.is_open && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  {t.offlineBanner.replace('{hours}', hoursInfo.hours_text)}
                </p>
              )}
              <p className="text-sm text-gray-500">{t.intakeSubtitle}</p>
              <input
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lw-pink"
                placeholder={t.namePlaceholder}
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={200}
              />
              <input
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lw-pink"
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={e => setEmail(e.target.value)}
                maxLength={200}
              />
              <input
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lw-pink"
                type="tel"
                placeholder={t.phonePlaceholder}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                maxLength={30}
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={!canStart || starting}
                className="mt-auto bg-lw-pink hover:bg-lw-pink-dark disabled:opacity-40 text-white font-semibold rounded-lg py-2 text-sm transition-colors"
              >
                {starting ? '…' : t.startChat}
              </button>
              <p className="text-[11px] text-gray-400 leading-snug">{t.disclaimer}</p>
            </form>
          ) : (
            <>
              {error && <p className="text-xs text-red-600 px-3 pt-2">{error}</p>}
              {stillWaiting && (
                <p className="text-xs text-amber-700 bg-amber-50 border-b border-amber-200 px-3 py-2">
                  {t.stillWaitingBanner}
                </p>
              )}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                {messages.map(m => (
                  <div key={m.id} className={`flex flex-col ${m.sender_role === 'visitor' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-gray-400 mb-0.5 px-1">
                      {m.sender_role === 'visitor' ? m.sender_name : 'Lifeway Support'}
                    </span>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-snug ${m.sender_role === 'visitor' ? 'bg-lw-pink text-white' : 'bg-gray-100 text-gray-800'}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} className="border-t border-gray-100 p-3 flex gap-2 flex-shrink-0">
                <input
                  className="flex-1 border border-gray-200 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lw-pink disabled:opacity-50"
                  placeholder={t.messagePlaceholder}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={status === 'closed'}
                  maxLength={5000}
                />
                <button
                  type="submit"
                  disabled={status === 'closed' || !input.trim()}
                  className="w-9 h-9 rounded-full bg-lw-pink hover:bg-lw-pink-dark disabled:opacity-40 text-white flex items-center justify-center flex-shrink-0 transition-colors"
                  aria-label={t.send}
                >
                  <Send size={15} />
                </button>
              </form>
              <p className="text-[10px] text-gray-400 leading-snug px-3 pb-2">{t.disclaimer}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
