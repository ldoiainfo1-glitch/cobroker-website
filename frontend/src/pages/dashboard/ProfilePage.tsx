import { useState, useRef, useMemo } from 'react'
import type { User } from '@/types'
import { Link } from 'react-router-dom'
import {
  MapPin, Building2, Briefcase, Star, Users, GitBranch,
  Shield, CheckCircle2, Edit3, Plus, Globe,
  Clock, Award, ArrowRight, Camera, X, Check,
} from 'lucide-react'
import { uploadAvatar } from '@/lib/s3'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { Spinner } from '@/components/ui/spinner'

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
  MY_PROFILE, MOCK_REVIEWS,
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

// ─── Avatar with completeness progress ring ───────────────────────────────────
// Container 112px — avatar 80px — ring r=52 strokeWidth=3
// Gap between avatar edge (40px) and ring inner edge (50.5px) = ~10px → clean look
function AvatarWithRing({
  avatarUrl, fullName, score, uploading, onCameraClick,
}: {
  avatarUrl?: string | null
  fullName: string
  score: number
  uploading: boolean
  onCameraClick: () => void
}) {
  const SIZE = 112           // container px
  const C    = SIZE / 2      // centre = 56
  const R    = 50            // ring radius — inner edge 48.5, outer 51.5
  const SW   = 3             // stroke width (thin & elegant)
  const circ   = 2 * Math.PI * R
  const offset = circ - (score / 100) * circ
  const ringColor = score >= 80 ? '#22c55e' : score >= 50 ? '#D4A017' : '#ef4444'
  const initials  = fullName.split(' ').map(n => n[0] ?? '').join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      {/* SVG progress ring — sits outside the avatar with ~8px air gap */}
      <svg
        className="absolute inset-0 -rotate-90 pointer-events-none"
        width={SIZE} height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
      >
        {/* Track — very subtle */}
        <circle
          cx={C} cy={C} r={R}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={SW}
        />
        {/* Progress arc */}
        <circle
          cx={C} cy={C} r={R}
          fill="none"
          stroke={ringColor}
          strokeWidth={SW}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>

      {/* Avatar circle — entire circle is clickable */}
      <button
        type="button"
        title="Change profile photo"
        disabled={uploading}
        onClick={onCameraClick}
        className="relative w-20 h-20 rounded-full z-10 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/60 disabled:opacity-50"
      >
        {/* Image or initials */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-full h-full rounded-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-brand-gold/20 flex items-center justify-center text-2xl font-bold text-brand-gold select-none">
            {initials}
          </div>
        )}

        {/* Hover overlay — dark tint + "Change photo" */}
        <div className="absolute inset-0 rounded-full bg-black/55 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          {uploading
            ? <Spinner size="sm" />
            : <>
                <Camera className="h-5 w-5 text-white" />
                <span className="text-[10px] text-white font-semibold leading-none">Change</span>
              </>
          }
        </div>

        {/* Always-visible camera badge — tells user this is editable */}
        <div className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full bg-surface-2 border-2 border-surface-0 flex items-center justify-center shadow-sm pointer-events-none group-hover:opacity-0 transition-opacity duration-200">
          <Camera className="h-3 w-3 text-text-muted" />
        </div>
      </button>
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

// ─── Tag Input ───────────────────────────────────────────────────────────────
function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder,
}: {
  tags: string[]
  onAdd: (tag: string) => void
  onRemove: (tag: string) => void
  placeholder: string
}) {
  const [input, setInput] = useState('')
  const commit = () => {
    const val = input.trim()
    if (val && !tags.includes(val)) { onAdd(val); setInput('') }
  }
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-surface-3 border border-border rounded-full text-xs text-text-secondary">
            {tag}
            <button type="button" onClick={() => onRemove(tag)} className="text-text-muted hover:text-error">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit() } }}
          placeholder={placeholder}
          className="flex-1 text-sm bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50"
        />
        <button
          type="button"
          onClick={commit}
          className="px-3 py-1.5 text-xs bg-brand-gold text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Add
        </button>
      </div>
    </div>
  )
}

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
interface EditProfileData {
  fullName: string
  phone: string
  bio: string
  yearsOfExperience: number
  specializations: string[]
  areas: string[]
  languages: string[]
  linkedinUrl: string
  websiteUrl: string
}

function EditProfileModal({
  user,
  onSave,
  onClose,
}: {
  user: User
  onSave: (data: EditProfileData) => Promise<void>
  onClose: () => void
}) {
  const [data, setData] = useState<EditProfileData>({
    fullName: user.fullName,
    phone: user.phone ?? '',
    bio: user.bio ?? '',
    yearsOfExperience: user.yearsOfExperience ?? 0,
    specializations: user.specializations ?? [],
    areas: user.areas ?? [],
    languages: user.languages ?? [],
    linkedinUrl: user.linkedinUrl ?? '',
    websiteUrl: user.websiteUrl ?? '',
  })
  const [saving, setSaving] = useState(false)

  const field = (
    label: string,
    key: keyof EditProfileData,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
      <input
        value={data[key] as string | number}
        onChange={(e) =>
          setData((d) => ({
            ...d,
            [key]: props.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value,
          }))
        }
        className="w-full text-sm bg-surface-2 border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50"
        {...props}
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-surface-1 border border-border rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-text-primary">Edit Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text-primary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-5">
          {field('Full Name *', 'fullName', { placeholder: 'Your full name' })}
          {field('Phone', 'phone', { placeholder: '9876543210' })}

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Bio</label>
            <textarea
              value={data.bio}
              onChange={(e) => setData((d) => ({ ...d, bio: e.target.value }))}
              rows={3}
              placeholder="Tell other brokers about your expertise, markets and approach..."
              className="w-full text-sm bg-surface-2 border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-brand-gold/50"
            />
          </div>

          {field('Years of Experience', 'yearsOfExperience', { type: 'number', min: 0, max: 60 })}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Specializations</label>
            <TagInput
              tags={data.specializations}
              onAdd={(t) => setData((d) => ({ ...d, specializations: [...d.specializations, t] }))}
              onRemove={(t) => setData((d) => ({ ...d, specializations: d.specializations.filter((x) => x !== t) }))}
              placeholder="e.g. Commercial Leasing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Service Areas</label>
            <TagInput
              tags={data.areas}
              onAdd={(t) => setData((d) => ({ ...d, areas: [...d.areas, t] }))}
              onRemove={(t) => setData((d) => ({ ...d, areas: d.areas.filter((x) => x !== t) }))}
              placeholder="e.g. Bandra West"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Languages</label>
            <TagInput
              tags={data.languages}
              onAdd={(t) => setData((d) => ({ ...d, languages: [...d.languages, t] }))}
              onRemove={(t) => setData((d) => ({ ...d, languages: d.languages.filter((x) => x !== t) }))}
              placeholder="e.g. Hindi"
            />
          </div>

          {field('LinkedIn URL', 'linkedinUrl', { placeholder: 'https://linkedin.com/in/...' })}
          {field('Website', 'websiteUrl', { placeholder: 'https://yourwebsite.com' })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border shrink-0 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button
            className="flex-1"
            disabled={saving || !data.fullName.trim()}
            onClick={async () => { setSaving(true); try { await onSave(data) } finally { setSaving(false) } }}
          >
            {saving ? <Spinner size="sm" /> : <Check className="h-3.5 w-3.5" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview')
  const [editBio, setEditBio] = useState(false)
  const [bioValue, setBioValue] = useState(user?.bio ?? '')
  const [showEditModal, setShowEditModal] = useState(false)

  // ─── Dynamic completeness items (recomputed on every user change) ──────────
  const completenessItems = useMemo(() => [
    { key: 'photo',           label: 'Profile photo',          weight: 10, done: !!user?.avatarUrl },
    { key: 'bio',             label: 'Bio (50+ chars)',         weight: 15, done: (user?.bio?.length ?? 0) >= 50 },
    { key: 'phone',           label: 'Phone number',           weight: 10, done: !!user?.phone },
    { key: 'kyc',             label: 'KYC verified',           weight: 20, done: !!user?.isVerified },
    { key: 'specializations', label: 'Specializations added',  weight: 10, done: (user?.specializations?.length ?? 0) > 0 },
    { key: 'areas',           label: 'Service areas set',      weight: 10, done: (user?.areas?.length ?? 0) > 0 },
    { key: 'languages',       label: 'Languages listed',       weight:  5, done: (user?.languages?.length ?? 0) > 0 },
    { key: 'experience',      label: 'Years of experience',    weight:  5, done: (user?.yearsOfExperience ?? 0) > 0 },
    { key: 'social',          label: 'LinkedIn linked',        weight:  5, done: !!user?.linkedinUrl },
    { key: 'company',         label: 'Company profile',        weight: 10, done: !!user?.company?.name },
  ], [user])

  const completenessScore = useMemo(
    () => completenessItems.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0),
    [completenessItems],
  )

  // Build profile from real auth-store user, falling back to MY_PROFILE for
  // display-only fields not yet entered (badges, stats, tier, etc.)
  const profile = user ? {
    ...MY_PROFILE,
    id: user.id,
    userId: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    avatarInitial: user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
    company: user.company?.name ?? MY_PROFILE.company,
    companyId: user.companyId ?? MY_PROFILE.companyId,
    city: user.company?.city ?? MY_PROFILE.city,
    state: user.company?.state ?? MY_PROFILE.state,
    isVerified: user.isVerified,
    bio: user.bio ?? MY_PROFILE.bio,
    yearsOfExperience: user.yearsOfExperience ?? MY_PROFILE.yearsOfExperience,
    specializations: user.specializations?.length ? user.specializations : MY_PROFILE.specializations,
    areas: user.areas?.length ? user.areas : MY_PROFILE.areas,
    languages: user.languages?.length ? user.languages : MY_PROFILE.languages,
    socialLinks: {
      linkedin: user.linkedinUrl,
      website: user.websiteUrl,
    },
    completenessScore,
  } : MY_PROFILE

  // ─── Save bio inline ───────────────────────────────────────────────────────
  const saveBio = async () => {
    if (!user) return
    await supabase.from('profiles').update({ bio: bioValue || null }).eq('id', user.id)
    setUser({ ...user, bio: bioValue || undefined })
    setEditBio(false)
  }

  // ─── Save full profile from modal ─────────────────────────────────────────
  const handleSaveProfile = async (data: EditProfileData) => {
    if (!user) return
    const { error } = await supabase.from('profiles').update({
      full_name: data.fullName,
      phone: data.phone || null,
      bio: data.bio || null,
      years_of_experience: data.yearsOfExperience,
      specializations: data.specializations,
      areas: data.areas,
      languages: data.languages,
      linkedin_url: data.linkedinUrl || null,
      website_url: data.websiteUrl || null,
    }).eq('id', user.id)
    if (!error) {
      setUser({
        ...user,
        fullName: data.fullName,
        phone: data.phone || undefined,
        bio: data.bio || undefined,
        yearsOfExperience: data.yearsOfExperience,
        specializations: data.specializations,
        areas: data.areas,
        languages: data.languages,
        linkedinUrl: data.linkedinUrl || undefined,
        websiteUrl: data.websiteUrl || undefined,
      })
      setBioValue(data.bio)
      setShowEditModal(false)
    }
  }

  // ─── Avatar upload ─────────────────────────────────────────────────────────
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (file.size > 5 * 1024 * 1024) { alert('File too large. Max 5 MB.'); return }
    setUploadingAvatar(true)
    try {
      const { publicUrl } = await uploadAvatar(file)
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      setUser({ ...user, avatarUrl: publicUrl })
    } catch (err) {
      console.error('Avatar upload failed:', err)
    } finally {
      setUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'reviews', label: `Reviews (${MOCK_REVIEWS.length})` },
  ] as const

  return (
    <>
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
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              {/* Avatar with completeness ring as outer border */}
              <AvatarWithRing
                avatarUrl={user?.avatarUrl}
                fullName={user?.fullName ?? ''}
                score={profile.completenessScore}
                uploading={uploadingAvatar}
                onCameraClick={() => avatarInputRef.current?.click()}
              />
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
                <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
                  <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-2 mb-3">
                <Stars rating={profile.avgRating ?? 0} />
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
                      <Button size="sm" onClick={saveBio}>
                        <Check className="h-3.5 w-3.5" /> Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setBioValue(user?.bio ?? ''); setEditBio(false) }}>
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
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                {[
                  { label: 'Deals', value: profile.totalDeals, icon: <GitBranch className="h-4 w-4 text-brand-gold" /> },
                  { label: 'Mandates', value: profile.totalMandates, icon: <Building2 className="h-4 w-4 text-info" /> },
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
                <p className="text-xs text-text-muted mt-0.5">Brokers with 90%+ profiles get 3× more enquiries</p>
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
              {completenessItems.map((item) => (
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
                  <button onClick={() => setShowEditModal(true)} className="ml-auto text-xs text-brand-gold hover:text-brand-gold-light"><Edit3 className="h-3 w-3" /></button>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Globe className="h-4 w-4" />
                  {profile.socialLinks.website
                    ? <a href={profile.socialLinks.website} className="text-brand-gold text-xs hover:underline truncate">{profile.socialLinks.website}</a>
                    : <span className="text-xs italic">Not set</span>}
                  <button onClick={() => setShowEditModal(true)} className="ml-auto text-xs text-brand-gold hover:text-brand-gold-light"><Edit3 className="h-3 w-3" /></button>
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
                  <Stars rating={profile.avgRating ?? 0} />
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


    </div>

    {/* Edit Profile Modal */}
    {showEditModal && user && (
      <EditProfileModal
        user={user}
        onSave={handleSaveProfile}
        onClose={() => setShowEditModal(false)}
      />
    )}
    </>
  )
}


