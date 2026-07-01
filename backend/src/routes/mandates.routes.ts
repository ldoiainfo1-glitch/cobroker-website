import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { requireAuth, AuthRequest } from '@/middleware/auth'

const router = Router()

const mandateSchema = z.object({
  title: z.string().min(5).max(200),
  mandateType: z.enum(['buy', 'sell', 'rent', 'lease']),
  propertyType: z.string().min(2),
  description: z.string().max(2000).optional(),
  minBudget: z.number().positive(),
  maxBudget: z.number().positive(),
  minArea: z.number().positive().optional(),
  maxArea: z.number().positive().optional(),
  areaUnit: z.string().optional(),
  commissionPct: z.number().min(0).max(10).optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  locations: z.array(z.string()).optional(),
  publishNow: z.boolean().optional(),
})

/** GET /api/v1/mandates */
router.get('/', async (req: Request, res: Response) => {
  const { city, state, type, q, page = '1', limit = '20' } = req.query as Record<string, string>
  const offset = (parseInt(page) - 1) * parseInt(limit)

  let query = supabase
    .from('mandates')
    .select('*, company:companies(id,name,slug,logo_url,verification_status)', { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1)

  if (city) query = query.ilike('city', `%${city}%`)
  if (state) query = query.ilike('state', `%${state}%`)
  if (type) query = query.eq('mandate_type', type)
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)

  const { data, error, count } = await query
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json({ data, count, page: parseInt(page), limit: parseInt(limit) })
})

/** GET /api/v1/mandates/:id */
router.get('/:id', async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('mandates')
    .select('*, company:companies(*), posted_by_profile:profiles(id,full_name,avatar_url)')
    .eq('id', req.params.id)
    .single()

  if (error || !data) {
    res.status(404).json({ error: 'Mandate not found' })
    return
  }

  // Increment view count (best-effort)
  supabase
    .from('mandates')
    .update({ views_count: (data.views_count ?? 0) + 1 })
    .eq('id', req.params.id)
    .then(() => {})

  res.json(data)
})

/** POST /api/v1/mandates */
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = mandateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() })
    return
  }

  const d = parsed.data

  // Verify user has a company
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', req.userId!)
    .single()

  if (!profile?.company_id) {
    res.status(400).json({ error: 'You must belong to a company to post mandates' })
    return
  }

  const { data, error } = await supabase
    .from('mandates')
    .insert({
      title: d.title,
      mandate_type: d.mandateType,
      property_type: d.propertyType.toLowerCase(),
      description: d.description ?? null,
      min_budget: d.minBudget,
      max_budget: d.maxBudget,
      min_area: d.minArea ?? null,
      max_area: d.maxArea ?? null,
      area_unit: d.areaUnit ?? 'sqft',
      commission_pct: d.commissionPct ?? null,
      city: d.city,
      state: d.state,
      locations: d.locations ?? [],
      status: d.publishNow ? 'active' : 'draft',
      posted_by: req.userId!,
      company_id: profile.company_id,
    })
    .select()
    .single()

  if (error) {
    res.status(400).json({ error: error.message })
    return
  }
  res.status(201).json(data)
})

/** DELETE /api/v1/mandates/:id */
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { error } = await supabase
    .from('mandates')
    .delete()
    .eq('id', req.params.id)
    .eq('posted_by', req.userId!)

  if (error) {
    res.status(400).json({ error: error.message })
    return
  }
  res.status(204).send()
})

export default router
