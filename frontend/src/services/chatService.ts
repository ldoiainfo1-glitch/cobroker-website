import { supabase } from '@/lib/supabase'

export interface ConvSummary {
  id: string
  type: 'direct' | 'company_group' | 'deal_group'
  name: string | null
  participants: ParticipantInfo[]
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export interface ParticipantInfo {
  userId: string
  fullName: string
  avatarInitial: string
  avatarUrl: string | null
  isOnline: boolean
  company: string
  isVerified: boolean
}

export interface MsgRow {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderInitial: string
  type: string
  text: string
  metadata?: Record<string, any> | null
  sentAt: string
  isMine: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toInitial(fullName: string): string {
  const words = fullName.trim().split(/\s+/)
  return (words.length >= 2 ? words[0][0] + words[words.length - 1][0] : fullName.slice(0, 2)).toUpperCase()
}

// ─── Get or create a direct conversation (calls SECURITY DEFINER function) ────
export async function getOrCreateDirectConversation(otherUserId: string): Promise<string> {
  const { data, error } = await supabase.rpc('get_or_create_direct_conversation', {
    other_user_id: otherUserId,
  })
  if (error) throw error
  return data as string
}

// ─── Fetch all conversations for a user ───────────────────────────────────────
export async function fetchConversations(myUserId: string): Promise<ConvSummary[]> {
  // My participations + last_read_at
  const { data: myParts, error: e1 } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', myUserId)

  if (e1 || !myParts?.length) return []

  const convIds = myParts.map(r => r.conversation_id)
  const lastReadMap: Record<string, string | null> = {}
  myParts.forEach(r => { lastReadMap[r.conversation_id] = r.last_read_at })

  // Conversation rows
  const { data: convs } = await supabase
    .from('conversations')
    .select('id, type, name, created_at')
    .in('id', convIds)

  // All other participants for those conversations
  const { data: otherParts } = await supabase
    .from('conversation_participants')
    .select('conversation_id, user_id')
    .in('conversation_id', convIds)
    .neq('user_id', myUserId)

  // Profile info for those users
  const otherIds = [...new Set((otherParts ?? []).map(p => p.user_id))]
  const { data: profiles } = otherIds.length
    ? await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, is_verified')
        .in('id', otherIds)
    : { data: [] }

  const profileMap: Record<string, any> = {}
  profiles?.forEach(p => { profileMap[p.id] = p })

  // Recent messages (enough to get last msg per conv + unread counts)
  const { data: msgs } = await supabase
    .from('messages')
    .select('id, conversation_id, content, created_at, sender_id, type')
    .in('conversation_id', convIds)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(Math.max(convIds.length * 20, 50))

  // Build last-message and unread maps
  const lastMsgMap: Record<string, { content: string; created_at: string }> = {}
  const unreadMap: Record<string, number> = {}
  convIds.forEach(id => { unreadMap[id] = 0 })

  msgs?.forEach(m => {
    if (!lastMsgMap[m.conversation_id]) {
      lastMsgMap[m.conversation_id] = {
        content: m.type === 'mandate_share' ? '📋 Shared a mandate' : (m.content ?? ''),
        created_at: m.created_at,
      }
    }
    const lastRead = lastReadMap[m.conversation_id]
    if (m.sender_id !== myUserId && (!lastRead || m.created_at > lastRead)) {
      unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] ?? 0) + 1
    }
  })

  return (convs ?? [])
    .map(conv => {
      const convParts = (otherParts ?? []).filter(p => p.conversation_id === conv.id)
      const participants: ParticipantInfo[] = convParts.map(p => {
        const pr = profileMap[p.user_id]
        const fullName: string = pr?.full_name ?? 'Unknown'
        return {
          userId: p.user_id,
          fullName,
          avatarInitial: toInitial(fullName),
          avatarUrl: pr?.avatar_url ?? null,
          isOnline: false,
          company: '',
          isVerified: pr?.is_verified ?? false,
        }
      })

      const lm = lastMsgMap[conv.id]
      return {
        id: conv.id,
        type: conv.type as ConvSummary['type'],
        name: conv.name,
        participants,
        lastMessage: lm?.content || 'Start a conversation',
        lastMessageAt: lm?.created_at ?? conv.created_at,
        unreadCount: unreadMap[conv.id] ?? 0,
      }
    })
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
}

// ─── Fetch messages for a conversation ────────────────────────────────────────
export async function fetchMessages(conversationId: string, myUserId: string): Promise<MsgRow[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, content, type, metadata, created_at, profiles(full_name)')
    .eq('conversation_id', conversationId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })
    .limit(200)

  if (error) throw error

  return (data ?? []).map(m => {
    const profile = m.profiles as any
    const fullName: string = profile?.full_name ?? 'User'
    return {
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      senderName: fullName,
      senderInitial: toInitial(fullName),
      type: m.type ?? 'text',
      text: m.type === 'mandate_share' ? '' : (m.content ?? ''),
      metadata: m.metadata as Record<string, any> | null,
      sentAt: m.created_at,
      isMine: m.sender_id === myUserId,
    }
  })
}

// ─── Send a message ───────────────────────────────────────────────────────────
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  type = 'text',
  metadata?: Record<string, any>,
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content, type, metadata: metadata ?? null })
    .select('id')
    .single()
  if (error) throw error
  return data
}

// ─── Mark conversation as read ────────────────────────────────────────────────
export async function markConversationRead(conversationId: string, userId: string): Promise<void> {
  await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
}
