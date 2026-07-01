import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import {
  fetchMandates, fetchMyMandates, fetchMandate,
  createMandate, updateMandateStatus, deleteMandate, fetchDashboardStats,
  type CreateMandatePayload,
} from '@/services/mandateService'
import type { MarketplaceFilters, MandateStatus } from '@/types'

export function useMarketplaceMandates(filters?: MarketplaceFilters) {
  return useQuery({
    queryKey: ['mandates', 'marketplace', filters],
    queryFn: () => fetchMandates(filters),
    staleTime: 60_000,
  })
}

export function useMyMandates() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['mandates', 'my', user?.id],
    queryFn: () => fetchMyMandates(user!.id),
    enabled: !!user?.id,
  })
}

export function useMandate(id: string) {
  return useQuery({
    queryKey: ['mandates', id],
    queryFn: () => fetchMandate(id),
    enabled: !!id,
  })
}

export function useDashboardStats() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: () => fetchDashboardStats(user!.id),
    enabled: !!user?.id,
    staleTime: 60_000,
  })
}

export function useCreateMandate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateMandatePayload) => createMandate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mandates'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useUpdateMandateStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: MandateStatus }) =>
      updateMandateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mandates'] }),
  })
}

export function useDeleteMandate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMandate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mandates'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
