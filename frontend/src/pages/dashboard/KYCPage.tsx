import { useState, useRef, useCallback } from 'react'
import {
  Shield, CheckCircle2, Clock, XCircle, Upload,
  AlertCircle, FileText, RefreshCw, ChevronDown,
  X, File, ImageIcon, Eye, ExternalLink,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useKycDocs, useSubmitKycDoc } from '@/hooks/useKyc'
import { uploadKycDocument, getSignedDocUrl } from '@/lib/s3'
import type { KYCDocument, KYCDocStatus } from '@/types'
import { Spinner } from '@/components/ui/spinner'

// ─── Upload modal ─────────────────────────────────────────────────────────────
interface UploadModalProps {
  doc: KYCDocument
  onClose: () => void
  onUploaded: (docId: string, file: File, publicUrl: string) => void
}

function UploadModal({ doc, onClose, onUploaded }: UploadModalProps) {
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) return alert('File too large. Max 5 MB.')
    setSelectedFile(file)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const simulateUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    setError('')
    try {
      const { publicUrl } = await uploadKycDocument(selectedFile)
      setDone(true)
      setTimeout(() => { onUploaded(doc.id, selectedFile, publicUrl); onClose() }, 800)
    } catch (e: any) {
      setError(e?.message ?? 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const isImage = selectedFile?.type.startsWith('image/')
  const fileIcon = isImage ? <ImageIcon className="h-8 w-8 text-info" /> : <File className="h-8 w-8 text-brand-gold" />

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-0 border border-border rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-sm font-semibold text-text-primary">{doc.label}</p>
            <p className="text-xs text-text-muted mt-0.5">{doc.description}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          {!selectedFile ? (
            /* Drop zone */
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                dragging
                  ? 'border-brand-gold bg-brand-gold/5'
                  : 'border-border hover:border-brand-gold/50 hover:bg-surface-1',
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
              <Upload className="h-8 w-8 text-text-muted mx-auto mb-3" />
              <p className="text-sm font-medium text-text-primary mb-1">Drop your file here</p>
              <p className="text-xs text-text-muted">or click to browse</p>
              <p className="text-xs text-text-muted mt-3">PDF, JPG, PNG — max 5 MB</p>
            </div>
          ) : done ? (
            /* Success */
            <div className="text-center py-6">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
              <p className="text-sm font-semibold text-text-primary">Uploaded successfully!</p>
              <p className="text-xs text-text-muted mt-1">Sent for review. You'll be notified within 1–2 days.</p>
            </div>
          ) : (
            /* File preview + upload */
            <div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-1 border border-border mb-4">
                {fileIcon}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{selectedFile.name}</p>
                  <p className="text-xs text-text-muted">{(selectedFile.size / 1024).toFixed(0)} KB · {selectedFile.type || 'document'}</p>
                </div>
                {!uploading && (
                  <button onClick={() => setSelectedFile(null)} className="p-1 rounded text-text-muted hover:text-error transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {uploading && (
                <div className="mb-4 text-xs text-text-muted">Uploading document to S3…</div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedFile(null)} disabled={uploading}>
                  Choose different file
                </Button>
                <Button size="sm" className="flex-1" onClick={simulateUpload} disabled={uploading}>
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? 'Uploading…' : 'Submit document'}
                </Button>
              </div>
              {error && <p className="text-xs text-error mt-2">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── View document button (fetches presigned URL, opens in new tab) ──────────
function ViewDocButton({ docUrl, label }: { docUrl: string; label: string }) {
  const [loading, setLoading] = useState(false)

  const handleView = async () => {
    setLoading(true)
    try {
      const signedUrl = await getSignedDocUrl(docUrl)
      window.open(signedUrl, '_blank', 'noopener,noreferrer')
    } catch {
      alert('Could not open document. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleView} disabled={loading}>
      {loading ? <Spinner size="sm" /> : <Eye className="h-3.5 w-3.5" />}
      View
    </Button>
  )
}

// ─── Status config ─────────────────────────────────────────────────────────────
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
function DocRow({ doc, onUploadClick }: { doc: KYCDocument; onUploadClick: (doc: KYCDocument) => void }) {
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
            {doc.required && <span className="text-xs text-error">Required</span>}
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
            <p className="text-xs text-text-muted mb-3">
              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              {doc.reviewedAt && ` · Reviewed: ${new Date(doc.reviewedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`}
            </p>
          )}

          <div className="flex items-center gap-2">
            {(doc.status === 'not_uploaded' || doc.status === 'rejected') && (
              <Button size="sm" className="flex items-center gap-2" onClick={() => onUploadClick(doc)}>
                <Upload className="h-3.5 w-3.5" />
                {doc.status === 'rejected' ? 'Re-upload document' : 'Upload document'}
              </Button>
            )}
            {doc.status === 'approved' && (
              <Button variant="outline" size="sm" onClick={() => onUploadClick(doc)}>
                <RefreshCw className="h-3.5 w-3.5" /> Replace document
              </Button>
            )}
            {doc.status === 'under_review' && (
              <p className="text-xs text-info">Document is under review. You will be notified once approved.</p>
            )}
            {doc.docUrl && doc.status !== 'not_uploaded' && (
              <ViewDocButton docUrl={doc.docUrl} label={doc.label} />
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
  const [uploadTarget, setUploadTarget] = useState<KYCDocument | null>(null)
  const { data: docs = [], isLoading } = useKycDocs()
  const { mutateAsync: submitKycDoc } = useSubmitKycDoc()

  const requiredDocs = docs.filter((d) => d.required)
  const optionalDocs = docs.filter((d) => !d.required)

  const handleUploaded = async (_docId: string, _file: File, publicUrl: string) => {
    if (!uploadTarget) return
    await submitKycDoc({ type: uploadTarget.type, docUrl: publicUrl })
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {uploadTarget && (
        <UploadModal
          doc={uploadTarget}
          onClose={() => setUploadTarget(null)}
          onUploaded={(id, file, url) => { handleUploaded(id, file, url); setUploadTarget(null) }}
        />
      )}
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
                  <div className="text-xs text-text-muted mt-0.5">{cfg.label}</div>
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
          <DocRow key={doc.id} doc={doc} onUploadClick={setUploadTarget} />
        ))}
      </div>

      {/* Optional documents */}
      <h2 className="text-sm font-semibold text-text-primary mb-3">Optional documents</h2>
      <div className="flex flex-col gap-3 mb-6">
        {optionalDocs.map((doc) => (
          <DocRow key={doc.id} doc={doc} onUploadClick={setUploadTarget} />
        ))}
      </div>

      {/* Uploaded documents table */}
      {docs.some((d) => d.docUrl) && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-gold" />
              Your uploaded documents
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-text-muted pb-2 pr-4">Document</th>
                    <th className="text-left text-xs font-semibold text-text-muted pb-2 pr-4">Status</th>
                    <th className="text-left text-xs font-semibold text-text-muted pb-2 pr-4">Uploaded</th>
                    <th className="text-left text-xs font-semibold text-text-muted pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {docs.filter((d) => d.docUrl).map((doc) => {
                    const cfg = statusConfig[doc.status]
                    return (
                      <tr key={doc.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-text-muted shrink-0" />
                            <span className="text-text-primary font-medium">{doc.label}</span>
                            {doc.required && <span className="text-[10px] text-error font-semibold">Required</span>}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={cn('flex items-center gap-1.5 text-xs font-medium', cfg.color)}>
                            {cfg.icon} {cfg.label}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-text-muted">
                          {doc.uploadedAt
                            ? new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="py-3">
                          <ViewDocButton docUrl={doc.docUrl!} label={doc.label} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

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


