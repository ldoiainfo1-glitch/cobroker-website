import { Router, Response } from 'express'
import { supabase } from '@/lib/supabase'
import { requireAuth, AuthRequest } from '@/middleware/auth'

const router = Router()

/** GET /api/v1/notifications */
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { limit = '20', offset = '0' } = req.query as Record<string, string>
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', req.userId!)
    .order('created_at', { ascending: false })
    .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(data)
})

/** PUT /api/v1/notifications/:id/read */
router.put('/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', req.params.id)
    .eq('user_id', req.userId!)

  if (error) {
    res.status(400).json({ error: error.message })
    return
  }
  res.json({ success: true })
})

/** PUT /api/v1/notifications/read-all */
router.put('/read-all', requireAuth, async (req: AuthRequest, res: Response) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', req.userId!)
    .eq('is_read', false)

  if (error) {
    res.status(400).json({ error: error.message })
    return
  }
  res.json({ success: true })
})

export default router
