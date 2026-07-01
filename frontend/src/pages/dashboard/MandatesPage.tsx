import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Eye, Users, Edit3, Trash2, EllipsisVertical,
  AlertCircle, CheckCircle2, Clock, XCircle, Filter,
  Building2, MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { MANDATE_TYPES } from '@/constants'
import type { Mandate, MandateStatus } from '@/types'
import { useMyMandates, useDeleteMandate } from '@/hooks/useMandates'
import { Spinner } from '@/components/ui/spinner'

const STATUS_ICON: Record<MandateStatus, React.ReactNode> = {
  active: <CheckCircle2 className="h-3.5 w-3.5" />,
  draft: <Clock className="h-3.5 w-3.5" />,
  closed: <XCircle className="h-3.5 w-3.5" />,
  expired: <AlertCircle className="h-3.5 w-3.5" />,
}

const STATUS_VARIANT: Record<MandateStatus, 'success' | 'warning' | 'default' | 'error'> = {
  active: 'success', draft: 'warning', closed: 'default', expired: 'error',
}

function MandateRow({ m, onDelete }: { m: Mandate; onDelete: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const budgetLabel =
    m.mandateType === 'lease'
      ? `₹${m.minBudget?.toLocaleString('en-IN')}/sqft`
      : `${formatCurrency(m.minBudget ?? 0)} – ${formatCurrency(m.maxBudget ?? 0)}`

  return (
    <Card hover className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant={m.mandateType} className="text-xs capitalize">
              {MANDATE_TYPES[m.mandateType]}
            </Badge>
            <Badge variant={STATUS_VARIANT[m.status]} dot className="text-xs capitalize">
              {STATUS_ICON[m.status]}
              {m.status}
            </Badge>
          </div>
          <h3 className="text-sm font-semibold text-text-primary mb-1 truncate">{m.title}</h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {m.city} · {m.locations?.join(', ')}
            </span>
            <span className="font-medium text-text-secondary">{budgetLabel}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-6 text-center shrink-0">
          <div>
            <p className="text-base font-bold text-text-primary">{m.viewsCount}</p>
            <p className="text-xs text-text-muted">Views</p>
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary">{timeAgo(m.createdAt)}</p>
            <p className="text-xs text-text-muted">Posted</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {m.status === 'draft' && (
            <Button variant="primary" size="sm" asChild>
              <Link to={`/dashboard/mandates/${m.id}/edit`}>Publish</Link>
            </Button>
          )}
          {m.status === 'active' && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/marketplace/${m.id}`}>
                <Eye className="h-3.5 w-3.5" /> View
              </Link>
            </Button>
          )}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-2 hover:text-text-secondary transition-colors"
            >
              <EllipsisVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-20 bg-surface-1 border border-border rounded-xl shadow-2xl py-1 min-w-36">
                <Link
                  to={`/dashboard/mandates/${m.id}/edit`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </Link>
                <button
                  onClick={() => { onDelete(m.id); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

const STATUS_TABS: Array<{ label: string; value: MandateStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Closed', value: 'closed' },
]

export default function MandatesPage() {
  const [activeStatus, setActiveStatus] = useState<MandateStatus | 'all'>('all')
  const { data: mandates = [], isLoading } = useMyMandates()
  const { mutate: deleteMandate } = useDeleteMandate()

  const filtered = activeStatus === 'all'
    ? mandates
    : mandates.filter((m) => m.status === activeStatus)

  const handleDelete = (id: string) => deleteMandate(id)

  const counts = {
    all: mandates.length,
    active: mandates.filter((m) => m.status === 'active').length,
    draft: mandates.filter((m) => m.status === 'draft').length,
    closed: mandates.filter((m) => m.status === 'closed').length,
    expired: mandates.filter((m) => m.status === 'expired').length,
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Mandates</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Manage all your buy, sell, and lease requirements.
          </p>
        </div>
        <Button size="lg" asChild>
          <Link to="/dashboard/mandates/new">
            <Plus className="h-4 w-4" /> Post Mandate
          </Link>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Mandates', value: mandates.length, color: 'text-text-primary' },
          { label: 'Active', value: counts.active, color: 'text-success' },
          { label: 'Total Views', value: mandates.reduce((a, m) => a + (m.viewsCount ?? 0), 0), color: 'text-brand-gold' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString('en-IN')}</p>
              <p className="text-xs text-text-muted">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter tabs + list */}
      <div>
        <div className="flex items-center gap-1 mb-4">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveStatus(tab.value)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeStatus === tab.value
                  ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/30'
                  : 'text-text-muted hover:text-text-secondary',
              )}
            >
              {tab.label}
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-surface-2 text-text-muted">
                {counts[tab.value] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <Building2 className="h-12 w-12 text-text-muted mb-3" />
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              {activeStatus === 'all' ? 'No mandates yet' : `No ${activeStatus} mandates`}
            </h3>
            <p className="text-sm text-text-muted mb-5">
              {activeStatus === 'all'
                ? 'Post your first mandate and start co-broking with verified brokers across India.'
                : `You have no ${activeStatus} mandates at the moment.`}
            </p>
            <Button asChild>
              <Link to="/dashboard/mandates/new">
                <Plus className="h-4 w-4" /> Post Mandate
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((m) => (
              <MandateRow key={m.id} m={m} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

