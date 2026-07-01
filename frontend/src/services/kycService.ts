import { supabase } from '@/lib/supabase'
import type { KYCDocument, KYCDocType, KYCDocStatus } from '@/types'

// ─── Static config (labels + descriptions don't live in DB) ──────────────────

export const KYC_CONFIG: Record<KYCDocType, { label: string; description: string; required: boolean }> = {
  rera: {
    label: 'RERA Certificate',
    description: 'Individual or company RERA registration certificate',
    required: true,
  },
  gst: {
    label: 'GST Certificate',
    description: 'GST registration certificate of your firm',
    required: false,
  },
  pan: {
    label: 'PAN Card',
    description: 'PAN card of the individual or the company',
    required: true,
  },
  incorporation: {
    label: 'Certificate of Incorporation',
    description: 'MCA-issued certificate (for registered companies)',
    required: false,
  },
  address_proof: {
    label: 'Address Proof',
    description: 'Utility bill, bank statement, or Aadhaar (less than 3 months old)',
    required: true,
  },
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function fetchKycDocs(userId: string): Promise<KYCDocument[]> {
  const { data, error } = await supabase
    .from('kyc_documents')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error

  const byType = Object.fromEntries((data ?? []).map((d) => [d.type, d]))

  return (Object.keys(KYC_CONFIG) as KYCDocType[]).map((type) => {
    const cfg = KYC_CONFIG[type]
    const dbDoc = byType[type]
    return {
      id: dbDoc?.id ?? type,
      type,
      label: cfg.label,
      description: cfg.description,
      required: cfg.required,
      status: (dbDoc?.status as KYCDocument['status']) ?? 'not_uploaded',
      docUrl: dbDoc?.doc_url ?? undefined,
      uploadedAt: dbDoc?.created_at ?? undefined,
      reviewedAt: dbDoc?.reviewed_at ?? undefined,
      rejectionReason: dbDoc?.notes ?? undefined,
    }
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function submitKycDoc(
  userId: string,
  type: KYCDocType,
  docUrl: string,
): Promise<void> {
  // Check if doc already exists for this user + type
  const { data: existing } = await supabase
    .from('kyc_documents')
    .select('id')
    .eq('user_id', userId)
    .eq('type', type)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('kyc_documents')
      .update({ doc_url: docUrl, status: 'pending', notes: null, reviewed_at: null })
      .eq('id', existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('kyc_documents')
      .insert({ user_id: userId, type, doc_url: docUrl, status: 'pending' })
    if (error) throw error
  }
}

// ─── Admin: fetch all KYC documents across all users ─────────────────────────

export interface AdminKYCRow {
  id: string
  userId: string
  userFullName: string
  userEmail: string
  companyName: string
  type: KYCDocType
  label: string
  docUrl: string
  status: KYCDocStatus
  notes: string | null
  createdAt: string
  reviewedAt: string | null
}

export async function fetchAllKycDocs(): Promise<AdminKYCRow[]> {
  const { data, error } = await supabase
    .from('kyc_documents')
    .select('*, user:profiles(full_name, email, company:companies(name))')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((d: any) => ({
    id: d.id,
    userId: d.user_id,
    userFullName: d.user?.full_name ?? 'Unknown',
    userEmail: d.user?.email ?? '',
    companyName: d.user?.company?.name ?? '',
    type: d.type as KYCDocType,
    label: KYC_CONFIG[d.type as KYCDocType]?.label ?? d.type,
    docUrl: d.doc_url,
    status: d.status as KYCDocStatus,
    notes: d.notes,
    createdAt: d.created_at,
    reviewedAt: d.reviewed_at,
  }))
}

export async function updateKycDocStatus(
  docId: string,
  status: KYCDocStatus,
  notes?: string,
): Promise<void> {
  const { error } = await supabase
    .from('kyc_documents')
    .update({ status, notes: notes ?? null, reviewed_at: new Date().toISOString() })
    .eq('id', docId)
  if (error) throw error
}

// ─── Signed URL helper for private documents ─────────────────────────────────

export async function getSignedDocUrl(docUrl: string): Promise<string> {
  try {
    const urlObj = new URL(docUrl)
    const s3Key = urlObj.pathname.slice(1) // strip leading /
    const { data, error } = await supabase.functions.invoke<{ signedUrl: string }>('get-download-url', {
      body: { s3Key },
    })
    if (error || !data?.signedUrl) throw new Error('Could not generate document URL')
    return data.signedUrl
  } catch {
    // Fallback: try the URL directly (works if bucket policy allows it)
    return docUrl
  }
}
