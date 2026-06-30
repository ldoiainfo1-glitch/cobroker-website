import { useState } from 'react'
import {
  Shield, CheckCircle2, Clock, XCircle, Upload,
  AlertCircle, FileText, RefreshCw, ChevronDown,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { MOCK_KYC_DOCS } from '@/data/profiles'
import type { KYCDocument, KYCDocStatus } from '@/types'

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig: Record<KYCDocStatus, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  not_uploaded: {
    label: 'Not uploaded',
    icon: <Upload className="h-4 w-4" />,
    color: 'text-text-muted',
    bg: 'bg-surface-2',
    border: 'border-border',
  },
  pending: {
    label: 'Upload pending',
    icon: <Clock className="h-4 w-4" />,
    color: 'text-warning',
    bg: 'bg-warning/5',
    border: 'border-warning/30',
  },
  under_review: {
    label: 'Under review',
    icon: <Clock className="h-4 w-4 animate-pulse" />,
    color: 'text-info',
    bg: 'bg-info/5',
    border: 'border-info/30',
  },
  approved: {
    label: 'Approved',
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-success',
    bg: 'bg-success/5',
    border: 'border-success/30',
  },
  rejected: {
    label: 'Rejected',
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-error',
    bg: 'bg-error/5',
    border: 'border-error/30',
  },
}

// ─── Overall verification status banner ───────────────────────────────────────
function VerificationBanner({ docs }: { docs: KYCDocument[] }) {
  const required = docs.filter((d) => d.required)
  const allApproved = required.every((d) => d.status === 'approved')
  const hasRejected = required.some((d) => d.status === 'rejected')
  const hasPending = required.some((d) => d.status === 'under_review')
  const notUploaded = required.filter((d) => d.status === 'not_uploaded').length

  if (allApproved) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/30 mb-6">
        <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
        <div>
          <p className="text-sm font-semibold text-success">Your company is fully verified</p>
          <p className="text-xs text-text-muted">All required documents have been reviewed and approved.</p>
        </div>
        <Badge variant="success" className="ml-auto shrink-0">Verified</Badge>
      </div>
    )
  }
  if (hasRejected) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-error/10 border border-error/30 mb-6">
        <XCircle className="h-5 w-5 text-error shrink-0" />
        <div>
          <p className="text-sm font-semibold text-error">Action required — document rejected</p>
          <p className="text-xs text-text-muted">One or more documents were rejected. Please re-upload with the correct files.</p>
        </div>
      </div>
    )
  }
  if (hasPending) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-info/10 border border-info/30 mb-6">
        <Clock className="h-5 w-5 text-info shrink-0 animate-pulse" />
        <div>
          <p className="text-sm font-semibold text-info">Verification in progress</p>
          <p className="text-xs text-text-muted">Your documents are being reviewed. This typically takes 1–2 business days.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30 mb-6">
      <AlertCircle className="h-5 w-5 text-warning shrink-0" />
      <div>
        <p className="text-sm font-semibold text-warning">Verification incomplete</p>
        <p className="text-xs text-text-muted">
          {notUploaded} required document{notUploaded !== 1 ? 's' : ''} still need{notUploaded === 1 ? 's' : ''} to be uploaded.
        </p>
      </div>
    </div>
  )
}

// ─── Document row ─────────────────────────────────────────────────────────────
function DocRow({ doc }: { doc: KYCDocument }) {
  const [expanded, setExpanded] = useState(doc.status === 'rejected')
  const cfg = statusConfig[doc.status]

  return (
    <div className={cn('rounded-xl border transition-all', cfg.border, cfg.bg)}>
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Icon */}
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-surface-2', cfg.color)}>
          <FileText className="h-5 w-5" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-text-primary">{doc.label}</span>
            {doc.required && <span className="text-[10px] text-error">Required</span>}
          </div>
          {doc.fileName && (
            <p className="text-xs text-text-muted mt-0.5 truncate">{doc.fileName} · {doc.fileSize}</p>
          )}
        </div>

        {/* Status */}
        <div className={cn('flex items-center gap-1.5 text-xs font-medium shrink-0', cfg.color)}>
          {cfg.icon}
          <span className="hidden sm:inline">{cfg.label}</span>
        </div>

        {/* Expand chevron */}
        <ChevronDown className={cn('h-4 w-4 text-text-muted transition-transform shrink-0', expanded && 'rotate-180')} />
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50 pt-4">
          <p className="text-xs text-text-muted mb-3">{doc.description}</p>

          {doc.status === 'rejected' && doc.rejectionReason && (
            <div className="flex items-start gap-2 p-3 bg-error/10 border border-error/30 rounded-lg mb-3">
              <XCircle className="h-4 w-4 text-error shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-error mb-0.5">Rejection reason</p>
                <p className="text-xs text-text-secondary">{doc.rejectionReason}</p>
              </div>
            </div>
          )}

          {doc.uploadedAt && (
            <p className="text-[11px] text-text-muted mb-3">
              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              {doc.reviewedAt && ` · Reviewed: ${new Date(doc.reviewedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`}
            </p>
          )}

          <div className="flex items-center gap-2">
            {(doc.status === 'not_uploaded' || doc.status === 'rejected') && (
              <Button size="sm" className="flex items-center gap-2">
                <Upload className="h-3.5 w-3.5" />
                {doc.status === 'rejected' ? 'Re-upload document' : 'Upload document'}
              </Button>
            )}
            {doc.status === 'approved' && (
              <Button variant="outline" size="sm">
                <RefreshCw className="h-3.5 w-3.5" /> Replace document
              </Button>
            )}
            {doc.status === 'under_review' && (
              <p className="text-xs text-info">Document is under review. You will be notified once approved.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Verification progress ────────────────────────────────────────────────────
function VerificationProgress({ docs }: { docs: KYCDocument[] }) {
  const required = docs.filter((d) => d.required)
  const approved = required.filter((d) => d.status === 'approved').length
  const pct = required.length ? Math.round((approved / required.length) * 100) : 0

  return (
    <div className="flex items-center gap-4 mb-1">
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs text-text-muted mb-1">
          <span>Required documents</span>
          <span className="font-medium text-text-primary">{approved}/{required.length} approved</span>
        </div>
        <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', pct === 100 ? 'bg-success' : 'bg-brand-gold')}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="text-lg font-bold text-text-primary shrink-0">{pct}%</span>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function KYCPage() {
  const [docs] = useState<KYCDocument[]>(MOCK_KYC_DOCS)

  const requiredDocs = docs.filter((d) => d.required)
  const optionalDocs = docs.filter((d) => !d.required)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-gold" />
            KYC & Verification
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Verified companies unlock full marketplace access and trust badges
          </p>
        </div>
      </div>

      {/* Status banner */}
      <VerificationBanner docs={docs} />

      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Verification progress</h3>
          <VerificationProgress docs={docs} />
          <div className="grid grid-cols-4 gap-3 mt-4">
            {(['approved', 'under_review', 'rejected', 'not_uploaded'] as KYCDocStatus[]).map((s) => {
              const count = docs.filter((d) => d.status === s).length
              const cfg = statusConfig[s]
              return (
                <div key={s} className={cn('text-center p-3 rounded-lg border', cfg.bg, cfg.border)}>
                  <div className={cn('text-lg font-bold', cfg.color)}>{count}</div>
                  <div className="text-[10px] text-text-muted mt-0.5">{cfg.label}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Required documents */}
      <h2 className="text-sm font-semibold text-text-primary mb-3">Required documents</h2>
      <div className="flex flex-col gap-3 mb-6">
        {requiredDocs.map((doc) => (
          <DocRow key={doc.id} doc={doc} />
        ))}
      </div>

      {/* Optional documents */}
      <h2 className="text-sm font-semibold text-text-primary mb-3">Optional documents</h2>
      <div className="flex flex-col gap-3 mb-6">
        {optionalDocs.map((doc) => (
          <DocRow key={doc.id} doc={doc} />
        ))}
      </div>

      {/* Help */}
      <Card className="border-brand-gold/20 bg-brand-gold/5">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-1">Need help?</h3>
          <p className="text-xs text-text-muted mb-3">
            Documents should be clear, colour scans in PDF or JPG format (max 5 MB each).
            RERA certificates must be current and not expired. If your documents are rejected,
            upload a fresh copy and our team will re-review within 24 hours.
          </p>
          <Button variant="outline" size="sm">Contact Support</Button>
        </CardContent>
      </Card>
    </div>
  )
}
