import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Search, MapPin, Star, CheckCircle2,
  UserPlus, UserCheck, GitBranch, Filter,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  MOCK_CONNECTIONS, MOCK_SUGGESTED_CONNECTIONS, MOCK_BROKER_PROFILES,
} from '@/data/profiles'
import type { Connection, BrokerTier } from '@/types'

// ─── Tier badge ───────────────────────────────────────────────────────────────
const tierConfig: Record<BrokerTier, { label: string; className: string }> = {
  free: { label: 'Free', className: 'bg-surface-3 text-text-secondary border-border' },
  pro: { label: 'Pro', className: 'bg-brand-gold/10 text-brand-gold border-brand-gold/30' },
  verified_plus: { label: 'Verified+', className: 'bg-info/10 text-info border-info/30' },
  enterprise: { label: 'Enterprise', className: 'bg-success/10 text-success border-success/30' },
}

// ─── Connection card ──────────────────────────────────────────────────────────
function ConnectionCard({
  conn,
  isConnected,
  onToggle,
}: {
  conn: Connection
  isConnected: boolean
  onToggle: () => void
}) {
  const tier = tierConfig[conn.tier as BrokerTier] ?? tierConfig.free

  return (
    <Card className="hover:border-brand-gold/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Link to={`/dashboard/brokers/${conn.brokerId}`}>
            <div className="w-11 h-11 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center text-sm font-bold text-brand-gold shrink-0">
              {conn.avatarInitial}
            </div>
          </Link>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                to={`/dashboard/brokers/${conn.brokerId}`}
                className="text-sm font-semibold text-text-primary hover:text-brand-gold transition-colors"
              >
                {conn.fullName}
              </Link>
              {conn.isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />}
              <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ml-auto', tier.className)}>
                {tier.label}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">{conn.company}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
              <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{conn.city}</span>
              <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-brand-gold text-brand-gold" />{conn.avgRating}</span>
              {conn.mutualDeals > 0 && (
                <span className="flex items-center gap-0.5 text-success"><GitBranch className="h-3 w-3" />{conn.mutualDeals} deals</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <Button
            size="sm"
            variant={isConnected ? 'outline' : 'primary'}
            className="flex-1"
            onClick={onToggle}
          >
            {isConnected
              ? <><UserCheck className="h-3.5 w-3.5" /> Connected</>
              : <><UserPlus className="h-3.5 w-3.5" /> Connect</>}
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link to={`/dashboard/brokers/${conn.brokerId}`}>View profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Discover card (broker from MOCK_BROKER_PROFILES) ─────────────────────────
function DiscoverCard({ brokerId, onConnect }: { brokerId: string; onConnect: (id: string) => void }) {
  const p = MOCK_BROKER_PROFILES.find((b) => b.id === brokerId)
  if (!p) return null
  const tier = tierConfig[p.tier]

  return (
    <Card className="hover:border-brand-gold/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center text-sm font-bold text-brand-gold shrink-0">
            {p.avatarInitial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-text-primary">{p.fullName}</span>
              {p.isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />}
              <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ml-auto', tier.className)}>
                {tier.label}
              </span>
            </div>
            <p className="text-xs text-text-muted">{p.company} · {p.city}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
              <span><Star className="h-3 w-3 fill-brand-gold text-brand-gold inline" /> {p.avgRating}</span>
              <span>{p.totalDeals} deals</span>
            </div>
          </div>
        </div>

        {/* Specializations preview */}
        <div className="flex flex-wrap gap-1 mb-3">
          {p.specializations.slice(0, 2).map((s) => (
            <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
          ))}
        </div>

        <Button size="sm" className="w-full" onClick={() => onConnect(p.id)}>
          <UserPlus className="h-3.5 w-3.5" /> Connect
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState<'connections' | 'discover'>('connections')
  const [search, setSearch] = useState('')
  const [connectedIds, setConnectedIds] = useState<Set<string>>(
    new Set(MOCK_CONNECTIONS.map((c) => c.brokerId)),
  )
  const [suggestedConnectedIds, setSuggestedConnectedIds] = useState<Set<string>>(new Set())

  const tabs = [
    { id: 'connections', label: `My Connections (${connectedIds.size})` },
    { id: 'discover', label: 'Discover Brokers' },
  ] as const

  const toggleConnection = (id: string) => {
    setConnectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filteredConnections = MOCK_CONNECTIONS.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()),
  )

  // Brokers not already connected
  const toDiscover = MOCK_BROKER_PROFILES.filter(
    (b) => !connectedIds.has(b.id) && !suggestedConnectedIds.has(b.id),
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-gold" />
            Connections
          </h1>
          <p className="text-sm text-text-muted mt-0.5">Build your co-broking network</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Connections', value: connectedIds.size, color: 'text-brand-gold' },
          { label: 'Mutual deals', value: MOCK_CONNECTIONS.reduce((s, c) => s + c.mutualDeals, 0), color: 'text-success' },
          { label: 'Suggested', value: toDiscover.length, color: 'text-info' },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className={cn('text-2xl font-bold mb-0.5', s.color)}>{s.value}</div>
            <div className="text-xs text-text-muted">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab.id
                ? 'text-brand-gold border-brand-gold'
                : 'text-text-muted border-transparent hover:text-text-secondary',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Connections tab */}
      {activeTab === 'connections' && (
        <div>
          {/* Search */}
          <div className="flex items-center gap-2 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search connections..."
                className="w-full pl-9 pr-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>

          {filteredConnections.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No connections match your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConnections.map((conn) => (
                <ConnectionCard
                  key={conn.id}
                  conn={conn}
                  isConnected={connectedIds.has(conn.brokerId)}
                  onToggle={() => toggleConnection(conn.brokerId)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Discover tab */}
      {activeTab === 'discover' && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                placeholder="Search brokers by name, city or specialization..."
                className="w-full pl-9 pr-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50"
              />
            </div>
          </div>

          {/* Suggested from circles */}
          {MOCK_SUGGESTED_CONNECTIONS.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Suggested from your circles</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_SUGGESTED_CONNECTIONS.map((conn) => (
                  <DiscoverCard
                    key={conn.id}
                    brokerId={conn.brokerId}
                    onConnect={(id) => {
                      setSuggestedConnectedIds((prev) => new Set([...prev, id]))
                      setConnectedIds((prev) => new Set([...prev, id]))
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All brokers */}
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">All brokers on COBROKINGS</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {toDiscover.map((b) => (
              <DiscoverCard
                key={b.id}
                brokerId={b.id}
                onConnect={(id) => {
                  setConnectedIds((prev) => new Set([...prev, id]))
                }}
              />
            ))}
            {toDiscover.length === 0 && (
              <div className="col-span-3 text-center py-12 text-text-muted">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">You are connected with all brokers on COBROKINGS!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
