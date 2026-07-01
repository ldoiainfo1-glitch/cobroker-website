import { useState } from 'react'
import {
  Shield, Search, Eye, CheckCircle2, XCircle,
  Clock, Upload, FileText, ChevronDown, Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminKycDocs, useUpdateKycDocStatus } from '@/hooks/useKyc'
import { getSignedDocUrl } from '@/lib/s3'
import { Spinner } from '@/components/ui/spinner'
import type { KYCDocStatus } from '@/types'
import type { AdminKYCRow } from '@/services/kycService'

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<KYCDocStatus, { label: string; color: string; bg: string; border: string }> = {
  not_uploaded: { label: 'Not uploaded', color: 'text-text-muted',  bg: 'bg-surface-2',    border: 'border-border' },
  pending:      { label: 'Pending',       color: 'text-warning',     bg: 'bg-warning/10',   border: 'border-warning/20' },
  under_review: { label: 'Under review',  color: 'text-info',        bg: 'bg-info/10',      border: 'border-info/20' },
  approved:     { label: 'Approved',      color: 'text-success',     bg: 'bg-success/10',   border: 'border-success/20' },
  rejected:     { label: 'Rejected',      color: 'text-error',       bg: 'bg-error/10',     border: 'border-error/20' },
}

const STATUS_FILTERS: { value: KYCDocStatus | 'all'; label: string }[] = [
  { value: 'all',          label: 'All' },
  { value: 'pending',      label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved',     label: 'Approved' },
  { value: 'rejected',     label: 'Rejected' },
]

// ─── View document button ─────────────────────────────────────────────────────

function ViewBtn({ docUrl }: { docUrl: string }) {
  const [loading, setLoading] = useState(false)

  const handleView = async () => {
    setLoading(true)
    try {
      const signedUrl = await getSignedDocUrl(docUrl)
      window.open(signedUrl, '_blank', 'noopener,noreferrer')
    } catch {
      alert('Could not open document.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleView}
      disabled={loading}
      title="View document"
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-text-secondary hover:text-brand-gold hover:bg-brand-gold/10 border border-border hover:border-brand-gold/30 transition-colors disabled:opacity-50"
    >
      {loading ? <Spinner size="sm" /> : <Eye className="h-3 w-3" />}
      View
    </button>
  )
}

// ─── Reject modal ─────────────────────────────────────────────────────────────

function RejectModal({
  doc,
  onConfirm,
  onClose,
  loading,
}: {
  doc: AdminKYCRow
  onConfirm: (reason: string) => void
  onClose: () => void
  loading: boolean
}) {
  const [reason, setReason] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-0 border border-border rounded-2xl w-full max-w-sm shadow-2xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-1">Reject document</h3>
        <p className="text-xs text-text-muted mb-4">
          Rejecting <span className="font-medium text-text-primary">{doc.label}</span> for{' '}
          <span className="font-medium text-text-primary">{doc.userFullName}</span>
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection (shown to the user)…"
          rows={3}
          className="w-full text-sm bg-surface-2 border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-error/50 mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-surface-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading || !reason.trim()}
            className="flex-1 px-3 py-2 rounded-lg bg-error text-white text-sm font-medium hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Spinner size="sm" /> : <XCircle className="h-3.5 w-3.5" />}
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminKYCPage() {
  const { data: docs = [], isLoading } = useAdminKycDocs()
  const { mutateAsync: updateStatus, isPending: updating } = useUpdateKycDocStatus()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<KYCDocStatus | 'all'>('all')
  const [rejectTarget, setRejectTarget] = useState<AdminKYCRow | null>(null)
  const [actioningId, setActioningId] = useState<string | null>(null)

  const filtered = docs.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        d.userFullName.toLowerCase().includes(q) ||
        d.userEmail.toLowerCase().includes(q) ||
        d.companyName.toLowerCase().includes(q) ||
        d.label.toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleApprove = async (doc: AdminKYCRow) => {
    setActioningId(doc.id)
    try {
      await updateStatus({ docId: doc.id, status: 'approved' })
    } finally {
      setActioningId(null)
    }
  }

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return
    setActioningId(rejectTarget.id)
    try {
      await updateStatus({ docId: rejectTarget.id, status: 'rejected', notes: reason })
      setRejectTarget(null)
    } finally {
      setActioningId(null)
    }
  }

  // Stats
  const counts = {
    total:       docs.length,
    pending:     docs.filter((d) => d.status === 'pending').length,
    under_review:docs.filter((d) => d.status === 'under_review').length,
    approved:    docs.filter((d) => d.status === 'approved').length,
    rejected:    docs.filter((d) => d.status === 'rejected').length,
  }

  return (
    <div className="p-6">
      {rejectTarget && (
        <RejectModal
          doc={rejectTarget}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectTarget(null)}
          loading={updating && actioningId === rejectTarget.id}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary flex items-center gap-2.5">
          <Shield className="h-5 w-5 text-brand-gold" />
          KYC Documents
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Review and approve KYC documents submitted by all users
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total docs',    count: counts.total,        color: 'text-text-primary',  bg: 'bg-surface-1' },
          { label: 'Pending',       count: counts.pending,      color: 'text-warning',        bg: 'bg-warning/5 border-warning/20' },
          { label: 'Approved',      count: counts.approved,     color: 'text-success',        bg: 'bg-success/5 border-success/20' },
          { label: 'Rejected',      count: counts.rejected,     color: 'text-error',          bg: 'bg-error/5 border-error/20' },
        ].map((s) => (
          <div key={s.label} className={cn('border rounded-xl px-4 py-3 flex items-center gap-3', s.bg)}>
            <div>
              <p className={cn('text-2xl font-bold', s.color)}>{s.count}</p>
              <p className="text-xs text-text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search by user, company or document…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-surface-1 border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-surface-1 border border-border rounded-lg">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                statusFilter === f.value
                  ? 'bg-brand-gold text-black'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface-2',
              )}
            >
              {f.label}
              {f.value !== 'all' && counts[f.value as keyof typeof counts] > 0 && (
                <span className="ml-1 opacity-70">({counts[f.value as keyof typeof counts]})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FileText className="h-10 w-10 text-text-muted mb-3" />
          <p className="text-text-primary font-semibold">
            {search || statusFilter !== 'all' ? 'No documents match your filters' : 'No KYC documents yet'}
          </p>
        </div>
      ) : (
        <div className="bg-surface-1 border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-0">
              <tr>
                {['User', 'Company', 'Document', 'Status', 'Uploaded', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-text-muted px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => {
                const cfg = STATUS_CFG[doc.status]
                const isActioning = actioningId === doc.id
                return (
                  <tr key={doc.id} className="border-b border-border/50 last:border-0 hover:bg-surface-0/50 transition-colors">
                    {/* User */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{doc.userFullName}</p>
                      <p className="text-xs text-text-muted">{doc.userEmail}</p>
                    </td>
                    {/* Company */}
                    <td className="px-4 py-3 text-xs text-text-secondary">{doc.companyName || '—'}</td>
                    {/* Document */}
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-text-primary">
                        <FileText className="h-3.5 w-3.5 text-text-muted shrink-0" />
                        {doc.label}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border', cfg.color, cfg.bg, cfg.border)}>
                        {cfg.label}
                      </span>
                      {doc.notes && doc.status === 'rejected' && (
                        <p className="text-[10px] text-error mt-0.5 max-w-32 truncate" title={doc.notes}>
                          {doc.notes}
                        </p>
                      )}
                    </td>
                    {/* Uploaded */}
                    <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap">
                      {new Date(doc.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <ViewBtn docUrl={doc.docUrl} />
                        {(doc.status === 'pending' || doc.status === 'under_review') && (
                          <>
                            <button
                              onClick={() => handleApprove(doc)}
                              disabled={isActioning}
                              title="Approve"
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-success hover:bg-success/10 border border-border hover:border-success/30 transition-colors disabled:opacity-50"
                            >
                              {isActioning ? <Spinner size="sm" /> : <CheckCircle2 className="h-3 w-3" />}
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectTarget(doc)}
                              disabled={isActioning}
                              title="Reject"
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-error hover:bg-error/10 border border-border hover:border-error/30 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
