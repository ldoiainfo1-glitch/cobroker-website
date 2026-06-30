import { useState } from 'react'
import {
  CheckCircle, XCircle, Clock, MessageSquare, Eye,
  ChevronDown, User2, Building2, Handshake,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { MANDATE_TYPES } from '@/constants'
import type { MandateType, IntroductionStatus } from '@/types'

interface Introduction {
  id: string
  direction: 'sent' | 'received'
  mandate: {
    id: string
    title: string
    type: MandateType
    city: string
    minBudget: number
    maxBudget: number
  }
  fromBroker: { name: string; company: string; verified: boolean }
  toBroker: { name: string; company: string; verified: boolean }
  message: string
  status: IntroductionStatus
  sentAt: string
  respondedAt?: string
}

const MOCK_INTROS: Introduction[] = [
  {
    id: '1', direction: 'received',
    mandate: { id: '1', title: '3BHK in Bandra — 2-3.5 Cr', type: 'buy', city: 'Mumbai', minBudget: 20000000, maxBudget: 35000000 },
    fromBroker: { name: 'Vikram Shah', company: 'Mahindra Lifespaces', verified: true },
    toBroker: { name: 'You', company: 'My Company', verified: true },
    message: "I have an active seller client in Bandra West with a 3BHK asking ₹2.8 Cr. Happy to co-broke on a 50/50 basis.",
    status: 'pending', sentAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: '2', direction: 'received',
    mandate: { id: '2', title: 'Office Space in Lower Parel', type: 'lease', city: 'Mumbai', minBudget: 8000, maxBudget: 10000 },
    fromBroker: { name: 'Anita Desai', company: 'JLL India', verified: true },
    toBroker: { name: 'You', company: 'My Company', verified: true },
    message: "We have a Grade A office building on Lower Parel with exactly the area you're looking for. Let's connect.",
    status: 'pending', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3', direction: 'sent',
    mandate: { id: '3', title: 'Penthouse in Worli Sea Face — ₹28 Cr', type: 'sell', city: 'Mumbai', minBudget: 250000000, maxBudget: 280000000 },
    fromBroker: { name: 'You', company: 'My Company', verified: true },
    toBroker: { name: 'Rahul Mehta', company: 'Oberoi Realty', verified: true },
    message: "My HNI client is looking for exactly this kind of luxury penthouse. Would love to co-broke with you.",
    status: 'accepted', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    respondedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: '4', direction: 'sent',
    mandate: { id: '4', title: 'Warehouse near JNPT', type: 'buy', city: 'Navi Mumbai', minBudget: 180000000, maxBudget: 220000000 },
    fromBroker: { name: 'You', company: 'My Company', verified: true },
    toBroker: { name: 'Sunil Kapoor', company: 'Godrej Properties', verified: true },
    message: "Interested in co-broking this industrial mandate. I have a buyer looking for exactly this.",
    status: 'rejected', sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    respondedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
]

const STATUS_CONFIG: Record<IntroductionStatus, { label: string; variant: 'warning' | 'success' | 'error' | 'default'; icon: React.ReactNode }> = {
  pending: { label: 'Pending', variant: 'warning', icon: <Clock className="h-3.5 w-3.5" /> },
  accepted: { label: 'Accepted', variant: 'success', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  rejected: { label: 'Declined', variant: 'error', icon: <XCircle className="h-3.5 w-3.5" /> },
  withdrawn: { label: 'Withdrawn', variant: 'default', icon: <XCircle className="h-3.5 w-3.5" /> },
  completed: { label: 'Completed', variant: 'success', icon: <CheckCircle className="h-3.5 w-3.5" /> },
}

function IntroCard({ intro, onAccept, onReject }: {
  intro: Introduction
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const statusCfg = STATUS_CONFIG[intro.status]

  const budgetLabel =
    intro.mandate.type === 'lease'
      ? `₹${intro.mandate.minBudget.toLocaleString('en-IN')}/sqft`
      : `${formatCurrency(intro.mandate.minBudget)} – ${formatCurrency(intro.mandate.maxBudget)}`

  const otherBroker = intro.direction === 'received' ? intro.fromBroker : intro.toBroker

  return (
    <Card className={cn(intro.status === 'pending' && intro.direction === 'received' && 'border-brand-gold/30 bg-brand-gold/5')}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant={intro.mandate.type === 'joint_venture' ? 'gold' : intro.mandate.type} className="text-[10px]">
                {MANDATE_TYPES[intro.mandate.type]}
              </Badge>
              <Badge variant={statusCfg.variant} dot className="text-[10px] flex items-center gap-1">
                {statusCfg.label}
              </Badge>
              {intro.direction === 'received' && intro.status === 'pending' && (
                <span className="text-[10px] font-medium text-brand-gold animate-pulse">• New</span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1 truncate">{intro.mandate.title}</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mb-2">
              <span>{intro.mandate.city}</span>
              <span className="text-text-secondary font-medium">{budgetLabel}</span>
            </div>

            {/* Broker info */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-surface-2 border border-border flex items-center justify-center text-[10px] font-bold text-text-muted">
                {otherBroker.name[0]}
              </div>
              <div className="text-xs">
                <span className="text-text-muted">{intro.direction === 'received' ? 'From' : 'To'}: </span>
                <span className="text-text-secondary font-medium">{otherBroker.name}</span>
                <span className="text-text-muted"> · {otherBroker.company}</span>
                {otherBroker.verified && <span className="ml-1 text-success">✓</span>}
              </div>
            </div>
          </div>

          {/* Time */}
          <div className="text-right shrink-0">
            <p className="text-[10px] text-text-muted">{timeAgo(intro.sentAt)}</p>
            {intro.respondedAt && (
              <p className="text-[10px] text-text-muted">Responded {timeAgo(intro.respondedAt)}</p>
            )}
          </div>
        </div>

        {/* Expandable message */}
        <div className="mt-3 pt-3 border-t border-border">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Message
            <ChevronDown className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')} />
          </button>
          {expanded && (
            <div className="mt-2 p-3 rounded-lg bg-surface-2 text-xs text-text-secondary leading-relaxed">
              "{intro.message}"
            </div>
          )}
        </div>

        {/* Actions */}
        {intro.direction === 'received' && intro.status === 'pending' && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <Button size="sm" className="flex-1" onClick={() => onAccept?.(intro.id)}>
              <CheckCircle className="h-3.5 w-3.5" /> Accept
            </Button>
            <Button variant="outline" size="sm" className="flex-1 !text-error !border-error/30 hover:!bg-error/10" onClick={() => onReject?.(intro.id)}>
              <XCircle className="h-3.5 w-3.5" /> Decline
            </Button>
          </div>
        )}

        {intro.status === 'accepted' && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <div className="flex-1 text-xs text-success flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5" />
              Contact details shared. Both brokers can now see each other's phone number.
            </div>
            <Button variant="secondary" size="sm">
              <MessageSquare className="h-3.5 w-3.5" /> Chat
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

type TabValue = 'received' | 'sent' | 'accepted'

export default function IntroductionsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('received')
  const [intros, setIntros] = useState(MOCK_INTROS)

  const handleAccept = (id: string) => {
    setIntros((prev) => prev.map((i) => i.id === id ? { ...i, status: 'accepted' as IntroductionStatus } : i))
  }

  const handleReject = (id: string) => {
    setIntros((prev) => prev.map((i) => i.id === id ? { ...i, status: 'rejected' as IntroductionStatus } : i))
  }

  const received = intros.filter((i) => i.direction === 'received')
  const sent = intros.filter((i) => i.direction === 'sent')
  const accepted = intros.filter((i) => i.status === 'accepted')
  const pendingCount = received.filter((i) => i.status === 'pending').length

  const tabs: Array<{ value: TabValue; label: string; count?: number }> = [
    { value: 'received', label: 'Received', count: received.length },
    { value: 'sent', label: 'Sent', count: sent.length },
    { value: 'accepted', label: 'Active Co-Brokes', count: accepted.length },
  ]

  const displayList =
    activeTab === 'received' ? received :
    activeTab === 'sent' ? sent : accepted

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Introductions</h1>
          <p className="text-sm text-text-muted mt-0.5">Manage all your co-broking introduction requests.</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-sm font-medium">
            <span className="w-5 h-5 rounded-full bg-brand-gold text-black text-xs font-bold flex items-center justify-center">{pendingCount}</span>
            Pending action
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Received', value: received.length, icon: <Handshake className="h-4 w-4" /> },
          { label: 'Pending', value: received.filter(i => i.status === 'pending').length, icon: <Clock className="h-4 w-4" />, highlight: true },
          { label: 'Active Co-Brokes', value: accepted.length, icon: <CheckCircle className="h-4 w-4" /> },
          { label: 'Total Sent', value: sent.length, icon: <MessageSquare className="h-4 w-4" /> },
        ].map((s) => (
          <Card key={s.label} className={s.highlight ? 'border-brand-gold/30 bg-brand-gold/5' : ''}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', s.highlight ? 'bg-brand-gold/20 text-brand-gold' : 'bg-surface-2 text-text-muted')}>
                {s.icon}
              </div>
              <div>
                <p className={cn('text-xl font-bold', s.highlight ? 'text-brand-gold' : 'text-text-primary')}>{s.value}</p>
                <p className="text-[10px] text-text-muted">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px',
              activeTab === tab.value
                ? 'border-brand-gold text-brand-gold'
                : 'border-transparent text-text-muted hover:text-text-secondary',
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-surface-2 text-text-muted">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {displayList.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <Handshake className="h-12 w-12 text-text-muted mb-3" />
          <h3 className="text-lg font-semibold text-text-primary mb-1">No introductions yet</h3>
          <p className="text-sm text-text-muted">
            {activeTab === 'received' ? 'Brokers who request to co-broke your mandates will appear here.' :
             activeTab === 'sent' ? 'Introductions you send to other brokers will appear here.' :
             'Accepted co-broking partnerships will appear here.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayList.map((intro) => (
            <IntroCard key={intro.id} intro={intro} onAccept={handleAccept} onReject={handleReject} />
          ))}
        </div>
      )}
    </div>
  )
}
