import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, SlidersHorizontal, MapIcon, LayoutGrid, X,
  Eye, Users, Clock, MapPin, ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatCurrency, timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { INDIAN_CITIES, MANDATE_TYPES } from '@/constants'
import type { Mandate, MandateType } from '@/types'
import { useMarketplaceMandates } from '@/hooks/useMandates'
import { Spinner } from '@/components/ui/spinner'

// ─── kept for TS — real data comes from hook
const _UNUSED = [
  {
    id: '1', type: 'buy' as MandateType, title: '3BHK / 4BHK in Bandra or Khar West',
    company: 'Lodha Capital Partners', verified: true, city: 'Mumbai', locations: ['Bandra West', 'Khar West'],
    minBudget: 20000000, maxBudget: 35000000, area: 1800, areaUnit: 'sq.ft',
    views: 420, intros: 8, image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=60',
    postedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    category: 'Residential',
  },
  {
    id: '2', type: 'sell' as MandateType, title: 'Luxury Penthouse in Worli Sea Face',
    company: 'Oberoi Realty', verified: true, city: 'Mumbai', locations: ['Worli'],
    minBudget: 250000000, maxBudget: 280000000, area: 4500, areaUnit: 'sq.ft',
    views: 1240, intros: 22, image: 'https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=600&q=60',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    category: 'Residential',
  },
  {
    id: '3', type: 'lease' as MandateType, title: 'Grade A Office Space in BKC',
    company: 'DLF Commercial', verified: true, city: 'Mumbai', locations: ['BKC', 'Lower Parel'],
    minBudget: 9500, maxBudget: 11000, area: 25000, areaUnit: 'sq.ft',
    views: 680, intros: 14, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=60',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    category: 'Commercial',
  },
  {
    id: '4', type: 'buy' as MandateType, title: 'Warehouse / Cold Storage near JNPT',
    company: 'Godrej Properties', verified: true, city: 'Navi Mumbai', locations: ['JNPT', 'Dronagiri'],
    minBudget: 180000000, maxBudget: 220000000, area: 50000, areaUnit: 'sq.ft',
    views: 340, intros: 6, image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=60',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    category: 'Industrial',
  },
  {
    id: '5', type: 'investment' as MandateType, title: 'Commercial Yield Investment - 8% Guaranteed',
    company: 'Prestige Estates', verified: true, city: 'Bengaluru', locations: ['Whitefield', 'Sarjapur'],
    minBudget: 50000000, maxBudget: 100000000, area: 3000, areaUnit: 'sq.ft',
    views: 890, intros: 31, image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=60',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    category: 'Commercial',
  },
  {
    id: '6', type: 'sell' as MandateType, title: '2 Acre Land Parcel for Residential Dev',
    company: 'Mahindra Lifespaces', verified: true, city: 'Pune', locations: ['Hinjewadi', 'Wakad'],
    minBudget: 80000000, maxBudget: 120000000, area: 2, areaUnit: 'acres',
    views: 210, intros: 4, image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=60',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    category: 'Land',
  },
]

const budgetRanges = [
  { label: 'Any budget', min: 0, max: 0 },
  { label: 'Below ₹50L', min: 0, max: 5000000 },
  { label: '₹50L – ₹1Cr', min: 5000000, max: 10000000 },
  { label: '₹1Cr – ₹5Cr', min: 10000000, max: 50000000 },
  { label: '₹5Cr – ₹20Cr', min: 50000000, max: 200000000 },
  { label: 'Above ₹20Cr', min: 200000000, max: 0 },
]

// ─── Mandate Card ─────────────────────────────────────────────────────────────
function MandateCard({ m }: { m: Mandate }) {
  const budgetLabel =
    m.mandateType === 'lease'
      ? `₹${m.minBudget?.toLocaleString('en-IN')}/sq.ft`
      : `${formatCurrency(m.minBudget ?? 0)} – ${formatCurrency(m.maxBudget ?? 0)}`

  return (
    <Link to={`/marketplace/${m.id}`}>
      <Card hover className="overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative h-44 overflow-hidden bg-surface-2">
          {m.images?.[0]?.url && (
            <img
              src={m.images[0].url}
              alt={m.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <Badge variant={m.mandateType === 'joint_venture' ? 'gold' : m.mandateType} className="capitalize">
              {MANDATE_TYPES[m.mandateType]}
            </Badge>
            {m.propertyType && <Badge variant="default" className="text-xs capitalize">{m.propertyType}</Badge>}
          </div>
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo(m.createdAt)}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-sm font-semibold text-text-primary line-clamp-2 mb-2 leading-snug">
            {m.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-text-muted mb-3">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{m.city} · {m.locations?.join(', ')}</span>
          </div>

          {/* Budget + Area */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-text-muted mb-0.5">Budget</p>
              <p className="text-sm font-bold text-text-primary">{budgetLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted mb-0.5">Area</p>
              <p className="text-sm font-medium text-text-secondary">
                {m.minArea?.toLocaleString('en-IN')} {m.areaUnit}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center text-xs font-bold text-brand-gold">
                {(m.company?.name ?? '?')[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-text-primary truncate max-w-28">{m.company?.name}</p>
                {m.company?.verificationStatus === 'verified' && (
                  <p className="text-xs text-success flex items-center gap-0.5">✓ Verified</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-muted shrink-0">
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{m.viewsCount}</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{m.introCount}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MarketplacePage() {
  const [view, setView] = useState<'grid' | 'map'>('grid')
  const [showFilters, setShowFilters] = useState(true)
  const [selectedTypes, setSelectedTypes] = useState<MandateType[]>([])
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedBudget, setSelectedBudget] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const { data: allMandates = [], isLoading } = useMarketplaceMandates()

  const toggleType = (t: MandateType) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    )
  }

  const filtered = allMandates.filter((m) => {
    if (selectedTypes.length && !selectedTypes.includes(m.mandateType)) return false
    if (selectedCity && m.city !== selectedCity) return false
    if (searchQuery && !m.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const activeFiltersCount =
    selectedTypes.length + (selectedCity ? 1 : 0) + (selectedBudget ? 1 : 0)

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Page header */}
      <div className="bg-surface-1 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-1">Marketplace</h1>
              <p className="text-text-secondary text-sm">
                Live mandates from verified brokers across India.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard/mandates/new"
                className="inline-flex items-center gap-2 h-9 px-4 bg-brand-gold text-black rounded-lg text-sm font-semibold hover:bg-brand-gold-light transition-colors"
              >
                + Post Mandate
              </Link>
            </div>
          </div>

          {/* Search + controls bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mandates, areas, keywords…"
                className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface-2 border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 rounded-lg bg-surface-2 border border-border text-sm text-text-primary focus:outline-none focus:border-brand-gold/50"
            >
              <option value="newest">Newest first</option>
              <option value="views">Most viewed</option>

              <option value="budget_asc">Budget: Low to High</option>
              <option value="budget_desc">Budget: High to Low</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 h-10 px-4 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap',
                showFilters
                  ? 'bg-brand-gold/10 border-brand-gold/40 text-brand-gold'
                  : 'bg-surface-2 border-border text-text-secondary hover:text-text-primary',
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-brand-gold text-black text-xs font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <div className="flex items-center rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setView('grid')}
                className={cn('h-10 w-10 flex items-center justify-center transition-colors', view === 'grid' ? 'bg-brand-gold/10 text-brand-gold' : 'bg-surface-2 text-text-muted hover:text-text-secondary')}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('map')}
                className={cn('h-10 w-10 flex items-center justify-center transition-colors', view === 'map' ? 'bg-brand-gold/10 text-brand-gold' : 'bg-surface-2 text-text-muted hover:text-text-secondary')}
              >
                <MapIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">

          {/* Filter Sidebar */}
          {showFilters && (
            <aside className="w-60 shrink-0">
              <div className="sticky top-6 flex flex-col gap-5">
                {/* Mandate type */}
                <div>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                    Mandate Type
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    {(Object.keys(MANDATE_TYPES) as MandateType[]).map((t) => (
                      <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
                        <div
                          onClick={() => toggleType(t)}
                          className={cn(
                            'w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer',
                            selectedTypes.includes(t)
                              ? 'bg-brand-gold border-brand-gold'
                              : 'border-border group-hover:border-brand-gold/50',
                          )}
                        >
                          {selectedTypes.includes(t) && (
                            <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 12 12">
                              <path d="M10 3L5 8.5 2 5.5" stroke="black" strokeWidth="2" strokeLinecap="round" fill="none" />
                            </svg>
                          )}
                        </div>
                        <span
                          onClick={() => toggleType(t)}
                          className="text-sm text-text-secondary capitalize"
                        >
                          {MANDATE_TYPES[t]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* City */}
                <div>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">City</h4>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full h-10 rounded-lg bg-surface-2 border border-border px-3 text-sm text-text-primary focus:outline-none focus:border-brand-gold/50"
                  >
                    <option value="">All cities</option>
                    {INDIAN_CITIES.slice(0, 20).map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Budget</h4>
                  <div className="flex flex-col gap-1.5">
                    {budgetRanges.map((r, i) => (
                      <label key={r.label} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="budget"
                          checked={selectedBudget === i}
                          onChange={() => setSelectedBudget(i)}
                          className="accent-brand-gold"
                        />
                        <span className="text-sm text-text-secondary">{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Verified only */}
                <div>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Other</h4>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" className="accent-brand-gold" />
                    <span className="text-sm text-text-secondary">Verified companies only</span>
                  </label>
                </div>

                {/* Clear */}
                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => { setSelectedTypes([]); setSelectedCity(''); setSelectedBudget(0); }}
                    className="flex items-center gap-1.5 text-xs text-error hover:text-error/80 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" /> Clear all filters
                  </button>
                )}
              </div>
            </aside>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-text-muted">
                <span className="text-text-primary font-medium">{filtered.length}</span> mandates found
              </p>
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {selectedTypes.map((t) => (
                    <span key={t} className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-xs text-brand-gold">
                      {MANDATE_TYPES[t]}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => toggleType(t)} />
                    </span>
                  ))}
                  {selectedCity && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-2 border border-border text-xs text-text-secondary">
                      {selectedCity}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCity('')} />
                    </span>
                  )}
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20"><Spinner /></div>
            ) : view === 'grid' ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((m) => (
                  <MandateCard key={m.id} m={m} />
                ))}
              </div>
            ) : (
              <div className="h-150 rounded-2xl bg-surface-2 border border-border flex items-center justify-center text-center">
                <div>
                  <MapIcon className="h-12 w-12 text-text-muted mx-auto mb-3" />
                  <p className="text-text-secondary font-medium">Map view</p>
                  <p className="text-xs text-text-muted mt-1">Leaflet map integration — Phase 3 advanced search</p>
                </div>
              </div>
            )}

            {/* Load more */}
            {filtered.length > 0 && (
              <div className="flex justify-center mt-8">
                <Button variant="secondary" size="lg">
                  Load more mandates <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

