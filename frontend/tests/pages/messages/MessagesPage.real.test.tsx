import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  fetchConversations: vi.fn(),
  fetchMessageHistory: vi.fn(),
  fetchConversationBooks: vi.fn(),
  sendPersistedMessage: vi.fn(),
  fetchAgreement: vi.fn(),
  createAgreement: vi.fn(),
  commandAgreement: vi.fn(),
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
  fetchConversationBooks: mocks.fetchConversationBooks,
  sendPersistedMessage: mocks.sendPersistedMessage,
  markMessagesRead: mocks.markMessagesRead,
}))
vi.mock('@api/messages/messages', () => ({
  fetchConversations: mocks.fetchConversations,
  fetchMessageHistory: mocks.fetchMessageHistory,
  fetchConversationBooks: mocks.fetchConversationBooks,
  sendPersistedMessage: mocks.sendPersistedMessage,
  markMessagesRead: mocks.markMessagesRead,
}))
vi.mock('@src/api/agreements/agreements', () => ({
  fetchAgreement: mocks.fetchAgreement,
  createAgreement: mocks.createAgreement,
  commandAgreement: mocks.commandAgreement,
}))
vi.mock('@api/agreements/agreements', () => ({
  fetchAgreement: mocks.fetchAgreement,
  createAgreement: mocks.createAgreement,
  commandAgreement: mocks.commandAgreement,
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
    mocks.fetchConversationBooks.mockReset()
    mocks.sendPersistedMessage.mockReset()
    mocks.fetchAgreement.mockReset()
    mocks.createAgreement.mockReset()
    mocks.commandAgreement.mockReset()
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
    mocks.fetchConversationBooks.mockResolvedValue({
      myBooks: [book],
      theirBooks: [],
    })
    mocks.sendPersistedMessage.mockRejectedValue(new Error('unauthorized'))

    renderWithProviders(<MessagesPage />)

    expect(await screen.findByText('Lucia')).toBeVisible()
    fireEvent.click(
      screen.getByRole('button', { name: 'Más opciones de mensaje' })
    )
    fireEvent.click(screen.getByRole('menuitem', { name: 'Adjuntar libro' }))
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

  test('renders a persisted book attachment after loading the history', async () => {
    mocks.fetchConversations.mockResolvedValue([conversation])
    mocks.fetchMessageHistory.mockResolvedValue({
      messages: [
        {
          id: 18,
          conversationId: conversation.id,
          senderId: 8,
          sequence: 1,
          clientKey: 'book-history',
          body: book.title,
          attachmentMetadata: {
            key: `book:${book.id}`,
            contentType: 'application/x-entrelibros-book',
            size: 1,
            kind: 'book',
            bookId: book.id,
            title: book.title,
            author: book.author,
            coverUrl: book.coverUrl,
          },
          createdAt: '2026-08-31T10:00:00.000Z',
        },
      ],
      nextAfter: 1,
    })

    renderWithProviders(<MessagesPage />)

    expect(await screen.findByText('Libro adjunto')).toBeVisible()
    expect(screen.getByText(book.title)).toBeVisible()
  })

  test('inserts an emoji from the composer menu without sending it', async () => {
    mocks.fetchConversations.mockResolvedValue([conversation])
    mocks.fetchMessageHistory.mockResolvedValue({ messages: [], nextAfter: 0 })

    renderWithProviders(<MessagesPage />)

    await screen.findByText('Lucia')
    fireEvent.click(
      screen.getByRole('button', { name: 'Más opciones de mensaje' })
    )
    fireEvent.click(screen.getByRole('menuitem', { name: 'Emoji' }))
    const emojiDialog = await screen.findByRole('dialog', {
      name: 'Elegí un emoji',
    })
    expect(emojiDialog).toBeVisible()

    fireEvent.keyDown(emojiDialog, { key: 'Escape' })
    expect(
      screen.queryByRole('dialog', { name: 'Elegí un emoji' })
    ).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Más opciones de mensaje' })
    )
    fireEvent.click(screen.getByRole('menuitem', { name: 'Emoji' }))

    const input = screen.getByPlaceholderText('Escribí un mensaje...')
    fireEvent.click(screen.getByRole('button', { name: 'Insertar emoji 😀' }))

    expect(input).toHaveValue('😀')
    expect(mocks.sendPersistedMessage).not.toHaveBeenCalled()
  })

  test('allows attaching a book from the other participant', async () => {
    const otherBook = {
      ...book,
      id: 'book-2',
      title: 'El libro de Lucia',
      ownerId: 8,
    }
    mocks.fetchConversations.mockResolvedValue([conversation])
    mocks.fetchMessageHistory.mockResolvedValue({ messages: [], nextAfter: 0 })
    mocks.fetchConversationBooks.mockResolvedValue({
      myBooks: [book],
      theirBooks: [otherBook],
    })
    mocks.sendPersistedMessage.mockResolvedValue({})

    renderWithProviders(<MessagesPage />)

    await screen.findByText('Lucia')
    fireEvent.click(
      screen.getByRole('button', { name: 'Más opciones de mensaje' })
    )
    fireEvent.click(screen.getByRole('menuitem', { name: 'Adjuntar libro' }))
    expect(await screen.findByText('Mis libros')).toBeVisible()
    expect(screen.getByText('Libros de Lucia')).toBeVisible()
    fireEvent.click(
      await screen.findByRole('button', { name: /El libro de Lucia/ })
    )

    await waitFor(() =>
      expect(mocks.sendPersistedMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: conversation.id,
          body: otherBook.title,
          attachmentMetadata: expect.objectContaining({
            kind: 'book',
            bookId: otherBook.id,
            ownerId: otherBook.ownerId,
          }),
        })
      )
    )
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

  test('renders persisted swap bubbles and sends a proposal from both catalogs', async () => {
    mocks.fetchConversations.mockResolvedValue([conversation])
    mocks.fetchMessageHistory.mockResolvedValue({
      messages: [
        {
          id: 19,
          conversationId: conversation.id,
          senderId: 8,
          sequence: 1,
          clientKey: 'swap-history',
          body: '¿Te interesa?',
          attachmentMetadata: {
            key: 'swap:1:2',
            contentType: 'application/x-entrelibros-swap',
            size: 1,
            kind: 'swap',
            offered: { ...book, ownerId: 7 },
            requested: {
              ...book,
              id: 'book-2',
              title: 'El libro de Lucia',
              ownerId: 8,
            },
          },
          createdAt: '2026-08-31T10:00:00.000Z',
        },
      ],
      nextAfter: 1,
    })
    mocks.fetchConversationBooks.mockResolvedValue({
      myBooks: [book],
      theirBooks: [
        { ...book, id: 'book-2', title: 'El libro de Lucia', ownerId: 8 },
      ],
    })
    mocks.sendPersistedMessage.mockResolvedValue({})

    renderWithProviders(<MessagesPage />)

    expect(await screen.findByText('Propuesta de intercambio')).toBeVisible()
    fireEvent.click(
      screen.getByRole('button', { name: 'Más opciones de mensaje' })
    )
    fireEvent.click(
      screen.getByRole('menuitem', { name: 'Proponer intercambio' })
    )
    expect(await screen.findByRole('dialog')).toBeVisible()
    fireEvent.change(
      await screen.findByRole('combobox', { name: 'Tu libro' }),
      {
        target: { value: book.id },
      }
    )
    fireEvent.change(
      screen.getByRole('combobox', { name: 'Libro que querés recibir' }),
      { target: { value: 'book-2' } }
    )
    fireEvent.click(screen.getByRole('button', { name: 'Enviar propuesta' }))

    await waitFor(() =>
      expect(mocks.sendPersistedMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: conversation.id,
          attachmentMetadata: expect.objectContaining({ kind: 'swap' }),
        })
      )
    )
  })

  test('creates an agreement from the composer menu with the selected book', async () => {
    mocks.fetchConversations.mockResolvedValue([conversation])
    mocks.fetchMessageHistory.mockResolvedValue({ messages: [], nextAfter: 0 })
    mocks.fetchConversationBooks.mockResolvedValue({
      myBooks: [book],
      theirBooks: [],
    })
    mocks.createAgreement.mockResolvedValue({
      id: 21,
      conversationId: conversation.id,
      proposerId: 7,
      participantId: 8,
      state: 'proposed',
      currentVersion: 1,
      details: {
        meetingPoint: 'Biblioteca',
        area: 'Centro',
        date: '2026-09-01',
        time: '18:00',
        bookTitle: book.title,
      },
      acceptances: [],
      listingIds: [1],
    })

    renderWithProviders(<MessagesPage />)
    await screen.findByText('Lucia')
    fireEvent.click(
      screen.getByRole('button', { name: 'Más opciones de mensaje' })
    )
    fireEvent.click(screen.getByRole('menuitem', { name: 'Preparar acuerdo' }))
    expect(await screen.findByRole('dialog')).toBeVisible()
    expect(
      await screen.findByRole('option', { name: book.title })
    ).toBeVisible()
    fireEvent.change(
      screen.getByRole('combobox', { name: 'Libro del acuerdo' }),
      {
        target: { value: book.title },
      }
    )
    fireEvent.change(screen.getByPlaceholderText('Ej. Café de la esquina'), {
      target: { value: 'Biblioteca' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ej. Palermo'), {
      target: { value: 'Centro' },
    })
    fireEvent.change(screen.getByLabelText('Fecha'), {
      target: { value: '2026-09-01' },
    })
    fireEvent.change(screen.getByLabelText('Hora'), {
      target: { value: '18:00' },
    })
    expect(
      screen.getByRole('combobox', { name: 'Libro del acuerdo' })
    ).toHaveValue(book.title)
    expect(
      screen.getByRole('textbox', { name: 'Punto de encuentro' })
    ).toHaveValue('Biblioteca')
    expect(screen.getByRole('textbox', { name: 'Zona' })).toHaveValue('Centro')
    expect(screen.getByLabelText('Fecha')).toHaveValue('2026-09-01')
    expect(screen.getByLabelText('Hora')).toHaveValue('18:00')
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Crear acuerdo' })
      ).toBeEnabled()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Crear acuerdo' }))

    await waitFor(() =>
      expect(mocks.createAgreement).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: conversation.id,
          participantId: 8,
          details: expect.objectContaining({ bookTitle: book.title }),
        })
      )
    )
  })

  test('renders agreement actions from a persisted agreement message', async () => {
    const agreement = {
      id: 21,
      conversationId: conversation.id,
      proposerId: 7,
      participantId: 8,
      state: 'proposed' as const,
      currentVersion: 1,
      details: {
        meetingPoint: 'Biblioteca',
        area: 'Centro',
        date: '2026-09-01',
        time: '18:00',
        bookTitle: book.title,
      },
      acceptances: [],
      listingIds: [1],
    }
    mocks.fetchConversations.mockResolvedValue([
      { ...conversation, agreementId: agreement.id },
    ])
    mocks.fetchMessageHistory.mockResolvedValue({
      messages: [
        {
          id: 20,
          conversationId: conversation.id,
          senderId: 8,
          sequence: 1,
          clientKey: 'agreement-history',
          body: '',
          attachmentMetadata: {
            key: 'agreement:21:1',
            contentType: 'application/x-entrelibros-agreement',
            size: 1,
            kind: 'agreement',
            agreementId: agreement.id,
            version: 1,
            event: 'proposal',
            details: agreement.details,
            listingIds: agreement.listingIds,
            actorName: 'Lucia',
          },
          createdAt: '2026-08-31T10:00:00.000Z',
        },
      ],
      nextAfter: 1,
    })
    mocks.fetchAgreement.mockResolvedValue(agreement)
    mocks.commandAgreement.mockResolvedValue(agreement)

    renderWithProviders(<MessagesPage />)

    expect(await screen.findByText('Propuesta de acuerdo')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Aceptar' }))
    expect(
      screen.queryByRole('button', { name: 'Cancelar acuerdo' })
    ).not.toBeInTheDocument()
    await waitFor(() =>
      expect(mocks.commandAgreement).toHaveBeenCalledWith({
        agreementId: agreement.id,
        command: 'confirm',
        expectedVersion: agreement.currentVersion,
      })
    )
  })

  test('shows only cancellation for an agreement proposed by the current user', async () => {
    const agreement = {
      id: 22,
      conversationId: conversation.id,
      proposerId: 7,
      participantId: 8,
      state: 'proposed' as const,
      currentVersion: 1,
      details: {
        meetingPoint: 'Biblioteca',
        area: 'Centro',
        date: '2026-09-01',
        time: '18:00',
        bookTitle: book.title,
      },
      acceptances: [],
      listingIds: [1],
    }
    mocks.fetchConversations.mockResolvedValue([
      { ...conversation, agreementId: agreement.id },
    ])
    mocks.fetchMessageHistory.mockResolvedValue({
      messages: [
        {
          id: 21,
          conversationId: conversation.id,
          senderId: 7,
          sequence: 1,
          clientKey: 'own-agreement-history',
          body: '',
          attachmentMetadata: {
            key: 'agreement:22:1',
            contentType: 'application/x-entrelibros-agreement',
            size: 1,
            kind: 'agreement',
            agreementId: agreement.id,
            version: 1,
            event: 'proposal',
            details: agreement.details,
            listingIds: agreement.listingIds,
            actorName: 'Mariano',
          },
          createdAt: '2026-08-31T10:00:00.000Z',
        },
      ],
      nextAfter: 1,
    })
    mocks.fetchAgreement.mockResolvedValue(agreement)
    mocks.commandAgreement.mockResolvedValue(agreement)

    renderWithProviders(<MessagesPage />)

    expect(await screen.findByText('Propuesta de acuerdo')).toBeVisible()
    expect(
      screen.queryByRole('button', { name: 'Aceptar' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Rechazar' })
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar acuerdo' }))
    await waitFor(() =>
      expect(mocks.commandAgreement).toHaveBeenCalledWith({
        agreementId: agreement.id,
        command: 'cancel',
        expectedVersion: agreement.currentVersion,
        reason: 'El acuerdo fue cancelado.',
      })
    )
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
