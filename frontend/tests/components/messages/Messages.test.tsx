import { fireEvent, screen } from '@testing-library/react'
import { Messages } from '@components/messages/Messages'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { renderWithProviders } from '../../test-utils'

const useChatSocketMock = vi.hoisted(() => vi.fn())

vi.mock('@hooks/socket/useChatSocket', () => ({
  useChatSocket: () => useChatSocketMock(),
}))

describe('Messages component', () => {
  beforeEach(() => {
    useChatSocketMock.mockReset()
  })

  test('shows offline state and disables input', () => {
    useChatSocketMock.mockReturnValue({
      messages: [],
      sendMessage: vi.fn(),
      currentUser: { id: 1, name: 'Me' },
      isConnected: false,
      error: 'fail',
    })

    renderWithProviders(<Messages />)

    expect(screen.getByText(/desconectado/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Escribe un mensaje...')).toBeDisabled()
  })

  test('renders selected conversation and sends new messages', () => {
    const sendMessage = vi.fn()
    const now = new Date('2025-03-18T12:00:00Z').toISOString()
    useChatSocketMock.mockReturnValue({
      messages: [
        {
          text: 'Mensaje en vivo',
          user: { id: 2, name: 'Samuel' },
          timestamp: now,
          channel: 'Samuel',
        },
      ],
      sendMessage,
      currentUser: { id: 1, name: 'Me' },
      isConnected: true,
      error: null,
    })

    renderWithProviders(<Messages />)

    const conversationItems = screen.getAllByRole('listitem')
    expect(screen.queryByText('Mensaje en vivo')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Samuel'))
    expect(conversationItems[1].className).toContain('conversationItemActive')
    expect(screen.getByText('Mensaje en vivo')).toBeInTheDocument()

    const input = screen.getByPlaceholderText('Escribe un mensaje...')
    fireEvent.change(input, { target: { value: 'Hola Bot' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(sendMessage).toHaveBeenCalledWith('Hola Bot', 'Samuel')
    expect(input).toHaveValue('')
  })
})
