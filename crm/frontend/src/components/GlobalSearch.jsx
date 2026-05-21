import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Users, Tag } from 'lucide-react'
import api from '../api'

export default function GlobalSearch({ onClose }) {
  const [query, setQuery] = useState('')
  const [clients, setClients] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (query.length < 3) {
      setClients([])
      setTickets([])
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const [cr, tr] = await Promise.allSettled([
          api.get('/clients/', { params: { search: query } }),
          api.get('/tickets/', { params: { search: query } }),
        ])
        setClients(cr.status === 'fulfilled' ? (cr.value.data?.results || cr.value.data || []).slice(0, 5) : [])
        setTickets(tr.status === 'fulfilled' ? (tr.value.data?.results || tr.value.data || []).slice(0, 5) : [])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  function goClient(c) {
    navigate(`/clients/${c.id}`)
    onClose()
  }

  function goTicket(t) {
    navigate('/tickets')
    onClose()
  }

  const hasResults = clients.length > 0 || tickets.length > 0

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-24 px-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search clients, tickets..."
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-lifeway-pink border-t-transparent rounded-full animate-spin flex-shrink-0" />
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={18} />
          </button>
        </div>

        {query.length > 0 && query.length < 3 && (
          <p className="px-4 py-3 text-sm text-gray-400">Type at least 3 characters to search...</p>
        )}

        {query.length >= 3 && !loading && !hasResults && (
          <p className="px-4 py-6 text-sm text-gray-400 text-center">No results found for "{query}"</p>
        )}

        {hasResults && (
          <div className="max-h-96 overflow-y-auto">
            {clients.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700">
                  <Users size={13} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clients</span>
                </div>
                {clients.map(c => (
                  <button
                    key={c.id}
                    onClick={() => goClient(c)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-lifeway-light flex items-center justify-center text-lifeway-pink text-xs font-bold flex-shrink-0">
                      {c.first_name?.[0]}{c.last_name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{c.first_name} {c.last_name}</p>
                      <p className="text-xs text-gray-400">{c.email || c.phone || c.primary_service || '—'}</p>
                    </div>
                    <span className={`ml-auto badge ${c.case_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {c.case_status}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {tickets.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700">
                  <Tag size={13} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tickets</span>
                </div>
                {tickets.map(t => (
                  <button
                    key={t.id}
                    onClick={() => goTicket(t)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-xs font-bold flex-shrink-0">
                      <Tag size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{t.title}</p>
                      <p className="text-xs text-gray-400">#{t.ticket_number} · {t.type} · {t.status}</p>
                    </div>
                    <span className={`ml-auto badge ${
                      t.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                      t.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      t.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {t.priority}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center gap-3 text-xs text-gray-400">
          <span><kbd className="bg-gray-100 dark:bg-gray-700 rounded px-1">↑↓</kbd> navigate</span>
          <span><kbd className="bg-gray-100 dark:bg-gray-700 rounded px-1">Enter</kbd> select</span>
          <span><kbd className="bg-gray-100 dark:bg-gray-700 rounded px-1">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
