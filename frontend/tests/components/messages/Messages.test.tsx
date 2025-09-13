import { Messages } from '@components/messages/Messages'
import { renderWithProviders } from '../../test-utils'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@hooks/socket/useChatSocket', () => ({
  useChatSocket: () => ({
    messages: [],
    sendMessage: vi.fn(),
    currentUser: { id: 1, name: 'Me' },
    isConnected: false,
    error: 'fail',
  }),
}))

describe('Messages component', () => {
  test('shows offline state and disables input', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <Messages />
    )
    expect(getByText(/disconnected/i)).toBeInTheDocument()
    expect(getByPlaceholderText('Message...')).toBeDisabled()
  })
})
