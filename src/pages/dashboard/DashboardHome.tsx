import { Link } from 'react-router-dom'
import {
  Building2, GitBranch, Users, TrendingUp, Plus, ArrowRight,
  Eye, Star, Clock, CheckCircle2, Radio, MapPin,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency, timeAgo } from '@/lib/utils'
import { MOCK_CIRCLES } from '@/data/circles'

const stats = [
  {
    label: 'Active Mandates',
    value: '12',
    change: '+2 this week',
    positive: true,
    icon: <Building2 className="h-5 w-5" />,
    color: 'text-brand-gold',
    bg: 'bg-brand-gold/10',
  },
  {
    label: 'Open Deals',
    value: '5',
    change: '3 in negotiation',
    positive: true,
    icon: <GitBranch className="h-5 w-5" />,
    color: 'text-info',
    bg: 'bg-info/10',
  },
  {
    label: 'Introductions',
    value: '18',
    change: '3 pending response',
    positive: null,
    icon: <Users className="h-5 w-5" />,
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    label: 'Total Views',
    value: '1,240',
    change: '+18% this month',
    positive: true,
    icon: <Eye className="h-5 w-5" />,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
]

const recentActivity = [
  {
    type: 'mandate_view',
    text: 'Raj Properties viewed your Bandra Buy mandate',
    time: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    action: null,
  },
  {
    type: 'mandate_view',
    text: 'Your Powai Commercial mandate received 34 new views today',
    time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    action: null,
  },
  {
    type: 'intro_accepted',
    text: 'Skyline Realty accepted your introduction request for the Andheri Lease mandate',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    action: { label: 'Open chat', href: '/dashboard/chat' },
  },
]

const quickActions = [
  { label: 'Post Mandate', icon: <Plus className="h-4 w-4" />, href: '/dashboard/mandates/new', variant: 'primary' as const },
  { label: 'Browse Marketplace', icon: <Building2 className="h-4 w-4" />, href: '/marketplace', variant: 'secondary' as const },
  { label: 'Explore Circles', icon: <GitBranch className="h-4 w-4" />, href: '/dashboard/circles', variant: 'secondary' as const },
]

const activityIcons: Record<string, React.ReactNode> = {
  intro_received: <Users className="h-4 w-4 text-info" />,
  deal_update: <GitBranch className="h-4 w-4 text-warning" />,
  mandate_view: <Eye className="h-4 w-4 text-text-muted" />,
  intro_accepted: <CheckCircle2 className="h-4 w-4 text-success" />,
}

export default function DashboardHome() {
  const { user } = useAuthStore()

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">
            Good morning, {user?.fullName?.split(' ')[0] || 'Broker'} 👋
          </h1>
          <p className="text-text-secondary text-sm">
            Here's what's happening with your mandates today
          </p>
        </div>
        <div className="flex items-center gap-2">
          {quickActions.map((a) => (
            <Button key={a.label} variant={a.variant} size="sm" asChild>
              <Link to={a.href}>
                {a.icon}
                <span className="hidden sm:inline">{a.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              {stat.positive !== null && (
                <TrendingUp className={`h-4 w-4 ${stat.positive ? 'text-success' : 'text-error'}`} />
              )}
            </div>
            <div className="text-2xl font-bold text-text-primary mb-0.5">{stat.value}</div>
            <div className="text-xs text-text-secondary font-medium mb-1">{stat.label}</div>
            <div className="text-xs text-text-muted">{stat.change}</div>
          </Card>
        ))}
      </div>

      {/* Suggested Circles */}
      {(() => {
        const joined = MOCK_CIRCLES.filter((c) => c.isJoined)
        const suggested = MOCK_CIRCLES.filter((c) => !c.isJoined && c.scope === 'area').slice(0, 6)
        return (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-brand-gold" />
                <h2 className="text-base font-semibold text-text-primary">My Circles</h2>
                <span className="text-xs text-text-muted">({joined.length} joined)</span>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/circles">Browse all <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>

            {/* Joined circles */}
            {joined.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {joined.map((c) => (
                  <Link
                    key={c.id}
                    to={`/dashboard/circles/${c.id}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-xs text-brand-gold hover:bg-brand-gold/20 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
                    {c.name}
                    <span className="text-brand-gold/70">{c.membersCount}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Suggested circles rail */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-text-muted">Suggested for you</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {suggested.map((c) => (
                <Link
                  key={c.id}
                  to={`/dashboard/circles/${c.id}`}
                  className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-1 border border-border hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all group"
                >
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-text-muted group-hover:text-brand-gold transition-colors" />
                    <span className="text-xs font-semibold text-text-primary truncate">{c.name}</span>
                  </div>
                  <p className="text-xs text-text-muted">{c.membersCount} brokers</p>
                  <p className="text-xs text-brand-gold font-medium">{c.dealsCount} deals closed</p>
                </Link>
              ))}
            </div>
          </div>
        )
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-text-primary">Recent Activity</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/notifications">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {recentActivity.map((item, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center shrink-0 mt-0.5">
                    {activityIcons[item.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary leading-relaxed">{item.text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {timeAgo(item.time)}
                      </span>
                      {item.action && (
                        <Link
                          to={item.action.href}
                          className="text-xs text-brand-gold hover:text-brand-gold-light font-medium"
                        >
                          {item.action.label} →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-6">
          {/* Active Circles */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-primary">Active Circles</h3>
                <Badge variant="warning" dot>3 new</Badge>
              </div>
              <div className="flex flex-col gap-3">
                {['BKC Commercial', 'South Mumbai Resi', 'Pune IT Corridor'].map((name) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center text-xs text-text-secondary font-medium">
                        {name[0]}
                      </div>
                      <span className="text-sm text-text-primary">{name}</span>
                    </div>
                    <Link to="/dashboard/circles" className="text-xs text-brand-gold hover:text-brand-gold-light">
                      View →
                    </Link>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                <Link to="/dashboard/circles">View all circles</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Verification status */}
          <Card className="border-success/30 bg-success/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm font-semibold text-success">Company Verified</span>
              </div>
              <p className="text-xs text-text-muted">
                Your RERA and GST documents are verified. You have full marketplace access.
              </p>
            </CardContent>
          </Card>

          {/* Top mandate */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary">Top Mandate</h3>
                <Star className="h-4 w-4 text-brand-gold" />
              </div>
              <Badge variant="buy" className="mb-2">Buy</Badge>
              <p className="text-sm text-text-primary font-medium mb-1">
                3BHK in Bandra West, Mumbai
              </p>
              <p className="text-xs text-text-secondary mb-3">
                {formatCurrency(15000000)} – {formatCurrency(22000000)}
              </p>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> 420 views</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 8 intros</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


