import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const { fetchConversationsMock, isApiMockModeMock, useAuthMock } = vi.hoisted(
  () => ({
    fetchConversationsMock: vi.fn(),
    isApiMockModeMock: vi.fn(),
    useAuthMock: vi.fn(),
  })
)

vi.mock('@contexts/auth/AuthContext', async () => {
  const actual = await vi.importActual<
    typeof import('@src/contexts/auth/AuthContext')
  >('@src/contexts/auth/AuthContext')
  return { ...actual, useAuth: () => useAuthMock() }
})

vi.mock('@api/messages/messages', async () => {
  const actual = await vi.importActual<
    typeof import('@src/api/messages/messages')
  >('@src/api/messages/messages')
  return { ...actual, fetchConversations: fetchConversationsMock }
})

vi.mock('@utils/runtimeEnv', () => ({
  isApiMockMode: () => isApiMockModeMock(),
}))

import { messageQueryKeys } from '@api/messages/messages'
import { Sidebar } from '@src/components/sidebar/Sidebar'

import { renderWithProviders } from '../../test-utils'

const conversation = (unreadCount: number) => ({
  id: 12,
  isBot: false,
  participantIds: [7, 8],
  agreementId: null,
  lastMessageSequence: 4,
  updatedAt: '2026-09-02T10:00:00.000Z',
  participantName: 'Lucia',
  unreadCount,
})

describe('Sidebar unread messages indicator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isApiMockModeMock.mockReturnValue(false)
    useAuthMock.mockReturnValue({ isAuthenticated: true })
  })

  test('shows the indicator from the unread conversation count', async () => {
    fetchConversationsMock.mockResolvedValue([conversation(2)])

    renderWithProviders(<Sidebar />)

    expect(
      await screen.findByLabelText('community.messages.badges.unread')
    ).toBeInTheDocument()
  })

  test('removes the indicator when the conversation query is reconciled', async () => {
    fetchConversationsMock.mockResolvedValue([conversation(2)])

    const { queryClient } = renderWithProviders(<Sidebar />)
    await screen.findByLabelText('community.messages.badges.unread')

    queryClient.setQueryData(messageQueryKeys.conversations(), [
      conversation(0),
    ])

    await waitFor(() => {
      expect(
        screen.queryByLabelText('community.messages.badges.unread')
      ).not.toBeInTheDocument()
    })
  })

  test('uses the shared mock conversation state', async () => {
    isApiMockModeMock.mockReturnValue(true)

    renderWithProviders(<Sidebar />)

    expect(
      await screen.findByLabelText('community.messages.badges.unread')
    ).toBeInTheDocument()
    expect(fetchConversationsMock).not.toHaveBeenCalled()
  })
})
