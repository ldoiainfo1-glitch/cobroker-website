import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth, requireAdmin, AuthRequest } from '@/middleware/auth'

const router = Router()

/** GET /api/v1/companies */
router.get('/', async (req: Request, res: Response) => {
  const { q, city, state, verified, page = '1', limit = '20' } = req.query as Record<string, string>
  const offset = (parseInt(page) - 1) * parseInt(limit)

  let query = supabaseAdmin
    .from('companies')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1)

  if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
  if (city) query = query.ilike('city', `%${city}%`)
  if (state) query = query.ilike('state', `%${state}%`)
  if (verified === 'true') query = query.eq('verification_status', 'verified')

  const { data, error, count } = await query
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json({ data, count, page: parseInt(page), limit: parseInt(limit) })
})

/** GET /api/v1/companies/:id */
router.get('/:id', async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('companies')
    .select('*')
    .eq('id', req.params.id)
    .single()

  if (error || !data) {
    res.status(404).json({ error: 'Company not found' })
    return
  }
  res.json(data)
})

const companySchema = z.object({
  name: z.string().min(2).max(200),
  companyType: z.enum(['pvt_ltd', 'partnership', 'sole_proprietor', 'llp']).optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  description: z.string().max(2000).optional(),
  address: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
})

/** POST /api/v1/companies */
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = companySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() })
    return
  }
  const d = parsed.data
  const slug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const { data, error } = await supabaseAdmin
    .from('companies')
    .insert({
      name: d.name,
      slug,
      city: d.city,
      state: d.state,
      phone: d.phone ?? null,
      email: d.email ?? null,
      website: d.website ?? null,
      description: d.description ?? null,
      address: d.address ?? null,
      pincode: d.pincode ?? null,
      verification_status: 'unverified',
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    res.status(400).json({ error: error.message })
    return
  }

  // Link user to company
  await supabaseAdmin
    .from('profiles')
    .update({ company_id: data.id })
    .eq('id', req.userId!)

  res.status(201).json(data)
})

/** POST /api/v1/companies/:id/verify — admin approve/reject */
router.post('/:id/verify', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { status, reason } = req.body as { status: 'verified' | 'rejected'; reason?: string }
  if (!['verified', 'rejected'].includes(status)) {
    res.status(400).json({ error: 'status must be verified or rejected' })
    return
  }

  const { data, error } = await supabaseAdmin
    .from('companies')
    .update({ verification_status: status })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) {
    res.status(400).json({ error: error.message })
    return
  }
  res.json({ data, reason })
})

export default router
