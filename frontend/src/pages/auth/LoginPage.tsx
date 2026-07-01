import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { AuthNavbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'
import { supabase, fetchProfile } from '@/lib/supabase'
import type { User } from '@/types'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

const stats = [
  { value: '30k+', label: 'Deals Closed' },
  { value: '12.4k+', label: 'Brokers' },
  { value: '30+', label: 'Cities' },
]

const demoUsers: Array<{ email: string; password: string; user: User }> = [
  {
    email: 'demo@cobrokings.com',
    password: 'demo123',
    user: {
      id: 'demo-user',
      email: 'demo@cobrokings.com',
      fullName: 'Demo Broker',
      role: 'company_admin',
      companyId: 'demo-company',
      company: {
        id: 'demo-company',
        name: 'COBROKINGS Demo Realty',
        slug: 'cobrokings-demo-realty',
        city: 'Mumbai',
        state: 'Maharashtra',
        verificationStatus: 'verified',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  },
  {
    email: 'admin@cobrokings.com',
    password: 'admin123',
    user: {
      id: 'demo-admin',
      email: 'admin@cobrokings.com',
      fullName: 'COBROKINGS Admin',
      role: 'super_admin',
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  },
]

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { setUser } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const signInDemo = (email: string, password: string) => {
    const demo = demoUsers.find((account) => account.email === email && account.password === password)
    if (!demo) return false

    setUser(demo.user)
    navigate(demo.user.role === 'super_admin' ? '/admin' : from, { replace: true })
    return true
  }

  const onSubmit = async (data: LoginForm) => {
    try {
      if (signInDemo(data.email.toLowerCase(), data.password)) return

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        setError('root', { message: error.message })
        return
      }

      const profile = await fetchProfile(authData.user.id)
      if (!profile) {
        setError('root', { message: 'Account not found. Please register first.' })
        return
      }

      setUser(profile)
      navigate(profile.role === 'super_admin' ? '/admin' : from, { replace: true })
    } catch {
      setError('root', { message: 'Something went wrong. Try again.' })
    }
  }

  return (
    <div className="min-h-screen bg-surface-0">
      <AuthNavbar />

      <div className="flex min-h-screen pt-16">
        {/* Left panel — branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-linear-to-br from-surface-0/95 via-surface-0/80 to-surface-0/40" />
          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 py-12">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-brand-gold mb-4">
              Verified Property Marketplace
            </p>
            <h2 className="text-4xl xl:text-5xl font-bold text-text-primary leading-tight mb-5">
              Co-broke faster.<br />
              <span className="gradient-text">Close more deals.</span>
            </h2>
            <p className="text-text-secondary text-base max-w-md mb-10">
              Find verified homes or list yours. Every property and broker on COBROKINGS is KYC-checked and RERA-verified.
            </p>
            <div className="flex items-center gap-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-brand-gold">{stat.value}</div>
                  <div className="text-sm text-text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-text-primary mb-1">Welcome back</h1>
              <p className="text-text-secondary text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand-gold hover:text-brand-gold-light font-medium">
                  Register your company
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@company.com"
                required
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                required
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-text-secondary transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
                  <input type="checkbox" className="rounded border-border accent-brand-gold" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-brand-gold hover:text-brand-gold-light">
                  Forgot password?
                </Link>
              </div>

              {errors.root && (
                <div className="rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
                  {errors.root.message}
                </div>
              )}

              <Button type="submit" size="lg" loading={isSubmitting} className="mt-2">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Social login */}
            <div className="mt-6">
              <div className="relative flex items-center gap-3">
                <hr className="flex-1 border-border" />
                <span className="text-xs text-text-muted">or continue with</span>
                <hr className="flex-1 border-border" />
              </div>
              <Button variant="secondary" size="lg" className="w-full mt-4" type="button">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </div>

            {/* Demo credentials */}
            <div className="mt-6 p-4 rounded-lg bg-brand-gold/5 border border-brand-gold/20">
              <p className="text-xs text-brand-gold font-medium mb-1">Demo credentials</p>
              <p className="text-xs text-text-muted">Email: demo@cobrokings.com</p>
              <p className="text-xs text-text-muted">Password: demo123</p>
              <p className="text-xs text-text-muted mt-2">Admin: admin@cobrokings.com / admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

