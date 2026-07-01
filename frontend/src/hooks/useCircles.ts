import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { fetchCircles, joinCircle, leaveCircle } from '@/services/circleService'

export function useCircles() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['circles', user?.id],
    queryFn: () => fetchCircles(user?.id ?? undefined),
    staleTime: 120_000,
  })
}

export function useJoinCircle() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  return useMutation({
    mutationFn: (circleId: string) => joinCircle(circleId, user!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['circles'] }),
  })
}

export function useLeaveCircle() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  return useMutation({
    mutationFn: (circleId: string) => leaveCircle(circleId, user!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['circles'] }),
  })
}
