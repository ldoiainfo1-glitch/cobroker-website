import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Phone, Lock, Eye, EyeOff, Building2, MapPin, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { AuthNavbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { INDIAN_CITIES, INDIAN_STATES } from '@/constants'
import { supabase } from '@/lib/supabase'

const PENDING_ENQUIRY_KEY = 'cobrokings-pending-enquiry'

// --- Schemas ---
const step1Schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
  confirmPassword: z.string(),
  introducerName: z.string().optional(),
  introducerPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
    .optional()
    .or(z.literal('')),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

const step2Schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  companyCity: z.string().min(1, 'City is required'),
  companyState: z.string().min(1, 'State is required'),
  companyAddress: z.string().optional(),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
})

type Step1Form = z.infer<typeof step1Schema>
type Step2Form = z.infer<typeof step2Schema>

const steps = [
  { number: 1, title: 'Your Details' },
  { number: 2, title: 'Company Info' },
  { number: 3, title: 'Verify Email' },
]

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [step1Data, setStep1Data] = useState<Step1Form | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [pendingEnquiryTitle, setPendingEnquiryTitle] = useState<string | null>(null)
  const navigate = useNavigate()

  // Step 1
  const {
    register: reg1,
    handleSubmit: submit1,
    formState: { errors: err1, isSubmitting: sub1 },
  } = useForm<Step1Form>({ resolver: zodResolver(step1Schema) })

  // Step 2
  const {
    register: reg2,
    handleSubmit: submit2,
    formState: { errors: err2, isSubmitting: sub2 },
  } = useForm<Step2Form>({ resolver: zodResolver(step2Schema) })

  const onStep1 = (data: Step1Form) => {
    setStep1Data(data)
    setCurrentStep(2)
  }

  const onStep2 = async (data: Step2Form) => {
    if (!step1Data) return
    setRegisterError(null)

    try {
      // 1. Create Supabase auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: step1Data.email,
        password: step1Data.password,
        options: {
          data: {
            full_name: step1Data.fullName,
            phone: step1Data.phone,
          },
        },
      })

      if (signUpError) throw new Error(signUpError.message)
      if (!authData.user) throw new Error('Sign up failed. Please try again.')

      // 2. Create the company record
      const baseSlug = data.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      const uniqueSlug = `${baseSlug}-${Date.now()}`

      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: data.companyName,
          slug: uniqueSlug,
          city: data.companyCity,
          state: data.companyState,
          address: data.companyAddress || null,
          website: data.website || null,
          verification_status: 'pending',
        })
        .select()
        .single()

      if (companyError) throw new Error(companyError.message)

      // 3. Update the auto-created profile with full details
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: step1Data.fullName,
          phone: step1Data.phone,
          company_id: company.id,
          role: 'company_admin',
        })
        .eq('id', authData.user.id)

      if (profileError) throw new Error(profileError.message)

      // 4. Link to introducer if a phone number was provided
      if (step1Data.introducerPhone?.trim()) {
        try {
          const { data: introducerProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('phone', step1Data.introducerPhone.trim())
            .maybeSingle()

          if (introducerProfile) {
            await supabase
              .from('profiles')
              .update({ introducer_id: introducerProfile.id })
              .eq('id', authData.user.id)
          }
        } catch (_) {
          // Non-critical — introducer linking failure should not block registration
        }
      }

      // 5. If user came from a mandate page, submit their enquiry now
      const raw = localStorage.getItem(PENDING_ENQUIRY_KEY)
      if (raw) {
        try {
          const { mandateId, mandateTitle } = JSON.parse(raw)
          await supabase.from('mandate_enquiries').insert({
            mandate_id: mandateId ?? null,
            full_name: step1Data.fullName,
            email: step1Data.email.toLowerCase(),
            phone: step1Data.phone,
            message: `Registered after expressing interest in: ${mandateTitle}`,
          })
          setPendingEnquiryTitle(mandateTitle)
        } catch (_) {
          // Non-critical — enquiry submission failure shouldn't block registration
        } finally {
          localStorage.removeItem(PENDING_ENQUIRY_KEY)
        }
      }

      setCurrentStep(3)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Try again.'
      setRegisterError(message)
    }
  }

  return (
    <div className="min-h-screen bg-surface-0">
      <AuthNavbar />

      <div className="flex min-h-screen pt-16">
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 flex-col justify-center px-12 xl:px-16 py-12 border-r border-border">
          <div className="mb-10">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-brand-gold mb-4">
              Verified Property Marketplace
            </p>
            <h2 className="text-3xl xl:text-4xl font-bold text-text-primary leading-tight mb-4">
              Grow your business<br />
              <span className="gradient-text">on COBROKINGS</span>
            </h2>
            <p className="text-text-secondary text-sm">
              Get verified, post mandates, and co-broke with trusted real estate companies across India.
            </p>
          </div>

          {/* Benefits */}
          <ul className="flex flex-col gap-4">
            {[
              'Access to 48,000+ live mandates',
              'RERA verified broker network',
              'Formal co-broking agreements',
              'GST invoice generation',
            ].map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-sm text-text-secondary">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Step indicator */}
            <div className="flex items-center gap-0 mb-10">
              {steps.map((step, i) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
                        currentStep > step.number
                          ? 'bg-success text-white'
                          : currentStep === step.number
                          ? 'bg-brand-gold text-black'
                          : 'bg-surface-2 text-text-muted border border-border',
                      )}
                    >
                      {currentStep > step.number ? <CheckCircle2 className="h-4 w-4" /> : step.number}
                    </div>
                    <span
                      className={cn(
                        'text-xs whitespace-nowrap',
                        currentStep === step.number ? 'text-text-primary font-medium' : 'text-text-muted',
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-px mx-2 mb-5 transition-colors',
                        currentStep > step.number ? 'bg-success' : 'bg-border',
                      )}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1 */}
            {currentStep === 1 && (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-text-primary mb-1">Create your account</h1>
                  <p className="text-text-secondary text-sm">
                    Already registered?{' '}
                    <Link to="/login" className="text-brand-gold hover:text-brand-gold-light font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>

                {/* Role selector — matching reference site */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">I am a</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Authorised Agent', 'Buyer / Tenant'] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        className="px-3 py-2.5 rounded-xl border text-sm font-medium transition-all border-brand-gold bg-brand-gold/10 text-brand-gold first:border-brand-gold first:bg-brand-gold/10 last:border-border last:bg-transparent last:text-text-secondary"
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={submit1(onStep1)} className="flex flex-col gap-4">
                  <Input
                    label="Full name"
                    placeholder="Rajesh Kumar"
                    required
                    leftIcon={<User className="h-4 w-4" />}
                    error={err1.fullName?.message}
                    {...reg1('fullName')}
                  />
                  <Input
                    label="Email address"
                    type="email"
                    placeholder="you@company.com"
                    required
                    leftIcon={<Mail className="h-4 w-4" />}
                    error={err1.email?.message}
                    {...reg1('email')}
                  />
                  <Input
                    label="Mobile number"
                    type="tel"
                    placeholder="9876543210"
                    required
                    leftIcon={<Phone className="h-4 w-4" />}
                    hint="10-digit Indian mobile number"
                    error={err1.phone?.message}
                    {...reg1('phone')}
                  />
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    required
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    error={err1.password?.message}
                    {...reg1('password')}
                  />
                  <Input
                    label="Confirm password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    required
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    error={err1.confirmPassword?.message}
                    {...reg1('confirmPassword')}
                  />

                  {/* Introducer / Referral (optional) */}
                  <div className="border-t border-border pt-4 flex flex-col gap-3">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Introducer <span className="font-normal normal-case text-text-muted/70">(optional)</span>
                    </p>
                    <Input
                      label="Introducer name"
                      placeholder="e.g. Rajesh Kumar"
                      leftIcon={<User className="h-4 w-4" />}
                      hint="Name of the person who referred you"
                      error={err1.introducerName?.message}
                      {...reg1('introducerName')}
                    />
                    <Input
                      label="Introducer phone number"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      leftIcon={<Phone className="h-4 w-4" />}
                      hint="Their registered mobile number on COBROKINGS"
                      error={err1.introducerPhone?.message}
                      {...reg1('introducerPhone')}
                    />
                  </div>

                  <p className="text-xs text-text-muted">
                    By registering, you agree to our{' '}
                    <Link to="/terms" className="text-brand-gold hover:underline">Terms</Link> and{' '}
                    <Link to="/privacy" className="text-brand-gold hover:underline">Privacy Policy</Link>.
                  </p>
                  <Button type="submit" size="lg" loading={sub1}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-text-primary mb-1">Company details</h1>
                  <p className="text-text-secondary text-sm">Tell us about your brokerage firm</p>
                </div>
                <form onSubmit={submit2(onStep2)} className="flex flex-col gap-4">
                  <Input
                    label="Company / Firm name"
                    placeholder="Skyline Realty"
                    required
                    leftIcon={<Building2 className="h-4 w-4" />}
                    error={err2.companyName?.message}
                    {...reg2('companyName')}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-text-secondary">
                        City <span className="text-error">*</span>
                      </label>
                      <select
                        className="h-11 rounded-lg bg-surface-2 border border-border px-4 text-sm text-text-primary focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30"
                        {...reg2('companyCity')}
                      >
                        <option value="">Select city</option>
                        {INDIAN_CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {err2.companyCity && <p className="text-xs text-error">{err2.companyCity.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-text-secondary">
                        State <span className="text-error">*</span>
                      </label>
                      <select
                        className="h-11 rounded-lg bg-surface-2 border border-border px-4 text-sm text-text-primary focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30"
                        {...reg2('companyState')}
                      >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {err2.companyState && <p className="text-xs text-error">{err2.companyState.message}</p>}
                    </div>
                  </div>
                  <Input
                    label="Office address"
                    placeholder="123, Business Park, Andheri West"
                    leftIcon={<MapPin className="h-4 w-4" />}
                    error={err2.companyAddress?.message}
                    {...reg2('companyAddress')}
                  />
                  <Input
                    label="Website (optional)"
                    type="url"
                    placeholder="https://yourcompany.com"
                    error={err2.website?.message}
                    {...reg2('website')}
                  />
                  <div className="flex gap-3 mt-2">
                    <Button type="button" variant="secondary" size="lg" className="flex-1"
                      onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button type="submit" size="lg" className="flex-1" loading={sub2}>
                      Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  {registerError && (
                    <p className="text-sm text-error text-center">{registerError}</p>
                  )}
                </form>
              </>
            )}

            {/* Step 3 — Email verification pending */}
            {currentStep === 3 && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-10 w-10 text-success" />
                </div>
                <h1 className="text-2xl font-bold text-text-primary mb-2">Check your email</h1>
                <p className="text-text-secondary mb-2">
                  We’ve sent a verification link to
                </p>
                <p className="text-brand-gold font-medium mb-6">{step1Data?.email}</p>

                {pendingEnquiryTitle && (
                  <div className="flex items-start gap-3 bg-success/10 border border-success/20 rounded-xl px-4 py-3 mb-6 text-left">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">Enquiry sent to admin</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Your interest in “{pendingEnquiryTitle}” has been recorded. The admin will reach out with details.
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-text-muted text-sm mb-8">
                  Click the link in the email to verify your account. Your company will be reviewed and approved within 24–48 hours.
                </p>
                <Button variant="outline" size="lg" className="w-full mb-4">
                  Resend verification email
                </Button>
                <Link to="/login" className="text-sm text-text-muted hover:text-text-primary">
                  Back to login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

