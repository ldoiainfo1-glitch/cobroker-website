import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CheckCircle2, ChevronRight, ChevronLeft, Building2,
  IndianRupee, MapPin, Upload, Eye, Home, Briefcase,
  Warehouse, Leaf, HardHat, X, Shield, AlertTriangle,
} from 'lucide-react'
import { uploadMandateImage } from '@/lib/s3'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { INDIAN_CITIES, INDIAN_STATES, AREA_UNITS } from '@/constants'
import type { MandateType } from '@/types'
import { useCreateMandate, useUpdateMandate, useMandate } from '@/hooks/useMandates'
import { useAuthStore } from '@/stores/authStore'
import { Spinner } from '@/components/ui/spinner'

// ─── Schemas ──────────────────────────────────────────────────────────────────
const step1Schema = z.object({
  mandateType: z.enum(['buy', 'sell', 'lease', 'investment', 'joint_venture']),
  propertyCategory: z.string().min(1, 'Select a category'),
  title: z.string().min(10, 'Minimum 10 characters').max(120, 'Maximum 120 characters'),
})

const step2Schema = z.object({
  description: z.string().min(50, 'Please add at least 50 characters of description'),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  furnishing: z.string().optional(),
})

const step3Schema = z.object({
  minBudget: z.number({ error: 'Enter minimum budget' }).min(1),
  maxBudget: z.number({ error: 'Enter maximum budget' }).min(1),
  minArea: z.number().optional(),
  maxArea: z.number().optional(),
  areaUnit: z.string().optional(),
  commissionPercent: z.string().optional(),
}).refine((d) => d.maxBudget >= d.minBudget, {
  message: 'Max budget must be ≥ Min budget',
  path: ['maxBudget'],
})

const step4Schema = z.object({
  city: z.string().min(1, 'Select a city'),
  state: z.string().min(1, 'Select a state'),
  locations: z.string().min(3, 'Enter at least one location / area name'),
})

type Step1 = z.infer<typeof step1Schema>
type Step2 = z.infer<typeof step2Schema>
type Step3 = z.infer<typeof step3Schema>
type Step4 = z.infer<typeof step4Schema>

// ─── Constants ────────────────────────────────────────────────────────────────
const MANDATE_TYPE_OPTIONS: Array<{ value: MandateType; label: string; desc: string; color: string }> = [
  { value: 'buy', label: 'Buying', desc: 'Client wants to buy a property', color: 'text-info' },
  { value: 'sell', label: 'Selling', desc: 'Client wants to sell a property', color: 'text-success' },
  { value: 'lease', label: 'Lease / Rent', desc: 'Looking to lease or rent', color: 'text-warning' },
  { value: 'investment', label: 'Investment', desc: 'Looking for investment opportunity', color: 'text-brand-gold' },
  { value: 'joint_venture', label: 'Joint Venture', desc: 'JV / collaboration mandate', color: 'text-info' },
]

const PROPERTY_CATEGORIES = [
  { icon: <Home className="h-5 w-5" />, label: 'Residential' },
  { icon: <Briefcase className="h-5 w-5" />, label: 'Commercial' },
  { icon: <Warehouse className="h-5 w-5" />, label: 'Industrial' },
  { icon: <Leaf className="h-5 w-5" />, label: 'Land' },
  { icon: <HardHat className="h-5 w-5" />, label: 'Agricultural' },
]

const STEPS = [
  { num: 1, label: 'Type', icon: <Building2 className="h-4 w-4" /> },
  { num: 2, label: 'Details', icon: <Eye className="h-4 w-4" /> },
  { num: 3, label: 'Budget', icon: <IndianRupee className="h-4 w-4" /> },
  { num: 4, label: 'Location', icon: <MapPin className="h-4 w-4" /> },
  { num: 5, label: 'Media', icon: <Upload className="h-4 w-4" /> },
  { num: 6, label: 'Preview', icon: <CheckCircle2 className="h-4 w-4" /> },
]

// ─── Helper ───────────────────────────────────────────────────────────────────
function formatCrore(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PostMandatePage() {
  const { id: editId } = useParams<{ id?: string }>()
  const isEdit = !!editId

  const [step, setStep] = useState(1)
  const [data, setData] = useState<Partial<Step1 & Step2 & Step3 & Step4>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [prefilled, setPrefilled] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { mutateAsync: createMandate } = useCreateMandate()
  const { mutateAsync: updateMandate } = useUpdateMandate()

  // Load existing mandate for edit mode
  const { data: existingMandate, isLoading: loadingMandate } = useMandate(editId ?? '')

  // ─── Image upload state ──────────────────────────────────────────────
  const imgInputRef = useRef<HTMLInputElement>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)

  const addImages = useCallback((files: File[]) => {
    setImageFiles((prev) => {
      const remaining = 10 - prev.length
      const valid = files
        .filter((f) => f.type.startsWith('image/'))
        .filter((f) => f.size <= 5 * 1024 * 1024)
        .slice(0, remaining)
      setImagePreviews((p) => [...p, ...valid.map((f) => URL.createObjectURL(f))].slice(0, 10))
      return [...prev, ...valid].slice(0, 10)
    })
  }, [])

  const removeImage = useCallback((idx: number) => {
    setImagePreviews((prev) => { URL.revokeObjectURL(prev[idx]); return prev.filter((_, i) => i !== idx) })
    setImageFiles((prev) => prev.filter((_, i) => i !== idx))
  }, [])

  // Step forms
  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema), defaultValues: data })
  const form2 = useForm<Step2>({ resolver: zodResolver(step2Schema), defaultValues: data })
  const form3 = useForm<Step3>({ resolver: zodResolver(step3Schema), defaultValues: data as any })
  const form4 = useForm<Step4>({ resolver: zodResolver(step4Schema), defaultValues: data })

  // Prefill forms when editing an existing mandate
  useEffect(() => {
    if (!isEdit || !existingMandate || prefilled) return
    const m = existingMandate
    const prefillData: Partial<Step1 & Step2 & Step3 & Step4> = {
      mandateType: m.mandateType as any,
      propertyCategory: m.propertyType ?? '',
      title: m.title,
      description: m.description ?? '',
      bedrooms: m.postedBy ? String(m.postedBy) : undefined,
      minBudget: m.minBudget ?? 0,
      maxBudget: m.maxBudget ?? 0,
      minArea: m.minArea,
      maxArea: m.maxArea,
      areaUnit: m.areaUnit ?? 'sq.ft',
      city: m.city,
      state: m.state,
      locations: (m.locations ?? []).join(', '),
    }
    setData(prefillData)
    form1.reset({ mandateType: prefillData.mandateType, propertyCategory: prefillData.propertyCategory, title: prefillData.title })
    form2.reset({ description: prefillData.description })
    form3.reset({ minBudget: prefillData.minBudget, maxBudget: prefillData.maxBudget, minArea: prefillData.minArea, maxArea: prefillData.maxArea, areaUnit: prefillData.areaUnit })
    form4.reset({ city: prefillData.city, state: prefillData.state, locations: prefillData.locations as string })
    // Prefill existing images as previews (URLs, no File objects)
    if (m.images?.length) {
      setImagePreviews(m.images.map((img) => img.url))
    }
    setPrefilled(true)
  }, [existingMandate, isEdit, prefilled, form1, form2, form3, form4])

  const next = async () => {
    let valid = false
    let stepData: any = {}

    if (step === 1) {
      valid = await form1.trigger()
      stepData = form1.getValues()
    } else if (step === 2) {
      valid = await form2.trigger()
      stepData = form2.getValues()
    } else if (step === 3) {
      valid = await form3.trigger()
      stepData = form3.getValues()
    } else if (step === 4) {
      valid = await form4.trigger()
      stepData = form4.getValues()
    } else {
      valid = true
    }

    if (valid) {
      setData((prev) => ({ ...prev, ...stepData }))
      setStep((s) => Math.min(s + 1, 6))
    }
  }

  const back = () => setStep((s) => Math.max(s - 1, 1))

  const submit = async (publishNow = true) => {
    if (!user?.id || !user.companyId) return
    setIsSubmitting(true)
    try {
      // Upload only new File objects (not existing URL previews)
      const imageUrls: string[] = []
      for (const file of imageFiles) {
        if (file instanceof File) {
          const { publicUrl } = await uploadMandateImage(file)
          imageUrls.push(publicUrl)
        }
      }
      // Keep existing images if no new uploads
      const finalImageUrls = imageUrls.length > 0 ? imageUrls : (existingMandate?.images?.map(i => i.url) ?? [])

      const payload = {
        mandateType: data.mandateType!,
        title: data.title!,
        description: data.description,
        propertyCategory: data.propertyCategory!,
        city: data.city!,
        state: data.state!,
        locations: (data.locations as string)?.split(',').map((l) => l.trim()).filter(Boolean) ?? [],
        minBudget: data.minBudget!,
        maxBudget: data.maxBudget!,
        minArea: data.minArea,
        maxArea: data.maxArea,
        areaUnit: data.areaUnit ?? 'sq.ft',
        commissionPercent: data.commissionPercent,
        bedrooms: data.bedrooms,
        postedBy: user!.id,
        companyId: user.companyId,
        publishNow,
        imageUrls: finalImageUrls,
      }

      if (isEdit && editId) {
        await updateMandate({ id: editId, payload })
      } else {
        await createMandate(payload)
      }
      navigate('/dashboard/mandates')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── KYC Gate ────────────────────────────────────────────────────────
  if (!user?.isVerified) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center mx-auto mb-5">
            <Shield className="h-8 w-8 text-warning" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">KYC Verification Required</h2>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">
            You need to complete KYC verification before posting mandates.
            Once approved by our admin team, your mandates will go live on the platform.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild size="lg" className="w-full">
              <Link to="/dashboard/kyc">
                <Shield className="h-4 w-4" /> Complete KYC Verification
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full" asChild>
              <Link to="/dashboard/mandates">← Back to My Mandates</Link>
            </Button>
          </div>
          <div className="mt-6 flex items-start gap-2.5 p-3 rounded-xl bg-surface-2 border border-border text-left">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted">
              KYC approval typically takes <strong className="text-text-secondary">24–48 hours</strong>.
              You'll receive a notification once verified.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ─── Loading state for edit mode ─────────────────────────────────────
  if (isEdit && loadingMandate) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-6 max-w-3xl mx-auto p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {isEdit ? 'Edit Mandate' : 'Post a Mandate'}
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          {isEdit
            ? 'Update your mandate details below. Changes go live immediately.'
            : 'Broadcast your requirement to verified brokers across India.'}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => step > s.num && setStep(s.num)}
              className={cn(
                'flex items-center gap-2 py-2 px-3 rounded-xl transition-all',
                step === s.num
                  ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/30'
                  : step > s.num
                    ? 'text-success cursor-pointer'
                    : 'text-text-muted cursor-default',
              )}
            >
              <span className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border',
                step === s.num
                  ? 'bg-brand-gold text-black border-brand-gold'
                  : step > s.num
                    ? 'bg-success text-black border-success'
                    : 'border-border text-text-muted',
              )}>
                {step > s.num ? '✓' : s.num}
              </span>
              <span className="text-xs font-medium hidden sm:block">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-px mx-1 hidden sm:block', step > s.num ? 'bg-success/50' : 'bg-border')} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="p-6">

          {/* Step 1 — Type + Category */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1">What are you looking for?</h2>
                <p className="text-sm text-text-muted">Choose the mandate type and property category.</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Mandate Type</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MANDATE_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => form1.setValue('mandateType', opt.value)}
                      className={cn(
                        'flex items-start gap-3 p-4 rounded-xl border text-left transition-all',
                        form1.watch('mandateType') === opt.value
                          ? 'bg-brand-gold/10 border-brand-gold/40'
                          : 'bg-surface-2 border-border hover:border-brand-gold/20',
                      )}
                    >
                      <div className={cn('mt-0.5 font-bold text-sm', opt.color)}>
                        {opt.label[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{opt.label}</p>
                        <p className="text-xs text-text-muted">{opt.desc}</p>
                      </div>
                      {form1.watch('mandateType') === opt.value && (
                        <CheckCircle2 className="h-4 w-4 text-brand-gold ml-auto shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                {form1.formState.errors.mandateType && (
                  <p className="text-xs text-error mt-2">{form1.formState.errors.mandateType.message}</p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Property Category</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PROPERTY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => form1.setValue('propertyCategory', cat.label)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all',
                        form1.watch('propertyCategory') === cat.label
                          ? 'bg-brand-gold/10 border-brand-gold/40 text-brand-gold'
                          : 'bg-surface-2 border-border text-text-muted hover:border-brand-gold/20',
                      )}
                    >
                      {cat.icon}
                      <span className="text-xs font-medium leading-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
                {form1.formState.errors.propertyCategory && (
                  <p className="text-xs text-error mt-2">{form1.formState.errors.propertyCategory.message}</p>
                )}
              </div>

              <Input
                label="Mandate Title"
                placeholder="e.g. 3BHK in Bandra West for HNI client — ₹2–3.5 Cr"
                hint="Write a clear, specific title. This is what other brokers will see first."
                error={form1.formState.errors.title?.message}
                {...form1.register('title')}
              />
            </div>
          )}

          {/* Step 2 — Details */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1">Requirement Details</h2>
                <p className="text-sm text-text-muted">Describe what the client needs. More detail = better co-broking matches.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Full Description <span className="text-error">*</span>
                </label>
                <textarea
                  {...form2.register('description')}
                  rows={8}
                  placeholder="Describe the client's requirement in detail:&#10;- Configuration (3BHK, 4BHK, etc.)&#10;- Floor preference&#10;- Ready-to-move or under-construction&#10;- Parking, amenities required&#10;- Client timeline&#10;- Any special requirements"
                  className="w-full rounded-xl bg-surface-2 border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-brand-gold/50"
                />
                {form2.formState.errors.description && (
                  <p className="text-xs text-error mt-1">{form2.formState.errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Bedrooms</label>
                  <select {...form2.register('bedrooms')} className="w-full h-10 rounded-lg bg-surface-2 border border-border px-3 text-sm text-text-primary focus:outline-none focus:border-brand-gold/50">
                    <option value="">Any</option>
                    {['1', '2', '3', '4', '5', '5+'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Bathrooms</label>
                  <select {...form2.register('bathrooms')} className="w-full h-10 rounded-lg bg-surface-2 border border-border px-3 text-sm text-text-primary focus:outline-none focus:border-brand-gold/50">
                    <option value="">Any</option>
                    {['1', '2', '3', '4', '4+'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Furnishing</label>
                  <select {...form2.register('furnishing')} className="w-full h-10 rounded-lg bg-surface-2 border border-border px-3 text-sm text-text-primary focus:outline-none focus:border-brand-gold/50">
                    <option value="">Any</option>
                    {['Unfurnished', 'Semi-Furnished', 'Fully Furnished'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Budget + Area */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1">Budget & Area</h2>
                <p className="text-sm text-text-muted">Set the budget range and area requirements for the property.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Min Budget <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">₹</span>
                    <input
                      type="number"
                      {...form3.register('minBudget', { valueAsNumber: true })}
                      placeholder="e.g. 20000000"
                      className="w-full h-10 pl-7 pr-4 rounded-lg bg-surface-2 border border-border text-sm text-text-primary focus:outline-none focus:border-brand-gold/50"
                    />
                  </div>
                  {form3.watch('minBudget') > 0 && (
                    <p className="text-xs text-brand-gold mt-1">{formatCrore(form3.watch('minBudget'))}</p>
                  )}
                  {form3.formState.errors.minBudget && (
                    <p className="text-xs text-error mt-1">{form3.formState.errors.minBudget.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Max Budget <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">₹</span>
                    <input
                      type="number"
                      {...form3.register('maxBudget', { valueAsNumber: true })}
                      placeholder="e.g. 35000000"
                      className="w-full h-10 pl-7 pr-4 rounded-lg bg-surface-2 border border-border text-sm text-text-primary focus:outline-none focus:border-brand-gold/50"
                    />
                  </div>
                  {form3.watch('maxBudget') > 0 && (
                    <p className="text-xs text-brand-gold mt-1">{formatCrore(form3.watch('maxBudget'))}</p>
                  )}
                  {form3.formState.errors.maxBudget && (
                    <p className="text-xs text-error mt-1">{form3.formState.errors.maxBudget.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Min Area</label>
                  <input
                    type="number"
                    {...form3.register('minArea', { valueAsNumber: true })}
                    placeholder="e.g. 1800"
                    className="w-full h-10 px-3 rounded-lg bg-surface-2 border border-border text-sm text-text-primary focus:outline-none focus:border-brand-gold/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Max Area</label>
                  <input
                    type="number"
                    {...form3.register('maxArea', { valueAsNumber: true })}
                    placeholder="e.g. 3000"
                    className="w-full h-10 px-3 rounded-lg bg-surface-2 border border-border text-sm text-text-primary focus:outline-none focus:border-brand-gold/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Area Unit</label>
                  <select {...form3.register('areaUnit')} className="w-full h-10 rounded-lg bg-surface-2 border border-border px-3 text-sm text-text-primary focus:outline-none focus:border-brand-gold/50">
                    {AREA_UNITS.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <Input
                label="Commission Offered (%)"
                placeholder="e.g. 2 (optional)"
                hint="Leave blank if you prefer to discuss commission during the introduction."
                {...form3.register('commissionPercent')}
              />
            </div>
          )}

          {/* Step 4 — Location */}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1">Location</h2>
                <p className="text-sm text-text-muted">Where is this property requirement focused?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    City <span className="text-error">*</span>
                  </label>
                  <select {...form4.register('city')} className="w-full h-10 rounded-lg bg-surface-2 border border-border px-3 text-sm text-text-primary focus:outline-none focus:border-brand-gold/50">
                    <option value="">Select city</option>
                    {INDIAN_CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  {form4.formState.errors.city && (
                    <p className="text-xs text-error mt-1">{form4.formState.errors.city.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    State <span className="text-error">*</span>
                  </label>
                  <select {...form4.register('state')} className="w-full h-10 rounded-lg bg-surface-2 border border-border px-3 text-sm text-text-primary focus:outline-none focus:border-brand-gold/50">
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  {form4.formState.errors.state && (
                    <p className="text-xs text-error mt-1">{form4.formState.errors.state.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Preferred Locations / Areas <span className="text-error">*</span>
                </label>
                <input
                  {...form4.register('locations')}
                  placeholder="e.g. Bandra West, Khar West, Santacruz West"
                  className="w-full h-10 px-4 rounded-lg bg-surface-2 border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50"
                />
                <p className="text-xs text-text-muted mt-1">Separate multiple areas with commas</p>
                {form4.formState.errors.locations && (
                  <p className="text-xs text-error mt-1">{form4.formState.errors.locations.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 5 — Media */}
          {step === 5 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1">Photos & Documents</h2>
                <p className="text-sm text-text-muted">Optional but recommended. Mandates with photos get 3× more enquiries.</p>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); addImages(Array.from(e.dataTransfer.files)) }}
                onClick={() => imgInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors',
                  dragging ? 'border-brand-gold bg-brand-gold/5' : 'border-border hover:border-brand-gold/40 bg-surface-2',
                )}
              >
                <Upload className="h-10 w-10 text-text-muted mb-3" />
                <p className="text-sm font-medium text-text-secondary mb-1">Drag & drop photos here</p>
                <p className="text-xs text-text-muted mb-4">PNG, JPG, WEBP · Up to 5 MB each · Max 10 photos</p>
                <Button variant="secondary" size="sm" type="button">Browse files</Button>
              </div>
              <input
                ref={imgInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => { addImages(Array.from(e.target.files ?? [])); e.target.value = '' }}
              />

              {/* Previews */}
              {imageFiles.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {imageFiles.map((file, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-surface-2 border border-border group">
                      <img src={imagePreviews[i]} alt={file.name} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded-full bg-brand-gold text-black font-bold">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeImage(i) }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-surface-0/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-text-primary" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {imageFiles.length > 0 && (
                <p className="text-xs text-text-muted">
                  {imageFiles.length}/10 photo{imageFiles.length !== 1 ? 's' : ''} added · First photo is shown as the primary image
                </p>
              )}
            </div>
          )}

          {/* Step 6 — Preview */}
          {step === 6 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1">Preview & Publish</h2>
                <p className="text-sm text-text-muted">Review your mandate before publishing to the network.</p>
              </div>

              <div className="p-4 rounded-xl bg-surface-2 border border-border flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant={(data.mandateType || 'buy') as MandateType}>
                    {data.mandateType || 'buy'}
                  </Badge>
                  <Badge variant="default">{data.propertyCategory}</Badge>
                </div>
                <h3 className="text-base font-bold text-text-primary">{data.title}</h3>
                {data.description && (
                  <p className="text-sm text-text-secondary line-clamp-3">{data.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm">
                  {data.minBudget && (
                    <span className="text-brand-gold font-medium">
                      {formatCrore(data.minBudget)} – {formatCrore(data.maxBudget ?? 0)}
                    </span>
                  )}
                  {data.city && (
                    <span className="text-text-muted flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {data.city}, {data.state}
                    </span>
                  )}
                </div>
                {data.locations && (
                  <p className="text-xs text-text-muted">
                    Areas: {data.locations}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-brand-gold/5 border border-brand-gold/20 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-brand-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-text-primary mb-1">Ready to broadcast?</p>
                  <p className="text-xs text-text-muted">
                    Once published, this mandate will be instantly visible to 12,400+ verified brokers across India. You'll start receiving introduction requests within minutes.
                  </p>
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="lg"
          onClick={back}
          disabled={step === 1}
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>

        <div className="flex items-center gap-2">
          {step < 5 && (
            <Button variant="ghost" size="lg" onClick={() => setStep(s => s + 1)}>
              Skip
            </Button>
          )}
          {step < 6 ? (
            <Button size="lg" onClick={next}>
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <>
              {!isEdit && (
                <Button variant="outline" size="lg" onClick={() => submit(false)} loading={isSubmitting}>
                  Save as Draft
                </Button>
              )}
              <Button size="lg" onClick={() => submit(true)} loading={isSubmitting}>
                {isSubmitting
                  ? (isEdit ? 'Updating…' : 'Publishing…')
                  : (isEdit ? 'Update Mandate' : 'Publish Mandate')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


