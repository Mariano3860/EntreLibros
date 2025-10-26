import { fireEvent, screen, waitFor, within } from '@testing-library/react'
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
    expect(screen.getByPlaceholderText('Escribí un mensaje...')).toBeDisabled()
  })

  test('renders selected conversation and sends new messages with emoji', async () => {
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

    const textarea = screen.getByPlaceholderText('Escribí un mensaje...')
    fireEvent.change(textarea, { target: { value: 'Hola' } })
    fireEvent.click(screen.getByRole('button', { name: 'Emoji' }))
    const emojiButton = screen.getByRole('button', {
      name: 'Insertar emoji 😀',
    })
    fireEvent.click(emojiButton)
    expect(textarea).toHaveValue('Hola😀')
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith('Hola😀', 'Samuel')
    })
    expect(textarea).toHaveValue('')
    expect(screen.getAllByText('Hola😀').length).toBeGreaterThan(0)
  })

  test('allows attaching a book with contextual note', () => {
    useChatSocketMock.mockReturnValue({
      messages: [],
      sendMessage: vi.fn(),
      currentUser: { id: 1, name: 'Me' },
      isConnected: true,
      error: null,
    })

    renderWithProviders(<Messages />)

    fireEvent.click(screen.getByText('Samuel'))
    fireEvent.click(screen.getByRole('button', { name: 'Adjuntar libro' }))

    const modal = screen.getByRole('dialog', { name: /adjuntar libro/i })
    fireEvent.change(screen.getByLabelText('Elegí un libro'), {
      target: { value: 'me-2' },
    })
    fireEvent.change(screen.getByLabelText('Nota (opcional)'), {
      target: { value: '¡Te va a gustar!' },
    })
    fireEvent.click(within(modal).getByRole('button', { name: 'Adjuntar' }))

    expect(screen.getByText('La Comunidad del Anillo')).toBeInTheDocument()
    expect(screen.getByText('¡Te va a gustar!')).toBeInTheDocument()
  })

  test('creates swap and agreement proposals through modals', () => {
    useChatSocketMock.mockReturnValue({
      messages: [],
      sendMessage: vi.fn(),
      currentUser: { id: 1, name: 'Me' },
      isConnected: true,
      error: null,
    })

    renderWithProviders(<Messages />)

    fireEvent.click(screen.getByText('Samuel'))

    // Swap proposal
    fireEvent.click(screen.getByRole('button', { name: 'Proponer intercambio' }))
    const swapModal = screen.getByRole('dialog', { name: /propuesta de intercambio/i })
    fireEvent.change(within(swapModal).getByLabelText('Mensaje adicional (opcional)'), {
      target: { value: '¿Te parece el viernes?' },
    })
    fireEvent.click(within(swapModal).getByRole('button', { name: 'Enviar propuesta' }))

    expect(screen.getAllByText('Ofrecés')[0]).toBeInTheDocument()
    expect(screen.getByText('¿Te parece el viernes?')).toBeInTheDocument()

    // Agreement proposal
    fireEvent.click(screen.getByRole('button', { name: 'Propuesta de acuerdo' }))
    const agreementModal = screen.getByRole('dialog', { name: /propuesta de acuerdo/i })
    fireEvent.change(within(agreementModal).getByLabelText('Punto de encuentro'), {
      target: { value: 'Biblioteca central' },
    })
    fireEvent.change(within(agreementModal).getByLabelText('Zona o barrio'), {
      target: { value: 'Centro' },
    })
    fireEvent.change(within(agreementModal).getByLabelText('Día sugerido'), {
      target: { value: 'Viernes 14' },
    })
    fireEvent.change(within(agreementModal).getByLabelText('Horario'), {
      target: { value: '18:00' },
    })
    fireEvent.change(within(agreementModal).getByLabelText('Libro a intercambiar'), {
      target: { value: 'me-1' },
    })
    fireEvent.click(within(agreementModal).getByRole('button', { name: 'Enviar propuesta' }))

    expect(
      screen.getByText('Biblioteca central — Centro', { exact: false })
    ).toBeInTheDocument()
    expect(screen.getByText('Viernes 14 · 18:00')).toBeInTheDocument()
  })
})
