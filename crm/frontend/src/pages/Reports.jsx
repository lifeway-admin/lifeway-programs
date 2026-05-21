import { useState, useEffect, useCallback } from 'react'
import { BarChart2, Users, Calendar, DollarSign, Tag } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const API = 'http://localhost:8000'
const tabs = [
  { key: 'clients', label: 'Clients', icon: Users },
  { key: 'appointments', label: 'Appointments', icon: Calendar },
  { key: 'donations', label: 'Donations', icon: DollarSign },
  { key: 'tickets', label: 'Tickets', icon: Tag },
]

function fmt(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function StatCard({ label, value, sub }) {
  return (
    <div className="card p-5">
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function Reports() {
  const token = localStorage.getItem('token')
  const [activeTab, setActiveTab] = useState('clients')
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)

  const defaultStart = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10)
  const defaultEnd = new Date().toISOString().slice(0, 10)
  const [startDate, setStartDate] = useState(defaultStart)
  const [endDate, setEndDate] = useState(defaultEnd)

  const fetchData = useCallback(async (tab) => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/reports/${tab}?start_date=${startDate}&end_date=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json()
      setData(prev => ({ ...prev, [tab]: json }))
    } catch {}
    setLoading(false)
  }, [startDate, endDate, token])

  useEffect(() => { fetchData(activeTab) }, [activeTab, fetchData])

  const d = data[activeTab] || {}

  return (
    <div className="max-w-6xl mx-auto px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart2 size={24} className="text-lifeway-pink" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input text-sm" />
          <span className="text-gray-400 text-sm">to</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input text-sm" />
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === key
                ? 'border-lifeway-pink text-lifeway-pink'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'clients' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Total Clients" value={d.total ?? '—'} />
              </div>
              {d.by_month?.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">New Clients by Month</h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={d.by_month?.map(r => ({ ...r, month: fmt(r.month) }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#c52177" radius={[4,4,0,0]} name="Clients" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {d.by_service?.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Clients by Service</h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={d.by_service?.map(r => ({ ...r, service: r.service?.replace(/_/g,' ') }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="service" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#aa1d51" radius={[4,4,0,0]} name="Clients" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          {activeTab === 'appointments' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Total Appointments" value={d.total ?? '—'} />
              </div>
              {d.by_month?.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Appointments by Month</h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={d.by_month?.map(r => ({ ...r, month: fmt(r.month) }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#c52177" radius={[4,4,0,0]} name="Appointments" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {d.by_provider?.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Appointments by Provider</h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={d.by_provider}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="provider" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#aa1d51" radius={[4,4,0,0]} name="Appointments" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          {activeTab === 'donations' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Total Raised" value={`$${(d.total_amount ?? 0).toLocaleString()}`} />
                <StatCard label="Total Donations" value={d.total_count ?? '—'} />
              </div>
              {d.by_month?.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Donations by Month</h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={d.by_month?.map(r => ({ ...r, month: fmt(r.month) }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Amount']} />
                      <Bar dataKey="amount" fill="#c52177" radius={[4,4,0,0]} name="Amount ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          {activeTab === 'tickets' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Open" value={d.by_status?.open ?? 0} />
                <StatCard label="In Progress" value={d.by_status?.in_progress ?? 0} />
                <StatCard label="Resolved" value={d.by_status?.resolved ?? 0} />
                <StatCard label="Closed" value={d.by_status?.closed ?? 0} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Total Tickets" value={d.total ?? '—'} />
                <StatCard label="Avg Resolution Time" value={d.avg_resolution_hours ? `${d.avg_resolution_hours}h` : '—'} sub="for resolved tickets" />
              </div>
              {d.by_priority && (
                <div className="card p-6">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Tickets by Priority</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={Object.entries(d.by_priority).map(([k, v]) => ({ priority: k, count: v }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#c52177" radius={[4,4,0,0]} name="Tickets" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          {Object.keys(d).length === 0 && !loading && (
            <div className="text-center py-16 text-gray-400">No data for selected date range.</div>
          )}
        </div>
      )}
    </div>
  )
}
