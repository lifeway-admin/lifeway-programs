import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'

const CRM_URL = import.meta.env.VITE_CRM_URL || 'http://localhost:5173'

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { label: 'Services', dropdown: [
    { to: '/services', label: 'Overview' },
    { to: '/insurances', label: 'Insurances Accepted' },
  ] },
  { label: 'Our Team', dropdown: [
    { to: '/founder', label: 'Founder' },
    { to: '/team', label: 'Team' },
  ] },
  { to: '/donate', label: 'Donate' },
  { to: '/contact', label: 'Contact' },
  { to: '/faq', label: 'FAQ' },
  { to: null, label: 'Staff Login', href: CRM_URL },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(null)
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/images/logo.png" alt="LifeWay Center" className="h-9 w-9 rounded-lg object-cover" onError={e => { e.target.style.display='none' }} />
          <span className="font-bold text-lw-navy text-lg">LifeWay <span className="text-lw-pink">Center</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map(l => {
            if (l.href) {
              return (
                <a key={l.label} href={l.href}
                  className="text-sm font-medium text-gray-600 hover:text-lw-pink transition-colors">
                  {l.label}
                </a>
              )
            }
            if (l.dropdown) {
              const isActive = l.dropdown.some(d => d.to === pathname)
              return (
                <div key={l.label} className="relative group">
                  <button
                    className={`flex items-center gap-1 text-sm font-medium transition-colors ${isActive ? 'text-lw-pink' : 'text-gray-600 hover:text-lw-pink'}`}
                  >
                    {l.label} <ChevronDown size={14} />
                  </button>
                  <div className="absolute left-0 top-full pt-2 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[140px]">
                      {l.dropdown.map(d => (
                        <NavLink
                          key={d.to}
                          to={d.to}
                          className={({ isActive }) =>
                            `block px-4 py-2 text-sm font-medium transition-colors ${isActive ? 'text-lw-pink bg-lw-pink-light' : 'text-gray-600 hover:text-lw-pink hover:bg-lw-pink-light'}`
                          }
                        >
                          {d.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }
            return (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-lw-pink' : 'text-gray-600 hover:text-lw-pink'}`
                }
              >
                {l.label}
              </NavLink>
            )
          })}
          <Link to="/book" className="btn-primary text-sm py-2 px-4">Book Appointment</Link>
        </nav>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          {links.map(l => {
            if (l.href) {
              return (
                <a key={l.label} href={l.href} onClick={() => setOpen(false)}
                  className="block text-sm font-medium py-2 text-gray-700">
                  {l.label}
                </a>
              )
            }
            if (l.dropdown) {
              const isOpen = mobileDropdownOpen === l.label
              return (
                <div key={l.label}>
                  <button
                    onClick={() => setMobileDropdownOpen(isOpen ? null : l.label)}
                    className="flex items-center gap-1 text-sm font-medium py-2 text-gray-700 w-full"
                  >
                    {l.label} <ChevronDown size={14} className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                  </button>
                  {isOpen && (
                    <div className="pl-4 space-y-1">
                      {l.dropdown.map(d => (
                        <NavLink
                          key={d.to}
                          to={d.to}
                          onClick={() => setOpen(false)}
                          className={({ isActive }) =>
                            `block text-sm font-medium py-2 ${isActive ? 'text-lw-pink' : 'text-gray-600'}`
                          }
                        >
                          {d.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
            return (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block text-sm font-medium py-2 ${isActive ? 'text-lw-pink' : 'text-gray-700'}`
                }
              >
                {l.label}
              </NavLink>
            )
          })}
          <Link to="/book" onClick={() => setOpen(false)} className="btn-primary text-sm py-2 px-4 w-full text-center block">
            Book Appointment
          </Link>
          <a href={CRM_URL} className="block text-xs text-gray-400 text-center pt-1">Staff Login</a>
        </div>
      )}
    </header>
  )
}
