import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/services/notificationService'

export function useNotifications() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => fetchNotifications(user!.id),
    enabled: !!user?.id,
    refetchInterval: 30_000,  // poll every 30s until realtime is wired
  })
}

export function useMarkRead() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] }),
  })
}

export function useMarkAllRead() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  return useMutation({
    mutationFn: () => markAllNotificationsRead(user!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] }),
  })
}
