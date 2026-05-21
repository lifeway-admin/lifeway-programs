import {
  Users, Calendar, DollarSign, UserCheck, Tag, Sparkles,
  Heart, Globe, BookOpen, BarChart2, Search, Moon, Download,
  CheckCircle, Phone, ArrowRight, ShieldCheck, Star
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const features = [
  {
    icon: Users,
    title: 'Client Management',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    items: [
      'Full intake & client profiles',
      'Service tracking & case notes',
      'Insurance & emergency contact info',
      'Bulk status updates & CSV export',
      'Searchable client directory',
    ],
  },
  {
    icon: Calendar,
    title: 'Appointments',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
    items: [
      'Schedule & manage appointments',
      'Week calendar view',
      'Google Calendar two-way sync',
      'Automatic client record linking',
      'CSV export for records',
    ],
  },
  {
    icon: DollarSign,
    title: 'Donations & Fundraising',
    color: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
    items: [
      'Track all donations & campaigns',
      'Mark tax receipts as sent',
      'Lifetime giving by donor',
      'Campaign performance view',
      'Export donor reports',
    ],
  },
  {
    icon: Tag,
    title: 'Ticket System',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
    items: [
      'Call log & inquiry management',
      'Priority & status tracking',
      'Staff assignment',
      'Comment threads per ticket',
      'Ticket stats & resolution tracking',
    ],
  },
  {
    icon: UserCheck,
    title: 'Staff & Volunteers',
    color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400',
    items: [
      'Staff profiles & roles',
      'Department organization',
      'Provider availability for booking',
      'Volunteer tracking',
      'Ticket assignment',
    ],
  },
  {
    icon: Sparkles,
    title: 'AI Marketing',
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400',
    items: [
      'Social media post generator',
      'Email campaign drafts',
      'Blog article writing',
      'Google Ads copy',
      'Content calendar planning',
    ],
  },
  {
    icon: Globe,
    title: 'Public Booking Platform',
    color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
    items: [
      'Patient-facing booking site',
      'Choose service, provider & time',
      'Auto-creates CRM client record',
      'Confirmation number issued',
      'No login required for patients',
    ],
  },
  {
    icon: BarChart2,
    title: 'Dashboard & Analytics',
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400',
    items: [
      'Live client & appointment counts',
      'Open ticket overview',
      'Clients by service chart',
      'Quick-add client & appointment',
      'Recent activity feed',
    ],
  },
]

const qolFeatures = [
  { icon: Search, label: 'Global Search — find clients & tickets instantly' },
  { icon: Moon, label: 'Dark mode — easy on the eyes for long shifts' },
  { icon: Download, label: 'CSV export on every major data table' },
  { icon: Phone, label: 'Multi-channel ticket intake (call, email, walk-in, web)' },
  { icon: ShieldCheck, label: 'JWT-secured login with 8-hour sessions' },
  { icon: Star, label: 'Fully custom-built for Lifeway Programs workflows' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="max-w-6xl mx-auto px-8 py-10 space-y-14">

      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-lifeway-pink mb-2">
          <Heart size={30} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Lifeway Programs
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Restoring hope and transforming lives through faith-based counseling, recovery programs,
          and community outreach — serving South Florida's Hispanic and underserved communities.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary flex items-center gap-2"
          >
            Go to Dashboard <ArrowRight size={16} />
          </button>
          <a
            href="https://lifewayprograms.org"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary flex items-center gap-2"
          >
            Visit Website <Globe size={16} />
          </a>
        </div>
      </div>

      {/* Mission */}
      <div className="card p-8 border-l-4 border-lifeway-pink">
        <div className="flex items-start gap-4">
          <BookOpen size={24} className="text-lifeway-pink mt-1 shrink-0" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Lifeway Programs is a nonprofit organization dedicated to providing accessible mental
              health services, addiction recovery support, and community resources to individuals and
              families in need. Rooted in faith and compassion, we walk alongside our clients through
              every step of their healing journey — from intake to long-term recovery.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
              This CRM was built specifically for the Lifeway Programs team to manage clients,
              coordinate care, track donations, and operate more efficiently — so staff can spend
              less time on admin and more time with the people they serve.
            </p>
          </div>
        </div>
      </div>

      {/* CRM Features Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">CRM Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, color, items }) => (
            <div key={title} className="card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
              </div>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle size={14} className="text-lifeway-pink mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* QOL Features */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Built-in Quality of Life</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {qolFeatures.map(({ icon: Icon, label }) => (
            <div key={label} className="card px-5 py-4 flex items-center gap-3">
              <Icon size={18} className="text-lifeway-pink shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="card p-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Services Offered</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'Individual Therapy',
            'Family Counseling',
            'Group Therapy',
            'Substance Abuse Recovery',
            'Crisis Intervention',
            'Community Outreach',
            'Mental Health Assessment',
          ].map(service => (
            <div key={service} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 rounded-full bg-lifeway-pink shrink-0" />
              {service}
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-gray-400 pb-4">
        Lifeway Programs CRM — Built for the team, by the mission.
      </p>
    </div>
  )
}
