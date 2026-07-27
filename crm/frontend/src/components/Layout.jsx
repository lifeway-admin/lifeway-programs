import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  LayoutDashboard, Users, Calendar, DollarSign,
  UserCheck, Sparkles, LogOut, Heart, Tag,
  Search, Home, BarChart2, Clock, FileText, Shield, Settings, CalendarDays,
  Users2, FolderOpen, ListChecks, CalendarOff, MessageCircle,
} from 'lucide-react'
import GlobalSearch from './GlobalSearch'
import GoogleCalendarStatus from './GoogleCalendarStatus'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
import SessionTimeoutWarning from './SessionTimeoutWarning'
import { useToast } from '../context/ToastContext'
import api from '../api'

const navSections = [
  {
    label: null,
    items: [
      { to: '/home', icon: Home, label: 'Home' },
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/my-schedule', icon: CalendarDays, label: 'My Schedule' },
    ],
  },
  {
    label: 'Clients & Services',
    items: [
      { to: '/clients', icon: Users, label: 'Clients' },
      { to: '/appointments', icon: Calendar, label: 'Appointments' },
      { to: '/donations', icon: DollarSign, label: 'Donations' },
      { to: '/tickets', icon: Tag, label: 'Tickets' },
      { to: '/live-chat', icon: MessageCircle, label: 'Live Chat' },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/staff', icon: UserCheck, label: 'Staff & Volunteers', adminOnly: true },
      { to: '/reports', icon: BarChart2, label: 'Reports' },
    ],
  },
  {
    label: 'HR',
    items: [
      { to: '/directory', icon: Users2, label: 'Directory' },
      { to: '/documents', icon: FolderOpen, label: 'Documents' },
      { to: '/onboarding', icon: ListChecks, label: 'Onboarding' },
      { to: '/time-off', icon: CalendarOff, label: 'Time Off' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/audit-log', icon: FileText, label: 'Audit Log', adminOnly: true },
      { to: '/policies', icon: Shield, label: 'Policies' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
  {
    label: 'Under Development',
    dev: true,
    items: [
      { to: '/ai-agent', icon: Sparkles, label: 'AI Marketing' },
    ],
  },
]

export default function Layout() {
  const navigate = useNavigate()
  const [showSearch, setShowSearch] = useState(false)
  const { recentItems } = useRecentlyViewed()
  const [showHelp, setShowHelp] = useState(false)
  const isAdmin = localStorage.getItem('role') === 'admin'
  const { toast } = useToast()
  const [waitingChatCount, setWaitingChatCount] = useState(0)
  const prevWaitingCountRef = useRef(0)
  const primedRef = useRef(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])
  useKeyboardShortcuts({ onSearchOpen: () => setShowSearch(true), onHelpOpen: () => setShowHelp(true), navigate })

  useEffect(() => {
    let cancelled = false
    async function pollWaitingCount() {
      try {
        const { data } = await api.get('/chat/sessions/count', { params: { status: 'waiting' } })
        if (cancelled) return
        // Don't toast on the very first poll — that would fire for a pre-existing
        // backlog at login, not a genuinely new arrival.
        if (primedRef.current && data.count > prevWaitingCountRef.current) {
          toast('New chat waiting', 'info')
        }
        primedRef.current = true
        prevWaitingCountRef.current = data.count
        setWaitingChatCount(data.count)
      } catch {}
    }
    pollWaitingCount()
    const interval = setInterval(pollWaitingCount, 12000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-lifeway-pink flex items-center justify-center">
              <Heart size={18} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white text-sm leading-tight">Lifeway Programs</div>
              <div className="text-xs text-gray-400">CRM Dashboard</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto space-y-4">
          {navSections.map((section, si) => {
            const visibleItems = section.items.filter(item => !item.adminOnly || isAdmin)
            if (visibleItems.length === 0) return null
            return (
            <div key={si}>
              {section.label && (
                <p className={`text-xs font-bold uppercase tracking-widest px-3 mb-1 ${
                  section.dev
                    ? 'text-amber-400 dark:text-amber-500'
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        section.dev
                          ? isActive
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                            : 'text-gray-400 dark:text-gray-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:text-amber-600 dark:hover:text-amber-400'
                          : isActive
                            ? 'bg-lifeway-light text-lifeway-pink'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                    {to === '/live-chat' && waitingChatCount > 0 && (
                      <span className="ml-auto text-[10px] font-bold bg-lifeway-pink text-white rounded-full px-1.5 py-0.5 leading-none min-w-[18px] text-center">
                        {waitingChatCount}
                      </span>
                    )}
                    {section.dev && (
                      <span className="ml-auto text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400 rounded px-1.5 py-0.5 leading-none">
                        WIP
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
            )
          })}
        </nav>

        {recentItems.length > 0 && (
          <div className="px-4 pt-2 pb-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 mb-1">Recent</p>
            {recentItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    isActive
                      ? 'bg-lifeway-light text-lifeway-pink'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-white'
                  }`
                }
              >
                <Clock size={12} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-1">
          <GoogleCalendarStatus />
          <a
            href={import.meta.env.VITE_MARKETING_URL || 'http://localhost:5175'}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 w-full transition-colors"
          >
            <Home size={18} />
            Lifeway Programs Site
          </a>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 w-full transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {/* Top bar with search */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-8 py-3 flex items-center justify-between">
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500 transition-colors text-sm bg-gray-50 dark:bg-gray-700 w-64"
          >
            <Search size={15} />
            <span>Search clients, tickets...</span>
            <kbd className="ml-auto text-xs bg-gray-200 dark:bg-gray-600 rounded px-1.5 py-0.5">/</kbd>
          </button>
          <div className="text-xs text-gray-400">
            {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            {' · '}
            {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
        </div>

        <Outlet />
      </main>

      {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} />}

      {showHelp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
          <div className="card max-w-sm w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
            <div className="space-y-2 text-sm">
              {[
                ['/','Open search'],
                ['g h','Home'],
                ['g d','Dashboard'],
                ['g c','Clients'],
                ['g a','Appointments'],
                ['g t','Tickets'],
                ['g r','Reports'],
                ['?','Show this help'],
              ].map(([key, label]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">{label}</span>
                  <kbd className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-0.5 rounded font-mono">{key}</kbd>
                </div>
              ))}
            </div>
            <button onClick={() => setShowHelp(false)} className="btn-secondary w-full text-sm">Close</button>
          </div>
        </div>
      )}

      <SessionTimeoutWarning />
    </div>
  )
}
