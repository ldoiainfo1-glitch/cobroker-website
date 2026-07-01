import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Upload, X, Shield, Clock, Star, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { INDIAN_CITIES } from '@/constants'

// ─── Types ────────────────────────────────────────────────────────────────────
type Intent = 'sell' | 'rent' | 'lease' | 'pg' | 'buy'
type AssetType = 'residential' | 'commercial' | 'industrial' | 'land'

const INTENTS: { value: Intent; label: string }[] = [
  { value: 'sell', label: 'Sell' },
  { value: 'rent', label: 'Rent out' },
  { value: 'lease', label: 'Lease out' },
  { value: 'pg', label: 'PG / Co-living' },
  { value: 'buy', label: 'Looking to Buy' },
]

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'land', label: 'Land / Plot' },
]

const PROPERTY_TYPES: Record<AssetType, string[]> = {
  residential: ['Apartment / Flat', 'Independent House', 'Villa', 'Row House', 'Builder Floor', 'Studio', 'Penthouse', 'Plot'],
  commercial: ['Office Space', 'Shop / Showroom', 'Co-working Space', 'Commercial Complex', 'Hotel / Resort', 'Pre-leased Asset'],
  industrial: ['Warehouse', 'Factory / Shed', 'Cold Storage', 'Industrial Plot', 'Data Centre'],
  land: ['Agricultural Land', 'Residential Plot', 'Commercial Plot', 'NA Plot', 'Farmhouse', 'Institutional Plot'],
}

const BHK_OPTIONS = ['Studio', '1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK', 'Penthouse']

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-surface-1 flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-bold flex items-center justify-center shrink-0">
          {num}
        </span>
        <h2 className="text-sm font-bold text-text-primary">{title}</h2>
      </div>
      <div className="p-5 bg-surface-0">{children}</div>
    </div>
  )
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
        {label} {required && <span className="text-error">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  )
}

// ─── Input / Textarea shared styles ──────────────────────────────────────────
const inputCls = 'w-full h-11 px-4 rounded-xl bg-surface-2 border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50 transition-colors'
const selectCls = 'w-full h-11 px-4 rounded-xl bg-surface-2 border border-border text-sm text-text-primary focus:outline-none focus:border-brand-gold/50 transition-colors'

// ─── Chip picker ──────────────────────────────────────────────────────────────
function ChipPicker<T extends string>({
  options, value, onChange,
}: { options: { value: T; label: string }[]; value: T | null; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
            value === o.value
              ? 'bg-brand-gold/10 border-brand-gold/60 text-brand-gold'
              : 'border-border text-text-secondary hover:border-brand-gold/30 hover:text-text-primary',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ─── Success screen ───────────────────────────────────────────────────────────
function SuccessScreen({ onReset }: { onReset: () => void }) {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-3">Listing submitted!</h2>
        <p className="text-text-secondary text-sm mb-2">
          Your property has been submitted for verification. Our team will review it and publish to the closed broker network within 24 hours.
        </p>
        <p className="text-xs text-text-muted mb-8">
          You will receive enquiries from KYC-verified brokers only — no spam calls, no fake leads.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full">Back to Home</Button>
          </Link>
          <Button className="flex-1 sm:flex-none" onClick={onReset}>List another property</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ListPropertyPage() {
  // Form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [locality, setLocality] = useState('')
  const [intent, setIntent] = useState<Intent | null>(null)
  const [assetType, setAssetType] = useState<AssetType | null>(null)
  const [propertyType, setPropertyType] = useState('')
  const [bhk, setBhk] = useState('')
  const [area, setArea] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<{ name: string; url: string }[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!fullName.trim()) e.fullName = 'Required'
    if (!/^[6-9]\d{9}$/.test(phone)) e.phone = 'Enter valid 10-digit mobile'
    if (!city) e.city = 'Required'
    if (!locality.trim()) e.locality = 'Required'
    if (!intent) e.intent = 'Please select one'
    if (!assetType) e.assetType = 'Please select one'
    if (!description.trim()) e.description = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) setSubmitted(true)
  }

  const handlePhotoAdd = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(ev.target.files ?? [])
    const remaining = 6 - photos.length
    const toAdd = files.slice(0, remaining).map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }))
    setPhotos((prev) => [...prev, ...toAdd])
    if (fileRef.current) fileRef.current.value = ''
  }

  const removePhoto = (i: number) => setPhotos((prev) => prev.filter((_, idx) => idx !== i))

  if (submitted) return <SuccessScreen onReset={() => { setSubmitted(false); setFullName(''); setPhone(''); setEmail(''); setCity(''); setLocality(''); setIntent(null); setAssetType(null); setPropertyType(''); setBhk(''); setArea(''); setPrice(''); setDescription(''); setPhotos([]) }} />

  return (
    <div className="min-h-screen bg-surface-0">
      {/* ── Mini header ── */}
      <header className="sticky top-0 z-50 bg-surface-0/95 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="w-px h-4 bg-border" />
            <Link to="/" className="flex items-center gap-1.5">
              <span className="text-brand-gold">⬡</span>
              <span className="font-bold text-sm tracking-widest text-text-primary">Co-Brokings</span>
            </Link>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/30 text-success text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Owner direct
          </span>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight mb-3">
            List your property —<br className="hidden sm:block" /> get verified broker enquiries
          </h1>
          <p className="text-text-secondary text-sm sm:text-base max-w-xl mb-6">
            Fill in the details once. Our team verifies your listing and publishes it to the closed network of KYC-verified brokers across India. No spam calls, no fake leads.
          </p>
          {/* Benefit pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: <Shield className="h-3.5 w-3.5" />, text: 'Admin verified' },
              { icon: <Clock className="h-3.5 w-3.5" />, text: 'Live within 24 hours' },
              { icon: <Star className="h-3.5 w-3.5" />, text: 'Free to list' },
            ].map((b) => (
              <span key={b.text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-surface-1 text-xs font-medium text-text-secondary">
                <span className="text-brand-gold">{b.icon}</span>
                {b.text}
              </span>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

          {/* ── Section 1: Your details ── */}
          <Section num="1" title="Your details">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name" required>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Rajesh Kumar"
                  className={cn(inputCls, errors.fullName && 'border-error/60')}
                />
                {errors.fullName && <p className="text-xs text-error mt-0.5">{errors.fullName}</p>}
              </Field>
              <Field label="Phone (India)" required hint="10-digit mobile number">
                <div className="flex">
                  <span className="flex items-center px-3 rounded-l-xl bg-surface-3 border border-r-0 border-border text-sm text-text-muted shrink-0">+91</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className={cn(inputCls, 'rounded-l-none', errors.phone && 'border-error/60')}
                  />
                </div>
                {errors.phone && <p className="text-xs text-error mt-0.5">{errors.phone}</p>}
              </Field>
              <Field label="Email" hint="Optional — for written communication">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className={inputCls}
                />
              </Field>
            </div>
          </Section>

          {/* ── Section 2: Property location ── */}
          <Section num="2" title="Property location">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="City" required>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={cn(selectCls, errors.city && 'border-error/60')}
                >
                  <option value="">Select city</option>
                  {INDIAN_CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                {errors.city && <p className="text-xs text-error mt-0.5">{errors.city}</p>}
              </Field>
              <Field label="Locality / Area" required>
                <input
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Bandra West, Whitefield"
                  className={cn(inputCls, errors.locality && 'border-error/60')}
                />
                {errors.locality && <p className="text-xs text-error mt-0.5">{errors.locality}</p>}
              </Field>
            </div>
          </Section>

          {/* ── Section 3: What are you listing? ── */}
          <Section num="3" title="What are you listing?">
            <div className="flex flex-col gap-5">
              <Field label="I want to" required>
                <ChipPicker options={INTENTS} value={intent} onChange={setIntent} />
                {errors.intent && <p className="text-xs text-error">{errors.intent}</p>}
              </Field>

              <Field label="Asset type" required>
                <ChipPicker options={ASSET_TYPES} value={assetType} onChange={(v) => { setAssetType(v); setPropertyType(''); setBhk('') }} />
                {errors.assetType && <p className="text-xs text-error">{errors.assetType}</p>}
              </Field>

              {assetType && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Property type">
                    <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={selectCls}>
                      <option value="">Select type</option>
                      {PROPERTY_TYPES[assetType].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  {assetType === 'residential' && (
                    <Field label="BHK / Config">
                      <select value={bhk} onChange={(e) => setBhk(e.target.value)} className={selectCls}>
                        <option value="">Select BHK</option>
                        {BHK_OPTIONS.map((b) => <option key={b}>{b}</option>)}
                      </select>
                    </Field>
                  )}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Carpet area (sqft)">
                  <input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. 1200"
                    min={0}
                    className={inputCls}
                  />
                </Field>
                <Field label="Expected price (₹)" hint={intent === 'rent' || intent === 'lease' || intent === 'pg' ? 'Monthly rent / lease amount' : 'Total sale price'}>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={intent === 'rent' || intent === 'lease' ? 'e.g. 45000' : 'e.g. 15000000'}
                    min={0}
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Describe your property" required hint={`${description.length} / 1500 characters`}>
                <textarea
                  value={description}
                  onChange={(e) => { if (e.target.value.length <= 1500) setDescription(e.target.value) }}
                  rows={5}
                  placeholder="Tell brokers about this property — highlights, condition, neighbourhood, unique features, why it's a good opportunity..."
                  className={cn('w-full px-4 py-3 rounded-xl bg-surface-2 border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50 transition-colors resize-none', errors.description && 'border-error/60')}
                />
                {errors.description && <p className="text-xs text-error">{errors.description}</p>}
              </Field>
            </div>
          </Section>

          {/* ── Section 4: Property photos ── */}
          <Section num="4" title="Property photos">
            <p className="text-sm text-text-secondary mb-4">
              Listings with photos get <strong className="text-text-primary">4× more enquiries</strong>. Add at least one cover photo.
            </p>

            {/* Photo grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-3">
              {photos.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs bg-brand-gold text-black font-semibold">Cover</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {photos.length < 6 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-brand-gold/40 hover:bg-brand-gold/5 flex flex-col items-center justify-center gap-1.5 transition-all text-text-muted hover:text-brand-gold"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-xs font-medium">Add</span>
                </button>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handlePhotoAdd}
            />
            <p className="text-xs text-text-muted">
              Up to 6 photos · 5MB each · JPG/PNG/WebP. First photo is used as the cover.
            </p>
          </Section>

          {/* ── Submit ── */}
          <div className="flex flex-col gap-3 pt-1">
            <p className="text-xs text-text-muted leading-relaxed">
              By submitting you agree your contact details will be shared with KYC-verified brokers on Co-Brokings. You can request takedown anytime.{' '}
              <Link to="/privacy" className="text-brand-gold hover:underline">Privacy Policy</Link>
            </p>
            <Button type="submit" size="lg" className="w-full sm:w-auto sm:self-start px-10">
              Submit for verification
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
