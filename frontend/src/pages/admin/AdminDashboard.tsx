import { useState } from 'react'
import {
  Users, Building2, FileText, TrendingUp, TrendingDown,
  CheckCircle2, Clock, AlertTriangle, XCircle,
  ArrowRight, Activity,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ── Mock data ─────────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Total Users',     value: '14,240', change: '+12%', up: true,  icon: <Users className="h-5 w-5" />,     color: 'text-info',    bg: 'bg-info/10' },
  { label: 'Companies',       value: '3,120',  change: '+8%',  up: true,  icon: <Building2 className="h-5 w-5" />, color: 'text-success', bg: 'bg-success/10' },
  { label: 'Active Mandates', value: '48,000', change: '+22%', up: true,  icon: <FileText className="h-5 w-5" />,  color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
  { label: 'MRR',             value: '₹12.4L', change: '+18%', up: true,  icon: <Activity className="h-5 w-5" />,  color: 'text-warning', bg: 'bg-warning/10' },
]

const PENDING_VERIFICATIONS = [
  { id: 'c1', name: 'Prime Properties Pvt. Ltd.', city: 'Pune', submittedAt: '2 hours ago', docs: 3 },
  { id: 'c2', name: 'Horizon Realty Group',       city: 'Chennai', submittedAt: '5 hours ago', docs: 4 },
  { id: 'c3', name: 'Skyward Brokers',             city: 'Hyderabad', submittedAt: '1 day ago', docs: 2 },
  { id: 'c4', name: 'Capital Housing LLP',         city: 'Bengaluru', submittedAt: '2 days ago', docs: 5 },
  { id: 'c5', name: 'Metro Estates',               city: 'Delhi NCR', submittedAt: '3 days ago', docs: 3 },
]

const REPORTED_MANDATES = [
  { id: 'm1', title: '3BHK in Bandra West', reporter: 'Arjun Mehta', reason: 'Duplicate listing',     reportedAt: '1 hour ago' },
  { id: 'm2', title: 'Commercial plot, Pune', reporter: 'Priya Nair', reason: 'Incorrect information', reportedAt: '4 hours ago' },
  { id: 'm3', title: 'Warehouse, Bhiwandi',  reporter: 'Raj Kumar',   reason: 'Spam / fake listing',   reportedAt: '1 day ago' },
]

const RECENT_SIGNUPS = [
  { name: 'Meera Kapoor',  company: 'DLF Commercial',    city: 'Gurgaon',  time: '12 min ago', verified: false },
  { name: 'Suresh Patel',  company: 'Sun Realty',         city: 'Surat',    time: '34 min ago', verified: false },
  { name: 'Anjali Singh',  company: 'Prestige Group',     city: 'Bengaluru',time: '1 hr ago',   verified: true },
  { name: 'Rohan Mehta',   company: 'Rohan Associates',   city: 'Pune',     time: '2 hr ago',   verified: false },
  { name: 'Kavita Desai',  company: 'Lodha Capital',      city: 'Mumbai',   time: '3 hr ago',   verified: true },
]

// Simple bar chart using inline SVG
function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-1 h-10">
      {data.map((v, i) => (
        <div
          key={i}
          className={cn('flex-1 rounded-sm opacity-80 hover:opacity-100 transition-opacity', color)}
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  )
}

// Sparkline SVG
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const w = 80, h = 24, pad = 2
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const SPARKLINES = {
  users:    [80, 95, 88, 102, 110, 108, 122, 130, 125, 140, 138, 150],
  companies:[40, 45, 42, 50,  52,  55,  58,  60,  65,  68,  70,  75],
  mandates: [200,220,210,250, 260, 245, 280, 290, 310, 320, 340, 360],
  revenue:  [50, 60, 55, 70,  72,  80,  85,  88,  95,  100, 108, 120],
}
const SPARKLINE_COLORS = ['#38bdf8','#4ade80','#D4A017','#fb923c']

export default function AdminDashboard() {
  const [verificationAction, setVerificationAction] = useState<Record<string, 'approved' | 'rejected' | null>>({})

  const actOn = (id: string, action: 'approved' | 'rejected') =>
    setVerificationAction((p) => ({ ...p, [id]: action }))

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-sm text-text-muted mt-0.5">Platform overview — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {STATS.map((s, i) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', s.bg, s.color)}>
                  {s.icon}
                </div>
                <div className={cn('flex items-center gap-0.5 text-xs font-medium', s.up ? 'text-success' : 'text-error')}>
                  {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {s.change}
                </div>
              </div>
              <p className="text-2xl font-black text-text-primary mb-0.5">{s.value}</p>
              <p className="text-xs text-text-muted mb-3">{s.label}</p>
              <Sparkline data={Object.values(SPARKLINES)[i]} color={SPARKLINE_COLORS[i]} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">New users (last 12 weeks)</h3>
              <span className="text-xs text-success font-medium">+12% vs prev</span>
            </div>
            <MiniBarChart
              data={[120, 145, 132, 160, 155, 178, 190, 185, 210, 225, 218, 240]}
              color="bg-info"
            />
            <div className="flex justify-between text-xs text-text-muted mt-2">
              <span>Apr</span><span>May</span><span>Jun</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Revenue MRR (last 12 weeks)</h3>
              <span className="text-xs text-success font-medium">+18% vs prev</span>
            </div>
            <MiniBarChart
              data={[80, 95, 88, 110, 105, 125, 130, 128, 148, 155, 162, 175]}
              color="bg-brand-gold"
            />
            <div className="flex justify-between text-xs text-text-muted mt-2">
              <span>Apr</span><span>May</span><span>Jun</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom 3-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pending verifications */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-warning" />
                  <h3 className="text-sm font-semibold text-text-primary">Pending verifications</h3>
                  <span className="text-xs bg-warning/10 text-warning border border-warning/20 px-2 py-0.5 rounded-full font-medium">{PENDING_VERIFICATIONS.length}</span>
                </div>
                <Link to="/admin/companies" className="text-xs text-brand-gold hover:text-brand-gold/80">View all →</Link>
              </div>
              <div className="flex flex-col divide-y divide-border">
                {PENDING_VERIFICATIONS.map((c) => {
                  const action = verificationAction[c.id]
                  return (
                    <div key={c.id} className="flex items-center gap-3 py-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-xs font-bold text-text-secondary shrink-0">
                        {c.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{c.name}</p>
                        <p className="text-xs text-text-muted">{c.city} · {c.docs} docs · {c.submittedAt}</p>
                      </div>
                      {action ? (
                        <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', action === 'approved' ? 'bg-success/10 text-success' : 'bg-error/10 text-error')}>
                          {action === 'approved' ? '✓ Approved' : '✗ Rejected'}
                        </span>
                      ) : (
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => actOn(c.id, 'approved')}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-success/10 text-success text-xs font-medium hover:bg-success/20 transition-colors">
                            <CheckCircle2 className="h-3 w-3" /> Approve
                          </button>
                          <button onClick={() => actOn(c.id, 'rejected')}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-error/10 text-error text-xs font-medium hover:bg-error/20 transition-colors">
                            <XCircle className="h-3 w-3" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Reported mandates */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-error" />
                  <h3 className="text-sm font-semibold text-text-primary">Reported</h3>
                  <span className="text-xs bg-error/10 text-error border border-error/20 px-2 py-0.5 rounded-full font-medium">{REPORTED_MANDATES.length}</span>
                </div>
                <Link to="/admin/mandates" className="text-xs text-brand-gold hover:text-brand-gold/80">Review →</Link>
              </div>
              <div className="flex flex-col gap-3">
                {REPORTED_MANDATES.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-surface-2 border border-border">
                    <p className="text-xs font-semibold text-text-primary mb-0.5 truncate">{m.title}</p>
                    <p className="text-xs text-error mb-0.5">{m.reason}</p>
                    <p className="text-xs text-text-muted">by {m.reporter} · {m.reportedAt}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent signups */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-primary">Recent signups</h3>
                <Link to="/admin/users" className="text-xs text-brand-gold hover:text-brand-gold/80">All →</Link>
              </div>
              <div className="flex flex-col gap-2.5">
                {RECENT_SIGNUPS.map((u, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-surface-2 border border-border flex items-center justify-center text-xs font-bold text-text-secondary shrink-0">
                      {u.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">{u.name}</p>
                      <p className="text-xs text-text-muted truncate">{u.company} · {u.city}</p>
                    </div>
                    {u.verified
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                      : <Clock className="h-3.5 w-3.5 text-warning shrink-0" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
