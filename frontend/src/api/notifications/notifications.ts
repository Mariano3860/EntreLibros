import { apiClient } from '../axios'
import { RELATIVE_API_ROUTES } from '../routes'

export type ApiNotification = {
  id: number
  kind: 'message' | 'agreement'
  entityId: string
  titleKey: string
  bodyKey: string
  data: Record<string, string | number>
  readAt: string | null
  createdAt: string
}

export const notificationKeys = { all: ['notifications'] as const }

export async function fetchNotifications(): Promise<ApiNotification[]> {
  const response = await apiClient.get<{ notifications: ApiNotification[] }>(
    RELATIVE_API_ROUTES.NOTIFICATIONS.LIST
  )
  return response.data.notifications
}

export async function markNotificationRead(id: number): Promise<void> {
  await apiClient.patch(RELATIVE_API_ROUTES.NOTIFICATIONS.READ(id))
}
