import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, Star, Shield, Radio, MessageSquare,
  Lock, ChevronRight, ArrowUpRight,
  Users, Home, Map, KeyRound, Warehouse,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { INDIAN_CITIES } from '@/constants'
import { cn } from '@/lib/utils'

// â”€â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TABS = ['Buy', 'Sell', 'Rent', 'Lease', 'PG'] as const
type TabType = typeof TABS[number]

const features = [
  {
    icon: <Lock className="h-5 w-5" />,
    title: 'Brokers Only',
    desc: 'A closed network of verified, RERA-aware brokers. No buyers, no owners, no spam leads.',
  },
  {
    icon: <Radio className="h-5 w-5" />,
    title: 'Broadcast Circles',
    desc: 'Post once, reach every broker in your city + area circles. Like a co-broking WhatsApp group, but organised.',
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: 'Direct Chat',
    desc: 'See a matching requirement? Open chat instantly with the posting broker. Phone unmasks on mutual accept.',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'KYC Verified',
    desc: 'Brokers get a green tick after KYC. Build your reputation with every closed deal.',
  },
]

const steps = [
  { num: '01', title: 'Post', desc: 'Pick a side — Buy, Sell, Rent or Lease — and type your requirement in plain text. No photos, no forms.' },
  { num: '02', title: 'Broadcast', desc: "Your post instantly reaches every broker in the city and area circles you've joined. Auto-join your city, opt into areas you work." },
  { num: '03', title: 'Co-broke', desc: 'Matching broker taps Chat. You message inside the app. Phone unmasks the moment both of you accept share.' },
]

const liveMandates = [
  { initial: 'L', type: 'buy',   subtype: 'JV Mandate',   company: 'Lodha Capital Partners', asset: 'Land',            assetCat: 'Land',        location: 'BKC, Mumbai',          meta: 'Ticket ₹200–250 Cr · 8–10 ac',  time: '2 min ago'  },
  { initial: 'B', type: 'buy',   subtype: 'Acquisition',  company: 'Brookfield India REIT', asset: 'Grade-A Office',  assetCat: 'Commercial',  location: 'Bengaluru',            meta: '₹1,500+ Cr · 1.5M sqft',       time: '5 min ago'  },
  { initial: 'G', type: 'buy',   subtype: 'Redev DM',     company: 'Godrej Properties',    asset: 'Society Redev',  assetCat: 'Residential', location: 'Andheri W',            meta: '4.2 FSI · Tier-1 dev',        time: '8 min ago'  },
  { initial: 'P', type: 'buy',   subtype: 'Land',         company: 'Prestige Group',       asset: 'Land',           assetCat: 'Land',        location: 'Whitefield, Bengaluru', meta: '10–15 ac · Group Housing',   time: '15 min ago' },
  { initial: 'O', type: 'buy',   subtype: 'Premium Resi', company: 'Oberoi Realty',        asset: 'Sea-facing',     assetCat: 'Residential', location: 'Worli',                meta: '3–5 ac · Outright',          time: '24 min ago' },
  { initial: 'V', type: 'sell',  subtype: 'Redev RFP',   company: 'Vijayanagar CHS',      asset: 'Society',        assetCat: 'Residential', location: 'Dadar E',              meta: '3.5 FSI · 96 flats · OC 1984', time: '1 min ago'  },
  { initial: 'S', type: 'sell',  subtype: 'Land Sale',   company: 'Sunteck Landholdings', asset: 'TDR-loaded plot',assetCat: 'Land',        location: 'Goregaon',             meta: '2.8 ac · Clear title',         time: '4 min ago'  },
  { initial: 'N', type: 'sell',  subtype: 'Asset Sale',  company: 'NRI Family Office',    asset: 'CBD Tower',      assetCat: 'Commercial',  location: 'Lower Parel',          meta: '1.1L sqft · 100% leased',      time: '13 min ago' },
  { initial: 'W', type: 'rent',  subtype: 'Rental',      company: 'WeWork India',         asset: 'Coworking floor',assetCat: 'Commercial',  location: 'Powai',                meta: '40k sqft · 5-yr lease',        time: '3 min ago'  },
  { initial: 'U', type: 'rent',  subtype: 'Rental',      company: 'Urban Co-living',      asset: 'Residential block',assetCat:'Residential', location: 'HSR',                  meta: '120 keys · 3-yr lease',        time: '11 min ago' },
  { initial: 'Z', type: 'lease', subtype: 'Office',      company: 'Zomato HQ Expansion',  asset: 'Grade-A Office', assetCat: 'Commercial',  location: 'Gurugram',             meta: '1.2L sqft · 9-yr lease',       time: '6 min ago'  },
  { initial: 'F', type: 'lease', subtype: 'Logistics',   company: 'Flipkart Warehousing', asset: 'Warehouse',      assetCat: 'Industrial',  location: 'Bhiwandi, Mumbai',     meta: '300k sqft · Built-to-suit',    time: '9 min ago'  },
]

const propertyCategories = [
  { title: 'Apartments', icon: 'Users', sub: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Penthouse', 'Studio'] },
  { title: 'Independent Homes', icon: 'Home', sub: ['Villas', 'Row Houses', 'Bungalows', 'Builder Floors'] },
  { title: 'Plots & Land', icon: 'Map', sub: ['Residential', 'Farmhouse', 'Gated', 'NA Plots'] },
  { title: 'Rentals', icon: 'KeyRound', sub: ['Long-term', 'Furnished', 'Semi-furnished', 'Short-stay'] },
  { title: 'Premium & Luxury', icon: 'Star', sub: ['Sea-facing', 'Branded Residences', 'Luxury Villas'] },
  { title: 'Commercial', icon: 'Warehouse', sub: ['Office', 'Retail', 'Warehouse', 'Pre-leased'] },
]

const statsBar = [
  { label: 'Brokers Only', sub: 'Closed Co-Broking Network' },
  { label: '30+ Cities', sub: 'Live City Circles' },
  { label: 'Area-wise', sub: 'Targeted Broadcast' },
  { label: 'Text Only', sub: 'No Photos, No Clutter' },
  { label: 'KYC Verified', sub: 'Green-tick Reputation' },
]

const popularCities = [
  'Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune', 'Hyderabad',
  'Chennai', 'Kolkata', 'Ahmedabad', 'Goa', 'Jaipur',
  'Lucknow', 'Indore', 'Chandigarh', 'Kochi', 'Coimbatore',
  'Mysuru', 'Surat', 'Nagpur', 'Bhubaneswar', 'Vizag',
]

const typeFilters = ['All', 'Buy', 'Sell', 'Rent', 'Lease']
const cityChips = ['All Cities', 'BKC, Mumbai', 'Bengaluru', 'Andheri W', 'Pune', 'Whitefield', 'NH48', 'Gurgaon', 'Chennai', 'Worli', 'Dadar E']
const assetChips = ['All Assets', 'Residential', 'Commercial', 'Industrial', 'Land']

const typeBadge: Record<string, string> = {
  buy: 'bg-info/15 text-info border-info/30',
  sell: 'bg-success/15 text-success border-success/30',
  rent: 'bg-warning/15 text-warning border-warning/30',
  lease: 'bg-brand-gold/15 text-brand-gold border-brand-gold/30',
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('Buy')
  const [searchCity, setSearchCity] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [mandateFilter, setMandateFilter] = useState('All')
  const [assetFilter, setAssetFilter] = useState('All Assets')
  const [cityFilter, setCityFilter] = useState('All cities')
  const navigate = useNavigate()

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchCity) params.set('city', searchCity)
    if (searchQuery) params.set('q', searchQuery)
    params.set('type', activeTab.toLowerCase())
    navigate(`/marketplace?${params.toString()}`)
  }

  const filtered = liveMandates.filter((m) => {
    if (mandateFilter !== 'All' && m.type !== mandateFilter.toLowerCase()) return false
    if (assetFilter !== 'All Assets' && m.assetCat !== assetFilter) return false
    return true
  })

  return (
    <div className="bg-surface-0">

      {/* â•â• HERO â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Right-side skyline photo */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80"
            alt="Verified broker network across India"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-surface-0 via-surface-0/70 to-surface-0/10" />
        </div>
        {/* Full overlay for small screens */}
        <div className="absolute inset-0 lg:hidden">
          <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80" alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-surface-0/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
          <div className="max-w-2xl">
            {/* Rating badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-1 border border-border text-xs font-medium text-text-secondary mb-6">
              <Star className="h-3 w-3 fill-brand-gold text-brand-gold" />
              <span className="text-brand-gold font-semibold">4.9</span>
              <span className="text-text-muted">Â·</span>
              <span>12,400+ verified brokers</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-text-primary leading-none mb-5">
              India's Largest<br />
              <span className="gradient-text">Co-Broking Network</span>
            </h1>

            <p className="text-text-secondary text-base sm:text-lg mb-8 max-w-lg leading-relaxed">
              From post to close, every broker in your city — connected.{' '}
              <span className="font-semibold text-text-primary">30,000+ Deals Co-Broked &amp; Closed</span>
            </p>

            {/* Search box */}
            <div className="bg-surface-1 border border-border rounded-2xl overflow-hidden shadow-2xl shadow-black/40 mb-3">
              {/* Tabs */}
              <div className="flex items-center gap-0.5 px-3 pt-3 pb-1 overflow-x-auto scrollbar-none">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                      activeTab === tab
                        ? 'bg-brand-gold text-black shadow'
                        : 'text-text-muted hover:text-text-secondary hover:bg-surface-2',
                    )}
                  >
                    {tab}
                  </button>
                ))}
                <Link
                  to="/dashboard/circles"
                  className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium text-brand-gold border border-brand-gold/30 bg-brand-gold/5 hover:bg-brand-gold/10 transition-colors whitespace-nowrap shrink-0"
                >
                  Broker Circles{' '}
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-brand-gold text-black text-xs font-bold">FREE</span>
                </Link>
              </div>

              <div className="flex items-center gap-2 p-2">
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="h-11 w-36 shrink-0 rounded-xl bg-surface-2 border border-border px-3 text-sm text-text-primary focus:outline-none focus:border-brand-gold/50"
                >
                  <option value="">Select City</option>
                  {INDIAN_CITIES.slice(0, 20).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Area, locality or landmark…"
                  className="flex-1 h-11 rounded-xl bg-surface-2 border border-border px-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50 min-w-0"
                />
                <button
                  onClick={handleSearch}
                  className="h-11 px-4 rounded-xl bg-surface-2 border border-border text-xs font-medium text-brand-gold hover:bg-brand-gold/10 transition-colors whitespace-nowrap hidden sm:block"
                >
                  âœ¦ Ask AI
                </button>
                <button
                  onClick={handleSearch}
                  className="h-11 px-6 rounded-xl bg-brand-gold text-black text-sm font-semibold hover:bg-brand-gold-light transition-colors whitespace-nowrap"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Owner listing CTA */}
            <div className="mb-5 text-sm text-text-muted">
              Are you a property owner?{' '}
              <Link to="/list-property" className="text-brand-gold hover:text-brand-gold-light font-medium inline-flex items-center gap-1">
                List your property direct <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Popular cities */}
            <div>
              <p className="text-xs text-text-muted mb-2 font-medium uppercase tracking-wider">Popular cities on COBROKINGS</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {['Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Goa', 'Jaipur'].map((city, i, arr) => (
                  <span key={city} className="flex items-center gap-2">
                    <button
                      onClick={() => { setSearchCity(city); handleSearch() }}
                      className="text-sm text-text-secondary hover:text-brand-gold transition-colors"
                    >
                      {city}
                    </button>
                    {i < arr.length - 1 && <span className="text-text-muted/40">Â·</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* â•â• FEATURES â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-16 border-y border-border bg-surface-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold tracking-[0.2em] uppercase text-text-muted mb-10">
            REAL HOMES. REAL OWNERS. ZERO SPAM.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {features.map((f) => (
              <div key={f.title} className="bg-surface-1 p-8 hover:bg-surface-2 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold mb-5">
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â• HOW IT WORKS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="how" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-text-muted mb-3">Simple process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              Post → Broadcast → Co-broke
            </h2>
            <p className="text-text-secondary mt-3 max-w-xl">
              One closed broker network, organised by city and area. Post a buy/sell ask in plain text and reach every broker who can close it.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div key={step.num} className="relative p-8 rounded-2xl bg-surface-1 border border-border">
                <div className="text-6xl font-black text-brand-gold/15 mb-5 leading-none">{step.num}</div>
                <h3 className="text-lg font-bold text-text-primary mb-3">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE ON THE NETWORK */}
      <section className="py-20 bg-surface-1 border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">Live on the network</h2>
            <p className="text-text-secondary text-sm">Verified principals posting and seeking mandates right now.</p>
          </div>
          <div className="bg-surface-0 border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border flex-wrap">
              <div className="flex items-center gap-1 flex-wrap">
                {typeFilters.map((f) => (
                  <button key={f} onClick={() => setMandateFilter(f)}
                    className={cn("px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all",
                      mandateFilter === f ? "bg-brand-gold text-black" : "text-text-muted hover:text-text-secondary")}>
                    {f}
                  </button>
                ))}
              </div>
              <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}
                className="h-9 px-3 rounded-full bg-surface-2 border border-border text-xs text-text-secondary focus:outline-none focus:border-brand-gold/40">
                {["All cities","BKC, Mumbai","Bengaluru","Andheri W","Pune","Whitefield","NH48","Gurgaon","Chennai","Worli"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1 px-4 py-2.5 border-b border-border flex-wrap">
              {["All Assets","Residential","Commercial","Industrial","Land"].map((a) => (
                <button key={a} onClick={() => setAssetFilter(a)}
                  className={cn("px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all",
                    assetFilter === a ? "bg-brand-gold text-black" : "text-text-muted hover:text-text-secondary")}>
                  {a}
                </button>
              ))}
            </div>
            <div className="divide-y divide-border">
              {filtered.map((m, i) => (
                <Link key={i} to="/marketplace/preview" className="flex items-center gap-4 px-5 py-4 hover:bg-surface-1 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-sm font-bold text-brand-gold shrink-0">
                    {m.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm font-semibold text-text-primary group-hover:text-brand-gold transition-colors truncate">{m.company}</span>
                      <svg className="h-3.5 w-3.5 text-brand-gold shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    </div>
                    <p className="text-xs text-text-muted truncate">{m.asset} {String.fromCharCode(183)} {m.location}</p>
                    <p className="text-xs text-text-muted/70 truncate">{m.meta} {String.fromCharCode(183)} {m.time}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className={cn("text-xs font-bold uppercase px-2.5 py-1 rounded-full",
                      m.type === "buy" ? "bg-brand-gold/10 text-brand-gold" :
                      m.type === "sell" ? "bg-success/10 text-success" :
                      m.type === "rent" ? "bg-info/10 text-info" : "bg-warning/10 text-warning")}>
                      {m.type}
                    </span>
                    {m.subtype && (
                      <span className="hidden sm:inline text-xs font-medium px-2.5 py-1 rounded-full bg-surface-2 border border-border text-text-muted">
                        {m.subtype}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-border text-center">
              <a href="/marketplace" className="text-sm text-brand-gold font-medium inline-flex items-center gap-1">
                See all mandates {String.fromCharCode(8594)}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BROWSE BY PROPERTY TYPE */}
      <section id="categories" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              <span className="text-text-primary">Browse by </span>
              <span className="text-brand-gold">property type</span>
            </h2>
            <p className="text-text-secondary text-sm mt-3">From a first 1BHK rental to a sea-facing villa — every type of home, only from verified sources.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
            {propertyCategories.map((cat) => {
              const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Users, Home, Map, KeyRound, Star, Warehouse };
              const Icon = iconMap[cat.icon];
              return (
                <Link
                  key={cat.title}
                  to="/marketplace"
                  className="group p-6 rounded-2xl bg-surface-0 border border-border hover:border-brand-gold/30 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center mb-4">
                    {Icon && <Icon className="h-6 w-6 text-brand-gold" />}
                  </div>
                  <h3 className="text-sm font-bold text-brand-gold mb-3">{cat.title}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.sub.map((s) => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-full border border-border text-text-muted bg-surface-1 group-hover:border-brand-gold/20 transition-colors">
                        {s}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Stats bar */}
          <div className="border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-border">
              {statsBar.map((s) => (
                <div key={s.label} className="px-5 py-4 text-center">
                  <p className="text-sm font-bold text-text-primary">{s.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* â•â• CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-20 bg-surface-1 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-brand-gold mb-4">
            FIND YOUR NEXT HOME — VERIFIED, DIRECT, SPAM-FREE
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-gold text-black text-sm font-bold hover:bg-brand-gold-light transition-colors shadow-lg shadow-brand-gold/20 mb-14"
          >
            START SEARCHING <ArrowRight className="h-4 w-4" />
          </Link>

          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-5">Popular Cities</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              {popularCities.map((city, i, arr) => (
                <span key={city} className="flex items-center gap-4">
                  <Link
                    to={`/marketplace?city=${encodeURIComponent(city)}`}
                    className="text-sm text-text-secondary hover:text-brand-gold transition-colors"
                  >
                    {city}
                  </Link>
                  {i < arr.length - 1 && <span className="text-border">{String.fromCharCode(183)}</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
