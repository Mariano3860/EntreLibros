import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchNotifications,
  markNotificationRead,
  notificationKeys,
} from '@src/api/notifications/notifications'

export const useNotifications = (options?: { enabled?: boolean }) => {
  const client = useQueryClient()
  const query = useQuery({
    queryKey: notificationKeys.all,
    queryFn: fetchNotifications,
    staleTime: 15_000,
    refetchInterval: 15_000,
    enabled: options?.enabled ?? true,
  })
  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
  return { ...query, markRead }
}
