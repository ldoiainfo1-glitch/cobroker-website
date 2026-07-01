import { Router, Response } from 'express'
import { supabase } from '@/lib/supabase'
import { requireAuth, AuthRequest } from '@/middleware/auth'

const router = Router()

/** GET /api/v1/users/me */
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, company:companies(*)')
    .eq('id', req.userId!)
    .single()

  if (error || !data) {
    res.status(404).json({ error: 'Profile not found' })
    return
  }
  res.json(data)
})

/** PUT /api/v1/users/me */
router.put('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const { fullName, phone, avatarUrl } = req.body
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (fullName) updates.full_name = fullName
  if (phone) updates.phone = phone
  if (avatarUrl) updates.avatar_url = avatarUrl

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', req.userId!)
    .select()
    .single()

  if (error) {
    res.status(400).json({ error: error.message })
    return
  }
  res.json(data)
})

export default router
