import { fetchProfile } from '@/lib/supabase'
import type { BrokerProfile } from '@/types'

// ─── Fetch a broker profile by user ID ───────────────────────────────────────
// Reuses the existing fetchProfile helper (proven query with correct FK syntax)
export async function fetchBrokerById(userId: string): Promise<BrokerProfile | null> {
  const user = await fetchProfile(userId)
  if (!user) return null

  const name = user.fullName ?? ''
  const initials = name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  return {
    id: user.id,
    userId: user.id,
    fullName: name,
    email: user.email ?? '',
    phone: user.phone ?? undefined,
    avatarInitial: initials,
    avatarUrl: user.avatarUrl ?? undefined,
    company: user.company?.name ?? 'Independent',
    companyId: user.company?.id ?? '',
    city: user.company?.city ?? '',
    state: user.company?.state ?? '',
    bio: '',
    specializations: [],
    areas: [],
    languages: [],
    yearsOfExperience: 0,
    totalDeals: 0,
    totalMandates: 0,
    totalReviews: 0,
    avgRating: undefined,
    tier: 'free',
    completenessScore: 0,
    badges: [],
    socialLinks: {},
    isVerified: user.isVerified ?? false,
    createdAt: user.createdAt,
  }
}

