import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { requireAuth, AuthRequest } from '@/middleware/auth'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
  fullName: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/),
})

/** POST /api/v1/auth/register */
router.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() })
    return
  }

  const { email, password, fullName, phone } = parsed.data

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone } },
  })

  if (error) {
    res.status(400).json({ error: error.message })
    return
  }

  res.status(201).json({ user: data.user, session: data.session })
})

/** POST /api/v1/auth/login */
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' })
    return
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    res.status(401).json({ error: error.message })
    return
  }

  res.json({ user: data.user, session: data.session })
})

/** POST /api/v1/auth/logout */
router.post('/logout', requireAuth, async (_req: AuthRequest, res: Response) => {
  await supabase.auth.signOut()
  res.json({ message: 'Logged out' })
})

/** POST /api/v1/auth/forgot-password */
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body
  if (!email) {
    res.status(400).json({ error: 'email is required' })
    return
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
  })

  // Always 200 to avoid email enumeration
  if (error) {
    res.json({ message: 'If that email exists, a reset link has been sent.' })
    return
  }
  res.json({ message: 'Password reset email sent.' })
})

export default router
