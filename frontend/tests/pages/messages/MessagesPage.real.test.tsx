import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  fetchConversations: vi.fn(),
  fetchMessageHistory: vi.fn(),
  fetchUserBooks: vi.fn(),
  sendPersistedMessage: vi.fn(),
  fetchAgreement: vi.fn(),
  markMessagesRead: vi.fn(),
  joinConversation: vi.fn(),
}))

vi.mock('@src/utils/runtimeEnv', () => ({ isApiMockMode: () => false }))
vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockResolvedValue({ id: 7, name: 'Mariano' }),
}))
vi.mock('@src/api/messages/messages', () => ({
  fetchConversations: mocks.fetchConversations,
  fetchMessageHistory: mocks.fetchMessageHistory,
  sendPersistedMessage: mocks.sendPersistedMessage,
  markMessagesRead: mocks.markMessagesRead,
}))
vi.mock('@api/messages/messages', () => ({
  fetchConversations: mocks.fetchConversations,
  fetchMessageHistory: mocks.fetchMessageHistory,
  sendPersistedMessage: mocks.sendPersistedMessage,
  markMessagesRead: mocks.markMessagesRead,
}))
vi.mock('@src/api/books/userBooks.service', () => ({
  fetchUserBooks: mocks.fetchUserBooks,
}))
vi.mock('@api/books/userBooks.service', () => ({
  fetchUserBooks: mocks.fetchUserBooks,
}))
vi.mock('@src/api/agreements/agreements', () => ({
  fetchAgreement: mocks.fetchAgreement,
  commandAgreement: vi.fn(),
}))
vi.mock('@api/agreements/agreements', () => ({
  fetchAgreement: mocks.fetchAgreement,
  commandAgreement: vi.fn(),
}))
vi.mock('@src/hooks/socket/useChatSocket', () => ({
  useChatSocket: () => ({
    conversationMessages: [],
    joinConversation: mocks.joinConversation,
    isConnected: false,
  }),
}))

import { MessagesPage } from '@src/pages/messages/MessagesPage'
import styles from '@src/pages/messages/MessagesPage.module.scss'

import { renderWithProviders } from '../../test-utils'

const conversation = {
  id: 11,
  isBot: false,
  participantIds: [7, 8],
  agreementId: null,
  lastMessageSequence: 0,
  updatedAt: '2026-08-31T10:00:00.000Z',
  participantName: 'Lucia',
}

const book = {
  id: 'book-1',
  title: 'Ecos del Viento Norte',
  author: 'Clara Montiel',
  coverUrl: '/prototype/book-cover.svg',
}

describe('MessagesPage in real API mode', () => {
  beforeEach(() => {
    mocks.fetchConversations.mockReset()
    mocks.fetchMessageHistory.mockReset()
    mocks.fetchUserBooks.mockReset()
    mocks.sendPersistedMessage.mockReset()
    mocks.fetchAgreement.mockReset()
    mocks.markMessagesRead.mockReset()
    mocks.joinConversation.mockReset()
    mocks.fetchAgreement.mockResolvedValue(null)
    mocks.markMessagesRead.mockResolvedValue(undefined)
  })

  test('keeps the conversation loading error inside both message regions', async () => {
    mocks.fetchConversations.mockRejectedValue(new Error('offline'))

    renderWithProviders(<MessagesPage />)

    const alerts = await screen.findAllByRole('alert')
    const chatAlert = alerts.find((alert) =>
      alert.textContent?.includes('No pudimos cargar tus mensajes.')
    )

    expect(chatAlert).toBeDefined()
    expect(chatAlert).toHaveClass(styles.messageState, styles.errorState)
    expect(screen.getAllByRole('button', { name: 'Reintentar' })).toHaveLength(
      2
    )
  })

  test('shows attachment errors in the book picker', async () => {
    mocks.fetchConversations.mockResolvedValue([conversation])
    mocks.fetchMessageHistory.mockResolvedValue({ messages: [], nextAfter: 0 })
    mocks.fetchUserBooks.mockResolvedValue([book])
    mocks.sendPersistedMessage.mockRejectedValue(new Error('unauthorized'))

    renderWithProviders(<MessagesPage />)

    expect(await screen.findByText('Lucia')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Adjuntar libro' }))
    fireEvent.click(
      await screen.findByRole('button', { name: /Ecos del Viento Norte/ })
    )
    expect(mocks.sendPersistedMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: conversation.id,
        attachmentMetadata: expect.objectContaining({ bookId: book.id }),
      })
    )
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/No pudimos adjuntar este libro/)
    expect(alert).toHaveClass(styles.bookPickerError)
    expect(screen.getByText('Elegí un libro')).toBeVisible()
  })

  test('centers the history error and offers a retry', async () => {
    mocks.fetchConversations.mockResolvedValue([conversation])
    mocks.fetchMessageHistory.mockRejectedValue(new Error('offline'))

    renderWithProviders(<MessagesPage />)

    await screen.findByText('Lucia')
    await waitFor(() => expect(mocks.fetchMessageHistory).toHaveBeenCalled())
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/No pudimos cargar los mensajes/)
    expect(alert).toHaveClass(styles.messageState, styles.errorState)
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeVisible()
  })

  test('opens a compact new conversation modal with clear actions', async () => {
    mocks.fetchConversations.mockResolvedValue([conversation])
    mocks.fetchMessageHistory.mockResolvedValue({ messages: [], nextAfter: 0 })

    renderWithProviders(<MessagesPage />)

    fireEvent.click(
      await screen.findByRole('button', { name: 'Redactar mensaje' })
    )

    const dialog = screen.getByRole('dialog', {
      name: '¿Con quién querés hablar?',
    })
    expect(dialog).toHaveClass(styles.newConversationDialog)
    expect(
      screen.getByText(
        'Iniciá una conversación nueva con alguien de la comunidad.'
      )
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Iniciar conversación' })
    ).toBeDisabled()

    const userIdInput = screen.getByLabelText('ID de usuario')
    expect(userIdInput).toHaveAttribute('placeholder', 'Ej. 42')
    fireEvent.change(userIdInput, { target: { value: '42' } })
    expect(
      screen.getByRole('button', { name: 'Iniciar conversación' })
    ).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
