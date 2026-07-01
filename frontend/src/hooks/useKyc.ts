import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import {
  fetchKycDocs, submitKycDoc, fetchAllKycDocs, updateKycDocStatus,
} from '@/services/kycService'
import type { KYCDocType, KYCDocStatus } from '@/types'

export function useKycDocs() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['kyc', user?.id],
    queryFn: () => fetchKycDocs(user!.id),
    enabled: !!user?.id,
  })
}

export function useSubmitKycDoc() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  return useMutation({
    mutationFn: ({ type, docUrl }: { type: KYCDocType; docUrl: string }) =>
      submitKycDoc(user!.id, type, docUrl),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kyc', user?.id] }),
  })
}

// ─── Admin hooks ──────────────────────────────────────────────────────────────

export function useAdminKycDocs() {
  return useQuery({
    queryKey: ['kyc', 'admin', 'all'],
    queryFn: fetchAllKycDocs,
    staleTime: 30_000,
  })
}

export function useUpdateKycDocStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ docId, status, notes }: { docId: string; status: KYCDocStatus; notes?: string }) =>
      updateKycDocStatus(docId, status, notes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kyc', 'admin', 'all'] }),
  })
}
