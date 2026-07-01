import { supabase } from '@/lib/supabase'
import type { Circle } from '@/types'

function mapRow(row: Record<string, any>, joinedIds: Set<string>): Circle {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    scope: row.scope,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    assetClasses: row.asset_classes ?? [],
    description: row.description ?? undefined,
    membersCount: (row.members as Array<{ count: number }>)?.[0]?.count ?? 0,
    postsCount: 0,   // not tracked yet
    dealsCount: 0,   // not tracked yet
    isJoined: joinedIds.has(row.id),
    isFeatured: row.is_featured ?? false,
    createdAt: row.created_at,
  }
}

export async function fetchCircles(userId?: string): Promise<Circle[]> {
  const [circlesRes, joinedRes] = await Promise.all([
    supabase
      .from('circles')
      .select('*, members:circle_members(count)')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: true }),
    userId
      ? supabase.from('circle_members').select('circle_id').eq('user_id', userId)
      : Promise.resolve({ data: [] }),
  ])

  if (circlesRes.error) throw circlesRes.error
  const joinedIds = new Set<string>(((joinedRes as any).data ?? []).map((r: any) => r.circle_id as string))
  return (circlesRes.data ?? []).map((row) => mapRow(row, joinedIds))
}

export async function joinCircle(circleId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('circle_members')
    .insert({ circle_id: circleId, user_id: userId })
  if (error && error.code !== '23505') throw error // ignore duplicate
}

export async function leaveCircle(circleId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('circle_members')
    .delete()
    .eq('circle_id', circleId)
    .eq('user_id', userId)
  if (error) throw error
}
