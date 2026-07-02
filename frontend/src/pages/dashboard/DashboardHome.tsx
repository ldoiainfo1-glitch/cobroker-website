import { Link } from 'react-router-dom'
import {
  Building2, GitBranch, TrendingUp, Plus, ArrowRight,
  Eye, Star, Clock, CheckCircle2, Radio, MapPin, Bell,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency, timeAgo } from '@/lib/utils'
import { useDashboardStats, useMyMandates } from '@/hooks/useMandates'
import { useCircles } from '@/hooks/useCircles'
import { useNotifications } from '@/hooks/useNotifications'

const quickActions = [
  { label: 'Post Mandate', icon: <Plus className="h-4 w-4" />, href: '/dashboard/mandates/new', variant: 'primary' as const },
  { label: 'Browse Marketplace', icon: <Building2 className="h-4 w-4" />, href: '/marketplace', variant: 'secondary' as const },
  { label: 'Explore Circles', icon: <GitBranch className="h-4 w-4" />, href: '/dashboard/circles', variant: 'secondary' as const },
]

const activityIcons: Record<string, React.ReactNode> = {
  mandate_view: <Eye className="h-4 w-4 text-text-muted" />,
}

export default function DashboardHome() {
  const { user } = useAuthStore()
  const { data: statsData } = useDashboardStats()
  const { data: circles = [] } = useCircles()
  const { data: notifications = [] } = useNotifications()
  const { data: myMandates = [] } = useMyMandates()
  const recentActivity = notifications.slice(0, 5)
  const topMandate = myMandates.find((m) => m.status === 'active') ?? myMandates[0] ?? null

  const joined = circles.filter((c) => c.isJoined)
  const suggested = circles.filter((c) => !c.isJoined && c.scope === 'area').slice(0, 6)

  const stats = [
    {
      label: 'Active Mandates',
      value: statsData?.active?.toString() ?? '--',
      change: 'Your active listings',
      positive: true,
      icon: <Building2 className="h-5 w-5" />,
      color: 'text-brand-gold',
      bg: 'bg-brand-gold/10',
    },
    {
      label: 'Total Views',
      value: statsData?.totalViews?.toLocaleString('en-IN') ?? '--',
      change: 'Across all mandates',
      positive: true,
      icon: <Eye className="h-5 w-5" />,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ]

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
            {recentActivity.length === 0 ? (
              <p className="text-sm text-text-muted py-4 text-center">No recent activity</p>
            ) : recentActivity.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center shrink-0 mt-0.5">
                    {activityIcons[item.type] ?? <Bell className="h-4 w-4 text-text-muted" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary leading-relaxed">{item.body ?? item.title}</p>
                    <span className="text-xs text-text-muted flex items-center gap-1 mt-2">
                      <Clock className="h-3 w-3" /> {timeAgo(item.createdAt)}
                    </span>
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
              </div>
              <div className="flex flex-col gap-3">
                {circles.slice(0, 3).map((c) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center text-xs text-text-secondary font-medium">
                        {c.name[0]}
                      </div>
                      <span className="text-sm text-text-primary">{c.name}</span>
                    </div>
                    <Link to={`/dashboard/circles/${c.id}`} className="text-xs text-brand-gold hover:text-brand-gold-light">
                      View →
                    </Link>
                  </div>
                ))}
                {circles.length === 0 && (
                  <p className="text-xs text-text-muted text-center py-2">No circles available yet.</p>
                )}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                <Link to="/dashboard/circles">View all circles</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Verification status */}
          {user?.company?.verificationStatus === 'verified' ? (
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
          ) : (
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-warning" />
                  <span className="text-sm font-semibold text-warning">Verification Pending</span>
                </div>
                <p className="text-xs text-text-muted mb-3">
                  Complete KYC to unlock full marketplace access and get your verified badge.
                </p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/dashboard/kyc">Complete KYC →</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Top mandate */}
          {topMandate && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary">Top Mandate</h3>
                  <Star className="h-4 w-4 text-brand-gold" />
                </div>
                <Badge variant={topMandate.mandateType as any} className="mb-2 capitalize">{topMandate.mandateType}</Badge>
                <p className="text-sm text-text-primary font-medium mb-1">
                  {topMandate.title}
                </p>
                {(topMandate.minBudget || topMandate.maxBudget) && (
                  <p className="text-xs text-text-secondary mb-3">
                    {topMandate.minBudget ? formatCurrency(topMandate.minBudget) : '–'}{' '}
                    {topMandate.maxBudget ? `– ${formatCurrency(topMandate.maxBudget)}` : ''}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {topMandate.viewsCount ?? 0} views</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}


