import { describe, expect, test, vi } from 'vitest'

const { get, patch } = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
}))

vi.mock('@src/api/axios', () => ({ apiClient: { get, patch } }))

import {
  fetchNotificationPreference,
  fetchNotifications,
  markNotificationRead,
  updateNotificationPreference,
} from '@src/api/notifications/notifications'

describe('notification service', () => {
  test('loads notifications and reads their payload', async () => {
    const notifications = [
      {
        id: 4,
        kind: 'message' as const,
        entityId: 'message-4',
        titleKey: 'notifications.message.title',
        bodyKey: 'notifications.message.body',
        data: {},
        readAt: null,
        createdAt: '2026-09-07T12:00:00.000Z',
      },
    ]
    get.mockResolvedValueOnce({ data: { notifications } })

    await expect(fetchNotifications()).resolves.toEqual(notifications)
    expect(get).toHaveBeenCalledWith('/notifications')
  })

  test('marks a notification as read', async () => {
    patch.mockResolvedValueOnce({})

    await expect(markNotificationRead(4)).resolves.toBeUndefined()
    expect(patch).toHaveBeenCalledWith('/notifications/4/read')
  })

  test('loads and updates the in-app preference', async () => {
    get.mockResolvedValueOnce({ data: { inAppEnabled: false } })
    patch.mockResolvedValueOnce({ data: { inAppEnabled: true } })

    await expect(fetchNotificationPreference()).resolves.toBe(false)
    await expect(updateNotificationPreference(true)).resolves.toBe(true)
    expect(get).toHaveBeenCalledWith('/notifications/preferences')
    expect(patch).toHaveBeenCalledWith('/notifications/preferences', {
      inAppEnabled: true,
    })
  })
})
