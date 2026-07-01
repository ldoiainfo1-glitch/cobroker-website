import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import { AuthNavbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    // TODO: await api.post('/auth/forgot-password', data)
    await new Promise((r) => setTimeout(r, 800)) // simulate delay
    setSentEmail(data.email)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-surface-0">
      <AuthNavbar />
      <div className="flex min-h-screen items-center justify-center px-6 pt-16">
        <div className="w-full max-w-md">
          {!sent ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-text-primary mb-1">Reset your password</h1>
                <p className="text-text-secondary text-sm">
                  Enter your registered email and we'll send you a reset link.
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
                <Button type="submit" size="lg" loading={isSubmitting}>
                  Send reset link <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-center text-sm text-text-muted mt-6">
                Remember your password?{' '}
                <Link to="/login" className="text-brand-gold hover:text-brand-gold-light font-medium">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">Email sent!</h1>
              <p className="text-text-secondary mb-1">We've sent a password reset link to</p>
              <p className="text-brand-gold font-medium mb-6">{sentEmail}</p>
              <p className="text-text-muted text-sm mb-8">
                Check your spam folder if you don't see it within a few minutes.
              </p>
              <Button variant="outline" size="lg" className="w-full mb-4" onClick={() => setSent(false)}>
                Try a different email
              </Button>
              <Link to="/login" className="text-sm text-text-muted hover:text-text-primary">
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

