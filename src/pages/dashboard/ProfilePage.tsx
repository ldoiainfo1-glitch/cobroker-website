import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin, Building2, Briefcase, Star, Users, GitBranch,
  Shield, CheckCircle2, Edit3, Plus, Globe,
  Clock, Award, ThumbsUp, ArrowRight, Camera, X, Check,
} from 'lucide-react'

const LinkedinIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  MY_PROFILE, COMPLETENESS_ITEMS, MOCK_REVIEWS, MOCK_ENDORSEMENTS, MOCK_CONNECTIONS,
} from '@/data/profiles'
import type { ReviewTag } from '@/types'

// ─── Completeness Ring ────────────────────────────────────────────────────────
function CompletenessRing({ score }: { score: number }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#D4A017' : '#ef4444'

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#222" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-xl font-bold text-text-primary">{score}%</div>
        <div className="text-xs text-text-muted leading-tight">complete</div>
      </div>
    </div>
  )
}

// ─── Tier badge ───────────────────────────────────────────────────────────────
const tierConfig = {
  free: { label: 'Free', className: 'bg-surface-3 text-text-secondary border-border' },
  pro: { label: 'Pro', className: 'bg-brand-gold/10 text-brand-gold border-brand-gold/30' },
  verified_plus: { label: 'Verified+', className: 'bg-info/10 text-info border-info/30' },
  enterprise: { label: 'Enterprise', className: 'bg-success/10 text-success border-success/30' },
}

// ─── Badge definitions ────────────────────────────────────────────────────────
const badgeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  top_closer: { label: 'Top Closer', icon: <Award className="h-3 w-3" />, color: 'text-brand-gold' },
  trusted_broker: { label: 'Trusted Broker', icon: <Shield className="h-3 w-3" />, color: 'text-info' },
  circle_leader: { label: 'Circle Leader', icon: <Star className="h-3 w-3" />, color: 'text-brand-gold' },
  speed_king: { label: 'Speed King', icon: <Clock className="h-3 w-3" />, color: 'text-warning' },
  multi_city: { label: 'Multi City', icon: <MapPin className="h-3 w-3" />, color: 'text-success' },
  rera_verified: { label: 'RERA Verified', icon: <CheckCircle2 className="h-3 w-3" />, color: 'text-success' },
  early_adopter: { label: 'Early Adopter', icon: <Award className="h-3 w-3" />, color: 'text-warning' },
}

// ─── Review tag labels ────────────────────────────────────────────────────────
const tagLabel: Record<ReviewTag, string> = {
  fast_responder: 'Fast Responder',
  professional: 'Professional',
  deal_closer: 'Deal Closer',
  honest: 'Honest',
  knowledgeable: 'Knowledgeable',
  great_communicator: 'Great Communicator',
}

// ─── Star row ─────────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn('h-3.5 w-3.5', i < Math.round(rating) ? 'fill-brand-gold text-brand-gold' : 'text-surface-3')}
        />
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'endorsements' | 'connections'>('overview')
  const [editBio, setEditBio] = useState(false)
  const [bioValue, setBioValue] = useState(MY_PROFILE.bio)
  const profile = MY_PROFILE

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'reviews', label: `Reviews (${MOCK_REVIEWS.length})` },
    { id: 'endorsements', label: `Endorsements (${MOCK_ENDORSEMENTS.length})` },
    { id: 'connections', label: `Connections (${MOCK_CONNECTIONS.length})` },
  ] as const

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">My Profile</h1>
          <p className="text-sm text-text-muted">Manage your broker identity and trust signals</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/dashboard/kyc">
            <Shield className="h-3.5 w-3.5" /> KYC & Verification
          </Link>
        </Button>
      </div>

      {/* Profile card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar + ring */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="relative">
                <CompletenessRing score={profile.completenessScore} />
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-surface-3 border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand-gold/40 transition-colors">
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border', tierConfig[profile.tier].className)}>
                {tierConfig[profile.tier].label}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
                <div>
                  <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    {profile.fullName}
                    {profile.isVerified && <CheckCircle2 className="h-4 w-4 text-success" />}
                  </h2>
                  <div className="flex items-center gap-3 flex-wrap mt-1 text-sm text-text-secondary">
                    <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {profile.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.city}, {profile.state}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {profile.yearsOfExperience} yrs exp</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-2 mb-3">
                <Stars rating={profile.avgRating} />
                <span className="text-sm font-semibold text-text-primary">{profile.avgRating}</span>
                <span className="text-xs text-text-muted">({profile.totalReviews} reviews)</span>
              </div>

              {/* Bio */}
              <div className="mb-4">
                {editBio ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={bioValue}
                      onChange={(e) => setBioValue(e.target.value)}
                      rows={3}
                      placeholder="Tell other brokers about your expertise, markets and approach..."
                      className="w-full text-sm bg-surface-2 border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-brand-gold/50"
                    />
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => setEditBio(false)}>
                        <Check className="h-3.5 w-3.5" /> Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditBio(false)}>
                        <X className="h-3.5 w-3.5" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditBio(true)}
                    className={cn(
                      'text-sm text-left w-full group',
                      bioValue ? 'text-text-secondary' : 'text-text-muted italic',
                    )}
                  >
                    {bioValue || 'Add a bio to tell other brokers about your expertise...'}
                    <Edit3 className="h-3 w-3 text-brand-gold inline ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>

              {/* Badges */}
              {profile.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.badges.map((b) => {
                    const cfg = badgeConfig[b]
                    return cfg ? (
                      <div
                        key={b}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-surface-2 border border-border text-xs font-medium"
                      >
                        <span className={cfg.color}>{cfg.icon}</span>
                        <span className="text-text-secondary">{cfg.label}</span>
                      </div>
                    ) : null
                  })}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
                {[
                  { label: 'Deals', value: profile.totalDeals, icon: <GitBranch className="h-4 w-4 text-brand-gold" /> },
                  { label: 'Mandates', value: profile.totalMandates, icon: <Building2 className="h-4 w-4 text-info" /> },
                  { label: 'Connections', value: profile.totalConnections, icon: <Users className="h-4 w-4 text-success" /> },
                  { label: 'Reviews', value: profile.totalReviews, icon: <Star className="h-4 w-4 text-warning" /> },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="flex justify-center mb-1">{s.icon}</div>
                    <div className="text-xl font-bold text-text-primary">{s.value}</div>
                    <div className="text-xs text-text-muted">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completeness checklist */}
      {profile.completenessScore < 100 && (
        <Card className="mb-6 border-brand-gold/20 bg-brand-gold/5">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Complete your profile to unlock more leads</h3>
                <p className="text-xs text-text-muted mt-0.5">Brokers with 90%+ profiles get 3× more introductions</p>
              </div>
              <span className="text-sm font-bold text-brand-gold">{profile.completenessScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-3 rounded-full mb-4">
              <div
                className="h-full bg-brand-gold rounded-full transition-all"
                style={{ width: `${profile.completenessScore}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {COMPLETENESS_ITEMS.map((item) => (
                <div key={item.key} className={cn('flex items-center gap-2 text-xs', item.done ? 'text-text-muted line-through' : 'text-text-secondary')}>
                  {item.done
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                    : <div className="h-3.5 w-3.5 rounded-full border-2 border-text-muted shrink-0" />}
                  {item.label}
                  {!item.done && <span className="text-brand-gold ml-auto">+{item.weight}%</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Specializations */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Specializations</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {profile.specializations.map((s) => (
                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
              <button className="flex items-center gap-1 text-xs text-brand-gold hover:text-brand-gold-light">
                <Plus className="h-3 w-3" /> Add specialization
              </button>
            </CardContent>
          </Card>

          {/* Service areas */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Service Areas</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {profile.areas.map((a) => (
                  <div key={a} className="flex items-center gap-1.5 px-2 py-1 bg-surface-2 border border-border rounded-full text-xs text-text-secondary">
                    <MapPin className="h-3 w-3" /> {a}
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-1 text-xs text-brand-gold hover:text-brand-gold-light">
                <Plus className="h-3 w-3" /> Add area
              </button>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((l) => (
                  <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>
                ))}
                <button className="flex items-center gap-1 text-xs text-brand-gold hover:text-brand-gold-light">
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Social links */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Social & Web</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <LinkedinIcon />
                  {profile.socialLinks.linkedin
                    ? <a href={profile.socialLinks.linkedin} className="text-brand-gold text-xs hover:underline truncate">{profile.socialLinks.linkedin}</a>
                    : <span className="text-xs italic">Not linked</span>}
                  <button className="ml-auto text-xs text-brand-gold hover:text-brand-gold-light"><Edit3 className="h-3 w-3" /></button>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Globe className="h-4 w-4" />
                  {profile.socialLinks.website
                    ? <a href={profile.socialLinks.website} className="text-brand-gold text-xs hover:underline truncate">{profile.socialLinks.website}</a>
                    : <span className="text-xs italic">Not set</span>}
                  <button className="ml-auto text-xs text-brand-gold hover:text-brand-gold-light"><Edit3 className="h-3 w-3" /></button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Reviews */}
      {activeTab === 'reviews' && (
        <div className="flex flex-col gap-4">
          {/* Avg rating summary */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-text-primary">{profile.avgRating}</div>
                  <Stars rating={profile.avgRating} />
                  <div className="text-xs text-text-muted mt-1">{profile.totalReviews} reviews</div>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((n) => {
                    const count = MOCK_REVIEWS.filter((r) => Math.round(r.rating) === n).length
                    const pct = MOCK_REVIEWS.length ? (count / MOCK_REVIEWS.length) * 100 : 0
                    return (
                      <div key={n} className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-text-muted w-3">{n}</span>
                        <Star className="h-3 w-3 text-brand-gold" />
                        <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-gold rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-text-muted w-4">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {MOCK_REVIEWS.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-surface-3 flex items-center justify-center text-sm font-semibold text-text-secondary shrink-0">
                    {r.reviewerAvatarInitial}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="text-sm font-semibold text-text-primary">{r.reviewerName}</span>
                      <span className="text-xs text-text-muted">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <span className="text-xs text-text-muted">{r.reviewerCompany}</span>
                    <div className="mt-1"><Stars rating={r.rating} /></div>
                  </div>
                </div>
                <p className="text-sm font-semibold text-text-primary mb-1">{r.title}</p>
                <p className="text-sm text-text-secondary mb-3 leading-relaxed">{r.body}</p>
                <div className="flex flex-wrap gap-1.5">
                  {r.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                      {tagLabel[tag]}
                    </span>
                  ))}
                </div>
                {r.ownerResponse && (
                  <div className="mt-3 p-3 bg-surface-2 rounded-lg border border-border text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary block mb-1">Your response:</span>
                    {r.ownerResponse}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Endorsements */}
      {activeTab === 'endorsements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_ENDORSEMENTS.map((e) => (
            <Card key={e.id} className={cn(e.endorsedByMe && 'border-brand-gold/30')}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-semibold text-text-secondary">
                      {e.endorserAvatarInitial}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-text-primary">{e.endorserName}</div>
                      <div className="text-xs text-text-muted">{e.endorserCompany}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-brand-gold">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {e.count}
                  </div>
                </div>
                <div className="text-sm font-semibold text-text-primary mb-2">{e.skill}</div>
                {e.endorsedByMe
                  ? <Badge variant="outline" className="text-xs border-brand-gold/30 text-brand-gold">You endorsed this</Badge>
                  : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Connections */}
      {activeTab === 'connections' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted">{MOCK_CONNECTIONS.length} connections</span>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/connections">
                Manage connections <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          {MOCK_CONNECTIONS.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-sm font-semibold text-text-secondary shrink-0">
                    {c.avatarInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">{c.fullName}</span>
                      {c.isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-text-muted">
                      <span>{c.company}</span>
                      <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{c.city}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs shrink-0">
                    <div className="flex items-center gap-1 justify-end text-brand-gold font-medium">
                      <Star className="h-3 w-3 fill-brand-gold" /> {c.avgRating}
                    </div>
                    {c.mutualDeals > 0 && (
                      <div className="text-text-muted mt-0.5">{c.mutualDeals} mutual deals</div>
                    )}
                  </div>
                  <Link to={`/dashboard/brokers/${c.brokerId}`} className="ml-2 text-xs text-brand-gold hover:text-brand-gold-light whitespace-nowrap">
                    View →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


