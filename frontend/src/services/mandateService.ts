import { supabase } from '@/lib/supabase'
import type { Mandate, MandateStatus, MarketplaceFilters } from '@/types'

// ─── DB → TS mapper ───────────────────────────────────────────────────────────

function mapRow(row: Record<string, any>): Mandate {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    mandateType: row.mandate_type,
    propertyType: row.property_type ?? undefined,
    minBudget: row.min_budget ?? undefined,
    maxBudget: row.max_budget ?? undefined,
    minArea: row.min_area ?? undefined,
    maxArea: row.max_area ?? undefined,
    areaUnit: row.area_unit ?? 'sqft',
    city: row.city,
    state: row.state,
    locations: row.locations ?? [],
    tags: row.tags ?? [],
    status: row.status,
    expiresAt: row.expires_at ?? undefined,
    viewsCount: row.views_count ?? 0,
    introCount: row.intro_count ?? 0,
    images: ((row.images ?? []) as Array<{ url: string; is_primary: boolean; sort_order: number }>)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({ id: '', url: img.url, isPrimary: img.is_primary, sortOrder: img.sort_order })),
    postedBy: row.posted_by
      ? {
          id: row.posted_by.id,
          email: '',
          fullName: row.posted_by.full_name,
          avatarUrl: row.posted_by.avatar_url ?? undefined,
          role: row.posted_by.role,
          isVerified: row.posted_by.is_verified,
          isActive: true,
          createdAt: '',
        }
      : ({} as Mandate['postedBy']),
    company: row.company
      ? {
          id: row.company.id,
          name: row.company.name,
          slug: row.company.slug,
          logoUrl: row.company.logo_url ?? undefined,
          verificationStatus: row.company.verification_status,
          city: row.company.city ?? '',
          state: row.company.state ?? '',
          isActive: true,
          createdAt: '',
        }
      : ({} as Mandate['company']),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const SELECT = `
  *,
  posted_by:profiles!mandates_posted_by_fkey(id, full_name, avatar_url, is_verified, role),
  company:companies!mandates_company_id_fkey(id, name, slug, logo_url, verification_status, city, state),
  images:mandate_images(url, is_primary, sort_order)
` as const

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function fetchMandates(filters?: MarketplaceFilters): Promise<Mandate[]> {
  let q = supabase
    .from('mandates')
    .select(SELECT)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(filters?.limit ?? 60)

  if (filters?.q) q = q.ilike('title', `%${filters.q}%`)
  if (filters?.type?.length) q = q.in('mandate_type', filters.type)
  if (filters?.city?.length) q = q.in('city', filters.city)
  if (filters?.budgetMin) q = q.gte('min_budget', filters.budgetMin)
  if (filters?.budgetMax) q = q.lte('max_budget', filters.budgetMax)
  if (filters?.sortBy === 'budget_asc') q = q.order('min_budget', { ascending: true })
  if (filters?.sortBy === 'budget_desc') q = q.order('min_budget', { ascending: false })

  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(mapRow)
}

export async function fetchMyMandates(userId: string): Promise<Mandate[]> {
  const { data, error } = await supabase
    .from('mandates')
    .select(SELECT)
    .eq('posted_by', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapRow)
}

export async function fetchMandate(id: string): Promise<Mandate> {
  const { data, error } = await supabase
    .from('mandates')
    .select(SELECT)
    .eq('id', id)
    .single()

  if (error) throw error
  return mapRow(data)
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export interface CreateMandatePayload {
  title: string
  mandateType: string
  propertyCategory: string
  description?: string
  bedrooms?: string
  bathrooms?: string
  furnishing?: string
  minBudget: number
  maxBudget: number
  minArea?: number
  maxArea?: number
  areaUnit?: string
  commissionPercent?: string
  city: string
  state: string
  locations?: string[]
  postedBy: string
  companyId: string
  publishNow?: boolean
  imageUrls?: string[]
}

// Normalize frontend area-unit display values to DB CHECK constraint values
const AREA_UNIT_DB: Record<string, string> = {
  'sq.ft': 'sqft', 'sqft': 'sqft',
  'sq.m': 'sqm',   'sqm': 'sqm',
  'sq.yd': 'sqft', // approximate
  'acre': 'acre',
  'gunta': 'gunta',
  'hectare': 'sqm', // approximate
  'cents': 'cents',
}

export async function createMandate(payload: CreateMandatePayload): Promise<Mandate> {
  const { data, error } = await supabase
    .from('mandates')
    .insert({
      title: payload.title,
      mandate_type: payload.mandateType,
      property_type: payload.propertyCategory.toLowerCase(),
      description: payload.description ?? null,
      bedrooms: payload.bedrooms ? parseInt(payload.bedrooms) : null,
      bathrooms: payload.bathrooms ? parseInt(payload.bathrooms) : null,
      furnishing: payload.furnishing ?? null,
      min_budget: payload.minBudget,
      max_budget: payload.maxBudget,
      min_area: payload.minArea ?? null,
      max_area: payload.maxArea ?? null,
      area_unit: AREA_UNIT_DB[payload.areaUnit ?? ''] ?? 'sqft',
      commission_pct: payload.commissionPercent ? parseFloat(payload.commissionPercent) : null,
      city: payload.city,
      state: payload.state,
      locations: payload.locations ?? [],
      status: payload.publishNow ? 'active' : 'draft',
      posted_by: payload.postedBy,
      company_id: payload.companyId,
    })
    .select(SELECT)
    .single()

  if (error) throw error

  // Insert images into mandate_images (non-critical — don't block on failure)
  if (payload.imageUrls && payload.imageUrls.length > 0) {
    await supabase.from('mandate_images').insert(
      payload.imageUrls.map((url, i) => ({
        mandate_id: data.id,
        url,
        is_primary: i === 0,
        sort_order: i,
      }))
    )
  }

  return mapRow(data)
}

export async function updateMandateStatus(id: string, status: MandateStatus): Promise<void> {
  const { error } = await supabase.from('mandates').update({ status }).eq('id', id)
  if (error) throw error
}

export async function updateMandate(id: string, payload: Partial<CreateMandatePayload>): Promise<Mandate> {
  const { data, error } = await supabase
    .from('mandates')
    .update({
      title: payload.title,
      mandate_type: payload.mandateType,
      property_type: payload.propertyCategory?.toLowerCase(),
      description: payload.description ?? null,
      bedrooms: payload.bedrooms ? parseInt(payload.bedrooms) : null,
      min_budget: payload.minBudget,
      max_budget: payload.maxBudget,
      min_area: payload.minArea ?? null,
      max_area: payload.maxArea ?? null,
      area_unit: AREA_UNIT_DB[payload.areaUnit ?? ''] ?? 'sqft',
      commission_pct: payload.commissionPercent ? parseFloat(payload.commissionPercent) : null,
      city: payload.city,
      state: payload.state,
      locations: payload.locations ?? [],
      status: payload.publishNow ? 'active' : 'draft',
    })
    .eq('id', id)
    .select(SELECT)
    .single()

  if (error) throw error

  // Replace images if new ones were provided
  if (payload.imageUrls && payload.imageUrls.length > 0) {
    await supabase.from('mandate_images').delete().eq('mandate_id', id)
    await supabase.from('mandate_images').insert(
      payload.imageUrls.map((url, i) => ({
        mandate_id: id, url, is_primary: i === 0, sort_order: i,
      }))
    )
  }

  return mapRow(data)
}

export async function deleteMandate(id: string): Promise<void> {
  const { error } = await supabase.from('mandates').delete().eq('id', id)
  if (error) throw error
}

export async function fetchDashboardStats(userId: string) {
  const [mandatesRes, viewsRes, notifRes] = await Promise.all([
    supabase
      .from('mandates')
      .select('id, status, views_count, intro_count')
      .eq('posted_by', userId),
    supabase
      .from('mandates')
      .select('views_count.sum()')
      .eq('posted_by', userId)
      .eq('status', 'active'),
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false),
  ])

  const mandates = mandatesRes.data ?? []
  const active = mandates.filter((m) => m.status === 'active').length
  const totalViews = mandates.reduce((sum, m) => sum + (m.views_count ?? 0), 0)
  const totalIntros = mandates.reduce((sum, m) => sum + (m.intro_count ?? 0), 0)
  const unreadNotifs = notifRes.count ?? 0

  return { active, totalViews, totalIntros, unreadNotifs, totalMandates: mandates.length }
}
