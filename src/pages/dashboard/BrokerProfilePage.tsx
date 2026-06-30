import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  MapPin, Building2, Briefcase, Star, Users, GitBranch,
  Shield, CheckCircle2, Globe, Clock, Award,
  ThumbsUp, ArrowLeft, UserPlus, UserCheck, MessageSquare,
} from 'lucide-react'

const LinkedinIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { MOCK_BROKER_PROFILES, MOCK_REVIEWS, MOCK_ENDORSEMENTS } from '@/data/profiles'
import type { ReviewTag } from '@/types'

// ─── Reusable sub-components ──────────────────────────────────────────────────
const tierConfig = {
  free: { label: 'Free', className: 'bg-surface-3 text-text-secondary border-border' },
  pro: { label: 'Pro', className: 'bg-brand-gold/10 text-brand-gold border-brand-gold/30' },
  verified_plus: { label: 'Verified+', className: 'bg-info/10 text-info border-info/30' },
  enterprise: { label: 'Enterprise', className: 'bg-success/10 text-success border-success/30' },
}

const badgeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  top_closer: { label: 'Top Closer', icon: <Award className="h-3 w-3" />, color: 'text-brand-gold' },
  trusted_broker: { label: 'Trusted Broker', icon: <Shield className="h-3 w-3" />, color: 'text-info' },
  circle_leader: { label: 'Circle Leader', icon: <Star className="h-3 w-3" />, color: 'text-brand-gold' },
  speed_king: { label: 'Speed King', icon: <Clock className="h-3 w-3" />, color: 'text-warning' },
  multi_city: { label: 'Multi City', icon: <MapPin className="h-3 w-3" />, color: 'text-success' },
  rera_verified: { label: 'RERA Verified', icon: <CheckCircle2 className="h-3 w-3" />, color: 'text-success' },
  early_adopter: { label: 'Early Adopter', icon: <Award className="h-3 w-3" />, color: 'text-warning' },
}

const tagLabel: Record<ReviewTag, string> = {
  fast_responder: 'Fast Responder',
  professional: 'Professional',
  deal_closer: 'Deal Closer',
  honest: 'Honest',
  knowledgeable: 'Knowledgeable',
  great_communicator: 'Great Communicator',
}

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sz = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(sz, i < Math.round(rating) ? 'fill-brand-gold text-brand-gold' : 'text-surface-3')}
        />
      ))}
    </div>
  )
}

// ─── Write Review modal ───────────────────────────────────────────────────────
const REVIEW_TAGS: ReviewTag[] = ['fast_responder', 'professional', 'deal_closer', 'honest', 'knowledgeable', 'great_communicator']

function ReviewModal({ onClose, brokerName }: { onClose: () => void; brokerName: string }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [selectedTags, setSelectedTags] = useState<ReviewTag[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const toggleTag = (tag: ReviewTag) =>
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-text-primary mb-1">Review {brokerName}</h3>
          <p className="text-sm text-text-muted mb-5">Share your co-broking experience</p>

          {/* Star picker */}
          <div className="flex gap-1 mb-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                onMouseEnter={() => setHover(i + 1)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(i + 1)}
              >
                <Star className={cn('h-7 w-7 transition-colors', (hover || rating) > i ? 'fill-brand-gold text-brand-gold' : 'text-surface-3 hover:text-brand-gold/50')} />
              </button>
            ))}
          </div>

          {/* Tags */}
          <div className="mb-4">
            <p className="text-xs text-text-muted mb-2">What stood out? (select all that apply)</p>
            <div className="flex flex-wrap gap-2">
              {REVIEW_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full border transition-all',
                    selectedTags.includes(tag)
                      ? 'bg-brand-gold/20 border-brand-gold text-brand-gold'
                      : 'border-border text-text-muted hover:border-brand-gold/30',
                  )}
                >
                  {tagLabel[tag]}
                </button>
              ))}
            </div>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Review title"
            className="w-full mb-3 text-sm bg-surface-2 border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe your experience working with this broker..."
            rows={3}
            className="w-full mb-4 text-sm bg-surface-2 border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-brand-gold/50"
          />
          <div className="flex gap-2">
            <Button className="flex-1" disabled={!rating || !title || !body} onClick={onClose}>
              Submit Review
            </Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BrokerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'endorsements'>('overview')
  const [isConnected, setIsConnected] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)

  const profile = MOCK_BROKER_PROFILES.find((p) => p.id === id || p.userId === id)
    ?? MOCK_BROKER_PROFILES[0]

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'reviews', label: `Reviews (${MOCK_REVIEWS.length})` },
    { id: 'endorsements', label: `Endorsements (${MOCK_ENDORSEMENTS.length})` },
  ] as const

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {showReviewModal && (
        <ReviewModal onClose={() => setShowReviewModal(false)} brokerName={profile.fullName} />
      )}

      {/* Back */}
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /> Back</Link>
      </Button>

      {/* Profile card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="w-20 h-20 rounded-full bg-brand-gold/20 border-2 border-brand-gold/40 flex items-center justify-center text-2xl font-bold text-brand-gold">
                {profile.avatarInitial}
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

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant={isConnected ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => setIsConnected(!isConnected)}
                  >
                    {isConnected
                      ? <><UserCheck className="h-3.5 w-3.5" /> Connected</>
                      : <><UserPlus className="h-3.5 w-3.5" /> Connect</>}
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-3.5 w-3.5" /> Message
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowReviewModal(true)}>
                    <Star className="h-3.5 w-3.5" /> Review
                  </Button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-2 mb-3">
                <Stars rating={profile.avgRating} />
                <span className="text-sm font-semibold text-text-primary">{profile.avgRating}</span>
                <span className="text-xs text-text-muted">({profile.totalReviews} reviews)</span>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-sm text-text-secondary leading-relaxed mb-4">{profile.bio}</p>
              )}

              {/* Badges */}
              {profile.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.badges.map((b) => {
                    const cfg = badgeConfig[b]
                    return cfg ? (
                      <div key={b} className="flex items-center gap-1 px-2 py-1 rounded-full bg-surface-2 border border-border text-xs font-medium">
                        <span className={cfg.color}>{cfg.icon}</span>
                        <span className="text-text-secondary">{cfg.label}</span>
                      </div>
                    ) : null
                  })}
                </div>
              )}

              {/* Social links */}
              <div className="flex items-center gap-4 mb-4">
                {profile.socialLinks.linkedin && (
                  <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-text-muted hover:text-brand-gold">
                    <LinkedinIcon /> LinkedIn
                  </a>
                )}
                {profile.socialLinks.website && (
                  <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-text-muted hover:text-brand-gold">
                    <Globe className="h-3.5 w-3.5" /> Website
                  </a>
                )}
              </div>

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
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {profile.specializations.map((s) => (
                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Service Areas</h3>
              <div className="flex flex-wrap gap-2">
                {profile.areas.map((a) => (
                  <div key={a} className="flex items-center gap-1.5 px-2 py-1 bg-surface-2 border border-border rounded-full text-xs text-text-secondary">
                    <MapPin className="h-3 w-3" /> {a}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((l) => (
                  <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Reviews */}
      {activeTab === 'reviews' && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-text-primary">{profile.avgRating}</div>
                  <Stars rating={profile.avgRating} size="md" />
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
                    <span className="font-semibold text-text-primary block mb-1">{profile.fullName} responded:</span>
                    {r.ownerResponse}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" className="w-full" onClick={() => setShowReviewModal(true)}>
            <Star className="h-4 w-4" /> Write a Review
          </Button>
        </div>
      )}

      {/* Tab: Endorsements */}
      {activeTab === 'endorsements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_ENDORSEMENTS.map((e) => (
            <Card key={e.id}>
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
                    <ThumbsUp className="h-3.5 w-3.5" /> {e.count}
                  </div>
                </div>
                <div className="text-sm font-semibold text-text-primary mb-3">{e.skill}</div>
                <button
                  onClick={() => {}}
                  className={cn(
                    'w-full text-xs py-1.5 rounded-lg border transition-all',
                    e.endorsedByMe
                      ? 'bg-brand-gold/10 border-brand-gold/30 text-brand-gold'
                      : 'border-border text-text-muted hover:border-brand-gold/30 hover:text-brand-gold',
                  )}
                >
                  {e.endorsedByMe ? 'Endorsed ✓' : '+ Endorse'}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


