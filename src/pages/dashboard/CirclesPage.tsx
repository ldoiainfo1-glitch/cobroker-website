import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Users, TrendingUp, Globe, MapPin, Briefcase,
  ChevronRight, Star, CheckCircle2, Radio,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MOCK_CIRCLES } from '@/data/circles'
import type { CircleScope } from '@/types'

const SCOPE_TABS: Array<{ value: CircleScope | 'all'; label: string; icon: React.ReactNode }> = [
  { value: 'all', label: 'All Circles', icon: <Globe className="h-3.5 w-3.5" /> },
  { value: 'area', label: 'Area', icon: <MapPin className="h-3.5 w-3.5" /> },
  { value: 'city', label: 'City', icon: <Globe className="h-3.5 w-3.5" /> },
  { value: 'state', label: 'State', icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { value: 'national', label: 'National', icon: <Radio className="h-3.5 w-3.5" /> },
]

const ASSET_FILTERS = ['All', 'Residential', 'Commercial', 'Industrial', 'Land', 'Hospitality', 'Retail']

const SCOPE_BADGE: Record<CircleScope, 'default' | 'info' | 'warning' | 'gold'> = {
  area: 'default', city: 'info', state: 'warning', national: 'gold',
}

const SCOPE_LOCK: Record<CircleScope, string | null> = {
  area: null,
  city: 'Verified Plus',
  state: 'Enterprise',
  national: 'Enterprise',
}

export default function CirclesPage() {
  const [scopeFilter, setScopeFilter] = useState<CircleScope | 'all'>('all')
  const [assetFilter, setAssetFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [circles, setCircles] = useState(MOCK_CIRCLES)

  const handleJoin = (id: string) => {
    setCircles((prev) =>
      prev.map((c) => c.id === id ? { ...c, isJoined: !c.isJoined, membersCount: c.isJoined ? c.membersCount - 1 : c.membersCount + 1 } : c)
    )
  }

  const filtered = circles.filter((c) => {
    if (scopeFilter !== 'all' && c.scope !== scopeFilter) return false
    if (assetFilter !== 'All' && !c.assetClasses.includes(assetFilter)) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.city?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const joined = circles.filter((c) => c.isJoined)
  const suggested = circles.filter((c) => !c.isJoined).slice(0, 6)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Circles</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Join area, city, and national circles to connect with co-brokers in your market.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-sm font-medium">
          <Radio className="h-4 w-4" />
          <span>{joined.length} joined</span>
        </div>
      </div>

      {/* My circles strip */}
      {joined.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">My Circles</h2>
          <div className="flex flex-wrap gap-2">
            {joined.map((c) => (
              <Link
                key={c.id}
                to={`/dashboard/circles/${c.id}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-sm text-brand-gold hover:bg-brand-gold/20 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
                {c.name}
                <span className="text-[10px] text-brand-gold/70">{c.membersCount}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search circles by name or city…"
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface-2 border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50"
          />
        </div>
        {/* Asset class filter */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {ASSET_FILTERS.map((a) => (
            <button
              key={a}
              onClick={() => setAssetFilter(a)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                assetFilter === a
                  ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/30'
                  : 'text-text-muted hover:text-text-secondary',
              )}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Scope tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-0">
        {SCOPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setScopeFilter(tab.value)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px whitespace-nowrap',
              scopeFilter === tab.value
                ? 'border-brand-gold text-brand-gold'
                : 'border-transparent text-text-muted hover:text-text-secondary',
            )}
          >
            {tab.icon} {tab.label}
            <span className="text-xs text-text-muted">
              ({circles.filter((c) => tab.value === 'all' ? true : c.scope === tab.value).length})
            </span>
          </button>
        ))}
      </div>

      {/* Tier lock notice for city/state/national */}
      {(scopeFilter === 'city' || scopeFilter === 'state' || scopeFilter === 'national') && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-warning/5 border border-warning/30 text-sm text-warning">
          <Star className="h-4 w-4 shrink-0" />
          <span>
            <strong>{SCOPE_LOCK[scopeFilter as CircleScope]}</strong> plan required to join {scopeFilter} circles.
            <Link to="/pricing" className="underline ml-1 hover:text-warning/80">Upgrade →</Link>
          </span>
        </div>
      )}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((circle) => {
          const lock = SCOPE_LOCK[circle.scope]
          return (
            <div key={circle.id} className="flex flex-col">
              <Card hover className="p-4 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant={SCOPE_BADGE[circle.scope]} className="text-[10px] capitalize">
                        {circle.scope}
                      </Badge>
                      {circle.isFeatured && (
                        <Badge variant="gold" dot className="text-[10px]">Featured</Badge>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary">{circle.name}</h3>
                    {circle.city && (
                      <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {circle.city}{circle.state ? `, ${circle.state}` : ''}
                      </p>
                    )}
                    {circle.description && (
                      <p className="text-xs text-text-muted mt-1">{circle.description}</p>
                    )}
                  </div>
                  {circle.isJoined && (
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0 mt-1" />
                  )}
                </div>

                {/* Asset classes */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {circle.assetClasses.map((a) => (
                    <span key={a} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-2 text-[10px] text-text-muted">
                      <Briefcase className="h-2.5 w-2.5" /> {a}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 py-3 border-y border-border mb-3">
                  <div className="text-center flex-1">
                    <p className="text-base font-bold text-text-primary">{circle.membersCount.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-text-muted">Brokers</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center flex-1">
                    <p className="text-base font-bold text-text-primary">{circle.postsCount.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-text-muted">Posts</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center flex-1">
                    <p className="text-base font-bold text-brand-gold">{circle.dealsCount.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-text-muted">Deals closed</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  {lock && !circle.isJoined ? (
                    <Button variant="secondary" size="sm" className="flex-1 opacity-60 cursor-not-allowed" disabled>
                      🔒 {lock} only
                    </Button>
                  ) : circle.isJoined ? (
                    <>
                      <Button size="sm" className="flex-1" asChild>
                        <Link to={`/dashboard/circles/${circle.id}`}>
                          Open Circle <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleJoin(circle.id)}>
                        Leave
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" className="flex-1" onClick={() => handleJoin(circle.id)}>
                        Join Circle
                      </Button>
                      <Button variant="secondary" size="sm" asChild>
                        <Link to={`/dashboard/circles/${circle.id}`}>Preview</Link>
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <Globe className="h-12 w-12 text-text-muted mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-text-primary mb-1">No circles found</h3>
          <p className="text-sm text-text-muted">Try adjusting your filters or search term.</p>
        </div>
      )}
    </div>
  )
}
