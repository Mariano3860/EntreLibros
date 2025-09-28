import { Messages } from '@components/messages/Messages'
import { describe, expect, test, vi } from 'vitest'

import { renderWithProviders } from '../../test-utils'

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
    expect(getByText(/desconectado/i)).toBeInTheDocument()
    expect(getByPlaceholderText('Escribe un mensaje...')).toBeDisabled()
  })
})
