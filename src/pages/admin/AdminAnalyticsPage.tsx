import { useState } from 'react'
import {
  Users, Building2, FileText, TrendingUp, Activity,
  ArrowUp, ArrowDown, MapPin, Star,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ── Data ─────────────────────────────────────────────────────────────────────
const RANGES = ['7d', '30d', '90d', '1y'] as const
type Range = typeof RANGES[number]

const RANGE_LABELS: Record<Range, string> = { '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days', '1y': 'Last year' }

const METRICS_BY_RANGE: Record<Range, { users: number[]; mandates: number[]; revenue: number[]; signups: number[] }> = {
  '7d':  {
    users:    [820, 940, 870, 1010, 960, 1120, 1080],
    mandates: [340, 410, 390, 450, 420, 510, 490],
    revenue:  [84, 92, 88, 102, 96, 118, 112],
    signups:  [42, 51, 48, 60, 55, 72, 68],
  },
  '30d': {
    users:    [720, 810, 780, 870, 820, 910, 880, 970, 950, 1040, 990, 1080],
    mandates: [280, 320, 300, 360, 340, 400, 380, 440, 420, 480, 460, 510],
    revenue:  [72, 80, 76, 88, 84, 96, 92, 104, 100, 112, 108, 120],
    signups:  [36, 42, 40, 48, 45, 54, 51, 60, 57, 66, 63, 72],
  },
  '90d': {
    users:    [600, 680, 640, 720, 680, 760, 720, 800, 760, 840, 800, 880],
    mandates: [240, 280, 260, 300, 280, 320, 300, 340, 320, 360, 340, 380],
    revenue:  [60, 72, 66, 78, 72, 84, 78, 90, 84, 96, 90, 102],
    signups:  [28, 36, 32, 40, 36, 44, 40, 48, 44, 52, 48, 56],
  },
  '1y':  {
    users:    [520, 580, 560, 620, 600, 660, 640, 700, 680, 740, 720, 780],
    mandates: [200, 230, 215, 245, 230, 260, 245, 275, 260, 290, 275, 305],
    revenue:  [50, 60, 55, 65, 60, 70, 65, 75, 70, 80, 75, 85],
    signups:  [22, 28, 25, 31, 28, 34, 31, 37, 34, 40, 37, 43],
  },
}

const CITY_BREAKDOWN = [
  { city: 'Mumbai',    mandates: 14200, users: 4820, pct: 29 },
  { city: 'Bengaluru', mandates: 10400, users: 3640, pct: 21 },
  { city: 'Delhi NCR', mandates: 9600,  users: 3100, pct: 20 },
  { city: 'Pune',      mandates: 6800,  users: 2280, pct: 14 },
  { city: 'Hyderabad', mandates: 4400,  users: 1560, pct: 9 },
  { city: 'Chennai',   mandates: 2600,  users: 840,  pct: 5 },
  { city: 'Others',    mandates: 1200,  users: 400,  pct: 2 },
]

const ASSET_MIX = [
  { label: 'Residential', pct: 42, color: 'bg-info' },
  { label: 'Commercial',  pct: 28, color: 'bg-brand-gold' },
  { label: 'Industrial',  pct: 18, color: 'bg-warning' },
  { label: 'Land',        pct: 12, color: 'bg-success' },
]

const TOP_BROKERS = [
  { name: 'Arjun Mehta',  company: 'JLL India',       mandates: 84, deals: 31, rating: 4.9 },
  { name: 'Priya Nair',   company: 'Skyline Realty',  mandates: 72, deals: 27, rating: 4.8 },
  { name: 'Vikram Rao',   company: 'Prime Homes',     mandates: 68, deals: 24, rating: 4.7 },
  { name: 'Anjali Singh', company: 'Prestige Group',  mandates: 61, deals: 22, rating: 4.8 },
  { name: 'Raj Kumar',    company: 'Metro Estates',   mandates: 55, deals: 18, rating: 4.6 },
]

const TOP_COMPANIES = [
  { name: 'JLL India',        mandates: 320, members: 48, deals: 112 },
  { name: 'Skyline Realty',   mandates: 280, members: 36, deals: 98 },
  { name: 'Prestige Group',   mandates: 240, members: 32, deals: 84 },
  { name: 'Prime Homes',      mandates: 210, members: 28, deals: 72 },
  { name: 'Metro Estates',    mandates: 180, members: 24, deals: 60 },
]

// ── Chart components ──────────────────────────────────────────────────────────
function BarChart({ data, color, height = 48 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className={cn('flex-1 rounded-sm transition-all', color)}
          style={{ height: `${(v / max) * 100}%`, opacity: i === data.length - 1 ? 1 : 0.6 + (i / data.length) * 0.4 }} />
      ))}
    </div>
  )
}

function Sparkline({ data, color = '#D4A017' }: { data: number[]; color?: string }) {
  const max = Math.max(...data), min = Math.min(...data)
  const H = 40, W = 100
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / (max - min || 1)) * H
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-10" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<Range>('30d')
  const d = METRICS_BY_RANGE[range]

  const kpis = [
    { label: 'Daily Active Users',  value: d.users[d.users.length - 1].toLocaleString(),    change: '+12%', up: true,  icon: <Users className="h-5 w-5" />,    color: 'text-info',       bg: 'bg-info/10',       spark: d.users    },
    { label: 'Mandates Posted',     value: d.mandates[d.mandates.length - 1].toLocaleString(), change: '+22%', up: true,  icon: <FileText className="h-5 w-5" />, color: 'text-brand-gold', bg: 'bg-brand-gold/10', spark: d.mandates },
    { label: 'Revenue (₹L)',        value: `₹${d.revenue[d.revenue.length - 1]}L`,           change: '+18%', up: true,  icon: <Activity className="h-5 w-5" />,  color: 'text-success',    bg: 'bg-success/10',    spark: d.revenue  },
    { label: 'New Sign-ups',        value: d.signups[d.signups.length - 1].toLocaleString(),  change: '+8%',  up: true,  icon: <TrendingUp className="h-5 w-5" />,color: 'text-warning',    bg: 'bg-warning/10',    spark: d.signups  },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Analytics</h1>
          <p className="text-sm text-text-muted mt-0.5">Platform-wide metrics and growth</p>
        </div>
        <div className="flex items-center gap-1 bg-surface-2 rounded-xl p-1">
          {RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                range === r ? 'bg-surface-0 text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary')}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', k.bg, k.color)}>
                  {k.icon}
                </div>
                <span className={cn('flex items-center gap-0.5 text-xs font-semibold', k.up ? 'text-success' : 'text-error')}>
                  {k.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />} {k.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-text-primary mb-0.5">{k.value}</p>
              <p className="text-xs text-text-muted mb-3">{k.label}</p>
              <Sparkline data={k.spark} color={k.color === 'text-info' ? '#3B82F6' : k.color === 'text-brand-gold' ? '#D4A017' : k.color === 'text-success' ? '#22C55E' : '#F59E0B'} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User growth */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-text-primary">User Growth</p>
                <p className="text-xs text-text-muted mt-0.5">{RANGE_LABELS[range]}</p>
              </div>
              <span className="text-xs text-success font-medium flex items-center gap-0.5">
                <ArrowUp className="h-3 w-3" /> 12%
              </span>
            </div>
            <BarChart data={d.users} color="bg-info" height={80} />
          </CardContent>
        </Card>

        {/* Mandates posted */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-text-primary">Mandates Posted</p>
                <p className="text-xs text-text-muted mt-0.5">{RANGE_LABELS[range]}</p>
              </div>
              <span className="text-xs text-success font-medium flex items-center gap-0.5">
                <ArrowUp className="h-3 w-3" /> 22%
              </span>
            </div>
            <BarChart data={d.mandates} color="bg-brand-gold" height={80} />
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-text-primary">Revenue (₹ Lakhs)</p>
                <p className="text-xs text-text-muted mt-0.5">{RANGE_LABELS[range]}</p>
              </div>
              <span className="text-xs text-success font-medium flex items-center gap-0.5">
                <ArrowUp className="h-3 w-3" /> 18%
              </span>
            </div>
            <BarChart data={d.revenue} color="bg-success" height={80} />
          </CardContent>
        </Card>

        {/* Sign-ups */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-text-primary">New Sign-ups</p>
                <p className="text-xs text-text-muted mt-0.5">{RANGE_LABELS[range]}</p>
              </div>
              <span className="text-xs text-success font-medium flex items-center gap-0.5">
                <ArrowUp className="h-3 w-3" /> 8%
              </span>
            </div>
            <BarChart data={d.signups} color="bg-warning" height={80} />
          </CardContent>
        </Card>
      </div>

      {/* Asset mix + City breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Asset mix */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-text-primary mb-4">Mandate Mix by Asset Type</p>
            <div className="space-y-3">
              {ASSET_MIX.map((a) => (
                <div key={a.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-text-secondary font-medium">{a.label}</span>
                    <span className="text-text-muted">{a.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-2">
                    <div className={cn('h-2 rounded-full', a.color)} style={{ width: `${a.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* City breakdown */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-text-primary mb-4">Top Cities</p>
            <div className="space-y-2.5">
              {CITY_BREAKDOWN.map((c) => (
                <div key={c.city} className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-28 shrink-0">
                    <MapPin className="h-3 w-3 text-text-muted" />
                    <span className="text-xs text-text-secondary font-medium truncate">{c.city}</span>
                  </div>
                  <div className="flex-1 h-1.5 rounded-full bg-surface-2">
                    <div className="h-1.5 rounded-full bg-brand-gold/70" style={{ width: `${c.pct}%` }} />
                  </div>
                  <span className="text-xs text-text-muted w-8 text-right">{c.pct}%</span>
                  <span className="text-xs text-text-muted w-16 text-right hidden sm:block">{c.mandates.toLocaleString()} M</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top brokers + companies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top brokers */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-text-primary mb-4">Top Brokers</p>
            <div className="space-y-3">
              {TOP_BROKERS.map((b, i) => (
                <div key={b.name} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center text-xs font-bold text-text-muted shrink-0">
                    {i + 1}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center text-xs font-bold text-brand-gold shrink-0">
                    {b.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{b.name}</p>
                    <p className="text-xs text-text-muted truncate">{b.company}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-text-primary">{b.mandates} mandates</p>
                    <p className="text-xs text-text-muted flex items-center gap-0.5 justify-end">
                      <Star className="h-3 w-3 fill-brand-gold text-brand-gold" /> {b.rating}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top companies */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-text-primary mb-4">Top Companies</p>
            <div className="space-y-3">
              {TOP_COMPANIES.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center text-xs font-bold text-text-muted shrink-0">
                    {i + 1}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center text-xs font-bold text-info shrink-0">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{c.name}</p>
                    <p className="text-xs text-text-muted">{c.members} members</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-text-primary">{c.mandates} mandates</p>
                    <p className="text-xs text-text-muted">{c.deals} deals closed</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
