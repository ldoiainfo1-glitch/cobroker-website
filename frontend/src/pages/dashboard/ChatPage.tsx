import { useState, useRef, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import {
  Search, Send, Paperclip,
  CheckCheck, Check, Building2, MapPin, Users,
  GitBranch, ChevronRight, MessageSquare, Smile, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, timeAgo, formatCurrency } from '@/lib/utils'
import type { Conversation, ChatMessage, ChatMessageType, ConvParticipant, Mandate } from '@/types'
import { useMyMandates } from '@/hooks/useMandates'
import { useAuthStore } from '@/stores/authStore'
import { useConversations, useMessages, useSendMessage, useMarkConversationRead } from '@/hooks/useChat'
import { getOrCreateDirectConversation } from '@/services/chatService'
import { Spinner } from '@/components/ui/spinner'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatDateSep(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

const mandateTypeColor: Record<string, string> = {
  buy: 'text-success bg-success/10 border-success/30',
  sell: 'text-warning bg-warning/10 border-warning/30',
  lease: 'text-info bg-info/10 border-info/30',
  investment: 'text-brand-gold bg-brand-gold/10 border-brand-gold/30',
  joint_venture: 'text-warning bg-warning/10 border-warning/30',
}

// ─── Online dot ───────────────────────────────────────────────────────────────
function OnlineDot({ online }: { online: boolean }) {
  return (
    <span className={cn(
      'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface-1',
      online ? 'bg-success' : 'bg-surface-3',
    )} />
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ initial, size = 'md', online }: { initial: string; size?: 'sm' | 'md' | 'lg'; online?: boolean }) {
  const sz = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }[size]
  return (
    <div className={cn('relative rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center font-semibold text-brand-gold shrink-0', sz)}>
      {initial}
      {online !== undefined && <OnlineDot online={online} />}
    </div>
  )
}

// ─── Mandate card message ─────────────────────────────────────────────────────
function MandateCardMsg({ card, isMine }: { card: NonNullable<ChatMessage['mandateCard']>; isMine: boolean }) {
  const typeClass = mandateTypeColor[card.mandateType] ?? 'text-text-muted bg-surface-3 border-border'
  return (
    <div className={cn('rounded-xl border p-3 min-w-55 max-w-70', isMine ? 'bg-brand-gold/5 border-brand-gold/30' : 'bg-surface-2 border-border')}>
      <div className="flex items-center gap-2 mb-2">
        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide', typeClass)}>
          {card.mandateType}
        </span>
      </div>
      <p className="text-sm font-semibold text-text-primary mb-1.5 leading-snug">{card.title}</p>
      <div className="flex items-center gap-3 text-xs text-text-muted">
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{card.city}</span>
        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{card.propertyType}</span>
      </div>
      <div className="mt-2 pt-2 border-t border-border/50 text-xs font-semibold text-brand-gold">{card.budget}</div>
      <Link to="/dashboard/mandates" className="mt-2 flex items-center gap-1 text-xs text-brand-gold hover:text-brand-gold-light font-medium">
        View mandate <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

// ─── Single message bubble ────────────────────────────────────────────────────
function MessageBubble({ msg, showAvatar }: { msg: ChatMessage; showAvatar: boolean }) {
  if (msg.type === 'system' || msg.type === 'deal_update') {
    return (
      <div className="flex justify-center my-3">
        <div className={cn(
          'flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium',
          msg.type === 'deal_update' ? 'bg-info/10 text-info border border-info/20' : 'bg-surface-2 text-text-muted border border-border',
        )}>
          {msg.type === 'deal_update' && <GitBranch className="h-3 w-3" />}
          {msg.systemText}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex items-end gap-2 mb-1', msg.isMine ? 'flex-row-reverse' : 'flex-row')}>
      <div className="w-8 shrink-0">
        {showAvatar && !msg.isMine && <Avatar initial={msg.senderInitial} size="sm" />}
      </div>
      <div className={cn('flex flex-col gap-0.5 max-w-[65%]', msg.isMine ? 'items-end' : 'items-start')}>
        {msg.type === 'mandate_share' && msg.mandateCard ? (
          <MandateCardMsg card={msg.mandateCard} isMine={msg.isMine} />
        ) : (
          <div className={cn(
            'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
            msg.isMine
              ? 'bg-brand-gold text-black rounded-br-sm font-medium'
              : 'bg-surface-2 text-text-primary border border-border rounded-bl-sm',
          )}>
            {msg.text}
          </div>
        )}
        <div className={cn('flex items-center gap-1 text-xs text-text-muted px-1', msg.isMine && 'flex-row-reverse')}>
          <span>{formatTime(msg.sentAt)}</span>
          {msg.isMine && (
            msg.isRead
              ? <CheckCheck className="h-3 w-3 text-info" />
              : <Check className="h-3 w-3" />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Conversation list item ───────────────────────────────────────────────────
function ConvItem({ conv, isActive, onClick }: { conv: Conversation; isActive: boolean; onClick: () => void }) {
  const participant = conv.participants[0]
  const displayName = conv.type === 'group' ? (conv.groupName ?? 'Group') : (participant?.fullName ?? participant?.name ?? 'Unknown')
  const displayInitial = conv.type === 'group' ? (conv.groupInitial ?? 'G') : (participant?.avatarInitial ?? '?')
  const isOnline = conv.type === 'direct' && (participant?.isOnline ?? false)

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-border/50',
        isActive ? 'bg-brand-gold/10 border-l-2 border-l-brand-gold' : 'hover:bg-surface-2',
      )}
    >
      <div className="relative shrink-0">
        <Avatar initial={displayInitial} size="md" online={conv.type === 'direct' ? isOnline : undefined} />
        {conv.type === 'group' && (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-surface-3 border border-border rounded-full flex items-center justify-center">
            <Users className="h-2.5 w-2.5 text-text-muted" />
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={cn('text-sm font-semibold truncate', conv.unreadCount > 0 ? 'text-text-primary' : 'text-text-secondary')}>
            {displayName}
          </span>
          <span className="text-xs text-text-muted shrink-0 ml-2">{timeAgo(conv.lastMessageAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <p className={cn('text-xs truncate flex-1', conv.unreadCount > 0 ? 'text-text-secondary' : 'text-text-muted')}>
            {conv.lastMessage}
          </p>
          {conv.unreadCount > 0 && (
            <span className="shrink-0 min-w-5 h-5 px-1 bg-brand-gold text-black text-xs font-bold rounded-full flex items-center justify-center">
              {conv.unreadCount}
            </span>
          )}
        </div>
        {conv.type === 'direct' && (
          <p className="text-xs text-text-muted truncate mt-0.5">{participant.company}</p>
        )}
      </div>
    </button>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyThread() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-4">
        <MessageSquare className="h-7 w-7 text-text-muted" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">Select a conversation</h3>
      <p className="text-sm text-text-muted max-w-xs">
        Choose a conversation from the list, or start chatting after an introduction is accepted.
      </p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const { conversationId: convIdParam } = useParams<{ conversationId?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuthStore()

  const [selectedId, setSelectedId] = useState<string | null>(convIdParam ?? null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const [text, setText] = useState('')
  const [isCreatingConv, setIsCreatingConv] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mandate picker (client-side only, sends to DB via sendMsgMutation)
  const [showMandatePicker, setShowMandatePicker] = useState(false)
  const [selectedMandateIds, setSelectedMandateIds] = useState<Set<string>>(new Set())
  const { data: myMandates } = useMyMandates()
  const activeMandates = (myMandates ?? []).filter((m: Mandate) => m.status === 'active')

  // ── Real data from Supabase ────────────────────────────────────────────────
  const { data: convSummaries = [], isLoading: convsLoading } = useConversations()
  const { data: msgRows = [], isLoading: msgsLoading } = useMessages(selectedId)
  const { mutate: sendMsgMutation } = useSendMessage()
  useMarkConversationRead(selectedId)

  // Map DB summaries → Conversation type for UI components
  const allConversations: Conversation[] = convSummaries.map(c => ({
    id: c.id,
    type: c.type === 'direct' ? 'direct' : 'group',
    groupName: c.type !== 'direct' ? (c.name ?? 'Group') : undefined,
    groupInitial: c.type !== 'direct' ? ((c.name ?? 'G')[0].toUpperCase()) : undefined,
    participants: c.participants.map(p => ({
      id: p.userId,
      name: p.fullName,
      company: p.company,
      avatarInitial: p.avatarInitial,
      isVerified: p.isVerified,
      isOnline: p.isOnline,
    } satisfies ConvParticipant)),
    lastMessage: c.lastMessage,
    lastMessageAt: c.lastMessageAt,
    lastMessageType: 'text' as ChatMessageType,
    unreadCount: c.unreadCount,
  }))

  // Map DB message rows → ChatMessage type for UI components
  const selectedMessages: ChatMessage[] = msgRows.map(m => ({
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    senderName: m.senderName,
    senderInitial: m.senderInitial,
    type: (m.type || 'text') as ChatMessageType,
    text: m.text,
    mandateCard: m.type === 'mandate_share' && m.metadata ? {
      id: m.metadata.id ?? '',
      title: m.metadata.title ?? '',
      mandateType: m.metadata.mandateType ?? '',
      budget: m.metadata.budget ?? '',
      city: m.metadata.city ?? '',
      propertyType: m.metadata.propertyType ?? '',
    } : undefined,
    sentAt: m.sentAt,
    isRead: true,
    isMine: m.isMine,
  }))

  // Auto-select first conversation
  useEffect(() => {
    if (!selectedId && allConversations.length > 0) {
      setSelectedId(allConversations[0].id)
    }
  }, [allConversations.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle ?with=userId → get or create direct conversation in DB
  useEffect(() => {
    const withUserId = searchParams.get('with')
    if (!withUserId || !user?.id) return

    setIsCreatingConv(true)
    getOrCreateDirectConversation(withUserId)
      .then((convId) => {
        setSelectedId(convId)
        setSearchParams({}, { replace: true })
      })
      .catch(console.error)
      .finally(() => setIsCreatingConv(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedId, msgRows.length])

  const selectedConv = allConversations.find(c => c.id === selectedId)

  const filteredConvs = allConversations.filter(c => {
    const name = c.type === 'group' ? (c.groupName ?? '') : (c.participants[0]?.fullName ?? c.participants[0]?.name ?? '')
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase())
    const matchesTab = tab === 'all' || (tab === 'unread' && c.unreadCount > 0)
    return matchesSearch && matchesTab
  })

  const unreadCount = allConversations.filter(c => c.unreadCount > 0).length

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || !selectedId) return
    sendMsgMutation({ conversationId: selectedId, content: trimmed })
    setText('')
  }

  const participant: ConvParticipant | undefined =
    selectedConv?.type === 'direct' ? selectedConv.participants[0] : undefined

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left Panel: Conversation List ──────────────────────────────────── */}
      <div className="w-[320px] shrink-0 flex flex-col border-r border-border bg-surface-1">
        <div className="px-4 pt-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-text-primary">Messages</h2>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-3.5 w-3.5" /> New
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50"
            />
          </div>
          <div className="flex gap-2 mt-3">
            {([['all', 'All'], ['unread', `Unread (${unreadCount})`]] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all',
                  tab === id ? 'bg-brand-gold text-black' : 'bg-surface-2 text-text-muted hover:text-text-secondary',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {convsLoading || isCreatingConv ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : filteredConvs.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="h-8 w-8 mx-auto text-text-muted opacity-40 mb-3" />
              <p className="text-sm text-text-muted">No conversations yet.</p>
              <p className="text-xs text-text-muted mt-1">Message a broker from their profile or network page.</p>
            </div>
          ) : (
            filteredConvs.map(conv => (
              <ConvItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === selectedId}
                onClick={() => setSelectedId(conv.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right Panel: Message Thread ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedConv ? (
          <EmptyThread />
        ) : (
          <>
            {/* Thread header */}
            <div className="h-16.25 px-5 flex items-center justify-between border-b border-border bg-surface-1 shrink-0">
              <div className="flex items-center gap-3">
                <Avatar
                  initial={selectedConv.type === 'group' ? (selectedConv.groupInitial ?? 'G') : (selectedConv.participants[0]?.avatarInitial ?? '?')}
                  size="md"
                  online={selectedConv.type === 'direct' ? (selectedConv.participants[0]?.isOnline ?? false) : undefined}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {selectedConv.type === 'group' ? selectedConv.groupName : (selectedConv.participants[0]?.fullName ?? selectedConv.participants[0]?.name ?? 'Unknown')}
                    </span>
                    {participant?.isVerified && <span className="text-xs text-success">✓</span>}
                  </div>
                  <p className="text-xs text-text-muted">
                    {selectedConv.type === 'group'
                      ? `${selectedConv.participants.length} participants`
                      : participant?.isOnline
                        ? 'Online now'
                        : participant?.lastSeen
                          ? `Last seen ${timeAgo(participant.lastSeen)}`
                          : participant?.company || 'Direct message'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-0.5">
              {msgsLoading ? (
                <div className="flex justify-center py-12"><Spinner /></div>
              ) : selectedMessages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                  <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-3">
                    <MessageSquare className="h-5 w-5 text-text-muted" />
                  </div>
                  <p className="text-sm font-medium text-text-secondary mb-1">Start the conversation</p>
                  <p className="text-xs text-text-muted">
                    Say hello to {selectedConv.type === 'direct' ? (selectedConv.participants[0]?.fullName ?? selectedConv.participants[0]?.name ?? 'them') : 'the group'}.
                  </p>
                </div>
              ) : (
                selectedMessages.map((msg, idx) => {
                  const prev = selectedMessages[idx - 1]
                  const showDateSep = !prev || !isSameDay(prev.sentAt, msg.sentAt)
                  const showAvatar = !prev || prev.senderId !== msg.senderId || msg.type === 'system'
                  return (
                    <div key={msg.id}>
                      {showDateSep && (
                        <div className="flex justify-center my-4">
                          <span className="text-xs text-text-muted bg-surface-2 border border-border px-3 py-1 rounded-full">
                            {formatDateSep(msg.sentAt)}
                          </span>
                        </div>
                      )}
                      <MessageBubble msg={msg} showAvatar={showAvatar} />
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Mandate share pill + picker */}
            <div className="px-5 pb-2 flex gap-2 relative">
              <button
                onClick={() => { setShowMandatePicker(v => !v); setSelectedMandateIds(new Set()) }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all',
                  activeMandates.length > 0
                    ? 'bg-brand-gold/10 border-brand-gold/40 text-brand-gold hover:bg-brand-gold/20'
                    : 'bg-surface-2 border-border text-text-muted hover:text-brand-gold hover:border-brand-gold/30',
                )}
              >
                <Building2 className="h-3.5 w-3.5" />
                Share Mandate
                {activeMandates.length > 0 && (
                  <span className="ml-1 min-w-4.5 h-4.5 px-1 rounded-full bg-brand-gold text-black text-[10px] font-bold flex items-center justify-center">
                    {activeMandates.length}
                  </span>
                )}
              </button>

              {showMandatePicker && (
                <div className="absolute bottom-full left-0 mb-3 w-140 bg-surface-0 border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface-1">
                    <div>
                      <p className="text-base font-bold text-text-primary">Share Mandate</p>
                      <p className="text-sm text-text-muted mt-0.5">Select one or more mandates to share</p>
                    </div>
                    <button
                      onClick={() => setShowMandatePicker(false)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {activeMandates.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                      <Building2 className="h-8 w-8 text-text-muted mx-auto mb-3" />
                      <p className="text-sm font-medium text-text-secondary mb-1">No active mandates</p>
                      <p className="text-xs text-text-muted mb-3">Post a mandate to share it in chat</p>
                      <Link
                        to="/dashboard/mandates/new"
                        onClick={() => setShowMandatePicker(false)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-gold text-black text-xs font-semibold hover:bg-brand-gold-light transition-colors"
                      >
                        + Post Mandate
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-100 overflow-y-auto p-4 flex flex-col gap-3">
                        {activeMandates.map((m: Mandate) => {
                          const isSelected = selectedMandateIds.has(m.id)
                          const budgetLabel = m.mandateType === 'lease'
                            ? `₹${m.minBudget?.toLocaleString('en-IN')}/sqft`
                            : `${formatCurrency(m.minBudget ?? 0)} – ${formatCurrency(m.maxBudget ?? 0)}`
                          return (
                            <button
                              key={m.id}
                              onClick={() => setSelectedMandateIds(prev => {
                                const next = new Set(prev)
                                next.has(m.id) ? next.delete(m.id) : next.add(m.id)
                                return next
                              })}
                              className={cn(
                                'w-full text-left p-4 rounded-xl border-2 transition-all',
                                isSelected ? 'border-brand-gold bg-brand-gold/8' : 'border-border bg-surface-1 hover:border-brand-gold/40 hover:bg-surface-2',
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  'mt-1 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all',
                                  isSelected ? 'bg-brand-gold border-brand-gold' : 'border-border',
                                )}>
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 12 12">
                                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className={cn('text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wide', mandateTypeColor[m.mandateType] ?? 'text-text-muted bg-surface-3 border-border')}>
                                      {m.mandateType}
                                    </span>
                                  </div>
                                  <p className="text-base font-semibold text-text-primary leading-snug">{m.title}</p>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                                    <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{m.city}</span>
                                    <span className="font-semibold text-brand-gold">{budgetLabel}</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                      <div className="px-5 py-4 border-t border-border bg-surface-1 flex items-center justify-between gap-3">
                        <p className="text-sm text-text-muted">
                          {selectedMandateIds.size > 0
                            ? `${selectedMandateIds.size} mandate${selectedMandateIds.size > 1 ? 's' : ''} selected`
                            : 'Tap cards to select'}
                        </p>
                        <button
                          disabled={selectedMandateIds.size === 0 || !selectedId}
                          onClick={() => {
                            activeMandates
                              .filter((m: Mandate) => selectedMandateIds.has(m.id))
                              .forEach((m: Mandate) => {
                                const budgetLabel = m.mandateType === 'lease'
                                  ? `₹${m.minBudget?.toLocaleString('en-IN')}/sqft`
                                  : `${formatCurrency(m.minBudget ?? 0)} – ${formatCurrency(m.maxBudget ?? 0)}`
                                sendMsgMutation({
                                  conversationId: selectedId!,
                                  content: m.title,
                                  type: 'mandate_share',
                                  metadata: {
                                    id: m.id,
                                    title: m.title,
                                    mandateType: m.mandateType,
                                    city: m.city,
                                    propertyType: m.propertyType,
                                    budget: budgetLabel,
                                  },
                                })
                              })
                            setShowMandatePicker(false)
                            setSelectedMandateIds(new Set())
                          }}
                          className={cn(
                            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                            selectedMandateIds.size > 0
                              ? 'bg-brand-gold text-black hover:bg-brand-gold-light'
                              : 'bg-surface-3 text-text-muted cursor-not-allowed',
                          )}
                        >
                          <Send className="h-4 w-4" />
                          Send{selectedMandateIds.size > 0 ? ` (${selectedMandateIds.size})` : ''}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-1 border-t border-border bg-surface-1 shrink-0">
              <div className="flex items-end gap-2">
                <button className="p-2.5 text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors shrink-0">
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
                    }}
                    placeholder="Type a message... (Enter to send)"
                    rows={1}
                    className="w-full px-4 py-2.5 pr-10 bg-surface-2 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50 resize-none"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                  <button className="absolute right-2.5 bottom-2.5 text-text-muted hover:text-brand-gold transition-colors">
                    <Smile className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!text.trim()}
                  className="shrink-0 h-11 w-11 p-0 rounded-xl"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
