import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import type { ApiNotification } from '@src/api/notifications/notifications'
import { NotificationBell } from '@src/components/notifications/NotificationBell'

import { renderWithProviders } from '../../test-utils'

const {
  navigateMock,
  markReadMock,
  useAuthMock,
  useNotificationsMock,
  useNotificationPreferenceMock,
} = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  markReadMock: { mutate: vi.fn() },
  useAuthMock: vi.fn(),
  useNotificationsMock: vi.fn(),
  useNotificationPreferenceMock: vi.fn(),
}))

vi.mock('@src/contexts/auth/AuthContext', async () => {
  const actual = await vi.importActual<
    typeof import('@src/contexts/auth/AuthContext')
  >('@src/contexts/auth/AuthContext')
  return { ...actual, useAuth: () => useAuthMock() }
})

vi.mock('@hooks/api/useNotifications', () => ({
  useNotifications: () => useNotificationsMock(),
  useNotificationPreference: () => useNotificationPreferenceMock(),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

const notification = (
  id: number,
  conversationId: number,
  createdAt: string
): ApiNotification => ({
  id,
  kind: 'message',
  entityId: String(conversationId),
  titleKey: 'notifications.message.title',
  bodyKey: 'notifications.message.body',
  data: { conversationId, senderName: 'Mariano' },
  readAt: null,
  createdAt,
})

const agreementNotification: ApiNotification = {
  id: 4,
  kind: 'agreement',
  entityId: '22',
  titleKey: 'notifications.agreement.title',
  bodyKey: 'notifications.agreement.body',
  data: { agreementId: 22, conversationId: 12, participantName: 'Ana' },
  readAt: null,
  createdAt: '2026-08-29T10:03:00.000Z',
}

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthMock.mockReturnValue({ isAuthenticated: true })
    useNotificationsMock.mockReturnValue({
      data: [],
      markRead: markReadMock,
    })
    useNotificationPreferenceMock.mockReturnValue({ data: true })
  })

  test('does not render when there are no unread messages', () => {
    renderWithProviders(<NotificationBell />)

    expect(
      screen.queryByRole('button', { name: /notifications.open/ })
    ).toBeNull()
  })

  test('does not render when in-app notifications are disabled', () => {
    useNotificationPreferenceMock.mockReturnValue({ data: false })
    useNotificationsMock.mockReturnValue({
      data: [notification(1, 10, '2026-08-29T10:00:00.000Z')],
      markRead: markReadMock,
    })

    renderWithProviders(<NotificationBell />)

    expect(
      screen.queryByRole('button', { name: /notifications.open/ })
    ).toBeNull()
  })

  test('groups messages and opens the selected conversation', () => {
    useNotificationsMock.mockReturnValue({
      data: [
        notification(1, 10, '2026-08-29T10:00:00.000Z'),
        notification(2, 10, '2026-08-29T10:01:00.000Z'),
        notification(3, 11, '2026-08-29T10:02:00.000Z'),
      ],
      markRead: markReadMock,
    })

    renderWithProviders(<NotificationBell />)

    const trigger = screen.getByRole('button', { name: /notifications.open/ })
    expect(trigger).toHaveTextContent('3')
    fireEvent.click(trigger)

    expect(
      screen.getByRole('button', {
        name: 'notifications.message.multipleFrom',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'notifications.message.from',
      })
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'notifications.message.multipleFrom',
      })
    )
    expect(markReadMock.mutate).toHaveBeenCalledWith(1)
    expect(markReadMock.mutate).toHaveBeenCalledWith(2)
    expect(navigateMock).toHaveBeenCalledWith('/messages', {
      state: { conversationId: 10 },
    })
  })

  test('shows agreement notifications and opens their conversation', () => {
    useNotificationsMock.mockReturnValue({
      data: [agreementNotification],
      markRead: markReadMock,
    })

    renderWithProviders(<NotificationBell />)

    fireEvent.click(screen.getByRole('button', { name: /notifications.open/ }))
    fireEvent.click(
      screen.getByRole('button', {
        name: 'notifications.agreement.confirmedWith',
      })
    )

    expect(markReadMock.mutate).toHaveBeenCalledWith(4)
    expect(navigateMock).toHaveBeenCalledWith('/messages', {
      state: { conversationId: 12 },
    })
  })
})
