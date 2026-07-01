import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  MapPin, Eye, Clock, ArrowLeft, Share2,
  Bookmark, CheckCircle2, Shield,
  ChevronLeft, ChevronRight, Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Navbar } from '@/components/layout/Navbar'
import { Spinner } from '@/components/ui/spinner'
import { formatCurrency, timeAgo } from '@/lib/utils'
import { MANDATE_TYPES } from '@/constants'
import type { Mandate } from '@/types'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { useMandate } from '@/hooks/useMandates'

// Demo mandate shown when no real mandate is found (e.g. /marketplace/preview)
const DEMO_MANDATE: Mandate = {
  id: 'demo',
  title: '3BHK / 4BHK in Bandra or Khar West',
  description: `Looking for a premium 3BHK or 4BHK apartment in Bandra West or Khar West for a HNI client.

Key requirements:
- Minimum 1,800 sq.ft carpet area
- High floor preferred (above 10th floor)
- Sea view or garden view preferred
- Well-maintained society
- Parking: minimum 2 covered spots
- Ready to move or within 6 months possession
- No SRA or chawl properties

Client is pre-approved and ready to close within 30–45 days of finding the right property.`,
  mandateType: 'buy',
  propertyType: 'residential',
  category: 'Residential',
  city: 'Mumbai',
  state: 'Maharashtra',
  locations: ['Bandra West', 'Khar West', 'Santacruz West'],
  minBudget: 20000000,
  maxBudget: 35000000,
  minArea: 1800,
  maxArea: 3500,
  areaUnit: 'sq.ft',
  tags: ['Premium', 'HNI Client', 'Ready to Move', 'Sea View'],
  viewsCount: 420,
  introCount: 8,
  images: [
    { id: '1', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80', isPrimary: true, sortOrder: 0 },
    { id: '2', url: 'https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200&q=80', isPrimary: false, sortOrder: 1 },
    { id: '3', url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80', isPrimary: false, sortOrder: 2 },
  ],
  createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  updatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25).toISOString(),
  status: 'active',
  postedBy: {
    id: 'demo',
    email: '',
    fullName: 'Raj Kumar',
    role: 'company_admin',
    isVerified: true,
    isActive: true,
    createdAt: '',
  },
  company: {
    id: 'demo',
    name: 'Lodha Capital Partners',
    slug: 'lodha-capital',
    verificationStatus: 'verified',
    city: 'Mumbai',
    state: 'Maharashtra',
    isActive: true,
    createdAt: '',
  },
}

export default function MandateDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()

  const [currentImg, setCurrentImg] = useState(0)

  const [enquirySent, setEnquirySent] = useState(false)
  const [enquiryLoading, setEnquiryLoading] = useState(false)
  const [enquiryError, setEnquiryError] = useState('')

  const isUuid = !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  const { data: mandateData, isLoading: mandateLoading } = useMandate(isUuid ? id : '')
  const m: Mandate = mandateData ?? DEMO_MANDATE

  const prevImg = () => setCurrentImg((p) => (p === 0 ? m.images.length - 1 : p - 1))
  const nextImg = () => setCurrentImg((p) => (p === m.images.length - 1 ? 0 : p + 1))

  // Non-authenticated: store intent in localStorage and redirect to register
  const handlePublicEnquiry = () => {
    const mandateUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? id : null
    localStorage.setItem('cobrokings-pending-enquiry', JSON.stringify({
      mandateId: mandateUuid,
      mandateTitle: m.title,
    }))
    navigate('/register')
  }

  const sendEnquiry = async () => {
    if (!user) return
    setEnquiryError('')
    setEnquiryLoading(true)
    const mandateUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? id : null

    const { error } = await supabase.from('mandate_enquiries').insert({
      mandate_id: mandateUuid,
      full_name: user.fullName,
      email: user.email,
      phone: user.phone ?? '',
    })
    setEnquiryLoading(false)

    if (error) {
      setEnquiryError('Something went wrong. Please try again.')
      console.error('[sendEnquiry]', error)
      return
    }
    setEnquirySent(true)
  }

  if (mandateLoading) return (
    <div className="min-h-screen bg-surface-0">
      <Navbar />
      <div className="flex items-center justify-center min-h-[80vh]">
        <Spinner size="lg" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-0">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link to="/marketplace" className="flex items-center gap-1 hover:text-text-secondary transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Marketplace
          </Link>
          <span>/</span>
          <span className="text-text-secondary truncate">{m.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left / Main */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Image gallery */}
            <div className="relative rounded-2xl overflow-hidden bg-surface-2 aspect-video">
              <img
                src={m.images[currentImg]?.url ?? ''}
                alt={m.title}
                className="w-full h-full object-cover"
              />
              {m.images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {m.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImg(i)}
                        className={`rounded-full transition-all ${i === currentImg ? 'w-4 h-1.5 bg-brand-gold' : 'w-1.5 h-1.5 bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Title + badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant={m.mandateType} className="capitalize">
                  {MANDATE_TYPES[m.mandateType]}
                </Badge>
                <Badge variant="default">{m.category}</Badge>
                <Badge variant={m.status === 'active' ? 'success' : 'default'} dot>
                  {m.status === 'active' ? 'Active' : m.status}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">{m.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {m.city}, {m.state}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Posted {timeAgo(m.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {m.viewsCount} views
                </span>
              </div>
            </div>

            {/* Details card */}
            <Card>
              <CardContent className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-5">
                <div>
                  <p className="text-xs text-text-muted mb-1">Min Budget</p>
                  <p className="text-base font-bold text-text-primary">{formatCurrency(m.minBudget)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Max Budget</p>
                  <p className="text-base font-bold text-text-primary">{formatCurrency(m.maxBudget)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Min Area</p>
                  <p className="text-base font-bold text-text-primary">{m.minArea?.toLocaleString('en-IN')} {m.areaUnit}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Max Area</p>
                  <p className="text-base font-bold text-text-primary">{m.maxArea?.toLocaleString('en-IN')} {m.areaUnit}</p>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Requirement Details</h3>
                <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">{m.description}</p>
              </CardContent>
            </Card>

            {/* Locations */}
            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Preferred Locations</h3>
                <div className="flex flex-wrap gap-2">
                  {m.locations.map((loc) => (
                    <span key={loc} className="flex items-center gap-1 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs text-text-secondary">
                      <MapPin className="h-3 w-3" /> {loc}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {m.tags?.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {m.tags.map((tag) => (
                      <Badge key={tag} variant="gold">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">
            {/* CTA card */}
            <Card className="sticky top-6">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-text-muted">Budget range</p>
                    <p className="text-lg font-bold text-text-primary">
                      {formatCurrency(m.minBudget)} – {formatCurrency(m.maxBudget)}
                    </p>
                  </div>
                  <Badge variant="success" dot>Active</Badge>
                </div>

                {isAuthenticated ? (
                  enquirySent ? (
                    <div className="flex items-center gap-2 justify-center w-full mb-3 py-2.5 px-4 rounded-xl bg-success/10 border border-success/20">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span className="text-sm font-medium text-success">Enquiry sent!</span>
                    </div>
                  ) : (
                    <>
                      <Button size="lg" className="w-full mb-3" onClick={sendEnquiry} disabled={enquiryLoading}>
                        <Send className="h-4 w-4" />
                        {enquiryLoading ? 'Sending…' : 'Send Enquiry'}
                      </Button>
                      {enquiryError && <p className="text-xs text-error text-center -mt-2 mb-2">{enquiryError}</p>}
                    </>
                  )
                ) : (
                  <Button size="lg" className="w-full mb-3" onClick={handlePublicEnquiry}>
                    <Send className="h-4 w-4" />
                    Send Enquiry
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button variant="secondary" size="md" className="flex-1">
                    <Bookmark className="h-4 w-4" /> Save
                  </Button>
                  <Button variant="secondary" size="md" className="flex-1">
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                </div>

                <p className="text-xs text-text-muted text-center mt-3">
                  Your details are shared only with the listing broker
                </p>
              </CardContent>
            </Card>

            {/* Broker profile */}
            <Card>
              <CardContent className="p-5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Posted by</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center font-bold text-brand-gold text-lg">
                    {(m.postedBy.fullName || 'B')[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{m.postedBy.fullName}</p>
                    <p className="text-xs text-text-muted">{m.company.name}</p>
                    {m.company.verificationStatus === 'verified' && (
                      <p className="text-xs text-success flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="h-3 w-3" /> RERA Verified
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                  <div className="text-center">
                    <p className="text-base font-bold text-text-primary">{m.viewsCount}</p>
                    <p className="text-xs text-text-muted">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-text-primary">{m.introCount}</p>
                    <p className="text-xs text-text-muted">Enquiries</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety */}
            <Card className="bg-brand-gold/5 border-brand-gold/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-brand-gold" />
                  <span className="text-xs font-semibold text-brand-gold">Safe co-broking</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  All introductions are formal. Phone numbers are shared only after both parties accept. Commission split is documented in the platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>


    </div>
  )
}

