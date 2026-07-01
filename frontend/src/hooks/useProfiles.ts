import { useQuery } from '@tanstack/react-query'
import { fetchBrokerById } from '@/services/profileService'

export function useBrokerProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['broker-profile', userId],
    queryFn: () => fetchBrokerById(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 min
  })
}
