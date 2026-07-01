import { Router, Response } from 'express'
import { supabase } from '@/lib/supabase'
import { requireAuth, requireAdmin, AuthRequest } from '@/middleware/auth'

const router = Router()

/** GET /api/v1/admin/stats */
router.get('/stats', requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  const [users, companies, mandates] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('companies').select('id', { count: 'exact', head: true }),
    supabase.from('mandates').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ])

  res.json({
    totalUsers: users.count ?? 0,
    totalCompanies: companies.count ?? 0,
    activeMandates: mandates.count ?? 0,
  })
})

/** GET /api/v1/admin/users */
router.get('/users', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20' } = req.query as Record<string, string>
  const offset = (parseInt(page) - 1) * parseInt(limit)

  const { data, error, count } = await supabase
    .from('profiles')
    .select('*, company:companies(id,name,verification_status)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1)

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json({ data, count, page: parseInt(page), limit: parseInt(limit) })
})

/** GET /api/v1/admin/companies/pending */
router.get('/companies/pending', requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .in('verification_status', ['pending', 'under_review'])
    .order('created_at', { ascending: true })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(data)
})

export default router
