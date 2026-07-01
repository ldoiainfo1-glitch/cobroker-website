import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  MapPin, Eye, Users, Clock, ArrowLeft, Share2,
  Bookmark, CheckCircle2, Phone, Building2, Shield,
  ChevronLeft, ChevronRight, MessageSquare, Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Navbar } from '@/components/layout/Navbar'
import { formatCurrency, timeAgo } from '@/lib/utils'
import { MANDATE_TYPES } from '@/constants'
import type { MandateType } from '@/types'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

// Mock single mandate — replace with API call
const MOCK_MANDATE = {
  id: '1',
  type: 'buy' as MandateType,
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
  category: 'Residential',
  propertyType: 'Apartment / Flat',
  city: 'Mumbai',
  state: 'Maharashtra',
  locations: ['Bandra West', 'Khar West', 'Santacruz West'],
  minBudget: 20000000,
  maxBudget: 35000000,
  minArea: 1800,
  maxArea: 3500,
  areaUnit: 'sq.ft',
  tags: ['Premium', 'HNI Client', 'Ready to Move', 'Sea View'],
  views: 420,
  intros: 8,
  images: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    'https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200&q=80',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
  ],
  postedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25).toISOString(),
  status: 'active',
  broker: {
    name: 'Raj Kumar',
    company: 'Lodha Capital Partners',
    city: 'Mumbai',
    verified: true,
    mandates: 34,
    deals: 12,
    joinedAt: '2023-06-01',
  },
}

export default function MandateDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [currentImg, setCurrentImg] = useState(0)

  // Broker intro modal (authenticated)
  const [showIntroModal, setShowIntroModal] = useState(false)
  const [introMessage, setIntroMessage] = useState('')
  const [introSent, setIntroSent] = useState(false)

  // Public enquiry modal (unauthenticated)
  const [showEnquiryModal, setShowEnquiryModal] = useState(false)
  const [enquiryName, setEnquiryName] = useState('')
  const [enquiryEmail, setEnquiryEmail] = useState('')
  const [enquiryPhone, setEnquiryPhone] = useState('')
  const [enquiryNote, setEnquiryNote] = useState('')
  const [enquirySent, setEnquirySent] = useState(false)
  const [enquiryLoading, setEnquiryLoading] = useState(false)
  const [enquiryError, setEnquiryError] = useState('')

  const m = MOCK_MANDATE // TODO: fetch by id

  const prevImg = () => setCurrentImg((p) => (p === 0 ? m.images.length - 1 : p - 1))
  const nextImg = () => setCurrentImg((p) => (p === m.images.length - 1 ? 0 : p + 1))

  const sendIntro = () => {
    if (!introMessage.trim()) return
    // TODO: API call
    setIntroSent(true)
    setTimeout(() => setShowIntroModal(false), 1500)
  }

  const sendEnquiry = async () => {
    setEnquiryError('')
    if (!enquiryName.trim()) { setEnquiryError('Please enter your name.'); return }
    if (!/^[6-9]\d{9}$/.test(enquiryPhone)) { setEnquiryError('Enter a valid 10-digit mobile number.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiryEmail)) { setEnquiryError('Enter a valid email address.'); return }

    setEnquiryLoading(true)
    // Only pass mandate_id if it looks like a valid UUID
    const mandateUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? id : null

    const { error } = await supabase.from('mandate_enquiries').insert({
      mandate_id: mandateUuid,
      full_name: enquiryName.trim(),
      email: enquiryEmail.trim().toLowerCase(),
      phone: enquiryPhone.trim(),
      message: enquiryNote.trim() || null,
    })
    setEnquiryLoading(false)

    if (error) {
      setEnquiryError('Something went wrong. Please try again.')
      console.error('[sendEnquiry]', error)
      return
    }
    setEnquirySent(true)
  }

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
                src={m.images[currentImg]}
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
                <Badge variant={m.type} className="capitalize">
                  {MANDATE_TYPES[m.type]}
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
                  Posted {timeAgo(m.postedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {m.views} views
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {m.intros} introductions
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
                  <Button size="lg" className="w-full mb-3" onClick={() => setShowIntroModal(true)}>
                    <MessageSquare className="h-4 w-4" />
                    Request Introduction
                  </Button>
                ) : (
                  <Button size="lg" className="w-full mb-3" onClick={() => setShowEnquiryModal(true)}>
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
                  {isAuthenticated
                    ? 'Only verified brokers can request introductions'
                    : 'Your details are shared only with the listing broker'}
                </p>
              </CardContent>
            </Card>

            {/* Broker profile */}
            <Card>
              <CardContent className="p-5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Posted by</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center font-bold text-brand-gold text-lg">
                    {m.broker.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{m.broker.name}</p>
                    <p className="text-xs text-text-muted">{m.broker.company}</p>
                    {m.broker.verified && (
                      <p className="text-xs text-success flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="h-3 w-3" /> RERA Verified
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                  <div className="text-center">
                    <p className="text-base font-bold text-text-primary">{m.broker.mandates}</p>
                    <p className="text-xs text-text-muted">Mandates</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-text-primary">{m.broker.deals}</p>
                    <p className="text-xs text-text-muted">Deals Closed</p>
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

      {/* Public Enquiry Modal */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { if (!enquiryLoading) { setShowEnquiryModal(false); setEnquirySent(false) } }} />
          <div className="relative bg-surface-1 rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl">
            {enquirySent ? (
              <div className="text-center py-4">
                <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-text-primary mb-1">Enquiry sent!</h3>
                <p className="text-sm text-text-muted mb-2">
                  {m.broker.name} will be in touch within 24–48 hours.
                </p>
                <p className="text-xs text-text-muted mb-6">
                  Want to track your enquiries and co-broke with verified brokers?
                </p>
                <div className="flex gap-3">
                  <Button variant="secondary" size="md" className="flex-1" onClick={() => { setShowEnquiryModal(false); setEnquirySent(false) }}>Close</Button>
                  <Button size="md" className="flex-1" onClick={() => navigate('/register')}>Register free</Button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-text-primary mb-1">Send Enquiry</h3>
                <p className="text-sm text-text-muted mb-5">
                  Express your interest in <span className="font-medium text-text-primary">{m.title}</span>. The broker will contact you directly.
                </p>

                <div className="flex flex-col gap-3 mb-4">
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1 block">Full name *</label>
                    <input
                      type="text"
                      value={enquiryName}
                      onChange={(e) => setEnquiryName(e.target.value)}
                      placeholder="Rajesh Kumar"
                      className="w-full rounded-xl bg-surface-2 border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1 block">Mobile number *</label>
                    <input
                      type="tel"
                      value={enquiryPhone}
                      onChange={(e) => setEnquiryPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="w-full rounded-xl bg-surface-2 border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1 block">Email *</label>
                    <input
                      type="email"
                      value={enquiryEmail}
                      onChange={(e) => setEnquiryEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full rounded-xl bg-surface-2 border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-secondary mb-1 block">Note (optional)</label>
                    <textarea
                      value={enquiryNote}
                      onChange={(e) => setEnquiryNote(e.target.value)}
                      placeholder="Any specific requirements or questions..."
                      rows={3}
                      maxLength={300}
                      className="w-full rounded-xl bg-surface-2 border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-brand-gold/50"
                    />
                  </div>
                </div>

                {enquiryError && (
                  <p className="text-xs text-error mb-3">{enquiryError}</p>
                )}

                <div className="flex gap-3">
                  <Button variant="secondary" size="lg" className="flex-1" onClick={() => setShowEnquiryModal(false)} disabled={enquiryLoading}>Cancel</Button>
                  <Button size="lg" className="flex-1" onClick={sendEnquiry} disabled={enquiryLoading}>
                    {enquiryLoading ? 'Sending…' : 'Send Enquiry'}
                  </Button>
                </div>

                <p className="text-xs text-text-muted text-center mt-3">
                  By submitting you agree your details are shared with the listing broker.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Introduction Request Modal */}
      {showIntroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowIntroModal(false)} />
          <div className="relative bg-surface-1 rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl">
            {introSent ? (
              <div className="text-center py-4">
                <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-text-primary mb-1">Introduction sent!</h3>
                <p className="text-sm text-text-muted">
                  {m.broker.name} will be notified. You'll hear back within 24–48 hours.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-text-primary mb-1">Request Introduction</h3>
                <p className="text-sm text-text-muted mb-5">
                  Write a short message to {m.broker.name} explaining why you'd like to co-broke this mandate.
                </p>
                <textarea
                  value={introMessage}
                  onChange={(e) => setIntroMessage(e.target.value)}
                  placeholder="E.g. I have a buyer client who matches this requirement exactly. Looking to co-broke on a 50/50 commission split."
                  rows={5}
                  className="w-full rounded-xl bg-surface-2 border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-brand-gold/50 mb-4"
                  maxLength={500}
                />
                <p className="text-xs text-text-muted mb-4 text-right">{introMessage.length}/500</p>
                <div className="flex gap-3">
                  <Button variant="secondary" size="lg" className="flex-1" onClick={() => setShowIntroModal(false)}>
                    Cancel
                  </Button>
                  <Button size="lg" className="flex-1" onClick={sendIntro} disabled={introMessage.trim().length < 20}>
                    Send Request
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

