import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, Star, Shield, Radio, MessageSquare, CheckCircle,
  TrendingUp, Users, Building, MapPin, Zap, Lock, BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { INDIAN_CITIES } from '@/constants'
import { formatCurrency } from '@/lib/utils'

// ─── Data ─────────────────────────────────────────────────────────────────────
const stats = [
  { value: '30,000+', label: 'Deals Closed' },
  { value: '12,400+', label: 'Verified Brokers' },
  { value: '30+', label: 'Cities Live' },
  { value: '100%', label: 'RERA Checked' },
  { value: 'Zero', label: 'Zero-Spam Policy' },
]

const features = [
  {
    icon: <Lock className="h-6 w-6" />,
    title: 'Brokers Only',
    desc: 'A closed network of verified, RERA-aware brokers. No buyers, no owners, no spam leads.',
  },
  {
    icon: <Radio className="h-6 w-6" />,
    title: 'Broadcast Circles',
    desc: 'Post once, reach every broker in your city + area circles. Like a co-broking WhatsApp group — but organised.',
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: 'Direct Chat',
    desc: 'See a matching requirement? Open chat instantly. Phone unmasks on mutual accept.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'KYC Verified',
    desc: 'Brokers get a verified badge after RERA + GST check. Build your reputation with every closed deal.',
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Deal Pipeline',
    desc: 'Track every deal from lead to registration. Full visibility, zero confusion.',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Instant Notifications',
    desc: 'Get alerted the moment a matching mandate is posted — never miss an opportunity again.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Post',
    desc: "Pick a side — Buy, Sell, Rent or Lease — and describe your requirement. No lengthy forms.",
  },
  {
    num: '02',
    title: 'Broadcast',
    desc: "Your post instantly reaches every broker in the city and area circles you've joined.",
  },
  {
    num: '03',
    title: 'Co‑broke',
    desc: 'Matching broker taps Chat. You message inside the app. Agree terms, split commission, close deal.',
  },
]

const liveListings = [
  { type: 'buy', badge: 'JV Mandate', company: 'Lodha Capital Partners', asset: 'Land · BKC, Mumbai', meta: '₹200–250 Cr · 8–10 acres', time: '2 min' },
  { type: 'sell', badge: '', company: 'Prestige Estates', asset: '3BHK · Indiranagar, Bengaluru', meta: '₹2.8–3.2 Cr · 1,800 sqft', time: '5 min' },
  { type: 'lease', badge: '', company: 'DLF Commercial', asset: 'Office · Cyber City, Gurgaon', meta: '₹95/sqft · 25,000 sqft', time: '12 min' },
  { type: 'buy', badge: '', company: 'Godrej Properties', asset: 'Warehouse · JNPT, Navi Mumbai', meta: '₹18–22 Cr · 50,000 sqft', time: '18 min' },
  { type: 'sell', badge: 'Premium', company: 'Oberoi Realty', asset: 'Penthouse · Worli, Mumbai', meta: '₹28 Cr · 4,500 sqft', time: '25 min' },
  { type: 'lease', badge: '', company: 'Mindspace REIT', asset: 'Office · Baner, Pune', meta: '₹75/sqft · 12,000 sqft', time: '31 min' },
]

const areaCircles = [
  { city: 'Mumbai', count: '2,840', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&q=60' },
  { city: 'Bengaluru', count: '1,920', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=60' },
  { city: 'Delhi NCR', count: '1,640', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=60' },
  { city: 'Pune', count: '980', img: 'https://images.unsplash.com/photo-1600697395543-f20f21a8f6b0?w=400&q=60' },
  { city: 'Hyderabad', count: '870', img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=60' },
  { city: 'Chennai', count: '740', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=60' },
]

const testimonials = [
  {
    quote: "COBROKINGS changed how I close deals. I used to spend hours on WhatsApp groups — now I post once and get 5–6 co-broking requests in an hour.",
    name: 'Rajesh Kumar',
    company: 'Skyline Properties, Mumbai',
    avatar: 'R',
    deals: '34 deals closed',
  },
  {
    quote: "The formal co-broking agreement feature is a game changer. No more commission disputes. Everything is documented and signed in the app.",
    name: 'Priya Sharma',
    company: 'Prime Realty, Bengaluru',
    avatar: 'P',
    deals: '22 deals closed',
  },
  {
    quote: "As a company admin, I can see all my team's mandates and deals in one dashboard. The pipeline view is incredibly useful for tracking.",
    name: 'Suresh Mehta',
    company: 'Anand Builders, Pune',
    avatar: 'S',
    deals: '41 deals closed',
  },
]

const categories = [
  { icon: '🏠', label: 'Residential', count: '18,400' },
  { icon: '🏢', label: 'Commercial', count: '9,200' },
  { icon: '🏭', label: 'Industrial', count: '3,100' },
  { icon: '🌾', label: 'Land', count: '4,800' },
  { icon: '🏨', label: 'Hospitality', count: '1,200' },
  { icon: '🏗️', label: 'Under Construction', count: '6,500' },
]

const mandateTypes = ['buy', 'sell', 'lease', 'investment'] as const

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [activeTab, setActiveTab] = useState<typeof mandateTypes[number]>('buy')
  const [searchCity, setSearchCity] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchCity) params.set('city', searchCity)
    if (searchQuery) params.set('q', searchQuery)
    params.set('type', activeTab)
    navigate(`/marketplace?${params.toString()}`)
  }

  return (
    <div className="bg-surface-0">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=60')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-surface-0 via-surface-0/95 to-surface-0/80" />
          {/* Glow orbs */}
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-info/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-medium mb-6">
                <Star className="h-3 w-3 fill-brand-gold" />
                <span>4.9 · 12,400+ verified brokers</span>
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold text-text-primary leading-[1.05] mb-5">
                India's Largest<br />
                <span className="gradient-text">Co‑Broking Network</span>
              </h1>

              <p className="text-text-secondary text-lg mb-8 max-w-xl leading-relaxed">
                From post to close, every broker in your city — connected.{' '}
                <strong className="text-text-primary">30,000+ Deals Co‑Broked & Closed.</strong>
              </p>

              {/* Search box */}
              <div className="bg-surface-1 border border-border rounded-2xl p-1 mb-6 shadow-2xl shadow-black/30">
                {/* Tabs */}
                <div className="flex items-center gap-1 px-3 pt-3 pb-2">
                  {mandateTypes.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                        activeTab === tab
                          ? 'bg-brand-gold text-black shadow'
                          : 'text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      {tab === 'joint_venture' ? 'JV' : tab}
                    </button>
                  ))}
                  <button className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium text-brand-gold border border-brand-gold/30 bg-brand-gold/5 hover:bg-brand-gold/10 transition-colors whitespace-nowrap">
                    Broker Circles <span className="ml-1 px-1.5 py-0.5 rounded bg-brand-gold text-black text-[10px] font-bold">FREE</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 p-2">
                  <select
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="h-12 w-36 shrink-0 rounded-xl bg-surface-2 border border-border px-3 text-sm text-text-primary focus:outline-none focus:border-brand-gold/50"
                  >
                    <option value="">All Cities</option>
                    {INDIAN_CITIES.slice(0, 20).map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Area, locality or landmark…"
                    className="flex-1 h-12 rounded-xl bg-surface-2 border border-border px-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50"
                  />
                  <button
                    onClick={handleSearch}
                    className="h-12 px-5 rounded-xl bg-surface-2 border border-border text-xs font-medium text-brand-gold hover:bg-brand-gold/10 transition-colors whitespace-nowrap"
                  >
                    ✦ Ask AI
                  </button>
                  <button
                    onClick={handleSearch}
                    className="h-12 px-6 rounded-xl bg-brand-gold text-black text-sm font-semibold hover:bg-brand-gold-light transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Popular cities */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span className="text-text-muted">Popular:</span>
                {['Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune', 'Hyderabad', 'Chennai', 'Goa'].map((city, i, arr) => (
                  <span key={city} className="flex items-center gap-2">
                    <button
                      onClick={() => { setSearchCity(city); handleSearch() }}
                      className="text-text-secondary hover:text-brand-gold transition-colors"
                    >
                      {city}
                    </button>
                    {i < arr.length - 1 && <span className="text-text-muted">·</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — floating cards mockup */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="relative w-80 h-80">
                {/* Skyline-style buildings mockup */}
                <div className="absolute inset-0 flex items-end justify-center gap-2 pb-8">
                  {[60, 110, 80, 140, 90, 120, 70].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: h }}
                      className="w-8 rounded-t-sm bg-gradient-to-t from-surface-3 to-surface-2 border border-border/50 relative overflow-hidden"
                    >
                      <div className="absolute inset-x-1 top-2 grid grid-cols-2 gap-0.5">
                        {Array.from({ length: Math.floor(h / 18) }).map((_, j) => (
                          <div
                            key={j}
                            className="h-1.5 rounded-sm"
                            style={{ background: Math.random() > 0.5 ? '#D4A01730' : 'transparent' }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-x-0 bottom-8 h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
                {/* Glow */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-gold/10 to-transparent rounded-b-full blur-xl" />

                {/* Floating cards */}
                <div className="absolute -left-16 top-10 bg-surface-1 border border-border rounded-xl p-3 shadow-2xl shadow-black/50 w-44">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-xs font-medium text-text-primary">Lodha Capital</span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5">BKC, Mumbai · 2 min ago</p>
                </div>

                <div className="absolute -right-12 top-1/3 bg-surface-1 border border-brand-gold/30 rounded-xl p-3 shadow-2xl shadow-brand-gold/10 w-40">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-gold" />
                    <span className="text-xs font-medium text-brand-gold">KYC Verified</span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5">12,400+ active brokers</p>
                </div>

                <div className="absolute -left-8 bottom-16 bg-surface-1 border border-success/30 rounded-xl p-3 shadow-2xl shadow-success/10 w-36">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-info" />
                    <span className="text-xs font-medium text-success">Deal Closed</span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5">Bengaluru · 30k+ closes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────────────────── */}
      <div className="border-y border-border bg-surface-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-5 overflow-x-auto gap-6">
            {stats.map((s, i) => (
              <div key={s.label} className="flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <div className="text-xl font-bold text-brand-gold">{s.value}</div>
                  <div className="text-xs text-text-muted">{s.label}</div>
                </div>
                {i < stats.length - 1 && <div className="w-px h-8 bg-border" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LIVE LISTINGS ─────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs text-text-muted mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Real-time activity
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
              Live on the network
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Verified brokers posting and seeking mandates right now.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {liveListings.map((listing, i) => (
              <Card key={i} hover className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center text-sm font-bold text-brand-gold shrink-0">
                    {listing.company[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={listing.type as 'buy' | 'sell' | 'lease'} className="text-[10px]">
                        {listing.type}
                      </Badge>
                      {listing.badge && (
                        <Badge variant="gold" className="text-[10px]">{listing.badge}</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-text-primary truncate">{listing.company}</p>
                    <p className="text-xs text-text-secondary">{listing.asset}</p>
                    <p className="text-xs text-text-muted mt-1">{listing.meta}</p>
                  </div>
                  <span className="text-[10px] text-text-muted shrink-0">{listing.time}m ago</span>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/marketplace">
                View all mandates <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-surface-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-medium mb-4">
              Why COBROKINGS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
              Real homes. Real owners.<br />
              <span className="gradient-text">Zero spam.</span>
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              India's privacy-first co-broking platform — verified owners, RERA-checked agents, masked numbers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl bg-surface-0 border border-border hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold mb-4 group-hover:bg-brand-gold/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex px-3 py-1 rounded-full bg-surface-2 border border-border text-xs text-text-muted mb-4">
              Simple process
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
              Post → Broadcast →{' '}
              <span className="gradient-text">Co‑broke</span>
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              One closed broker network, organised by city and area. Post once, reach everyone who can close it.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-brand-gold/20 via-brand-gold/60 to-brand-gold/20" />
            <div className="hidden md:block absolute top-12 left-2/3 right-0 h-px bg-gradient-to-r from-brand-gold/20 to-brand-gold/5" />

            {steps.map((step) => (
              <div key={step.num} className="relative p-7 rounded-2xl bg-surface-1 border border-border">
                <div className="text-5xl font-black text-brand-gold/20 mb-4 leading-none">{step.num}</div>
                <h3 className="text-xl font-bold text-text-primary mb-3">{step.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AREA CIRCLES ─────────────────────────────────────────────────── */}
      <section id="circles" className="py-20 bg-surface-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex px-3 py-1 rounded-full bg-surface-2 border border-border text-xs text-text-muted mb-4">
              Network by city
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
              Active in <span className="gradient-text">30+ cities</span>
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Join your city's circle and instantly connect with every broker in your area.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {areaCircles.map((circle) => (
              <div
                key={circle.city}
                className="group relative rounded-2xl overflow-hidden aspect-square cursor-pointer"
              >
                <img
                  src={circle.img}
                  alt={circle.city}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-3">
                  <p className="text-sm font-bold text-white">{circle.city}</p>
                  <p className="text-[10px] text-white/70">{circle.count} brokers</p>
                </div>
                <div className="absolute inset-0 border-2 border-brand-gold/0 group-hover:border-brand-gold/50 rounded-2xl transition-all duration-300" />
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-text-muted text-sm">
              + Ahmedabad, Kolkata, Jaipur, Nagpur, Indore, Coimbatore and 24 more cities
            </p>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
      <section id="categories" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
              All property <span className="gradient-text">categories</span>
            </h2>
            <p className="text-text-secondary">
              Residential, commercial, industrial, land — every asset class covered.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                to={`/marketplace?category=${cat.label.toLowerCase()}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-surface-1 border border-border hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all duration-300 text-center"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{cat.label}</p>
                  <p className="text-xs text-text-muted">{cat.count} mandates</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-surface-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
              Loved by <span className="gradient-text">12,400+ brokers</span>
            </h2>
            <p className="text-text-secondary">Real stories from real brokers on the network.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl bg-surface-0 border border-border">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-brand-gold text-brand-gold" />
                  ))}
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center font-bold text-brand-gold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.company}</p>
                  </div>
                  <Badge variant="gold" className="ml-auto text-[10px]">{t.deals}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 via-surface-0 to-surface-0" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="gold" dot className="mb-6 text-xs">Limited early access — join today</Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-5">
            Ready to close more deals<br />
            <span className="gradient-text">with co-broking?</span>
          </h2>
          <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto">
            Join 12,400+ verified brokers on India's largest professional co-broking network. Free to join. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" asChild>
              <Link to="/register">
                Get started free <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/marketplace">Browse marketplace</Link>
            </Button>
          </div>
          <p className="text-xs text-text-muted mt-6">
            ✓ Free 14-day trial &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Verified brokers only
          </p>
        </div>
      </section>

    </div>
  )
}
