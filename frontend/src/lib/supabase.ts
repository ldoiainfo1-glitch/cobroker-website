import { createClient } from '@supabase/supabase-js'
import type { User, Company } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_PROJECT_URL') {
  console.warn('[Supabase] VITE_SUPABASE_URL is not set. Add it to .env.local')
}
if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('[Supabase] VITE_SUPABASE_ANON_KEY is not set. Add it to .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'cobrokings-auth',
  },
})

// ─── Row types (match the DB columns exactly) ────────────────────────────────

export interface ProfileRow {
  id: string
  email: string
  phone: string | null
  full_name: string
  avatar_url: string | null
  role: string
  company_id: string | null
  is_verified: boolean
  is_active: boolean
  last_seen_at: string | null
  created_at: string
  updated_at: string
  company?: CompanyRow | null
  // Extended fields
  bio: string | null
  years_of_experience: number
  specializations: string[]
  areas: string[]
  languages: string[]
  linkedin_url: string | null
  website_url: string | null
}

export interface CompanyRow {
  id: string
  name: string
  slug: string
  logo_url: string | null
  cover_url: string | null
  description: string | null
  website: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string
  state: string
  pincode: string | null
  rera_number: string | null
  gst_number: string | null
  pan_number: string | null
  verification_status: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Mappers (DB snake_case → TS camelCase) ───────────────────────────────────

export function mapProfileToUser(profile: ProfileRow): User {
  return {
    id: profile.id,
    email: profile.email,
    phone: profile.phone ?? undefined,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url ?? undefined,
    role: profile.role as User['role'],
    companyId: profile.company_id ?? undefined,
    company: profile.company ? mapCompanyRow(profile.company) : undefined,
    isVerified: profile.is_verified,
    isActive: profile.is_active,
    lastSeenAt: profile.last_seen_at ?? undefined,
    createdAt: profile.created_at,
    bio: profile.bio ?? undefined,
    yearsOfExperience: profile.years_of_experience ?? 0,
    specializations: profile.specializations ?? [],
    areas: profile.areas ?? [],
    languages: profile.languages ?? [],
    linkedinUrl: profile.linkedin_url ?? undefined,
    websiteUrl: profile.website_url ?? undefined,
  }
}

export function mapCompanyRow(row: CompanyRow): Company {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    description: row.description ?? undefined,
    website: row.website ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    address: row.address ?? undefined,
    city: row.city,
    state: row.state,
    pincode: row.pincode ?? undefined,
    reraNumber: row.rera_number ?? undefined,
    gstNumber: row.gst_number ?? undefined,
    panNumber: row.pan_number ?? undefined,
    verificationStatus: row.verification_status as Company['verificationStatus'],
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Fetch a user's full profile + company from the DB */
export async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, company:companies!company_id(*)')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('[fetchProfile] error:', error.code, error.message, error.details)
    return null
  }
  if (!data) {
    console.warn('[fetchProfile] no profile row found for', userId)
    return null
  }
  return mapProfileToUser(data as ProfileRow)
}
