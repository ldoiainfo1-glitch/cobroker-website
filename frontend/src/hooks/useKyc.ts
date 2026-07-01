import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { fetchKycDocs, submitKycDoc } from '@/services/kycService'
import type { KYCDocType } from '@/types'

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
