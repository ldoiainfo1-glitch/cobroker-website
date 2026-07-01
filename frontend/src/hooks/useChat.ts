import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  markConversationRead,
} from '@/services/chatService'
import type { MsgRow } from '@/services/chatService'

function toInitial(fullName: string): string {
  const words = fullName.trim().split(/\s+/)
  return (words.length >= 2 ? words[0][0] + words[words.length - 1][0] : fullName.slice(0, 2)).toUpperCase()
}

// ─── All conversations for current user ───────────────────────────────────────
export function useConversations() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => fetchConversations(user!.id),
    enabled: !!user?.id,
    refetchInterval: 20_000, // fallback polling every 20s
  })
}

// ─── Messages for a conversation + real-time subscription ─────────────────────
export function useMessages(conversationId: string | null) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId!, user!.id),
    enabled: !!conversationId && !!user?.id,
    staleTime: 0,
  })

  // Supabase Realtime subscription
  useEffect(() => {
    if (!conversationId || !user?.id) return

    const channel = supabase
      .channel(`room-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const raw = payload.new as Record<string, any>

          // Fetch sender's name (usually already in cache)
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', raw.sender_id)
            .single()

          const fullName: string = profile?.full_name ?? 'User'
          const newMsg: MsgRow = {
            id: raw.id,
            conversationId: raw.conversation_id,
            senderId: raw.sender_id,
            senderName: fullName,
            senderInitial: toInitial(fullName),
            type: raw.type ?? 'text',
            text: raw.type === 'mandate_share' ? '' : (raw.content ?? ''),
            metadata: raw.metadata ?? null,
            sentAt: raw.created_at,
            isMine: raw.sender_id === user.id,
          }

          // Append to cache, skip duplicates (optimistic already there)
          queryClient.setQueryData(
            ['messages', conversationId],
            (old: MsgRow[] = []) =>
              old.some(m => m.id === raw.id) ? old : [...old, newMsg],
          )

          // Refresh unread badge / last message in conversation list
          queryClient.invalidateQueries({ queryKey: ['conversations', user.id] })
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId, user?.id, queryClient])

  return query
}

// ─── Send a message (with optimistic update) ──────────────────────────────────
export function useSendMessage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      conversationId,
      content,
      type = 'text',
      metadata,
    }: {
      conversationId: string
      content: string
      type?: string
      metadata?: Record<string, any>
    }) => sendMessage(conversationId, user!.id, content, type, metadata),

    onMutate: async ({ conversationId, content, type = 'text', metadata }) => {
      const tempId = `optimistic-${Date.now()}-${Math.random()}`
      const fullName = user?.fullName ?? 'Me'
      const optimistic: MsgRow = {
        id: tempId,
        conversationId,
        senderId: user!.id,
        senderName: fullName,
        senderInitial: toInitial(fullName),
        type,
        text: type === 'mandate_share' ? '' : content,
        metadata: metadata ?? null,
        sentAt: new Date().toISOString(),
        isMine: true,
      }
      queryClient.setQueryData(
        ['messages', conversationId],
        (old: MsgRow[] = []) => [...old, optimistic],
      )
      return { tempId, conversationId }
    },

    onSuccess: (data, _vars, ctx) => {
      // Replace temp id with real DB id
      queryClient.setQueryData(
        ['messages', ctx!.conversationId],
        (old: MsgRow[] = []) =>
          old.map(m => m.id === ctx!.tempId ? { ...m, id: data.id } : m),
      )
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] })
    },

    onError: (_err, _vars, ctx) => {
      // Remove failed optimistic message
      queryClient.setQueryData(
        ['messages', ctx!.conversationId],
        (old: MsgRow[] = []) => old.filter(m => m.id !== ctx!.tempId),
      )
    },
  })
}

// ─── Auto-mark conversation as read when opened ───────────────────────────────
export function useMarkConversationRead(conversationId: string | null) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!conversationId || !user?.id) return
    markConversationRead(conversationId, user.id).then(() => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user.id] })
    })
  }, [conversationId, user?.id, queryClient])
}
