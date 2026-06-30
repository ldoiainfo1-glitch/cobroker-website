import { useState } from 'react'
import {
  Search, CheckCircle2, XCircle, Clock, Eye,
  MoreVertical, X, Download, ZoomIn, FileText,
  AlertCircle, MapPin, Mail,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────
type VerificationStatus = 'verified' | 'pending' | 'under_review' | 'rejected' | 'unverified'
type DocStatus = 'approved' | 'pending' | 'rejected' | 'not_uploaded'

interface KYCDoc {
  id: string
  type: string
  filename: string | null
  uploadedAt: string | null
  status: DocStatus
  note?: string
}

interface AdminCompany {
  id: string; name: string; city: string; state: string
  status: VerificationStatus; membersCount: number
  mandatesCount: number; reraNumber: string
  submittedAt: string; contactEmail: string
  docsSubmitted: number; docsTotal: number
  docs: KYCDoc[]
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const makeDocs = (submitted: number): KYCDoc[] => {
  const types = [
    { id: 'd1', type: 'RERA Certificate' },
    { id: 'd2', type: 'GST Registration' },
    { id: 'd3', type: 'Company PAN Card' },
    { id: 'd4', type: 'Director / Owner ID Proof' },
    { id: 'd5', type: 'Office Address Proof' },
  ]
  return types.map((t, i) => {
    if (i >= submitted) return { ...t, filename: null, uploadedAt: null, status: 'not_uploaded' as DocStatus }
    return {
      ...t,
      filename: `${t.type.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_')}.pdf`,
      uploadedAt: `${28 - i} Jun 2024`,
      status: 'pending' as DocStatus,
    }
  })
}

const MOCK_COMPANIES: AdminCompany[] = [
  { id: 'c1', name: 'Skyline Realty Pvt. Ltd.',   city: 'Mumbai',    state: 'Maharashtra', status: 'verified',     membersCount: 14, mandatesCount: 38,  reraNumber: 'A51800012345',               submittedAt: '12 Jan 2024', contactEmail: 'info@skylinerealty.com', docsSubmitted: 5, docsTotal: 5, docs: makeDocs(5).map((d) => ({ ...d, status: 'approved' as DocStatus })) },
  { id: 'c2', name: 'Prime Properties Pvt. Ltd.',  city: 'Pune',      state: 'Maharashtra', status: 'under_review', membersCount: 6,  mandatesCount: 12,  reraNumber: 'A52100034567',               submittedAt: '28 Jun 2024', contactEmail: 'admin@primeprop.in',     docsSubmitted: 4, docsTotal: 5, docs: makeDocs(4) },
  { id: 'c3', name: 'Horizon Realty Group',        city: 'Chennai',   state: 'Tamil Nadu',  status: 'pending',      membersCount: 9,  mandatesCount: 8,   reraNumber: 'TN/01/2024/1234',            submittedAt: '30 Jun 2024', contactEmail: 'contact@horizonrg.com',  docsSubmitted: 3, docsTotal: 5, docs: makeDocs(3) },
  { id: 'c4', name: 'Skyward Brokers',             city: 'Hyderabad', state: 'Telangana',   status: 'pending',      membersCount: 4,  mandatesCount: 5,   reraNumber: 'P02100002345',               submittedAt: '29 Jun 2024', contactEmail: 'hi@skywardb.com',        docsSubmitted: 2, docsTotal: 5, docs: makeDocs(2) },
  { id: 'c5', name: 'Capital Housing LLP',         city: 'Bengaluru', state: 'Karnataka',   status: 'rejected',     membersCount: 7,  mandatesCount: 0,   reraNumber: 'PRM/KA/RERA/1251/308',       submittedAt: '15 Jun 2024', contactEmail: 'kapil@capitalh.com',     docsSubmitted: 3, docsTotal: 5, docs: makeDocs(3).map((d, i) => ({ ...d, status: (i === 1 ? 'rejected' : d.status) as DocStatus, note: i === 1 ? 'GST number does not match RERA records.' : undefined })) },
  { id: 'c6', name: 'Metro Estates',               city: 'Delhi NCR', state: 'Delhi',       status: 'unverified',   membersCount: 3,  mandatesCount: 2,   reraNumber: '',                           submittedAt: '25 Jun 2024', contactEmail: 'info@metroe.in',         docsSubmitted: 0, docsTotal: 5, docs: makeDocs(0) },
  { id: 'c7', name: 'JLL India',                   city: 'Mumbai',    state: 'Maharashtra', status: 'verified',     membersCount: 45, mandatesCount: 120, reraNumber: 'A51800045678',               submittedAt: '01 Jan 2023', contactEmail: 'india@jll.com',          docsSubmitted: 5, docsTotal: 5, docs: makeDocs(5).map((d) => ({ ...d, status: 'approved' as DocStatus })) },
]

// ── Status configs ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<VerificationStatus, { label: string; style: string; icon: React.ReactNode }> = {
  verified:     { label: 'Verified',      style: 'bg-success/10 text-success border-success/20',   icon: <CheckCircle2 className="h-3 w-3" /> },
  pending:      { label: 'Pending',       style: 'bg-warning/10 text-warning border-warning/20',   icon: <Clock className="h-3 w-3" /> },
  under_review: { label: 'Under Review',  style: 'bg-info/10 text-info border-info/20',             icon: <Clock className="h-3 w-3 animate-pulse" /> },
  rejected:     { label: 'Rejected',      style: 'bg-error/10 text-error border-error/20',         icon: <XCircle className="h-3 w-3" /> },
  unverified:   { label: 'Not submitted', style: 'bg-surface-2 text-text-muted border-border',     icon: null },
}

const DOC_STATUS: Record<DocStatus, { label: string; style: string }> = {
  approved:     { label: 'Approved',     style: 'bg-success/10 text-success border-success/20' },
  pending:      { label: 'Pending',      style: 'bg-warning/10 text-warning border-warning/20' },
  rejected:     { label: 'Rejected',     style: 'bg-error/10 text-error border-error/20' },
  not_uploaded: { label: 'Not uploaded', style: 'bg-surface-2 text-text-muted border-border' },
}

// ── KYC Review Drawer ─────────────────────────────────────────────────────────
function KYCDrawer({ company, onClose, onUpdateCompany }: {
  company: AdminCompany
  onClose: () => void
  onUpdateCompany: (updated: AdminCompany) => void
}) {
  const [docs, setDocs] = useState<KYCDoc[]>(company.docs)
  const [docNotes, setDocNotes] = useState<Record<string, string>>(
    Object.fromEntries(company.docs.map((d) => [d.id, d.note ?? '']))
  )
  const [rejectionReason, setRejectionReason] = useState('')
  const [confirming, setConfirming] = useState<'approve' | 'reject' | null>(null)

  const setDocStatus = (id: string, status: DocStatus) =>
    setDocs((p) => p.map((d) => d.id === id ? { ...d, status, note: docNotes[id] || undefined } : d))

  const isReadOnly = company.status === 'verified'
  const uploadedDocs = docs.filter((d) => d.status !== 'not_uploaded')
  const allApproved = uploadedDocs.length > 0 && uploadedDocs.every((d) => d.status === 'approved')

  const handleFinalDecision = (decision: 'verified' | 'rejected') => {
    onUpdateCompany({ ...company, docs, status: decision, docsSubmitted: uploadedDocs.length })
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-surface-0 border-l border-border z-40 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-sm font-bold text-text-secondary shrink-0">
              {company.name[0]}
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">{company.name}</h2>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-text-muted flex items-center gap-1"><MapPin className="h-3 w-3" />{company.city}</span>
                <span className="text-xs text-text-muted flex items-center gap-1"><Mail className="h-3 w-3" />{company.contactEmail}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 px-5 py-3 bg-surface-1 border-b border-border text-xs text-text-muted shrink-0 flex-wrap">
          <span><span className="font-medium text-text-secondary">RERA:</span> {company.reraNumber || '—'}</span>
          <span><span className="font-medium text-text-secondary">Submitted:</span> {company.submittedAt}</span>
          <span><span className="font-medium text-text-secondary">Members:</span> {company.membersCount}</span>
          <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-medium', STATUS_CONFIG[company.status].style)}>
            {STATUS_CONFIG[company.status].icon} {STATUS_CONFIG[company.status].label}
          </span>
        </div>

        {/* Documents list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
            KYC Documents ({uploadedDocs.length}/{company.docsTotal} uploaded)
          </p>

          {docs.map((doc) => {
            const ds = DOC_STATUS[doc.status]
            const isUploaded = doc.status !== 'not_uploaded'

            return (
              <div key={doc.id} className={cn('rounded-xl border p-4 transition-colors',
                doc.status === 'approved' ? 'border-success/30 bg-success/5' :
                doc.status === 'rejected' ? 'border-error/30 bg-error/5' : 'border-border bg-surface-1')}>
                <div className="flex items-start gap-3">
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', isUploaded ? 'bg-brand-gold/10' : 'bg-surface-2')}>
                    <FileText className={cn('h-4 w-4', isUploaded ? 'text-brand-gold' : 'text-text-muted')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{doc.type}</p>
                        {isUploaded
                          ? <p className="text-xs text-text-muted mt-0.5 truncate">{doc.filename} · {doc.uploadedAt}</p>
                          : <p className="text-xs text-text-muted mt-0.5">Not yet uploaded by company</p>}
                      </div>
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border shrink-0', ds.style)}>
                        {ds.label}
                      </span>
                    </div>

                    {doc.status === 'rejected' && docNotes[doc.id] && (
                      <div className="mt-2 flex items-start gap-1.5">
                        <AlertCircle className="h-3 w-3 text-error shrink-0 mt-0.5" />
                        <p className="text-xs text-error">{docNotes[doc.id]}</p>
                      </div>
                    )}

                    {isUploaded && (
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <button className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary px-2 py-1 rounded-lg border border-border hover:border-brand-gold/40 transition-colors">
                          <ZoomIn className="h-3 w-3" /> Preview
                        </button>
                        <button className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary px-2 py-1 rounded-lg border border-border hover:border-brand-gold/40 transition-colors">
                          <Download className="h-3 w-3" /> Download
                        </button>
                        {!isReadOnly && doc.status !== 'approved' && (
                          <button onClick={() => setDocStatus(doc.id, 'approved')}
                            className="flex items-center gap-1 text-xs text-success bg-success/10 hover:bg-success/20 px-2 py-1 rounded-lg border border-success/20 transition-colors ml-auto">
                            <CheckCircle2 className="h-3 w-3" /> Approve
                          </button>
                        )}
                        {!isReadOnly && doc.status !== 'rejected' && (
                          <button onClick={() => setDocStatus(doc.id, 'rejected')}
                            className={cn('flex items-center gap-1 text-xs text-error bg-error/10 hover:bg-error/20 px-2 py-1 rounded-lg border border-error/20 transition-colors', doc.status === 'approved' && 'ml-auto')}>
                            <XCircle className="h-3 w-3" /> Reject
                          </button>
                        )}
                        {!isReadOnly && doc.status === 'rejected' && (
                          <button onClick={() => setDocStatus(doc.id, 'pending')}
                            className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary px-2 py-1 rounded-lg border border-border transition-colors">
                            ↩ Undo
                          </button>
                        )}
                      </div>
                    )}

                    {!isReadOnly && doc.status === 'rejected' && (
                      <input
                        value={docNotes[doc.id]}
                        onChange={(e) => setDocNotes((p) => ({ ...p, [doc.id]: e.target.value }))}
                        placeholder="Reason for rejection (shown to company)…"
                        className="mt-2 w-full h-8 px-2 text-xs rounded-lg border border-error/30 bg-surface-0 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-error/60"
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer — final decision (hidden for already-verified companies) */}
        <div className="border-t border-border p-5 shrink-0 space-y-3">
          {isReadOnly ? (
            <div className="flex items-center justify-center gap-2 py-2 text-success text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" />
              This company is verified. KYC is read-only.
            </div>
          ) : (
            <>
              {confirming === 'reject' && (
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">
                    Overall rejection reason <span className="text-error">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={2}
                    placeholder="Explain why this company's KYC was rejected…"
                    className="w-full px-3 py-2 rounded-xl border border-error/30 bg-surface-1 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-error/50 resize-none"
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                {confirming === null && (
                  <>
                    <button
                      onClick={() => setConfirming('approve')}
                      disabled={!allApproved}
                      title={!allApproved ? 'Approve all uploaded documents first' : ''}
                      className="flex-1 h-10 rounded-xl bg-success text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-success/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      <CheckCircle2 className="h-4 w-4" /> Approve & Verify
                    </button>
                    <button
                      onClick={() => setConfirming('reject')}
                      className="flex-1 h-10 rounded-xl bg-error/10 text-error border border-error/20 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-error/20 transition-colors">
                      <XCircle className="h-4 w-4" /> Reject KYC
                    </button>
                  </>
                )}

                {confirming === 'approve' && (
                  <>
                    <p className="text-sm text-text-secondary flex-1">Mark as <span className="font-semibold text-success">Verified</span>?</p>
                    <button onClick={() => handleFinalDecision('verified')}
                      className="px-4 h-9 rounded-xl bg-success text-white text-sm font-semibold hover:bg-success/90 transition-colors">
                      Confirm
                    </button>
                    <button onClick={() => setConfirming(null)}
                      className="px-4 h-9 rounded-xl border border-border text-sm text-text-muted hover:bg-surface-2 transition-colors">
                      Cancel
                    </button>
                  </>
                )}

                {confirming === 'reject' && (
                  <>
                    <button
                      onClick={() => rejectionReason.trim() && handleFinalDecision('rejected')}
                      disabled={!rejectionReason.trim()}
                      className="flex-1 h-10 rounded-xl bg-error text-white text-sm font-semibold hover:bg-error/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      Confirm Rejection
                    </button>
                    <button onClick={() => setConfirming(null)}
                      className="px-4 h-10 rounded-xl border border-border text-sm text-text-muted hover:bg-surface-2 transition-colors">
                      Cancel
                    </button>
                  </>
                )}
              </div>

              {!allApproved && confirming === null && uploadedDocs.length > 0 && (
                <p className="text-xs text-text-muted text-center">
                  Approve all {uploadedDocs.length} uploaded documents to enable final approval.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminCompaniesPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<VerificationStatus | 'all'>('all')
  const [companies, setCompanies] = useState<AdminCompany[]>(MOCK_COMPANIES)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [reviewingId, setReviewingId] = useState<string | null>(null)

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase()
    return (!q || c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q))
      && (filterStatus === 'all' || c.status === filterStatus)
  })

  const setStatus = (id: string, status: VerificationStatus) => {
    setCompanies((p) => p.map((c) => c.id === id ? { ...c, status } : c))
    setOpenMenu(null)
  }

  const reviewingCompany = companies.find((c) => c.id === reviewingId) ?? null

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Companies</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {companies.length} companies ·{' '}
            <span className="text-warning font-medium">
              {companies.filter((c) => c.status === 'pending' || c.status === 'under_review').length} awaiting KYC review
            </span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search company, city…"
            className="w-full h-9 pl-8 pr-3 rounded-lg bg-surface-2 border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-gold/40" />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {(['all', 'pending', 'under_review', 'verified', 'rejected', 'unverified'] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize',
                filterStatus === s ? 'bg-brand-gold/10 text-brand-gold' : 'text-text-muted hover:text-text-secondary hover:bg-surface-2')}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-muted font-medium">
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">RERA No.</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Docs</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Members</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3 hidden xl:table-cell">Submitted</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => {
                const cfg = STATUS_CONFIG[c.status]
                return (
                  <tr key={c.id} className="hover:bg-surface-1 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-xs font-bold text-text-secondary shrink-0">
                          {c.name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{c.name}</p>
                          <p className="text-xs text-text-muted">{c.city}, {c.state}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs font-mono text-text-secondary">{c.reraNumber || '—'}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden w-16">
                          <div className="h-full rounded-full bg-brand-gold" style={{ width: `${(c.docsSubmitted / c.docsTotal) * 100}%` }} />
                        </div>
                        <span className="text-xs text-text-muted">{c.docsSubmitted}/{c.docsTotal}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-text-secondary">{c.membersCount}</td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border', cfg.style)}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs text-text-muted">{c.submittedAt}</td>
                    <td className="px-4 py-3 relative">
                      {(c.status === 'pending' || c.status === 'under_review') && (
                        <button onClick={() => setReviewingId(c.id)}
                          className="mr-1 px-2 py-1 text-xs font-medium text-info bg-info/10 border border-info/20 rounded-lg hover:bg-info/20 transition-colors">
                          Review KYC
                        </button>
                      )}
                      {c.status === 'verified' && (
                        <div className="inline-flex items-center gap-1 mr-1">
                          <button onClick={() => setReviewingId(c.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-success bg-success/10 border border-success/20 rounded-lg hover:bg-success/20 transition-colors">
                            <Eye className="h-3 w-3" /> View KYC
                          </button>
                          <button onClick={() => setStatus(c.id, 'rejected')}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-error bg-error/10 border border-error/20 rounded-lg hover:bg-error/20 transition-colors">
                            <XCircle className="h-3 w-3" /> Reject
                          </button>
                        </div>
                      )}
                      {c.status !== 'verified' && (
                        <>
                          <button onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-2 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openMenu === c.id && (
                            <div className="absolute right-4 top-10 z-20 bg-surface-0 border border-border rounded-xl shadow-xl py-1 min-w-40">
                              <button onClick={() => { setReviewingId(c.id); setOpenMenu(null) }}
                                className="w-full text-left px-3 py-2 text-xs text-text-muted hover:bg-surface-1 transition-colors flex items-center gap-1.5">
                                <Eye className="h-3 w-3" /> View KYC Documents
                              </button>
                              <div className="border-t border-border my-1" />
                              {c.status !== 'under_review' && (
                                <button onClick={() => setStatus(c.id, 'under_review')}
                                  className="w-full text-left px-3 py-2 text-xs text-info hover:bg-surface-1 transition-colors flex items-center gap-1.5">
                                  <Clock className="h-3 w-3" /> Mark under review
                                </button>
                              )}
                              {c.status !== 'rejected' && (
                                <button onClick={() => setStatus(c.id, 'rejected')}
                                  className="w-full text-left px-3 py-2 text-xs text-error hover:bg-surface-1 transition-colors flex items-center gap-1.5">
                                  <XCircle className="h-3 w-3" /> Reject
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-muted text-sm">No companies match your search.</div>
          )}
        </div>
      </Card>

      {/* KYC Review drawer */}
      {reviewingCompany && (
        <KYCDrawer
          company={reviewingCompany}
          onClose={() => setReviewingId(null)}
          onUpdateCompany={(updated) => {
            setCompanies((p) => p.map((c) => c.id === updated.id ? updated : c))
            setReviewingId(null)
          }}
        />
      )}
    </div>
  )
}
