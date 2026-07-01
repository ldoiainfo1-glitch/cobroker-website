import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Search, Send, Paperclip, MoreVertical, Phone,
  CheckCheck, Check, Building2, MapPin, Users,
  GitBranch, ChevronRight, MessageSquare, Smile,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, timeAgo } from '@/lib/utils'
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '@/data/messages'
import type { Conversation, ChatMessage, ConvParticipant } from '@/types'

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
      {/* Avatar placeholder (keeps alignment) */}
      <div className="w-8 shrink-0">
        {showAvatar && !msg.isMine && <Avatar initial={msg.senderInitial} size="sm" />}
      </div>

      {/* Bubble */}
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
        {/* Time + read */}
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
  const displayName = conv.type === 'group' ? conv.groupName! : participant.name
  const displayInitial = conv.type === 'group' ? conv.groupInitial! : participant.avatarInitial
  const isOnline = conv.type === 'direct' && participant.isOnline

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
  const { conversationId } = useParams<{ conversationId?: string }>()
  const [selectedId, setSelectedId] = useState<string>(conversationId ?? MOCK_CONVERSATIONS[0].id)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({ ...MOCK_MESSAGES })
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedConv = MOCK_CONVERSATIONS.find((c) => c.id === selectedId)
  const selectedMessages = messages[selectedId] ?? []

  // Scroll to bottom when conversation or messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedId, messages])

  // Simulate typing indicator when switching to c1
  useEffect(() => {
    if (selectedId === 'c1') {
      const t = setTimeout(() => setIsTyping(true), 2000)
      const t2 = setTimeout(() => setIsTyping(false), 5000)
      return () => { clearTimeout(t); clearTimeout(t2) }
    } else {
      setIsTyping(false)
    }
  }, [selectedId])

  const filteredConvs = MOCK_CONVERSATIONS.filter((c) => {
    const name = c.type === 'group' ? c.groupName! : c.participants[0].name
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase())
    const matchesTab = tab === 'all' || (tab === 'unread' && c.unreadCount > 0)
    return matchesSearch && matchesTab
  })

  const unreadCount = MOCK_CONVERSATIONS.filter((c) => c.unreadCount > 0).length

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || !selectedId) return
    const newMsg: ChatMessage = {
      id: `new-${Date.now()}`,
      conversationId: selectedId,
      senderId: 'me',
      senderName: 'Me',
      senderInitial: 'DB',
      type: 'text',
      text: trimmed,
      sentAt: new Date().toISOString(),
      isRead: false,
      isMine: true,
    }
    setMessages((prev) => ({ ...prev, [selectedId]: [...(prev[selectedId] ?? []), newMsg] }))
    setText('')
  }

  // Participant info for thread header
  const participant: ConvParticipant | undefined = selectedConv?.type === 'direct' ? selectedConv.participants[0] : undefined

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left Panel: Conversation List ──────────────────────────────────── */}
      <div className="w-[320px] shrink-0 flex flex-col border-r border-border bg-surface-1">
        {/* Header */}
        <div className="px-4 pt-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-text-primary">Messages</h2>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-3.5 w-3.5" /> New
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50"
            />
          </div>

          {/* Tabs */}
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

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-sm">No conversations found</div>
          ) : (
            filteredConvs.map((conv) => (
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
                  initial={selectedConv.type === 'group' ? selectedConv.groupInitial! : selectedConv.participants[0].avatarInitial}
                  size="md"
                  online={selectedConv.type === 'direct' ? selectedConv.participants[0].isOnline : undefined}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {selectedConv.type === 'group' ? selectedConv.groupName : selectedConv.participants[0].name}
                    </span>
                    {participant?.isVerified && (
                      <span className="text-xs text-success">✓</span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">
                    {selectedConv.type === 'group'
                      ? `${selectedConv.participants.length} participants`
                      : participant?.isOnline
                        ? 'Online now'
                        : participant?.lastSeen
                          ? `Last seen ${timeAgo(participant.lastSeen)}`
                          : participant?.company}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors">
                  <Phone className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-0.5">
              {selectedMessages.map((msg, idx) => {
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
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end gap-2 mb-1">
                  <div className="w-8 shrink-0">
                    <Avatar initial={selectedConv.participants[0].avatarInitial} size="sm" />
                  </div>
                  <div className="px-4 py-3 bg-surface-2 border border-border rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1 items-center h-3">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Mandate share pill */}
            <div className="px-5 pb-2 flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs text-text-muted hover:text-brand-gold hover:border-brand-gold/30 transition-all">
                <Building2 className="h-3 w-3" /> Share Mandate
              </button>
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
