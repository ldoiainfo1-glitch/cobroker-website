import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MoreHorizontal, Plus, Circle, ArrowRight,
  Building2, MapPin, IndianRupee, User2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { DEAL_STAGES, DEAL_STAGE_LABELS } from '@/constants'
import type { DealStage } from '@/types'

interface Deal {
  id: string
  title: string
  stage: DealStage
  city: string
  budget: number
  cobrokingPartner: { name: string; company: string }
  commission: number
  updatedAt: string
}

const MOCK_DEALS: Deal[] = [
  {
    id: '1', title: '3BHK Bandra West — HNI Client', stage: 'site_visit',
    city: 'Mumbai', budget: 28000000,
    cobrokingPartner: { name: 'Vikram Shah', company: 'Mahindra Lifespaces' },
    commission: 1.5, updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '2', title: 'Worli Penthouse — Sea Face', stage: 'negotiation',
    city: 'Mumbai', budget: 260000000,
    cobrokingPartner: { name: 'Rahul Mehta', company: 'Oberoi Realty' },
    commission: 2, updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: '3', title: 'BKC Office — Fintech Company', stage: 'agreement',
    city: 'Mumbai', budget: 9500,
    cobrokingPartner: { name: 'Anita Desai', company: 'JLL India' },
    commission: 1, updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '4', title: 'Hinjewadi Land — Dev Project', stage: 'due_diligence',
    city: 'Pune', budget: 95000000,
    cobrokingPartner: { name: 'Suresh Joshi', company: 'Kolte Patil' },
    commission: 1.5, updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: '5', title: 'JNPT Warehouse — Logistics', stage: 'registration',
    city: 'Navi Mumbai', budget: 195000000,
    cobrokingPartner: { name: 'Sunil Kapoor', company: 'Godrej Properties' },
    commission: 1.25, updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: '6', title: 'Whitefield Office — IT Park', stage: 'closed_won',
    city: 'Bengaluru', budget: 8000,
    cobrokingPartner: { name: 'Priya Nair', company: 'Prestige Estates' },
    commission: 2, updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
]

// Ordered stages for the Kanban board
const KANBAN_STAGES: DealStage[] = [
  'introduction', 'site_visit', 'negotiation', 'agreement',
  'due_diligence', 'registration', 'closed_won',
]

const STAGE_COLORS: Record<DealStage, string> = {
  introduction: 'border-t-text-muted',
  site_visit: 'border-t-info',
  negotiation: 'border-t-warning',
  agreement: 'border-t-brand-gold',
  due_diligence: 'border-t-warning',
  registration: 'border-t-success',
  closed_won: 'border-t-success',
  closed_lost: 'border-t-error',
}

function DealCard({ deal }: { deal: Deal }) {
  return (
    <div className="bg-surface-2 rounded-xl border border-border p-3 hover:border-brand-gold/30 transition-colors cursor-grab active:cursor-grabbing">
      <p className="text-xs font-semibold text-text-primary leading-snug mb-2 line-clamp-2">
        {deal.title}
      </p>
      <div className="flex items-center gap-1.5 text-[10px] text-text-muted mb-2">
        <MapPin className="h-3 w-3 shrink-0" />
        {deal.city}
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-text-muted mb-3">
        <User2 className="h-3 w-3 shrink-0" />
        <span className="truncate">{deal.cobrokingPartner.name}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-brand-gold">{formatCurrency(deal.budget)}</span>
        <span className="text-[10px] text-text-muted">{deal.commission}%</span>
      </div>
    </div>
  )
}

function KanbanColumn({ stage, deals }: { stage: DealStage; deals: Deal[] }) {
  const label = DEAL_STAGE_LABELS[stage]
  const colorClass = STAGE_COLORS[stage]

  return (
    <div className={`flex-shrink-0 w-60 flex flex-col rounded-xl bg-surface-1 border border-border border-t-2 ${colorClass}`}>
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-primary">{label}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-2 text-text-muted">{deals.length}</span>
        </div>
        <button className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-surface-2 rounded transition-colors">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex flex-col gap-2 p-2 min-h-24 flex-1">
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
        {deals.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[10px] text-text-muted text-center">No deals in this stage</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DealsPage() {
  const [deals] = useState(MOCK_DEALS)

  const totalCommission = deals
    .filter((d) => d.stage === 'closed_won')
    .reduce((sum, d) => sum + (d.budget * d.commission) / 100, 0)

  const pipelineValue = deals.reduce((sum, d) => sum + d.budget, 0)

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Deal Pipeline</h1>
          <p className="text-sm text-text-muted mt-0.5">Track every co-broking deal from introduction to registration.</p>
        </div>
        <Button size="lg">
          <Plus className="h-4 w-4" /> Add Deal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Deals', value: deals.length, fmt: (v: number) => v.toString() },
          { label: 'Pipeline Value', value: pipelineValue, fmt: formatCurrency },
          { label: 'Deals Won', value: deals.filter(d => d.stage === 'closed_won').length, fmt: (v: number) => v.toString() },
          { label: 'Commission Earned', value: totalCommission, fmt: formatCurrency },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xl font-bold text-text-primary">{s.fmt(s.value)}</p>
              <p className="text-xs text-text-muted">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-3 pb-4" style={{ minWidth: 'max-content' }}>
          {KANBAN_STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              deals={deals.filter((d) => d.stage === stage)}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-text-muted text-center">
        Drag-and-drop between stages coming in Phase 4 with @dnd-kit integration.
      </p>
    </div>
  )
}
