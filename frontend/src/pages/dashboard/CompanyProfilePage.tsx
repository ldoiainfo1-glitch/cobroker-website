import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, MapPin, Globe, Phone, Mail, Shield,
  CheckCircle2, Star, Users, FileText, Edit3,
  ExternalLink, Award, Briefcase, Calendar,
  Download, Upload, File, AlertCircle, Camera,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { uploadCompanyLogo, uploadCompanyCover } from '@/lib/s3'
import { supabase } from '@/lib/supabase'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ── Mock company data ──────────────────────────────────────────────────────────
const MOCK_COMPANY = {
  id: 'c1',
  name: 'Skyline Realty Pvt. Ltd.',
  slug: 'skyline-realty',
  tagline: 'Mumbai\'s trusted co-broking partner since 2012',
  description:
    'Skyline Realty is a full-service brokerage firm headquartered in BKC, Mumbai. We specialise in Grade-A commercial leases, warehousing mandates, and luxury residential across MMR. Our 14-member team collectively handles over ₹500 Cr worth of mandates annually, with a 93% client satisfaction rate.',
  website: 'https://skylinerealty.com',
  phone: '+91 22 4056 7890',
  email: 'info@skylinerealty.com',
  address: 'Unit 12B, Platina, BKC, Bandra (E)',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400051',
  reraNumber: 'A51800012345',
  gstNumber: '27AABCS1234F1Z5',
  panNumber: 'AABCS1234F',
  verificationStatus: 'verified' as const,
  isActive: true,
  createdAt: '2022-01-10T00:00:00Z',
  membersCount: 14,
  mandatesCount: 38,
  totalDeals: 312,
  avgRating: 4.8,
  reviewCount: 94,
  specializations: ['Commercial Leasing', 'Warehousing', 'Luxury Residential', 'Investment Properties', 'NRI Mandates'],
  areas: ['BKC', 'Worli', 'Lower Parel', 'Bandra West', 'Andheri W', 'Powai'],
  socialLinks: {
    linkedin: 'https://linkedin.com/company/skyline-realty',
    instagram: 'https://instagram.com/skylinerealty',
  },
}

const MOCK_TEAM = [
  { id: 'b1', name: 'Arjun Mehta', role: 'Director & Co-Founder', city: 'Mumbai', initial: 'AM', tier: 'verified_plus', deals: 87, rating: 4.9, isVerified: true },
  { id: 'b2', name: 'Priya Nair', role: 'Senior Broker', city: 'Mumbai', initial: 'PN', tier: 'pro', deals: 54, rating: 4.7, isVerified: true },
  { id: 'b3', name: 'Rahul Sharma', role: 'Commercial Specialist', city: 'Mumbai', initial: 'RS', tier: 'pro', deals: 43, rating: 4.6, isVerified: true },
  { id: 'b4', name: 'Sneha Joshi', role: 'Residential Broker', city: 'Pune', initial: 'SJ', tier: 'free', deals: 21, rating: 4.4, isVerified: false },
  { id: 'b5', name: 'Vikram Rao', role: 'Leasing Specialist', city: 'Mumbai', initial: 'VR', tier: 'pro', deals: 36, rating: 4.8, isVerified: true },
  { id: 'b6', name: 'Kavita Shetty', role: 'Broker', city: 'Mumbai', initial: 'KS', tier: 'free', deals: 14, rating: 4.3, isVerified: false },
]

const MOCK_MANDATES = [
  { id: 'm1', type: 'buy', assetType: 'Commercial', title: 'Grade-A Office in BKC', budget: '₹5–8 Cr', area: 'BKC, Mumbai', postedAt: '3 days ago', views: 142 },
  { id: 'm2', type: 'lease', assetType: 'Warehouse', title: 'Industrial warehouse in Bhiwandi', budget: '₹18/sqft', area: 'Bhiwandi, MMR', postedAt: '5 days ago', views: 98 },
  { id: 'm3', type: 'sell', assetType: 'Residential', title: 'Sea-facing 3BHK in Worli', budget: '₹12–15 Cr', area: 'Worli, Mumbai', postedAt: '1 week ago', views: 231 },
  { id: 'm4', type: 'rent', assetType: 'Commercial', title: 'Serviced office space in Andheri', budget: '₹95/sqft', area: 'Andheri W, Mumbai', postedAt: '2 weeks ago', views: 67 },
]

const MOCK_REVIEWS = [
  { id: 'r1', author: 'Rajesh Kapoor', company: 'Capital Properties', rating: 5, date: '2 weeks ago', text: 'Outstanding professionalism. Arjun closed our BKC deal in under 3 weeks. The team is very responsive and knows the market inside out.' },
  { id: 'r2', author: 'Meena Iyer', company: 'Prestige Homes', rating: 5, date: '1 month ago', text: 'Worked with Priya on a Worli residential mandate. Genuine, no-spam approach. Would co-broke again.' },
  { id: 'r3', author: 'Suresh Mehta', company: 'Prime Ventures', rating: 4, date: '2 months ago', text: 'Good co-broking experience. Slight delay in documentation but overall smooth. Reliable team.' },
]

const MOCK_DOCUMENTS = [
  { id: 'd1', name: 'RERA Registration Certificate', type: 'rera', ext: 'PDF', size: '1.2 MB', uploadedAt: '12 Jan 2024', status: 'verified', uploadedBy: 'Arjun Mehta' },
  { id: 'd2', name: 'GST Registration Certificate', type: 'gst', ext: 'PDF', size: '0.8 MB', uploadedAt: '12 Jan 2024', status: 'verified', uploadedBy: 'Arjun Mehta' },
  { id: 'd3', name: 'Company Incorporation Certificate', type: 'incorporation', ext: 'PDF', size: '2.1 MB', uploadedAt: '15 Jan 2024', status: 'verified', uploadedBy: 'Arjun Mehta' },
  { id: 'd4', name: 'PAN Card', type: 'pan', ext: 'PDF', size: '0.4 MB', uploadedAt: '15 Jan 2024', status: 'verified', uploadedBy: 'Arjun Mehta' },
  { id: 'd5', name: 'Trade License 2024-25', type: 'license', ext: 'PDF', size: '1.5 MB', uploadedAt: '02 Apr 2024', status: 'pending', uploadedBy: 'Priya Nair' },
  { id: 'd6', name: 'Professional Indemnity Insurance', type: 'insurance', ext: 'PDF', size: '3.2 MB', uploadedAt: '10 Jun 2024', status: 'under_review', uploadedBy: 'Arjun Mehta' },
]

const STATS = [
  { label: 'Total Deals', value: '312', icon: <Briefcase className="h-4 w-4 text-brand-gold" /> },
  { label: 'Active Mandates', value: '38', icon: <FileText className="h-4 w-4 text-info" /> },
  { label: 'Team Members', value: '14', icon: <Users className="h-4 w-4 text-success" /> },
  { label: 'Avg Rating', value: '4.8', icon: <Star className="h-4 w-4 text-warning" /> },
]

const TIER_LABEL: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  verified_plus: 'Verified+',
  enterprise: 'Enterprise',
}

const TYPE_STYLE: Record<string, string> = {
  buy: 'bg-info/10 text-info',
  sell: 'bg-success/10 text-success',
  rent: 'bg-warning/10 text-warning',
  lease: 'bg-brand-gold/10 text-brand-gold',
}

type Tab = 'overview' | 'team' | 'mandates' | 'reviews' | 'documents'

export default function CompanyProfilePage() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState<Tab>('overview')
  const isAdmin = user?.role === 'company_admin' || user?.role === 'director'

  // ─── Logo / cover upload ─────────────────────────────────────────────────
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string>(user?.company?.logoUrl ?? '')
  const [coverUrl, setCoverUrl] = useState<string>(user?.company?.coverUrl ?? '')

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.companyId) return
    if (file.size > 5 * 1024 * 1024) { alert('Max 5 MB'); return }
    setUploadingLogo(true)
    try {
      const { publicUrl } = await uploadCompanyLogo(file)
      await supabase.from('companies').update({ logo_url: publicUrl }).eq('id', user.companyId)
      setLogoUrl(publicUrl)
    } catch (err) { console.error('Logo upload failed:', err) }
    finally { setUploadingLogo(false); if (logoInputRef.current) logoInputRef.current.value = '' }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.companyId) return
    if (file.size > 5 * 1024 * 1024) { alert('Max 5 MB'); return }
    setUploadingCover(true)
    try {
      const { publicUrl } = await uploadCompanyCover(file)
      await supabase.from('companies').update({ cover_url: publicUrl }).eq('id', user.companyId)
      setCoverUrl(publicUrl)
    } catch (err) { console.error('Cover upload failed:', err) }
    finally { setUploadingCover(false); if (coverInputRef.current) coverInputRef.current.value = '' }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'team', label: `Team (${MOCK_COMPANY.membersCount})` },
    { id: 'mandates', label: `Mandates (${MOCK_COMPANY.mandatesCount})` },
    { id: 'reviews', label: `Reviews (${MOCK_REVIEWS.length})` },
    { id: 'documents', label: `Documents (${MOCK_DOCUMENTS.length})` },
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hidden file inputs */}
      <input ref={logoInputRef}  type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoUpload} />
      <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverUpload} />

      {/* Cover + header */}
      <div className="relative h-48 border-b border-border overflow-hidden">
        {coverUrl ? (
          <img src={coverUrl} alt="Company cover" className="w-full h-full object-cover" />
        ) : (
          <img
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80"
            alt="Company cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-surface-0/80 via-surface-0/30 to-transparent" />
        {isAdmin && (
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-0/80 border border-border text-xs text-text-secondary hover:text-text-primary hover:bg-surface-0 transition-all backdrop-blur-sm disabled:opacity-50"
          >
            {uploadingCover ? <Spinner size="sm" /> : <Camera className="h-3.5 w-3.5" />}
            {uploadingCover ? 'Uploading…' : 'Change Cover'}
          </button>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {/* Logo + name row */}
        <div className="flex items-end gap-4 -mt-8 mb-5">
          <div
            onClick={() => isAdmin && logoInputRef.current?.click()}
            className="w-16 h-16 rounded-2xl bg-surface-0 border-2 border-border shadow-lg flex items-center justify-center shrink-0 relative z-10 overflow-hidden group cursor-pointer"
            title={isAdmin ? 'Change company logo' : undefined}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Company logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-black text-brand-gold">
                {(user?.company?.name ?? 'C')[0].toUpperCase()}
              </span>
            )}
            {isAdmin && (
              <div className="absolute inset-0 bg-surface-0/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingLogo ? <Spinner size="sm" /> : <Camera className="h-4 w-4 text-text-primary" />}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-text-primary">{MOCK_COMPANY.name}</h1>
              {MOCK_COMPANY.verificationStatus === 'verified' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-sm text-text-muted mt-0.5">{MOCK_COMPANY.tagline}</p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {STATS.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center shrink-0">
                  {s.icon}
                </div>
                <div>
                  <p className="text-lg font-bold text-text-primary leading-none">{s.value}</p>
                  <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border mb-6">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn('px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === t.id
                  ? 'border-brand-gold text-brand-gold'
                  : 'border-transparent text-text-muted hover:text-text-secondary')}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* About */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-text-primary mb-3">About</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{MOCK_COMPANY.description}</p>
                </CardContent>
              </Card>

              {/* Specializations */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_COMPANY.specializations.map((s) => (
                      <span key={s} className="px-3 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-xs font-medium text-brand-gold">
                        {s}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Areas */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Areas of Operation</h3>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_COMPANY.areas.map((a) => (
                      <span key={a} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-2 border border-border text-xs text-text-secondary">
                        <MapPin className="h-3 w-3 text-text-muted" /> {a}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right sidebar */}
            <div className="flex flex-col gap-5">
              {/* Contact */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-text-primary mb-4">Contact</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { icon: <MapPin className="h-3.5 w-3.5" />, text: `${MOCK_COMPANY.address}, ${MOCK_COMPANY.city} ${MOCK_COMPANY.pincode}` },
                      { icon: <Phone className="h-3.5 w-3.5" />, text: MOCK_COMPANY.phone },
                      { icon: <Mail className="h-3.5 w-3.5" />, text: MOCK_COMPANY.email },
                      { icon: <Globe className="h-3.5 w-3.5" />, text: MOCK_COMPANY.website, link: MOCK_COMPANY.website },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="text-text-muted mt-0.5 shrink-0">{item.icon}</span>
                        {item.link ? (
                          <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-brand-gold hover:underline break-all inline-flex items-center gap-1">
                            {item.text} <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-text-secondary break-all">{item.text}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Legal IDs */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-4 w-4 text-success" />
                    <h3 className="text-sm font-semibold text-text-primary">Verified Documents</h3>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { label: 'RERA', value: MOCK_COMPANY.reraNumber },
                      { label: 'GST', value: MOCK_COMPANY.gstNumber },
                      { label: 'PAN', value: MOCK_COMPANY.panNumber },
                    ].map((doc) => (
                      <div key={doc.label} className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">{doc.label}</span>
                        <span className="text-xs font-mono text-text-secondary">{doc.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Member since */}
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-text-muted" />
                  <div>
                    <p className="text-xs text-text-muted">Member since</p>
                    <p className="text-sm font-medium text-text-primary">January 2022</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab: Team */}
        {tab === 'team' && (
          <div className="pb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_TEAM.map((member) => (
                <Card key={member.id} className="hover:border-brand-gold/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-11 h-11 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-sm font-bold text-brand-gold shrink-0">
                        {member.initial}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-semibold text-text-primary truncate">{member.name}</p>
                          {member.isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-brand-gold shrink-0" />}
                        </div>
                        <p className="text-xs text-text-muted truncate">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surface-2 border border-border text-text-muted">
                        {TIER_LABEL[member.tier]}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-brand-gold text-brand-gold" />
                        <span className="text-xs text-text-secondary">{member.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">{member.deals} deals closed</span>
                      <Link to={`/dashboard/brokers/${member.id}`}
                        className="text-xs text-brand-gold hover:text-brand-gold-light font-medium">
                        View profile →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Mandates */}
        {tab === 'mandates' && (
          <div className="pb-10">
            <div className="flex flex-col gap-3">
              {MOCK_MANDATES.map((m) => (
                <Card key={m.id} className="hover:border-brand-gold/30 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={cn('text-xs font-bold uppercase px-2.5 py-0.5 rounded-full', TYPE_STYLE[m.type])}>
                          {m.type}
                        </span>
                        <span className="text-xs text-text-muted bg-surface-2 border border-border px-2 py-0.5 rounded-full">
                          {m.assetType}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-text-primary">{m.title}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {m.area}
                        </span>
                        <span className="text-xs font-medium text-brand-gold">{m.budget}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-text-muted">{m.postedAt}</p>
                      <p className="text-xs text-text-muted mt-1">{m.views} views</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" asChild>
                <Link to="/marketplace">View all mandates</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Tab: Reviews */}
        {tab === 'reviews' && (
          <div className="pb-10">
            {/* Rating summary */}
            <Card className="mb-5">
              <CardContent className="p-5 flex items-center gap-6">
                <div className="text-center shrink-0">
                  <p className="text-4xl font-black text-text-primary">{MOCK_COMPANY.avgRating}</p>
                  <div className="flex items-center gap-0.5 justify-center mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={cn('h-4 w-4', s <= Math.round(MOCK_COMPANY.avgRating) ? 'fill-brand-gold text-brand-gold' : 'text-border')} />
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-1">{MOCK_COMPANY.reviewCount} reviews</p>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = star === 5 ? 72 : star === 4 ? 21 : star === 3 ? 5 : star === 2 ? 1 : 1
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-text-muted w-4 text-right">{star}</span>
                        <Star className="h-3 w-3 text-brand-gold shrink-0" />
                        <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                          <div className="h-full rounded-full bg-brand-gold" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-text-muted w-8">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Review cards */}
            <div className="flex flex-col gap-4">
              {MOCK_REVIEWS.map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-2 border border-border flex items-center justify-center text-xs font-bold text-text-secondary shrink-0">
                          {r.author[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{r.author}</p>
                          <p className="text-xs text-text-muted">{r.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-brand-gold text-brand-gold" />
                        ))}
                        <span className="text-xs text-text-muted ml-1">{r.date}</span>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{r.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Documents */}
        {tab === 'documents' && (
          <div className="pb-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-text-muted">{MOCK_DOCUMENTS.length} documents uploaded</p>
              {isAdmin && (
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-gold text-black text-xs font-bold hover:bg-brand-gold/90 transition-colors">
                  <Upload className="h-3.5 w-3.5" /> Upload Document
                </button>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {MOCK_DOCUMENTS.map((doc) => {
                const statusStyle =
                  doc.status === 'verified'
                    ? { pill: 'bg-success/10 text-success border-success/20', icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Verified' }
                    : doc.status === 'pending'
                    ? { pill: 'bg-warning/10 text-warning border-warning/20', icon: <AlertCircle className="h-3.5 w-3.5" />, label: 'Pending review' }
                    : { pill: 'bg-info/10 text-info border-info/20', icon: <AlertCircle className="h-3.5 w-3.5" />, label: 'Under review' }

                return (
                  <Card key={doc.id} className="hover:border-brand-gold/30 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      {/* File icon */}
                      <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0">
                        <File className="h-5 w-5 text-text-muted" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{doc.name}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-text-muted">{doc.ext} · {doc.size}</span>
                          <span className="text-xs text-text-muted">Uploaded {doc.uploadedAt}</span>
                          <span className="text-xs text-text-muted">by {doc.uploadedBy}</span>
                        </div>
                      </div>

                      {/* Status + download */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium', statusStyle.pill)}>
                          {statusStyle.icon} {statusStyle.label}
                        </span>
                        <button className="p-2 rounded-lg text-text-muted hover:text-brand-gold hover:bg-brand-gold/10 transition-colors" title="Download">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Info note */}
            <div className="mt-5 flex items-start gap-2.5 p-4 rounded-xl bg-surface-2 border border-border">
              <Shield className="h-4 w-4 text-text-muted mt-0.5 shrink-0" />
              <p className="text-xs text-text-muted leading-relaxed">
                Documents marked <span className="text-success font-medium">Verified</span> have been reviewed by the Co-Brokings compliance team. Only company admins can upload or delete documents.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
