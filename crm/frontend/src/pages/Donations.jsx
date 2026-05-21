import { useEffect, useState } from 'react'
import { Plus, X, Download, CheckCircle2, Circle } from 'lucide-react'
import api from '../api'
import { useToast } from '../context/ToastContext'

function DonationForm({ initial, onSave, onClose, toast }) {
  const [form, setForm] = useState(initial || {
    donor_name: '', donor_email: '', donor_phone: '',
    donor_organization: '', amount: '', donation_type: 'one_time',
    campaign: '', payment_method: '', is_anonymous: false, notes: '',
  })

  async function submit(e) {
    e.preventDefault()
    const payload = { ...form, amount: Number(form.amount) }
    try {
      if (initial?.id) {
        await api.patch(`/donations/${initial.id}`, payload)
        toast('Donation recorded.', 'success')
      } else {
        await api.post('/donations/', payload)
        toast('Donation recorded.', 'success')
      }
      onSave()
    } catch {
      toast('Action failed.', 'error')
    }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{initial?.id ? 'Edit Donation' : 'Record Donation'}</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={submit} className="p-6 grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Donor Name *</label><input className="input" value={form.donor_name} onChange={set('donor_name')} required /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount ($) *</label><input className="input" type="number" step="0.01" value={form.amount} onChange={set('amount')} required /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input className="input" type="email" value={form.donor_email} onChange={set('donor_email')} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label><input className="input" value={form.donor_phone} onChange={set('donor_phone')} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization</label><input className="input" value={form.donor_organization} onChange={set('donor_organization')} /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select className="input" value={form.donation_type} onChange={set('donation_type')}>
              <option value="one_time">One-time</option>
              <option value="recurring">Recurring</option>
              <option value="in_kind">In-Kind</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign</label><input className="input" value={form.campaign} onChange={set('campaign')} /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
            <select className="input" value={form.payment_method} onChange={set('payment_method')}>
              <option value="">Select...</option>
              <option value="credit_card">Credit Card</option>
              <option value="check">Check</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={set('notes')} /></div>
          <div className="col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Donations() {
  const { toast } = useToast()
  const [donations, setDonations] = useState([])
  const [summary, setSummary] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [lifetimeMap, setLifetimeMap] = useState({})

  async function load() {
    const [d, s] = await Promise.all([api.get('/donations/'), api.get('/donations/summary')])
    const list = d.data
    setDonations(list)
    setSummary(s.data)

    // Build lifetime giving by email
    const map = {}
    list.forEach(don => {
      if (don.donor_email && !don.is_anonymous) {
        map[don.donor_email] = (map[don.donor_email] || 0) + Number(don.amount)
      }
    })
    setLifetimeMap(map)
  }

  useEffect(() => { load() }, [])

  async function markReceiptSent(id) {
    try {
      await api.patch(`/donations/${id}`, { tax_receipt_sent: true })
      toast('Receipt marked as sent.', 'success')
      load()
    } catch {
      toast('Action failed.', 'error')
    }
  }

  async function exportCsv() {
    try {
      const res = await api.get('/donations/export/csv', { responseType: 'blob' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(res.data)
      a.download = 'donations.csv'
      a.click()
      toast('Export complete.', 'info')
    } catch {
      const header = 'ID,Donor,Email,Amount,Type,Campaign,Date,Receipt Sent'
      const csv = [header, ...donations.map(d =>
        `${d.id},"${d.is_anonymous ? 'Anonymous' : d.donor_name}","${d.donor_email || ''}","${d.amount}","${d.donation_type}","${d.campaign || ''}","${d.donation_date}","${d.tax_receipt_sent ? 'Yes' : 'No'}"`)
      ].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'donations.csv'
      a.click()
      toast('Export complete.', 'info')
    }
  }

  // Count donations per email
  const donorCounts = {}
  donations.forEach(d => {
    if (d.donor_email && !d.is_anonymous) {
      donorCounts[d.donor_email] = (donorCounts[d.donor_email] || 0) + 1
    }
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Donations</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{donations.length} records</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCsv} className="btn-secondary flex items-center gap-2">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Record Donation
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Raised</p>
            <p className="text-2xl font-bold text-green-600">${summary.total_raised?.toLocaleString()}</p>
          </div>
          <div className="card text-center dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
            <p className="text-2xl font-bold text-lifeway-pink">${summary.this_month?.toLocaleString()}</p>
          </div>
          <div className="card text-center dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Donations</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_donations}</p>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden dark:bg-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
            <tr>
              <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Donor</th>
              <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Amount</th>
              <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Lifetime</th>
              <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Type</th>
              <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Campaign</th>
              <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Date</th>
              <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Receipt</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {donations.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">No donations recorded yet.</td></tr>
            )}
            {donations.map(d => {
              const lifetime = d.donor_email && !d.is_anonymous ? lifetimeMap[d.donor_email] : null
              const isRepeat = d.donor_email && donorCounts[d.donor_email] > 1
              return (
                <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <div>{d.is_anonymous ? 'Anonymous' : d.donor_name}</div>
                    {d.donor_email && !d.is_anonymous && (
                      <div className="text-xs text-gray-400">{d.donor_email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-green-600 font-semibold">${Number(d.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {lifetime && isRepeat ? (
                      <span className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full px-2 py-0.5" title="Lifetime giving total">
                        ${lifetime.toLocaleString()} total
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 capitalize">{d.donation_type.replace('_', ' ')}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{d.campaign || 'General'}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{new Date(d.donation_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {d.tax_receipt_sent ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs">
                        <CheckCircle2 size={14} /> Sent
                      </span>
                    ) : (
                      <button
                        onClick={() => markReceiptSent(d.id)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-lifeway-pink transition-colors"
                        title="Mark receipt as sent"
                      >
                        <Circle size={14} /> Mark sent
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => { setEditing(d); setShowForm(true) }} className="text-lifeway-pink hover:underline text-xs">Edit</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showForm && <DonationForm initial={editing} onSave={() => { setShowForm(false); load() }} onClose={() => setShowForm(false)} toast={toast} />}
    </div>
  )
}
