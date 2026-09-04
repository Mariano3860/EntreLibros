import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const { mocks, messageQueryKeys } = vi.hoisted(() => ({
  mocks: {
    fetchConversations: vi.fn(),
    fetchMessagingContacts: vi.fn(),
    createConversation: vi.fn(),
    fetchMessageHistory: vi.fn(),
    fetchConversationBooks: vi.fn(),
    sendPersistedMessage: vi.fn(),
    fetchMessageDraft: vi.fn(),
    saveMessageDraft: vi.fn(),
    deleteMessageDraft: vi.fn(),
    sendMessageDraft: vi.fn(),
    fetchAgreement: vi.fn(),
    counterProposeAgreement: vi.fn(),
    createAgreement: vi.fn(),
    commandAgreement: vi.fn(),
    markMessagesRead: vi.fn(),
    joinConversation: vi.fn(),
  },
  messageQueryKeys: {
    all: ['messages'] as const,
    conversations: () => ['messages', 'conversations'] as const,
    contacts: (search = '') => ['messages', 'contacts', search] as const,
    history: (conversationId: number, after = 0) =>
      ['messages', 'history', conversationId, after] as const,
    books: (conversationId: number) =>
      ['messages', 'books', conversationId] as const,
    draft: (conversationId: number) =>
      ['messages', 'draft', conversationId] as const,
  },
}))

vi.mock('@src/utils/runtimeEnv', () => ({ isApiMockMode: () => false }))
vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockResolvedValue({ id: 7, name: 'Mariano' }),
}))
vi.mock('@src/api/messages/messages', () => ({
  fetchConversations: mocks.fetchConversations,
  fetchMessagingContacts: mocks.fetchMessagingContacts,
  createConversation: mocks.createConversation,
  fetchMessageHistory: mocks.fetchMessageHistory,
  fetchConversationBooks: mocks.fetchConversationBooks,
  sendPersistedMessage: mocks.sendPersistedMessage,
  fetchMessageDraft: mocks.fetchMessageDraft,
  saveMessageDraft: mocks.saveMessageDraft,
  deleteMessageDraft: mocks.deleteMessageDraft,
  sendMessageDraft: mocks.sendMessageDraft,
  markMessagesRead: mocks.markMessagesRead,
  messageQueryKeys,
}))
vi.mock('@api/messages/messages', () => ({
  fetchConversations: mocks.fetchConversations,
  fetchMessagingContacts: mocks.fetchMessagingContacts,
  createConversation: mocks.createConversation,
  fetchMessageHistory: mocks.fetchMessageHistory,
  fetchConversationBooks: mocks.fetchConversationBooks,
  sendPersistedMessage: mocks.sendPersistedMessage,
  fetchMessageDraft: mocks.fetchMessageDraft,
  saveMessageDraft: mocks.saveMessageDraft,
  deleteMessageDraft: mocks.deleteMessageDraft,
  sendMessageDraft: mocks.sendMessageDraft,
  markMessagesRead: mocks.markMessagesRead,
  messageQueryKeys,
}))
vi.mock('@src/api/agreements/agreements', () => ({
  fetchAgreement: mocks.fetchAgreement,
  counterProposeAgreement: mocks.counterProposeAgreement,
  createAgreement: mocks.createAgreement,
  commandAgreement: mocks.commandAgreement,
}))
vi.mock('@api/agreements/agreements', () => ({
  fetchAgreement: mocks.fetchAgreement,
  counterProposeAgreement: mocks.counterProposeAgreement,
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
  unreadCount: 0,
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
    mocks.fetchMessagingContacts.mockReset()
    mocks.createConversation.mockReset()
    mocks.fetchMessageHistory.mockReset()
    mocks.fetchConversationBooks.mockReset()
    mocks.sendPersistedMessage.mockReset()
    mocks.fetchMessageDraft.mockReset()
    mocks.saveMessageDraft.mockReset()
    mocks.deleteMessageDraft.mockReset()
    mocks.sendMessageDraft.mockReset()
    mocks.fetchAgreement.mockReset()
    mocks.counterProposeAgreement.mockReset()
    mocks.createAgreement.mockReset()
    mocks.commandAgreement.mockReset()
    mocks.markMessagesRead.mockReset()
    mocks.joinConversation.mockReset()
    mocks.fetchAgreement.mockResolvedValue(null)
    mocks.fetchMessageDraft.mockResolvedValue(null)
    mocks.saveMessageDraft.mockResolvedValue({
      id: 1,
      conversationId: conversation.id,
      authorId: 7,
      body: 'Borrador',
      attachmentMetadata: null,
      revision: 1,
      createdAt: '2026-08-31T10:00:00.000Z',
      updatedAt: '2026-08-31T10:00:00.000Z',
    })
    mocks.deleteMessageDraft.mockResolvedValue(undefined)
    mocks.sendMessageDraft.mockResolvedValue({})
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
    mocks.saveMessageDraft.mockRejectedValue(new Error('unauthorized'))

    renderWithProviders(<MessagesPage />)

    expect(await screen.findByText('Lucia')).toBeVisible()
    fireEvent.click(
      screen.getByRole('button', { name: 'Más opciones de mensaje' })
    )
    fireEvent.click(screen.getByRole('menuitem', { name: 'Adjuntar libro' }))
    fireEvent.click(
      await screen.findByRole('button', { name: /Ecos del Viento Norte/ })
    )
    await waitFor(() =>
      expect(mocks.saveMessageDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: conversation.id,
          attachmentMetadata: expect.objectContaining({ bookId: book.id }),
        })
      )
    )
    const alerts = await screen.findAllByRole('alert')
    const pickerAlert = alerts.find((item) =>
      item.className.includes(styles.bookPickerError)
    )
    expect(pickerAlert).toBeDefined()
    expect(pickerAlert).toHaveTextContent(/No pudimos adjuntar este libro/)
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

  test('sends a persisted draft with its revision and refreshes the history', async () => {
    mocks.fetchConversations.mockResolvedValue([conversation])
    mocks.fetchMessageHistory.mockResolvedValue({ messages: [], nextAfter: 0 })
    mocks.fetchMessageDraft.mockResolvedValue({
      id: 8,
      conversationId: conversation.id,
      authorId: 7,
      body: 'Borrador listo',
      attachmentMetadata: null,
      revision: 3,
      createdAt: '2026-08-31T10:00:00.000Z',
      updatedAt: '2026-08-31T10:01:00.000Z',
    })
    mocks.sendMessageDraft.mockResolvedValue({
      id: 30,
      conversationId: conversation.id,
      senderId: 7,
      sequence: 1,
      clientKey: 'draft-client-1',
      body: 'Borrador listo',
      attachmentMetadata: null,
      createdAt: '2026-08-31T10:02:00.000Z',
    })

    renderWithProviders(<MessagesPage />)

    const draftCard = await screen.findByRole('article', {
      name: 'Borrador: Mensaje',
    })
    fireEvent.click(within(draftCard).getByRole('button', { name: 'Editar' }))
    expect(screen.getByPlaceholderText('Escribí un mensaje...')).toHaveValue(
      'Borrador listo'
    )
    fireEvent.click(within(draftCard).getByRole('button', { name: 'Enviar' }))

    await waitFor(() =>
      expect(mocks.sendMessageDraft).toHaveBeenCalledWith({
        conversationId: conversation.id,
        clientKey: expect.any(String),
        revision: 3,
      })
    )
    expect(mocks.fetchMessageHistory).toHaveBeenCalledWith(conversation.id)
  })

  test('discards a persisted draft using its current revision', async () => {
    mocks.fetchConversations.mockResolvedValue([conversation])
    mocks.fetchMessageHistory.mockResolvedValue({ messages: [], nextAfter: 0 })
    mocks.fetchMessageDraft.mockResolvedValue({
      id: 9,
      conversationId: conversation.id,
      authorId: 7,
      body: 'Borrador descartable',
      attachmentMetadata: null,
      revision: 5,
      createdAt: '2026-08-31T10:00:00.000Z',
      updatedAt: '2026-08-31T10:01:00.000Z',
    })

    renderWithProviders(<MessagesPage />)

    const draftCard = await screen.findByRole('article', {
      name: 'Borrador: Mensaje',
    })
    fireEvent.click(
      within(draftCard).getByRole('button', { name: 'Descartar' })
    )

    await waitFor(() =>
      expect(mocks.deleteMessageDraft).toHaveBeenCalledWith(conversation.id, 5)
    )
    expect(
      screen.queryByRole('article', { name: 'Borrador: Mensaje' })
    ).not.toBeInTheDocument()
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
    expect(mocks.saveMessageDraft).not.toHaveBeenCalled()
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
    mocks.saveMessageDraft.mockResolvedValue({
      id: 1,
      conversationId: conversation.id,
      authorId: 7,
      body: otherBook.title,
      attachmentMetadata: null,
      revision: 1,
      createdAt: '2026-08-31T10:00:00.000Z',
      updatedAt: '2026-08-31T10:00:00.000Z',
    })

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
      expect(mocks.saveMessageDraft).toHaveBeenCalledWith(
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
    mocks.saveMessageDraft.mockResolvedValue({
      id: 1,
      conversationId: conversation.id,
      authorId: 7,
      body: '',
      attachmentMetadata: null,
      revision: 1,
      createdAt: '2026-08-31T10:00:00.000Z',
      updatedAt: '2026-08-31T10:00:00.000Z',
    })

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
      expect(mocks.saveMessageDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: conversation.id,
          attachmentMetadata: expect.objectContaining({ kind: 'swap' }),
        })
      )
    )
  })

  test('creates an agreement from the composer menu with the selected book', async () => {
    const agreementBook = { ...book, id: '1' }
    mocks.fetchConversations.mockResolvedValue([conversation])
    mocks.fetchMessageHistory.mockResolvedValue({ messages: [], nextAfter: 0 })
    mocks.fetchConversationBooks.mockResolvedValue({
      myBooks: [agreementBook],
      theirBooks: [],
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
      screen.getByRole('combobox', { name: 'Libro a intercambiar' }),
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
    fireEvent.change(screen.getByLabelText('Día sugerido'), {
      target: { value: '2026-09-01' },
    })
    fireEvent.change(screen.getByLabelText('Horario'), {
      target: { value: '18:00' },
    })
    expect(
      screen.getByRole('combobox', { name: 'Libro a intercambiar' })
    ).toHaveValue(book.title)
    expect(
      screen.getByRole('textbox', { name: 'Punto de encuentro' })
    ).toHaveValue('Biblioteca')
    expect(screen.getByRole('textbox', { name: 'Zona o barrio' })).toHaveValue(
      'Centro'
    )
    expect(screen.getByLabelText('Día sugerido')).toHaveValue('2026-09-01')
    expect(screen.getByLabelText('Horario')).toHaveValue('18:00')
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Guardar borrador' })
      ).toBeEnabled()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }))

    await waitFor(() =>
      expect(mocks.saveMessageDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: conversation.id,
          body: '',
          attachmentMetadata: expect.objectContaining({
            kind: 'agreementProposal',
            listingIds: [1],
            details: expect.objectContaining({ bookTitle: book.title }),
          }),
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

  test('sends a counterproposal when the conversation already has an active agreement', async () => {
    const agreementBook = { ...book, id: '1' }
    const agreement = {
      id: 23,
      conversationId: conversation.id,
      proposerId: 7,
      participantId: 8,
      state: 'partially_confirmed' as const,
      currentVersion: 2,
      details: {
        meetingPoint: 'Plaza central',
        area: 'Centro',
        date: '2026-09-04',
        time: '17:30',
        bookTitle: book.title,
      },
      acceptances: [7],
      listingIds: [1],
    }
    mocks.fetchConversations.mockResolvedValue([
      { ...conversation, agreementId: agreement.id },
    ])
    mocks.fetchMessageHistory.mockResolvedValue({
      messages: [],
      nextAfter: 0,
    })
    mocks.fetchConversationBooks.mockResolvedValue({
      myBooks: [agreementBook],
      theirBooks: [],
    })
    mocks.fetchAgreement.mockResolvedValue(agreement)

    renderWithProviders(<MessagesPage />)

    await screen.findByText('Lucia')
    await waitFor(() =>
      expect(mocks.fetchAgreement).toHaveBeenCalledWith(agreement.id)
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Más opciones de mensaje' })
    )
    fireEvent.click(screen.getByRole('menuitem', { name: 'Preparar acuerdo' }))

    expect(await screen.findByText('Proponer cambios')).toBeVisible()
    expect(
      await screen.findByRole('option', { name: book.title })
    ).toBeVisible()
    fireEvent.change(screen.getByLabelText('Punto de encuentro'), {
      target: { value: 'Biblioteca municipal' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(mocks.saveMessageDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: conversation.id,
          body: '',
          attachmentMetadata: expect.objectContaining({
            kind: 'agreementProposal',
            details: {
              ...agreement.details,
              meetingPoint: 'Biblioteca municipal',
            },
          }),
        })
      )
    )
    expect(mocks.counterProposeAgreement).not.toHaveBeenCalled()
    expect(mocks.createAgreement).not.toHaveBeenCalled()
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

  test('searches contacts and opens an existing conversation', async () => {
    mocks.fetchConversations.mockResolvedValue([conversation])
    mocks.fetchMessageHistory.mockResolvedValue({ messages: [], nextAfter: 0 })
    mocks.fetchMessagingContacts.mockResolvedValue([
      { id: 7, name: 'Mariano', alias: 'mariano', isFollowing: false },
      { id: 8, name: 'Lucía Fernández', alias: 'lucia', isFollowing: true },
      { id: 9, name: 'Pablo Ruiz', alias: 'pablo', isFollowing: false },
    ])

    renderWithProviders(<MessagesPage />)

    fireEvent.click(
      await screen.findByRole('button', { name: 'Redactar mensaje' })
    )

    const dialog = screen.getByRole('dialog', {
      name: '¿Con quién querés hablar?',
    })
    expect(dialog).toHaveClass(styles.newConversationDialog)
    expect(await screen.findByText('Personas que seguís')).toBeVisible()
    expect(
      screen.getByRole('button', { name: /Lucía Fernández/ })
    ).toBeVisible()
    expect(
      screen.queryByRole('button', { name: /Mariano/ })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Pablo Ruiz/ })).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Iniciar conversación' })
    ).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: /Lucía Fernández/ }))
    expect(
      screen.getByRole('button', { name: 'Iniciar conversación' })
    ).toBeEnabled()
    fireEvent.change(screen.getByLabelText('Buscar personas'), {
      target: { value: 'Pablo' },
    })
    expect(
      screen.getByRole('button', { name: /Iniciar conversaci/ })
    ).toBeDisabled()
    fireEvent.click(await within(dialog).findByRole('button', { name: /Luc/ }))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Iniciar conversaci/ })
      ).toBeEnabled()
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Iniciar conversación' })
    )

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
    expect(mocks.createConversation).not.toHaveBeenCalled()
  })

  test('filters persisted conversations by unread state and restores all', async () => {
    const readConversation = {
      ...conversation,
      id: 12,
      participantName: 'Ana',
      unreadCount: 0,
    }
    const unreadConversation = {
      ...conversation,
      id: 13,
      participantIds: [7, 9],
      participantName: 'Pablo',
      unreadCount: 3,
    }
    mocks.fetchConversations.mockResolvedValue([
      readConversation,
      unreadConversation,
    ])
    mocks.fetchMessageHistory.mockResolvedValue({ messages: [], nextAfter: 0 })

    renderWithProviders(<MessagesPage />)

    expect(await screen.findByText('Ana')).toBeVisible()
    expect(screen.getAllByText('Pablo')[0]).toBeVisible()
    fireEvent.click(screen.getByRole('tab', { name: 'No leídos' }))

    await waitFor(() => {
      expect(screen.queryByText('Ana')).not.toBeInTheDocument()
    })
    expect(screen.getAllByText('Pablo')[0]).toBeVisible()
    expect(screen.getByText('3')).toBeVisible()

    fireEvent.click(screen.getByRole('tab', { name: 'Todos' }))
    expect(await screen.findByText('Ana')).toBeVisible()
  })

  test('shows an empty state when no conversation is unread', async () => {
    mocks.fetchConversations.mockResolvedValue([conversation])
    mocks.fetchMessageHistory.mockResolvedValue({ messages: [], nextAfter: 0 })

    renderWithProviders(<MessagesPage />)

    fireEvent.click(await screen.findByRole('tab', { name: 'No leídos' }))
    expect(
      await screen.findByText('No hay conversaciones no leídas.')
    ).toBeVisible()
  })
})
