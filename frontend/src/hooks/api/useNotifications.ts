import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchNotifications,
  markNotificationRead,
  type ApiNotification,
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
    onMutate: async (id) => {
      await client.cancelQueries({ queryKey: notificationKeys.all })
      const previous = client.getQueryData<ApiNotification[]>(
        notificationKeys.all
      )
      client.setQueryData<ApiNotification[]>(notificationKeys.all, (current) =>
        current?.map((notification) =>
          notification.id === id
            ? { ...notification, readAt: new Date().toISOString() }
            : notification
        )
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        client.setQueryData(notificationKeys.all, context.previous)
      }
    },
    onSettled: () => {
      void client.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
  return { ...query, markRead }
}
