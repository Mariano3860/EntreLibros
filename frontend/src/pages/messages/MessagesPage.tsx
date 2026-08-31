import { commandAgreement, fetchAgreement } from '@api/agreements/agreements'
import { fetchUserBooks } from '@api/books/userBooks.service'
import {
  createConversation,
  fetchConversations,
  fetchMessageHistory,
  markMessagesRead,
  sendPersistedMessage,
} from '@api/messages/messages'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { useAuth } from '@contexts/auth/AuthContext'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { usePrototype } from '@src/features/prototype/PrototypeContext'
import {
  Avatar,
  BookCover,
  Panel,
  PrototypeButton,
  PrototypePage,
} from '@src/features/prototype/PrototypeUI'
import {
  toPrototypeChatMessage,
  toPrototypeConversation,
} from '@src/features/prototype/realData.adapters'
import { useChatSocket } from '@src/hooks/socket/useChatSocket'
import { isApiMockMode } from '@src/utils/runtimeEnv'

import styles from './MessagesPage.module.scss'

export const MessagesPage = () =>
  isApiMockMode() ? <MockMessagesPage /> : <RealMessagesPage />

const MockMessagesPage = () => {
  const { catalog, chatMessages, sendMessage } = usePrototype()
  const [selected, setSelected] = useState('lucia')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [bookPicker, setBookPicker] = useState<'attach' | 'proposal' | null>(
    null
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const activeConversation =
    catalog.conversations.find(
      (conversation) => conversation.id === selected
    ) ?? catalog.conversations[1]
  const conversations = catalog.conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ block: 'end' })
  }, [chatMessages, selected])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!message.trim()) return
    sendMessage(message.trim())
    setMessage('')
  }

  return (
    <BaseLayout id="messages-page" mainClassName={styles.layoutMain}>
      <PrototypePage className={styles.page}>
        <section className={styles.messenger}>
          <aside className={styles.conversationRail}>
            <header className={styles.conversationHeader}>
              <h1>Mensajes</h1>
              <button aria-label="Redactar mensaje">✎</button>
            </header>
            <label className={styles.search}>
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar conversaciones"
              />
            </label>
            <div className={styles.railTabs}>
              <button className={styles.active}>Todos</button>
              <button>No leídos</button>
            </div>
            <div className={styles.conversationList}>
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  className={
                    selected === conversation.id ? styles.selected : ''
                  }
                  onClick={() => setSelected(conversation.id)}
                >
                  <Avatar
                    initials={conversation.initials}
                    accent={conversation.accent}
                    online={conversation.online}
                  />
                  <span className={styles.conversationCopy}>
                    <strong>{conversation.name}</strong>
                    <small>{conversation.preview}</small>
                  </span>
                  <span className={styles.conversationMeta}>
                    <small>{conversation.time}</small>
                    {conversation.unread ? <b>{conversation.unread}</b> : null}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className={styles.chat}>
            <header className={styles.chatHeader}>
              <Avatar
                initials={activeConversation.initials}
                accent={activeConversation.accent}
                online={activeConversation.online}
              />
              <div>
                <strong>{activeConversation.name}</strong>
                <small>
                  {activeConversation.online
                    ? 'En línea'
                    : 'Última conexión reciente'}
                </small>
              </div>
              <nav aria-label="Acciones del chat">
                <button aria-label="Buscar en el chat">⌕</button>
                <button aria-label="Llamar">☎</button>
                <button aria-label="Videollamada">▣</button>
                <button aria-label="Información">ⓘ</button>
              </nav>
            </header>

            <div className={styles.messages} aria-live="polite">
              <div className={styles.day}>Hoy</div>
              {chatMessages.map((item) =>
                item.kind === 'proposal' ? (
                  <article
                    key={item.id}
                    className={`${styles.proposal} ${item.role === 'me' ? styles.mine : ''}`}
                  >
                    <span className={styles.proposalLabel}>
                      Propuesta de intercambio
                    </span>
                    <div>
                      <BookCover compact book={catalog.books[0]} />
                      <div>
                        <strong>{catalog.books[0].title}</strong>
                        <small>{catalog.books[0].author}</small>
                        <p>Café Literario · mañana, 18:30</p>
                      </div>
                    </div>
                    <div className={styles.proposalActions}>
                      <PrototypeButton size="small" tone="primary">
                        Aceptar
                      </PrototypeButton>
                      <PrototypeButton size="small">
                        Ver detalle
                      </PrototypeButton>
                    </div>
                  </article>
                ) : item.kind === 'book' ? (
                  <article
                    key={item.id}
                    className={`${styles.bookAttachment} ${styles.mine}`}
                  >
                    <BookCover compact book={catalog.books[0]} />
                    <div>
                      <strong>{item.text}</strong>
                      <small>Libro adjunto</small>
                    </div>
                  </article>
                ) : (
                  <div
                    key={item.id}
                    className={`${styles.bubble} ${item.role === 'me' ? styles.mine : ''}`}
                  >
                    <span>{item.text}</span>
                    <small>
                      {item.time} {item.role === 'me' ? '✓✓' : ''}
                    </small>
                  </div>
                )
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className={styles.composer} onSubmit={submit}>
              <button
                type="button"
                aria-label="Adjuntar libro"
                onClick={() => setBookPicker('attach')}
              >
                ＋
              </button>
              <button
                type="button"
                aria-label="Proponer intercambio"
                onClick={() => setBookPicker('proposal')}
              >
                ↔
              </button>
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Escribí un mensaje..."
              />
              <button type="button" aria-label="Agregar emoji">
                ☺
              </button>
              <button
                className={styles.send}
                type="submit"
                aria-label="Enviar mensaje"
              >
                ➤
              </button>
            </form>
          </section>
        </section>

        {bookPicker ? (
          <div className={styles.modalBackdrop}>
            <Panel className={styles.bookPicker} as="div">
              <header>
                <div>
                  <span>
                    {bookPicker === 'attach'
                      ? 'ADJUNTAR AL CHAT'
                      : 'NUEVA PROPUESTA'}
                  </span>
                  <h2>Elegí un libro</h2>
                </div>
                <button onClick={() => setBookPicker(null)} aria-label="Cerrar">
                  ×
                </button>
              </header>
              <p>Todos tus libros disponibles aparecen en esta lista.</p>
              <div>
                {catalog.books.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => {
                      sendMessage(
                        bookPicker === 'attach'
                          ? book.title
                          : `Propuesta de intercambio · ${book.title}`,
                        bookPicker === 'attach' ? 'book' : 'proposal'
                      )
                      setBookPicker(null)
                    }}
                  >
                    <BookCover compact book={book} />
                    <span>
                      <strong>{book.title}</strong>
                      <small>
                        {book.author} · {book.mode}
                      </small>
                    </span>
                    <b>＋</b>
                  </button>
                ))}
              </div>
            </Panel>
          </div>
        ) : null}
      </PrototypePage>
    </BaseLayout>
  )
}

const RealMessagesPage = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const {
    conversationMessages: liveMessages,
    joinConversation,
    isConnected,
  } = useChatSocket()
  const [selected, setSelected] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [bookPicker, setBookPicker] = useState(false)
  const [newConversationOpen, setNewConversationOpen] = useState(false)
  const [participantId, setParticipantId] = useState('')
  const [sendError, setSendError] = useState<string | null>(null)
  const [attachError, setAttachError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const conversationsQuery = useQuery({
    queryKey: ['prototype', 'messages', 'conversations'],
    queryFn: fetchConversations,
  })
  const conversations = conversationsQuery.data
  const activeConversation =
    conversations?.find((item) => item.id === selected) ?? null
  const historyQuery = useQuery({
    queryKey: ['prototype', 'messages', 'history', selected],
    queryFn: () => fetchMessageHistory(selected ?? 0),
    enabled: selected !== null,
  })
  const booksQuery = useQuery({
    queryKey: ['prototype', 'messages', 'books'],
    queryFn: fetchUserBooks,
    enabled: bookPicker,
  })
  const agreementQuery = useQuery({
    queryKey: ['prototype', 'agreement', activeConversation?.agreementId],
    queryFn: () => fetchAgreement(activeConversation?.agreementId ?? 0),
    enabled:
      activeConversation?.agreementId !== null && activeConversation !== null,
  })
  const agreementMutation = useMutation({
    mutationFn: (command: 'confirm' | 'reject' | 'cancel') =>
      commandAgreement({
        agreementId: agreementQuery.data?.id ?? 0,
        command,
        expectedVersion: agreementQuery.data?.currentVersion ?? 0,
      }),
    onSuccess: (agreement) => {
      queryClient.setQueryData(
        ['prototype', 'agreement', agreement.id],
        agreement
      )
      void queryClient.invalidateQueries({
        queryKey: ['prototype', 'messages'],
      })
    },
  })
  const conversationMutation = useMutation({
    mutationFn: () => createConversation(Number(participantId)),
    onSuccess: async (conversation) => {
      setNewConversationOpen(false)
      setParticipantId('')
      await queryClient.invalidateQueries({
        queryKey: ['prototype', 'messages', 'conversations'],
      })
      setSelected(conversation.id)
    },
  })

  useEffect(() => {
    if (selected === null && conversations?.length)
      setSelected(conversations[0].id)
  }, [conversations, selected])
  useEffect(() => {
    if (selected === null || !isConnected) return
    joinConversation(selected, historyQuery.data?.nextAfter ?? 0)
  }, [historyQuery.data?.nextAfter, isConnected, joinConversation, selected])
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ block: 'end' })
    const last = historyQuery.data?.messages.at(-1)
    if (selected && last) void markMessagesRead(selected, last.sequence)
  }, [historyQuery.data, selected])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selected || !message.trim()) return
    setSendError(null)
    try {
      await sendPersistedMessage({
        conversationId: selected,
        clientKey: crypto.randomUUID(),
        body: message.trim(),
      })
      setMessage('')
      await queryClient.invalidateQueries({
        queryKey: ['prototype', 'messages'],
      })
    } catch {
      setSendError(
        t('community.messages.states.sendError', {
          defaultValue: 'No pudimos enviar el mensaje. Intentá nuevamente.',
        })
      )
    }
  }
  const attachBook = async (book: {
    id: string
    title: string
    author: string
    coverUrl: string
  }) => {
    if (!selected) return
    setSendError(null)
    setAttachError(null)
    try {
      await sendPersistedMessage({
        conversationId: selected,
        clientKey: crypto.randomUUID(),
        body: book.title,
        attachmentMetadata: {
          key: `book:${book.id}`,
          contentType: 'application/json',
          size: 0,
          kind: 'book',
          bookId: book.id,
          title: book.title,
          author: book.author,
          coverUrl: book.coverUrl,
        },
      })
      setBookPicker(false)
      setAttachError(null)
      await queryClient.invalidateQueries({
        queryKey: ['prototype', 'messages'],
      })
    } catch {
      setAttachError(
        t('community.messages.states.attachError', {
          defaultValue: 'No pudimos adjuntar este libro. Intentá nuevamente.',
        })
      )
    }
  }
  const visibleConversations = (conversations ?? []).filter((item) =>
    (item.participantName ?? (item.isBot ? 'Bot' : ''))
      .toLowerCase()
      .includes(search.toLowerCase())
  )
  const persistedMessages = (historyQuery.data?.messages ?? []).map((item) =>
    toPrototypeChatMessage(item, user?.id ?? -1)
  )
  const messages = [
    ...persistedMessages,
    ...liveMessages
      .filter(
        (item) =>
          item.conversationId === selected &&
          !(historyQuery.data?.messages ?? []).some(
            (message) => message.sequence === item.sequence
          )
      )
      .map((item) =>
        toPrototypeChatMessage(
          {
            id: -item.sequence,
            conversationId: item.conversationId,
            senderId: item.senderId,
            sequence: item.sequence,
            clientKey: item.clientKey,
            body: item.body,
            attachmentMetadata: null,
            createdAt: item.createdAt,
          },
          user?.id ?? -1
        )
      ),
  ]

  return (
    <BaseLayout id="messages-page" mainClassName={styles.layoutMain}>
      <PrototypePage className={styles.page}>
        <section className={styles.messenger}>
          <aside className={styles.conversationRail}>
            <header className={styles.conversationHeader}>
              <h1>Mensajes</h1>
              <button
                aria-label="Redactar mensaje"
                data-new-conversation
                onClick={() => setNewConversationOpen(true)}
              >
                ✎
              </button>
            </header>
            <label className={styles.search}>
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar conversaciones"
              />
            </label>
            <div className={styles.railTabs}>
              <button className={styles.active}>Todos</button>
              <button>No leídos</button>
            </div>
            <div className={styles.conversationList}>
              {conversationsQuery.isLoading ? (
                <div className={styles.conversationState} role="status">
                  <span className={styles.stateSpinner} aria-hidden="true" />
                  <span>
                    {t('community.messages.states.loadingConversations', {
                      defaultValue: 'Cargando conversaciones...',
                    })}
                  </span>
                </div>
              ) : conversationsQuery.isError ? (
                <div
                  className={`${styles.conversationState} ${styles.errorState}`}
                  role="alert"
                >
                  <span className={styles.stateMark} aria-hidden="true">
                    !
                  </span>
                  <strong>
                    {t('community.messages.states.conversationsError', {
                      defaultValue: 'No pudimos cargar tus conversaciones.',
                    })}
                  </strong>
                  <button
                    type="button"
                    className={styles.retryButton}
                    onClick={() => void conversationsQuery.refetch()}
                  >
                    {t('community.messages.states.retry', {
                      defaultValue: 'Reintentar',
                    })}
                  </button>
                </div>
              ) : (
                visibleConversations.map((conversation) => {
                  const view = toPrototypeConversation(conversation)
                  return (
                    <button
                      key={conversation.id}
                      className={
                        selected === conversation.id ? styles.selected : ''
                      }
                      onClick={() => setSelected(conversation.id)}
                    >
                      <Avatar
                        initials={view.initials}
                        accent={view.accent}
                        online={false}
                      />
                      <span className={styles.conversationCopy}>
                        <strong>{view.name}</strong>
                        <small>{view.preview}</small>
                      </span>
                      <span className={styles.conversationMeta}>
                        <small>{view.time}</small>
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </aside>
          <section className={styles.chat}>
            {conversationsQuery.isError ? (
              <div
                className={`${styles.messageState} ${styles.errorState}`}
                role="alert"
              >
                <span className={styles.stateMark} aria-hidden="true">
                  !
                </span>
                <strong>
                  {t('community.messages.states.messagesError', {
                    defaultValue: 'No pudimos cargar tus mensajes.',
                  })}
                </strong>
                <span>
                  {t('community.messages.states.connectionHint', {
                    defaultValue: 'Revisá tu conexión e intentá nuevamente.',
                  })}
                </span>
                <button
                  type="button"
                  className={styles.retryButton}
                  onClick={() => void conversationsQuery.refetch()}
                >
                  {t('community.messages.states.retry', {
                    defaultValue: 'Reintentar',
                  })}
                </button>
              </div>
            ) : activeConversation ? (
              <>
                <header className={styles.chatHeader}>
                  <Avatar
                    initials={
                      toPrototypeConversation(activeConversation).initials
                    }
                    accent={toPrototypeConversation(activeConversation).accent}
                  />
                  <div>
                    <strong>
                      {toPrototypeConversation(activeConversation).name}
                    </strong>
                    <small>Conversación persistida</small>
                  </div>
                </header>
                <div className={styles.messages} aria-live="polite">
                  <div className={styles.day}>Mensajes</div>
                  {historyQuery.isLoading ? (
                    <div className={styles.messageState} role="status">
                      <span
                        className={styles.stateSpinner}
                        aria-hidden="true"
                      />
                      <span>
                        {t('community.messages.states.loadingMessages', {
                          defaultValue: 'Cargando mensajes...',
                        })}
                      </span>
                    </div>
                  ) : historyQuery.isError ? (
                    <div
                      className={`${styles.messageState} ${styles.errorState}`}
                      role="alert"
                    >
                      <span className={styles.stateMark} aria-hidden="true">
                        !
                      </span>
                      <strong>
                        {t('community.messages.states.historyError', {
                          defaultValue: 'No pudimos cargar los mensajes.',
                        })}
                      </strong>
                      <span>
                        {t('community.messages.states.connectionHint', {
                          defaultValue:
                            'Revisá tu conexión e intentá nuevamente.',
                        })}
                      </span>
                      <button
                        type="button"
                        className={styles.retryButton}
                        onClick={() => void historyQuery.refetch()}
                      >
                        {t('community.messages.states.retry', {
                          defaultValue: 'Reintentar',
                        })}
                      </button>
                    </div>
                  ) : messages.length ? (
                    messages.map((item) => (
                      <div
                        key={item.id}
                        className={`${styles.bubble} ${item.role === 'me' ? styles.mine : ''}`}
                      >
                        <span>{item.text}</span>
                        <small>
                          {item.time}
                          {item.role === 'me' ? ' ✓✓' : ''}
                        </small>
                      </div>
                    ))
                  ) : (
                    <div className={styles.messageState}>
                      <span>
                        {t('community.messages.states.emptyMessages', {
                          defaultValue: 'No hay mensajes todavía.',
                        })}
                      </span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                {agreementQuery.data ? (
                  <Panel className={styles.proposal} as="article">
                    <span className={styles.proposalLabel}>
                      Propuesta de intercambio · {agreementQuery.data.state}
                    </span>
                    <strong>{agreementQuery.data.details.bookTitle}</strong>
                    <small>
                      {agreementQuery.data.details.meetingPoint} ·{' '}
                      {agreementQuery.data.details.date}{' '}
                      {agreementQuery.data.details.time}
                    </small>
                    {agreementQuery.data.state === 'proposed' ? (
                      <div className={styles.proposalActions}>
                        <PrototypeButton
                          size="small"
                          tone="primary"
                          onClick={() => agreementMutation.mutate('confirm')}
                          disabled={agreementMutation.isPending}
                        >
                          Aceptar
                        </PrototypeButton>
                        <PrototypeButton
                          size="small"
                          onClick={() => agreementMutation.mutate('reject')}
                          disabled={agreementMutation.isPending}
                        >
                          Rechazar
                        </PrototypeButton>
                      </div>
                    ) : null}
                  </Panel>
                ) : null}
                <form className={styles.composer} onSubmit={submit}>
                  <button
                    type="button"
                    aria-label="Adjuntar libro"
                    onClick={() => {
                      setSendError(null)
                      setAttachError(null)
                      setBookPicker(true)
                    }}
                  >
                    ＋
                  </button>
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Escribí un mensaje..."
                  />
                  <button
                    className={styles.send}
                    type="submit"
                    aria-label="Enviar mensaje"
                  >
                    ➤
                  </button>
                </form>
                {sendError ? (
                  <div className={styles.composerError} role="alert">
                    <span className={styles.stateMark} aria-hidden="true">
                      !
                    </span>
                    <span>{sendError}</span>
                  </div>
                ) : null}
              </>
            ) : (
              <Panel className={styles.empty}>
                Seleccioná una conversación para ver los mensajes.
              </Panel>
            )}
          </section>
        </section>
        {bookPicker ? (
          <div className={styles.modalBackdrop}>
            <Panel className={styles.bookPicker} as="div">
              <header>
                <div>
                  <span>ADJUNTAR AL CHAT</span>
                  <h2>Elegí un libro</h2>
                </div>
                <button
                  onClick={() => {
                    setAttachError(null)
                    setBookPicker(false)
                  }}
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </header>
              {attachError ? (
                <p className={styles.bookPickerError} role="alert">
                  <span className={styles.stateMark} aria-hidden="true">
                    !
                  </span>
                  <span>{attachError}</span>
                </p>
              ) : null}
              {booksQuery.isLoading ? (
                <p className={styles.bookPickerState} role="status">
                  <span className={styles.stateSpinner} aria-hidden="true" />
                  <span>
                    {t('community.messages.states.loadingBooks', {
                      defaultValue: 'Cargando libros...',
                    })}
                  </span>
                </p>
              ) : booksQuery.isError ? (
                <p
                  className={`${styles.bookPickerState} ${styles.errorState}`}
                  role="alert"
                >
                  <span className={styles.stateMark} aria-hidden="true">
                    !
                  </span>
                  <span>
                    {t('community.messages.states.booksError', {
                      defaultValue: 'No pudimos cargar los libros.',
                    })}
                  </span>
                  <button
                    type="button"
                    className={styles.retryButton}
                    onClick={() => void booksQuery.refetch()}
                  >
                    {t('community.messages.states.retry', {
                      defaultValue: 'Reintentar',
                    })}
                  </button>
                </p>
              ) : (booksQuery.data ?? []).length === 0 ? (
                <p className={styles.bookPickerState}>
                  {t('community.messages.states.emptyBooks', {
                    defaultValue: 'No tenés libros disponibles para adjuntar.',
                  })}
                </p>
              ) : (
                <div className={styles.bookPickerList}>
                  {(booksQuery.data ?? []).map((book) => (
                    <button key={book.id} onClick={() => void attachBook(book)}>
                      <BookCover
                        compact
                        book={{
                          id: book.id,
                          title: book.title,
                          author: book.author,
                          owner: '',
                          distance: '',
                          mode: 'Intercambio',
                          accent: '#42d7c7',
                          genre: 'Libro',
                          coverUrl: book.coverUrl,
                        }}
                      />
                      <span>
                        <strong>{book.title}</strong>
                        <small>{book.author}</small>
                      </span>
                      <b>＋</b>
                    </button>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        ) : null}
        {newConversationOpen ? (
          <div className={styles.modalBackdrop}>
            <div
              className={styles.newConversationDialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby="new-conversation-title"
            >
              <Panel
                className={`${styles.bookPicker} ${styles.newConversationModal}`}
                as="div"
              >
                <header className={styles.newConversationHeader}>
                  <div className={styles.newConversationTitle}>
                    <span className={styles.newConversationEyebrow}>
                      {t('community.messages.newConversation.eyebrow', {
                        defaultValue: 'NUEVA CONVERSACIÓN',
                      })}
                    </span>
                    <h2 id="new-conversation-title">
                      {t('community.messages.newConversation.title', {
                        defaultValue: '¿Con quién querés hablar?',
                      })}
                    </h2>
                    <p>
                      {t('community.messages.newConversation.description', {
                        defaultValue:
                          'Iniciá una conversación nueva con alguien de la comunidad.',
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.modalCloseButton}
                    onClick={() => setNewConversationOpen(false)}
                    aria-label="Cerrar"
                  >
                    ×
                  </button>
                </header>
                <form
                  className={styles.newConversationForm}
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (Number(participantId) > 0) conversationMutation.mutate()
                  }}
                >
                  <label className={styles.newConversationField}>
                    <span>
                      {t('community.messages.newConversation.fieldLabel', {
                        defaultValue: 'ID de usuario',
                      })}
                    </span>
                    <input
                      id="new-conversation-user-id"
                      autoFocus
                      inputMode="numeric"
                      value={participantId}
                      onChange={(event) => setParticipantId(event.target.value)}
                      placeholder={t(
                        'community.messages.newConversation.placeholder',
                        { defaultValue: 'Ej. 42' }
                      )}
                      aria-describedby="new-conversation-hint"
                    />
                  </label>
                  <p
                    id="new-conversation-hint"
                    className={styles.newConversationHint}
                  >
                    <span
                      className={styles.newConversationHintIcon}
                      aria-hidden="true"
                    >
                      i
                    </span>
                    <span>
                      {t('community.messages.newConversation.hint', {
                        defaultValue:
                          'Encontrás el ID en el perfil de la persona.',
                      })}
                    </span>
                  </p>
                  <div className={styles.newConversationActions}>
                    <button
                      type="button"
                      className={styles.newConversationCancel}
                      onClick={() => setNewConversationOpen(false)}
                    >
                      {t('community.messages.newConversation.cancel', {
                        defaultValue: 'Cancelar',
                      })}
                    </button>
                    <PrototypeButton
                      className={styles.newConversationSubmit}
                      type="submit"
                      tone="primary"
                      disabled={
                        Number(participantId) <= 0 ||
                        conversationMutation.isPending
                      }
                    >
                      {t('community.messages.newConversation.submit', {
                        defaultValue: 'Iniciar conversación',
                      })}
                    </PrototypeButton>
                  </div>
                </form>
              </Panel>
            </div>
          </div>
        ) : null}
      </PrototypePage>
    </BaseLayout>
  )
}
