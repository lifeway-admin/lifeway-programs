import { useState } from 'react'
import { Settings as SettingsIcon, Lock, Sun, Moon, AlignJustify, Check } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useDensity } from '../context/DensityContext'
import api from '../api'
import { useToast } from '../context/ToastContext'

function Section({ title, children }) {
  return (
    <div className="card p-6 mb-6">
      <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-5">{title}</h2>
      {children}
    </div>
  )
}

function ToggleRow({ icon: Icon, label, description, active, onToggle }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Icon size={16} className="text-gray-500 dark:text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          {description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`w-11 h-6 rounded-full transition-colors flex items-center ${active ? 'bg-lifeway-pink' : 'bg-gray-200 dark:bg-gray-600'}`}
      >
        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { density, toggleDensity } = useDensity()
  const { toast } = useToast()

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwErrors, setPwErrors] = useState({})

  const setPw = k => e => setPwForm(f => ({ ...f, [k]: e.target.value }))

  async function handleChangePassword(e) {
    e.preventDefault()
    const errors = {}
    if (!pwForm.current_password) errors.current_password = 'Required'
    if (!pwForm.new_password) errors.new_password = 'Required'
    if (pwForm.new_password && pwForm.new_password.length < 10) errors.new_password = 'Minimum 10 characters'
    if (pwForm.new_password !== pwForm.confirm) errors.confirm = 'Passwords do not match'
    setPwErrors(errors)
    if (Object.keys(errors).length > 0) return

    setPwLoading(true)
    try {
      await api.post('/auth/change-password', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      })
      toast('Password changed successfully.', 'success')
      setPwForm({ current_password: '', new_password: '', confirm: '' })
      setPwErrors({})
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to change password.'
      toast(msg, 'error')
    } finally {
      setPwLoading(false)
    }
  }

  const inputClass = field =>
    `input ${pwErrors[field] ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : ''}`

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-lifeway-light flex items-center justify-center">
          <SettingsIcon size={20} className="text-lifeway-pink" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Manage your account and preferences</p>
        </div>
      </div>

      {/* Appearance */}
      <Section title="Appearance">
        <ToggleRow
          icon={theme === 'dark' ? Moon : Sun}
          label="Dark Mode"
          description="Switch between light and dark interface"
          active={theme === 'dark'}
          onToggle={toggleTheme}
        />
        <ToggleRow
          icon={AlignJustify}
          label="Compact View"
          description="Reduce padding and spacing for a denser layout"
          active={density === 'compact'}
          onToggle={toggleDensity}
        />
      </Section>

      {/* Change Password */}
      <Section title="Security">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Lock size={16} className="text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Change Password</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Must be at least 10 characters with uppercase, lowercase, and a number</p>
          </div>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input
              type="password"
              className={inputClass('current_password')}
              value={pwForm.current_password}
              onChange={setPw('current_password')}
              autoComplete="current-password"
            />
            {pwErrors.current_password && <p className="text-xs text-red-500 mt-1">{pwErrors.current_password}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              className={inputClass('new_password')}
              value={pwForm.new_password}
              onChange={setPw('new_password')}
              autoComplete="new-password"
            />
            {pwErrors.new_password && <p className="text-xs text-red-500 mt-1">{pwErrors.new_password}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              className={inputClass('confirm')}
              value={pwForm.confirm}
              onChange={setPw('confirm')}
              autoComplete="new-password"
            />
            {pwErrors.confirm && <p className="text-xs text-red-500 mt-1">{pwErrors.confirm}</p>}
          </div>

          {/* Strength hints */}
          {pwForm.new_password.length > 0 && (
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                ['10+ characters', pwForm.new_password.length >= 10],
                ['Uppercase letter', /[A-Z]/.test(pwForm.new_password)],
                ['Lowercase letter', /[a-z]/.test(pwForm.new_password)],
                ['Number', /\d/.test(pwForm.new_password)],
              ].map(([label, met]) => (
                <div key={label} className={`flex items-center gap-1.5 ${met ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                  <Check size={12} className={met ? 'opacity-100' : 'opacity-0'} />
                  <span className={met ? '' : 'pl-3.5'}>{label}</span>
                </div>
              ))}
            </div>
          )}

          <button type="submit" disabled={pwLoading} className="btn-primary flex items-center gap-2">
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </Section>
    </div>
  )
}
