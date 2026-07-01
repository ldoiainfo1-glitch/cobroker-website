import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, Users, TrendingUp, MessageSquare, Eye,
  CheckCircle2, Star, Crown, Trophy, ChevronRight,
  Briefcase, MapPin, BarChart3, Radio, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn, timeAgo } from '@/lib/utils'
import { MOCK_CIRCLES, MOCK_MEMBERS, MOCK_CIRCLE_POSTS, MOCK_LEADERBOARD } from '@/data/circles'
import type { CircleMember, LeaderboardEntry } from '@/types'

// ─── Tier badge ───────────────────────────────────────────────────────────────
const TIER_STYLE: Record<string, string> = {
  enterprise: 'bg-brand-gold text-black',
  verified_plus: 'bg-success/20 text-success',
  pro: 'bg-info/20 text-info',
  free: 'bg-surface-2 text-text-muted',
}
const TIER_LABEL: Record<string, string> = {
  enterprise: 'Enterprise', verified_plus: 'Verified+', pro: 'Pro', free: 'Free',
}

// ─── Top broker card ─────────────────────────────────────────────────────────
function TopBrokerCard({ member, rank }: { member: CircleMember; rank: number }) {
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl border',
      rank === 1 ? 'bg-brand-gold/5 border-brand-gold/30' : 'bg-surface-2 border-border',
    )}>
      <div className="relative">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border',
          rank === 1 ? 'bg-brand-gold/20 border-brand-gold/40 text-brand-gold' : 'bg-surface-3 border-border text-text-secondary',
        )}>
          {member.avatarInitial}
        </div>
        {rank === 1 && (
          <Crown className="absolute -top-2 -right-1 h-3.5 w-3.5 text-brand-gold fill-brand-gold" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-semibold text-text-primary truncate">{member.name}</p>
          {member.verified && <CheckCircle2 className="h-3 w-3 text-success shrink-0" />}
        </div>
        <p className="text-xs text-text-muted truncate">{member.company}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={cn('px-1.5 py-0.5 rounded text-xs font-medium', TIER_STYLE[member.tier])}>
            {TIER_LABEL[member.tier]}
          </span>
          <span className="flex items-center gap-0.5 text-xs text-brand-gold">
            <Star className="h-2.5 w-2.5 fill-brand-gold" /> {member.rating}
          </span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-text-primary">{member.dealsCount}</p>
        <p className="text-xs text-text-muted">deals</p>
      </div>
    </div>
  )
}

// ─── Leaderboard row ──────────────────────────────────────────────────────────
function LeaderRow({ entry, isMe }: { entry: LeaderboardEntry; isMe?: boolean }) {
  const delta = entry.prevRank - entry.rank
  return (
    <div className={cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
      isMe ? 'bg-brand-gold/5 border border-brand-gold/20' : 'hover:bg-surface-2',
    )}>
      <div className="w-7 text-center">
        {entry.rank <= 3 ? (
          <Trophy className={cn('h-4 w-4 mx-auto', entry.rank === 1 ? 'text-brand-gold' : entry.rank === 2 ? 'text-text-secondary' : 'text-warning')} />
        ) : (
          <span className="text-xs font-bold text-text-muted">#{entry.rank}</span>
        )}
      </div>
      <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-xs font-bold text-text-secondary">
        {entry.member.avatarInitial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-xs font-semibold text-text-primary truncate">{entry.member.name}</p>
          {entry.member.verified && <CheckCircle2 className="h-3 w-3 text-success shrink-0" />}
        </div>
        <p className="text-xs text-text-muted truncate">{entry.member.company}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0 text-center">
        <div>
          <p className="text-xs font-bold text-text-primary">{entry.score}</p>
          <p className="text-xs text-text-muted">score</p>
        </div>
        <div>
          <p className="text-xs font-medium text-text-secondary">{entry.deals} deals</p>
        </div>
        {delta !== 0 && (
          <span className={cn('text-xs font-medium', delta > 0 ? 'text-success' : 'text-error')}>
            {delta > 0 ? `▲${delta}` : `▼${Math.abs(delta)}`}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Post card ────────────────────────────────────────────────────────────────
function PostCard({ post }: { post: typeof MOCK_CIRCLE_POSTS[0] }) {
  const typeConfig = {
    mandate: { label: 'Mandate', color: 'text-info' },
    deal_closed: { label: 'Deal Closed 🎉', color: 'text-success' },
    announcement: { label: 'Announcement', color: 'text-brand-gold' },
  }
  const cfg = typeConfig[post.type]

  return (
    <div className="p-4 rounded-xl bg-surface-2 border border-border hover:border-brand-gold/20 transition-colors">
      {/* Author */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center text-xs font-bold text-brand-gold">
          {post.author.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-text-primary">{post.author.name}</span>
            {post.author.verified && <CheckCircle2 className="h-3 w-3 text-success" />}
            <span className={cn('px-1.5 py-0.5 rounded text-xs font-medium', TIER_STYLE[post.author.tier])}>
              {TIER_LABEL[post.author.tier]}
            </span>
          </div>
          <p className="text-xs text-text-muted">{post.author.company}</p>
        </div>
        <div className="text-right shrink-0">
          <span className={cn('text-xs font-semibold', cfg.color)}>{cfg.label}</span>
          <p className="text-xs text-text-muted">{timeAgo(post.postedAt)}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-text-secondary leading-relaxed mb-3">{post.content}</p>

      {/* Meta + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.views} views</span>
          {false && (
            <span className="flex items-center gap-1 text-brand-gold font-medium">
              <MessageSquare className="h-3 w-3" /> {post.intros} intros
            </span>
          )}
        </div>
        {post.type === 'mandate' && (
          <Button variant="outline" size="sm" className="h-7 text-xs px-3">
            Request Intro
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
type Tab = 'feed' | 'members' | 'leaderboard' | 'insights'

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CircleDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<Tab>('feed')
  const [leaderPeriod, setLeaderPeriod] = useState<'weekly' | 'monthly'>('weekly')
  const [isJoined, setIsJoined] = useState(false)

  // Find circle from mock data
  const circle = MOCK_CIRCLES.find((c) => c.id === id) ?? MOCK_CIRCLES[0]

  // Sync joined state from mock
  useState(() => {
    setIsJoined(circle.isJoined)
  })

  const TABS: Array<{ value: Tab; label: string; icon: React.ReactNode }> = [
    { value: 'feed', label: 'Activity Feed', icon: <Radio className="h-3.5 w-3.5" /> },
    { value: 'members', label: `Members (${circle.membersCount})`, icon: <Users className="h-3.5 w-3.5" /> },
    { value: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="h-3.5 w-3.5" /> },
    { value: 'insights', label: 'Insights', icon: <BarChart3 className="h-3.5 w-3.5" /> },
  ]

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-6 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Link to="/dashboard/circles" className="flex items-center gap-1 hover:text-text-secondary transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Circles
        </Link>
        <span>/</span>
        <span className="text-text-secondary">{circle.name}</span>
      </div>

      {/* Circle header */}
      <div className="p-5 rounded-2xl bg-surface-1 border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Circle avatar */}
            <div className="w-14 h-14 rounded-2xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center text-brand-gold text-xl font-bold shrink-0">
              {circle.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-text-primary">{circle.name}</h1>
                {circle.isFeatured && <Badge variant="gold" dot className="text-xs">Featured</Badge>}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
                <Badge variant={
                  circle.scope === 'area' ? 'default' :
                  circle.scope === 'city' ? 'info' :
                  circle.scope === 'state' ? 'warning' : 'gold'
                } className="text-xs capitalize">{circle.scope}</Badge>
                {circle.city && (
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {circle.city}</span>
                )}
                {circle.assetClasses.map((a) => (
                  <span key={a} className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {a}</span>
                ))}
              </div>
              {circle.description && (
                <p className="text-sm text-text-muted mt-1">{circle.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isJoined ? (
              <>
                <Button variant="secondary" size="md" onClick={() => setIsJoined(false)}>Leave</Button>
                <Button size="md" asChild>
                  <Link to="/dashboard/mandates/new">
                    + Post Mandate
                  </Link>
                </Button>
              </>
            ) : (
              <Button size="lg" onClick={() => setIsJoined(true)}>
                Join Circle
              </Button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-text-primary">{circle.membersCount.toLocaleString('en-IN')}</p>
            <p className="text-xs text-text-muted">Brokers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-text-primary">{circle.postsCount.toLocaleString('en-IN')}</p>
            <p className="text-xs text-text-muted">Total Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-gold">{circle.dealsCount.toLocaleString('en-IN')}</p>
            <p className="text-xs text-text-muted">Deals Closed</p>
          </div>
          <div className="text-center hidden sm:block">
            <p className="text-2xl font-bold text-success">{Math.round(circle.dealsCount / circle.membersCount * 10) / 10}</p>
            <p className="text-xs text-text-muted">Avg deals/broker</p>
          </div>
        </div>
      </div>

      {/* Top brokers rail */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Crown className="h-4 w-4 text-brand-gold" />
          <h2 className="text-sm font-semibold text-text-primary">Top Brokers in {circle.name}</h2>
          <span className="text-xs text-text-muted">— this week</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {MOCK_MEMBERS.slice(0, 3).map((m, i) => (
            <TopBrokerCard key={m.id} member={m} rank={i + 1} />
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px whitespace-nowrap',
              activeTab === tab.value
                ? 'border-brand-gold text-brand-gold'
                : 'border-transparent text-text-muted hover:text-text-secondary',
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'feed' && (
        <div className="flex flex-col gap-4">
          {!isJoined && (
            <div className="p-4 rounded-xl bg-brand-gold/5 border border-brand-gold/30 text-center">
              <p className="text-sm text-text-secondary mb-2">Join this circle to post mandates and send intro requests.</p>
              <Button size="sm" onClick={() => setIsJoined(true)}>Join Circle to Participate</Button>
            </div>
          )}
          {MOCK_CIRCLE_POSTS.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="flex flex-col gap-2">
          {MOCK_MEMBERS.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-border hover:border-brand-gold/20 transition-colors">
              <div className="w-9 h-9 rounded-full bg-surface-3 border border-border flex items-center justify-center text-xs font-bold text-text-secondary">
                {member.avatarInitial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-text-primary">{member.name}</span>
                  {member.verified && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                  <span className={cn('px-1.5 py-0.5 rounded text-xs font-medium', TIER_STYLE[member.tier])}>
                    {TIER_LABEL[member.tier]}
                  </span>
                </div>
                <p className="text-xs text-text-muted">{member.company} · {member.city}</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-center shrink-0">
                <div>
                  <p className="text-sm font-bold text-brand-gold">{member.dealsCount}</p>
                  <p className="text-xs text-text-muted">Deals</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-brand-gold text-brand-gold" /> {member.rating}
                  </p>
                  <p className="text-xs text-text-muted">{member.reviewCount} reviews</p>
                </div>
              </div>
              <Button variant="secondary" size="sm">Connect</Button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div>
          {/* Period toggle */}
          <div className="flex items-center gap-1 mb-4">
            {(['weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setLeaderPeriod(p)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
                  leaderPeriod === p
                    ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/30'
                    : 'text-text-muted hover:text-text-secondary',
                )}
              >
                {p}
              </button>
            ))}
            <span className="ml-auto text-xs text-text-muted">
              Resets {leaderPeriod === 'weekly' ? 'every Monday' : 'every 1st'}
            </span>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-3 px-3 py-1.5 text-xs text-text-muted uppercase tracking-wider mb-1">
            <div className="w-7 text-center">Rank</div>
            <div className="w-8" />
            <div className="flex-1">Broker</div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="w-12 text-center">Score</span>
              <span className="w-14 text-center">Deals</span>
              <span className="w-10 text-center">Δ</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {MOCK_LEADERBOARD.map((entry) => (
              <LeaderRow key={entry.rank} entry={entry} isMe={entry.rank === 8} />
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-brand-gold/5 border border-brand-gold/20 text-center">
            <p className="text-xs text-text-muted">
              Your rank this {leaderPeriod}: <span className="font-bold text-brand-gold">#8</span>
              {' '}— Post 3 more mandates to move to <span className="font-bold text-brand-gold">#6</span>
            </p>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Summary stats */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Circle Activity</h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Posts this week', value: '42', change: '+18%' },
                  { label: 'New members this month', value: '28', change: '+12%' },
                  { label: 'Intro requests sent', value: '156', change: '+24%' },
                  { label: 'Deals closed this month', value: '9', change: '+3' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-xs text-text-muted">{s.label}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-text-primary">{s.value}</span>
                      <span className="text-xs text-success ml-2">{s.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top asset classes */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Top Asset Classes</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Residential', pct: 62 },
                  { label: 'Commercial Office', pct: 24 },
                  { label: 'Retail', pct: 10 },
                  { label: 'Industrial', pct: 4 },
                ].map((a) => (
                  <div key={a.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary">{a.label}</span>
                      <span className="text-text-muted">{a.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-gold rounded-full transition-all duration-500" style={{ width: `${a.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget heatmap mock */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Budget Distribution</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: '< ₹50L', count: 12 },
                  { label: '₹50L – ₹1Cr', count: 34 },
                  { label: '₹1Cr – ₹5Cr', count: 67 },
                  { label: '₹5Cr – ₹20Cr', count: 29 },
                  { label: '> ₹20Cr', count: 14 },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-3">
                    <span className="text-xs text-text-muted w-28 shrink-0">{b.label}</span>
                    <div className="flex-1 h-5 bg-surface-2 rounded-md overflow-hidden flex items-center">
                      <div
                        className="h-full bg-brand-gold/40 rounded-md flex items-center pl-2"
                        style={{ width: `${(b.count / 67) * 100}%` }}
                      >
                        <span className="text-xs font-medium text-text-primary">{b.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Demand heatmap placeholder */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-2">Demand Heatmap</h3>
              <p className="text-xs text-text-muted mb-4">Localities with highest activity in this circle</p>
              <div className="flex flex-col gap-1.5">
                {[
                  { area: 'Bandra West', intensity: 90 },
                  { area: 'Khar West', intensity: 74 },
                  { area: 'Santacruz W', intensity: 58 },
                  { area: 'Juhu', intensity: 42 },
                  { area: 'Vile Parle', intensity: 28 },
                ].map((h) => (
                  <div key={h.area} className="flex items-center gap-2">
                    <span className="text-xs text-text-muted w-24 shrink-0">{h.area}</span>
                    <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${h.intensity}%`,
                          background: `rgba(212, 160, 23, ${h.intensity / 100})`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-text-muted w-8 text-right">{h.intensity}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-text-muted mt-3">
                OpenStreetMap integration — Phase 7 (Circle Insights advanced)
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

