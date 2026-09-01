import {
  commandAgreement,
  createAgreement,
  fetchAgreement,
  type AgreementDetails,
  type AgreementSnapshot,
} from '@api/agreements/agreements'
import {
  createConversation,
  fetchConversationBooks,
  fetchConversations,
  fetchMessageHistory,
  markMessagesRead,
  sendPersistedMessage,
  type ConversationBook,
} from '@api/messages/messages'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { useAuth } from '@contexts/auth/AuthContext'
import { useFocusTrap } from '@hooks/useFocusTrap'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type {
  PrototypeBook,
  PrototypeChatBook,
  PrototypeChatMessage,
} from '@src/features/prototype/catalog'
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

const toPrototypeBook = (book: PrototypeChatBook): PrototypeBook => ({
  id: book.id,
  title: book.title,
  author: book.author,
  owner: '',
  distance: '',
  mode: 'Intercambio',
  accent: '#42d7c7',
  genre: 'Libro',
  ...(book.coverUrl ? { coverUrl: book.coverUrl } : {}),
})

const createClientKey = () =>
  globalThis.crypto?.randomUUID?.() ??
  `message-${Date.now()}-${Math.random().toString(36).slice(2)}`

const COMPOSER_EMOJIS = ['😀', '😁', '😂', '😍', '🤔', '👍', '🎉', '📚']

type ComposerActionMenuProps = {
  onEmoji: () => void
  onAttachBook: () => void
  onProposeSwap: () => void
  onPrepareAgreement?: () => void
}

const ComposerActionMenu = ({
  onEmoji,
  onAttachBook,
  onProposeSwap,
  onPrepareAgreement,
}: ComposerActionMenuProps) => {
  const { t } = useTranslation()

  return (
    <div className={styles.composerMenu} role="menu">
      <button type="button" role="menuitem" onClick={onEmoji}>
        {t('community.messages.composer.menu.emoji', {
          defaultValue: 'Emoji',
        })}
      </button>
      <button type="button" role="menuitem" onClick={onAttachBook}>
        {t('community.messages.composer.menu.book', {
          defaultValue: 'Adjuntar libro',
        })}
      </button>
      <button type="button" role="menuitem" onClick={onProposeSwap}>
        {t('community.messages.composer.menu.swap', {
          defaultValue: 'Proponer intercambio',
        })}
      </button>
      {onPrepareAgreement ? (
        <button type="button" role="menuitem" onClick={onPrepareAgreement}>
          {t('community.messages.composer.menu.agreement', {
            defaultValue: 'Preparar acuerdo',
          })}
        </button>
      ) : null}
    </div>
  )
}

type EmojiPickerModalProps = {
  open: boolean
  onClose: () => void
  onSelect: (emoji: string) => void
}

const EmojiPickerModal = ({
  open,
  onClose,
  onSelect,
}: EmojiPickerModalProps) => {
  const { t } = useTranslation()
  const modalRef = useRef<HTMLDivElement>(null)

  useFocusTrap({
    containerRef: modalRef,
    active: open,
    onEscape: onClose,
  })

  if (!open) return null

  return (
    <div className={styles.modalBackdrop}>
      <div
        ref={modalRef}
        className={styles.emojiPickerDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="emoji-picker-title"
      >
        <Panel
          className={`${styles.bookPicker} ${styles.emojiPicker}`}
          as="div"
        >
          <header>
            <div>
              <span>
                {t('community.messages.composer.emoji.open', {
                  defaultValue: 'Emoji',
                })}
              </span>
              <h2 id="emoji-picker-title">
                {t('community.messages.composer.emoji.title', {
                  defaultValue: 'Elegí un emoji',
                })}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('community.messages.composer.close', {
                defaultValue: 'Cerrar',
              })}
            >
              ×
            </button>
          </header>
          <p>
            {t('community.messages.composer.emoji.description', {
              defaultValue: 'Insertalo en tu mensaje y seguí escribiendo.',
            })}
          </p>
          <div className={styles.emojiGrid}>
            {COMPOSER_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={styles.emojiChoice}
                onClick={() => onSelect(emoji)}
                aria-label={t('community.messages.composer.emoji.insert', {
                  defaultValue: 'Insertar emoji {{emoji}}',
                  emoji,
                })}
              >
                {emoji}
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

type ChatMessageBubbleProps = {
  item: PrototypeChatMessage
  agreement?: AgreementSnapshot
  agreementPending: boolean
  onConfirmAgreement: () => void
  onRejectAgreement: () => void
  onCancelAgreement: () => void
}

const ChatMessageBubble = ({
  item,
  agreement,
  agreementPending,
  onConfirmAgreement,
  onRejectAgreement,
  onCancelAgreement,
}: ChatMessageBubbleProps) => {
  const { t } = useTranslation()
  const alignment = item.role === 'me' ? styles.mine : ''

  if (item.kind === 'book' && item.book) {
    return (
      <article className={`${styles.bookAttachment} ${alignment}`}>
        <BookCover compact book={toPrototypeBook(item.book)} />
        <div>
          <strong>{item.book.title}</strong>
          <small>{item.book.author}</small>
          <small>
            {t('community.messages.bubbles.book', {
              defaultValue: 'Libro adjunto',
            })}
          </small>
          {item.text && item.text !== item.book.title ? (
            <p>{item.text}</p>
          ) : null}
        </div>
      </article>
    )
  }

  if (item.kind === 'swap' && item.swap) {
    return (
      <article className={`${styles.proposal} ${alignment}`}>
        <span className={styles.proposalLabel}>
          {t('community.messages.bubbles.swap', {
            defaultValue: 'Propuesta de intercambio',
          })}
        </span>
        <div className={styles.proposalBooks}>
          <div className={styles.proposalBook}>
            <BookCover compact book={toPrototypeBook(item.swap.offered)} />
            <span>
              <strong>{item.swap.offered.title}</strong>
              <small>
                {t('community.messages.bubbles.offered', {
                  defaultValue: 'Ofrecido',
                })}
              </small>
            </span>
          </div>
          <div className={styles.proposalBook}>
            <BookCover compact book={toPrototypeBook(item.swap.requested)} />
            <span>
              <strong>{item.swap.requested.title}</strong>
              <small>
                {t('community.messages.bubbles.requested', {
                  defaultValue: 'Solicitado',
                })}
              </small>
            </span>
          </div>
        </div>
        {item.swap.note ? <p>{item.swap.note}</p> : null}
        <small className={styles.bubbleTime}>{item.time}</small>
      </article>
    )
  }

  if (item.kind === 'agreement' && item.agreement) {
    const agreementMessage = item.agreement
    const canAct =
      agreement?.id === agreementMessage.agreementId &&
      agreement.currentVersion === agreementMessage.version &&
      (agreement.state === 'proposed' ||
        agreement.state === 'partially_confirmed') &&
      (agreementMessage.event === 'proposal' ||
        agreementMessage.event === 'counterproposal')
    const canRespond = canAct && item.role === 'them'
    const canCancel = canAct && item.role === 'me'
    const title =
      agreementMessage.event === 'counterproposal'
        ? t('community.messages.bubbles.agreementChange', {
            defaultValue: 'Cambio en la propuesta',
          })
        : agreementMessage.event === 'confirm'
          ? t('community.messages.bubbles.agreementConfirmed', {
              defaultValue: 'Acuerdo confirmado',
            })
          : agreementMessage.event === 'complete'
            ? t('community.messages.bubbles.agreementComplete', {
                defaultValue: 'Intercambio completado',
              })
            : agreementMessage.event === 'cancel' ||
                agreementMessage.event === 'reject'
              ? t('community.messages.bubbles.agreementCancelled', {
                  defaultValue: 'Acuerdo cancelado',
                })
              : t('community.messages.bubbles.agreementProposal', {
                  defaultValue: 'Propuesta de acuerdo',
                })

    return (
      <article className={`${styles.proposal} ${alignment}`}>
        <span className={styles.proposalLabel}>{title}</span>
        <strong>{agreementMessage.bookTitle}</strong>
        <small>
          {agreementMessage.meetingPoint} · {agreementMessage.area}
        </small>
        <small>
          {agreementMessage.date} · {agreementMessage.time}
        </small>
        {agreementMessage.reason ? <p>{agreementMessage.reason}</p> : null}
        {canRespond ? (
          <div className={styles.proposalActions}>
            <PrototypeButton
              size="small"
              tone="primary"
              onClick={onConfirmAgreement}
              disabled={agreementPending}
            >
              {t('community.messages.bubbles.accept', {
                defaultValue: 'Aceptar',
              })}
            </PrototypeButton>
            <PrototypeButton
              size="small"
              onClick={onRejectAgreement}
              disabled={agreementPending}
            >
              {t('community.messages.bubbles.reject', {
                defaultValue: 'Rechazar',
              })}
            </PrototypeButton>
          </div>
        ) : canCancel ? (
          <div className={styles.proposalActions}>
            <PrototypeButton
              size="small"
              onClick={onCancelAgreement}
              disabled={agreementPending}
            >
              {t('community.messages.agreement.cancellation.confirmAction', {
                defaultValue: 'Cancelar acuerdo',
              })}
            </PrototypeButton>
          </div>
        ) : null}
        <small className={styles.bubbleTime}>{item.time}</small>
      </article>
    )
  }

  return (
    <div className={`${styles.bubble} ${alignment}`}>
      <span>{item.text}</span>
      <small>
        {item.time}
        {item.role === 'me' ? ' ✓✓' : ''}
      </small>
    </div>
  )
}

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
  const [composerMenuOpen, setComposerMenuOpen] = useState(false)
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const messageInputRef = useRef<HTMLInputElement>(null)
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

  const insertEmoji = (emoji: string) => {
    const input = messageInputRef.current
    const start = input?.selectionStart ?? message.length
    const end = input?.selectionEnd ?? message.length
    setMessage(
      (current) => `${current.slice(0, start)}${emoji}${current.slice(end)}`
    )
    setEmojiPickerOpen(false)
    setComposerMenuOpen(false)
    requestAnimationFrame(() => {
      input?.focus()
      const cursorPosition = start + emoji.length
      input?.setSelectionRange(cursorPosition, cursorPosition)
    })
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
                      {item.role === 'me' ? (
                        <PrototypeButton size="small">Cancelar</PrototypeButton>
                      ) : (
                        <>
                          <PrototypeButton size="small" tone="primary">
                            Aceptar
                          </PrototypeButton>
                          <PrototypeButton size="small">
                            Rechazar
                          </PrototypeButton>
                        </>
                      )}
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
                aria-label="Más opciones de mensaje"
                aria-expanded={composerMenuOpen}
                onClick={() => {
                  setEmojiPickerOpen(false)
                  setComposerMenuOpen((open) => !open)
                }}
              >
                ＋
              </button>
              {composerMenuOpen ? (
                <ComposerActionMenu
                  onEmoji={() => {
                    setComposerMenuOpen(false)
                    setEmojiPickerOpen(true)
                  }}
                  onAttachBook={() => {
                    setComposerMenuOpen(false)
                    setBookPicker('attach')
                  }}
                  onProposeSwap={() => {
                    setComposerMenuOpen(false)
                    setBookPicker('proposal')
                  }}
                />
              ) : null}
              <input
                ref={messageInputRef}
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
        <EmojiPickerModal
          open={emojiPickerOpen}
          onClose={() => setEmojiPickerOpen(false)}
          onSelect={insertEmoji}
        />
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
  const [composerMenuOpen, setComposerMenuOpen] = useState(false)
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const [bookPickerMode, setBookPickerMode] = useState<
    'attach' | 'swap' | null
  >(null)
  const [agreementOpen, setAgreementOpen] = useState(false)
  const [offeredId, setOfferedId] = useState('')
  const [requestedId, setRequestedId] = useState('')
  const [swapNote, setSwapNote] = useState('')
  const [agreementForm, setAgreementForm] = useState<AgreementDetails>({
    meetingPoint: '',
    area: '',
    date: '',
    time: '',
    bookTitle: '',
  })
  const [newConversationOpen, setNewConversationOpen] = useState(false)
  const [participantId, setParticipantId] = useState('')
  const [sendError, setSendError] = useState<string | null>(null)
  const [attachError, setAttachError] = useState<string | null>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const conversationsQuery = useQuery({
    queryKey: ['prototype', 'messages', 'conversations'],
    queryFn: fetchConversations,
  })
  const conversations = conversationsQuery.data
  const activeConversation =
    conversations?.find((item) => item.id === selected) ?? null
  const counterpartId = activeConversation?.participantIds.find(
    (id) => id !== user?.id
  )
  const historyQuery = useQuery({
    queryKey: ['prototype', 'messages', 'history', selected],
    queryFn: () => fetchMessageHistory(selected ?? 0),
    enabled: selected !== null,
  })
  const booksQuery = useQuery({
    queryKey: ['prototype', 'messages', 'books', selected],
    queryFn: () => fetchConversationBooks(selected ?? 0),
    enabled: selected !== null && (bookPickerMode !== null || agreementOpen),
  })
  const agreementQuery = useQuery({
    queryKey: ['prototype', 'agreement', activeConversation?.agreementId],
    queryFn: () => fetchAgreement(activeConversation?.agreementId ?? 0),
    enabled:
      activeConversation?.agreementId !== null && activeConversation !== null,
  })
  type AgreementMutationInput = {
    command: 'confirm' | 'reject' | 'cancel'
    reason?: string
  }
  const agreementMutation = useMutation({
    mutationFn: ({ command, reason }: AgreementMutationInput) =>
      commandAgreement({
        agreementId: agreementQuery.data?.id ?? 0,
        command,
        expectedVersion: agreementQuery.data?.currentVersion ?? 0,
        ...(reason ? { reason } : {}),
      }),
    onSuccess: (agreement) => {
      queryClient.setQueryData(
        ['prototype', 'agreement', agreement.id],
        agreement
      )
      void queryClient.invalidateQueries({
        queryKey: ['prototype', 'messages'],
      })
      void queryClient.invalidateQueries({
        queryKey: [
          'prototype',
          'messages',
          'history',
          agreement.conversationId,
        ],
      })
    },
  })
  const cancelAgreement = () =>
    agreementMutation.mutate({
      command: 'cancel',
      reason: t('community.messages.agreement.cancellation.defaultReason', {
        defaultValue: 'El acuerdo fue cancelado.',
      }),
    })
  const agreementCreateMutation = useMutation({
    mutationFn: async (details: AgreementDetails) => {
      if (!selected || !activeConversation || !user) {
        throw new Error('conversation_unavailable')
      }
      const participantId = activeConversation.participantIds.find(
        (id) => id !== user.id
      )
      if (!participantId) throw new Error('participant_unavailable')
      const book = (booksQuery.data?.myBooks ?? [])
        .concat(booksQuery.data?.theirBooks ?? [])
        .find((item) => item.title === details.bookTitle)
      const listingId =
        book?.id && /^\d+$/.test(book.id) ? Number(book.id) : null
      return createAgreement({
        conversationId: selected,
        participantId,
        details,
        ...(listingId ? { listingIds: [listingId] } : {}),
      })
    },
    onSuccess: async (agreement) => {
      setAgreementOpen(false)
      setAgreementForm({
        meetingPoint: '',
        area: '',
        date: '',
        time: '',
        bookTitle: '',
      })
      await queryClient.invalidateQueries({
        queryKey: [
          'prototype',
          'messages',
          'history',
          agreement.conversationId,
        ],
      })
      await queryClient.invalidateQueries({
        queryKey: ['prototype', 'messages', 'conversations'],
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
        clientKey: createClientKey(),
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

  const insertEmoji = (emoji: string) => {
    const input = messageInputRef.current
    const start = input?.selectionStart ?? message.length
    const end = input?.selectionEnd ?? message.length
    setMessage(
      (current) => `${current.slice(0, start)}${emoji}${current.slice(end)}`
    )
    setEmojiPickerOpen(false)
    setComposerMenuOpen(false)
    requestAnimationFrame(() => {
      input?.focus()
      const cursorPosition = start + emoji.length
      input?.setSelectionRange(cursorPosition, cursorPosition)
    })
  }

  const attachBook = async (book: ConversationBook) => {
    if (!selected) return
    setSendError(null)
    setAttachError(null)
    try {
      await sendPersistedMessage({
        conversationId: selected,
        clientKey: createClientKey(),
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
          ...(book.ownerId ? { ownerId: book.ownerId } : {}),
        },
      })
      setBookPickerMode(null)
      setComposerMenuOpen(false)
      setAttachError(null)
      await queryClient.invalidateQueries({
        queryKey: ['prototype', 'messages', 'history', selected],
      })
    } catch {
      setAttachError(
        t('community.messages.states.attachError', {
          defaultValue: 'No pudimos adjuntar este libro. Intentá nuevamente.',
        })
      )
    }
  }
  const proposeSwap = async (event: FormEvent) => {
    event.preventDefault()
    if (!selected || !counterpartId) return
    const offered = booksQuery.data?.myBooks.find(
      (book) => book.id === offeredId
    )
    const requested = booksQuery.data?.theirBooks.find(
      (book) => book.id === requestedId
    )
    if (!offered || !requested) {
      setAttachError('Elegí un libro propio y uno de la otra persona.')
      return
    }
    setAttachError(null)
    try {
      await sendPersistedMessage({
        conversationId: selected,
        clientKey: createClientKey(),
        body: swapNote.trim(),
        attachmentMetadata: {
          key: `swap:${offered.id}:${requested.id}`,
          contentType: 'application/x-entrelibros-swap',
          size: 1,
          kind: 'swap',
          offered: { ...offered, ownerId: user?.id },
          requested: { ...requested, ownerId: counterpartId },
          ...(swapNote.trim() ? { note: swapNote.trim() } : {}),
        },
      })
      setBookPickerMode(null)
      setComposerMenuOpen(false)
      setOfferedId('')
      setRequestedId('')
      setSwapNote('')
      await queryClient.invalidateQueries({
        queryKey: ['prototype', 'messages', 'history', selected],
      })
    } catch {
      setAttachError(
        t('community.messages.states.attachError', {
          defaultValue: 'No pudimos enviar la propuesta. Intentá nuevamente.',
        })
      )
    }
  }
  const openBookPicker = (mode: 'attach' | 'swap') => {
    setSendError(null)
    setAttachError(null)
    setComposerMenuOpen(false)
    setBookPickerMode(mode)
  }
  const openAgreement = () => {
    setSendError(null)
    setAttachError(null)
    setComposerMenuOpen(false)
    setAgreementOpen(true)
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
            attachmentMetadata: item.attachmentMetadata,
            createdAt: item.createdAt,
          },
          user?.id ?? -1
        )
      ),
  ]
  const pickerBooks = [
    ...(booksQuery.data?.myBooks ?? []),
    ...(booksQuery.data?.theirBooks ?? []),
  ]
  const renderBookOption = (book: ConversationBook) => (
    <button key={book.id} type="button" onClick={() => void attachBook(book)}>
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
  )

  useFocusTrap({
    containerRef: modalRef,
    active: bookPickerMode !== null || agreementOpen || newConversationOpen,
    onEscape: () => {
      setBookPickerMode(null)
      setAgreementOpen(false)
      setNewConversationOpen(false)
    },
  })

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
                      <ChatMessageBubble
                        key={item.id}
                        item={item}
                        agreement={agreementQuery.data}
                        agreementPending={agreementMutation.isPending}
                        onConfirmAgreement={() =>
                          agreementMutation.mutate({ command: 'confirm' })
                        }
                        onRejectAgreement={() =>
                          agreementMutation.mutate({ command: 'reject' })
                        }
                        onCancelAgreement={cancelAgreement}
                      />
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
                {agreementQuery.data &&
                !messages.some((item) => item.kind === 'agreement') ? (
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
                    {agreementQuery.data.state === 'proposed' && user ? (
                      <div className={styles.proposalActions}>
                        {agreementQuery.data.participantId === user.id ? (
                          <>
                            <PrototypeButton
                              size="small"
                              tone="primary"
                              onClick={() =>
                                agreementMutation.mutate({
                                  command: 'confirm',
                                })
                              }
                              disabled={agreementMutation.isPending}
                            >
                              Aceptar
                            </PrototypeButton>
                            <PrototypeButton
                              size="small"
                              onClick={() =>
                                agreementMutation.mutate({
                                  command: 'reject',
                                })
                              }
                              disabled={agreementMutation.isPending}
                            >
                              Rechazar
                            </PrototypeButton>
                          </>
                        ) : agreementQuery.data.proposerId === user.id ? (
                          <PrototypeButton
                            size="small"
                            onClick={cancelAgreement}
                            disabled={agreementMutation.isPending}
                          >
                            {t(
                              'community.messages.agreement.cancellation.confirmAction',
                              { defaultValue: 'Cancelar acuerdo' }
                            )}
                          </PrototypeButton>
                        ) : null}
                      </div>
                    ) : null}
                  </Panel>
                ) : null}
                <form className={styles.composer} onSubmit={submit}>
                  <button
                    type="button"
                    aria-label={t('community.messages.composer.menu.open', {
                      defaultValue: 'Más opciones de mensaje',
                    })}
                    aria-expanded={composerMenuOpen}
                    onClick={() => {
                      setSendError(null)
                      setAttachError(null)
                      setEmojiPickerOpen(false)
                      setComposerMenuOpen((open) => !open)
                    }}
                  >
                    ＋
                  </button>
                  {composerMenuOpen ? (
                    <ComposerActionMenu
                      onEmoji={() => {
                        setComposerMenuOpen(false)
                        setEmojiPickerOpen(true)
                      }}
                      onAttachBook={() => openBookPicker('attach')}
                      onProposeSwap={() => openBookPicker('swap')}
                      onPrepareAgreement={openAgreement}
                    />
                  ) : null}
                  <input
                    ref={messageInputRef}
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
        {bookPickerMode ? (
          <div className={styles.modalBackdrop}>
            <div
              ref={modalRef}
              className={styles.bookPickerDialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby="book-picker-title"
            >
              <Panel className={styles.bookPicker} as="div">
                <header>
                  <div>
                    <span>
                      {bookPickerMode === 'swap'
                        ? 'PROPUESTA DE INTERCAMBIO'
                        : 'ADJUNTAR AL CHAT'}
                    </span>
                    <h2 id="book-picker-title">
                      {bookPickerMode === 'swap'
                        ? 'Elegí los libros'
                        : 'Elegí un libro'}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setAttachError(null)
                      setBookPickerMode(null)
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
                ) : pickerBooks.length === 0 ? (
                  <p className={styles.bookPickerState}>
                    {t('community.messages.states.emptyBooks', {
                      defaultValue:
                        'No tenés libros disponibles para adjuntar.',
                    })}
                  </p>
                ) : bookPickerMode === 'swap' ? (
                  <form className={styles.swapForm} onSubmit={proposeSwap}>
                    <label>
                      <span>Tu libro</span>
                      <select
                        aria-label="Tu libro"
                        value={offeredId}
                        onChange={(event) => setOfferedId(event.target.value)}
                      >
                        <option value="">Elegí un libro para ofrecer</option>
                        {(booksQuery.data?.myBooks ?? []).map((book) => (
                          <option key={book.id} value={book.id}>
                            {book.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Libro que querés recibir</span>
                      <select
                        aria-label="Libro que querés recibir"
                        value={requestedId}
                        onChange={(event) => setRequestedId(event.target.value)}
                      >
                        <option value="">
                          Elegí un libro de la otra persona
                        </option>
                        {(booksQuery.data?.theirBooks ?? []).map((book) => (
                          <option key={book.id} value={book.id}>
                            {book.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Nota opcional</span>
                      <textarea
                        value={swapNote}
                        onChange={(event) => setSwapNote(event.target.value)}
                        placeholder="Contale algo sobre la propuesta"
                        rows={3}
                      />
                    </label>
                    {attachError ? (
                      <p className={styles.bookPickerError} role="alert">
                        {attachError}
                      </p>
                    ) : null}
                    <div className={styles.newConversationActions}>
                      <button
                        type="button"
                        className={styles.newConversationCancel}
                        onClick={() => setBookPickerMode(null)}
                      >
                        Cancelar
                      </button>
                      <PrototypeButton
                        type="submit"
                        tone="primary"
                        disabled={
                          !offeredId ||
                          !requestedId ||
                          !booksQuery.data?.myBooks.length ||
                          !booksQuery.data?.theirBooks.length
                        }
                      >
                        Enviar propuesta
                      </PrototypeButton>
                    </div>
                  </form>
                ) : (
                  <div className={styles.bookPickerGroups}>
                    <section className={styles.bookPickerGroup}>
                      <h3>
                        {t('community.messages.composer.bookModal.mine', {
                          defaultValue: 'Mis libros',
                        })}
                      </h3>
                      {booksQuery.data?.myBooks.length ? (
                        <div className={styles.bookPickerList}>
                          {booksQuery.data.myBooks.map(renderBookOption)}
                        </div>
                      ) : (
                        <p className={styles.bookPickerEmpty}>
                          {t('community.messages.composer.swapModal.noMine', {
                            defaultValue: 'No tenés libros disponibles.',
                          })}
                        </p>
                      )}
                    </section>
                    <section className={styles.bookPickerGroup}>
                      <h3>
                        {t('community.messages.composer.bookModal.theirs', {
                          defaultValue: 'Libros de {{name}}',
                          name:
                            activeConversation?.participantName ??
                            'la otra persona',
                        })}
                      </h3>
                      {booksQuery.data?.theirBooks.length ? (
                        <div className={styles.bookPickerList}>
                          {booksQuery.data.theirBooks.map(renderBookOption)}
                        </div>
                      ) : (
                        <p className={styles.bookPickerEmpty}>
                          {t('community.messages.composer.swapModal.noTheirs', {
                            defaultValue:
                              'No hay libros publicados en esta conversación.',
                          })}
                        </p>
                      )}
                    </section>
                  </div>
                )}
              </Panel>
            </div>
          </div>
        ) : null}
        {agreementOpen ? (
          <div className={styles.modalBackdrop}>
            <div
              ref={modalRef}
              className={styles.newConversationDialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby="agreement-title"
            >
              <Panel
                className={`${styles.bookPicker} ${styles.newConversationModal}`}
                as="div"
              >
                <header className={styles.newConversationHeader}>
                  <div className={styles.newConversationTitle}>
                    <span className={styles.newConversationEyebrow}>
                      PROPUESTA DE ACUERDO
                    </span>
                    <h2 id="agreement-title">Coordiná el intercambio</h2>
                    <p>
                      Definí los datos del encuentro para que queden guardados
                      en la conversación.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.modalCloseButton}
                    onClick={() => setAgreementOpen(false)}
                    aria-label="Cerrar"
                  >
                    ×
                  </button>
                </header>
                <form
                  className={styles.newConversationForm}
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (
                      agreementForm.bookTitle &&
                      agreementForm.meetingPoint &&
                      agreementForm.area &&
                      agreementForm.date &&
                      agreementForm.time
                    ) {
                      agreementCreateMutation.mutate(agreementForm)
                    }
                  }}
                >
                  <label className={styles.newConversationField}>
                    <span>Libro del acuerdo</span>
                    <select
                      aria-label="Libro del acuerdo"
                      value={agreementForm.bookTitle}
                      onChange={(event) =>
                        setAgreementForm((form) => ({
                          ...form,
                          bookTitle: event.target.value,
                        }))
                      }
                    >
                      <option value="">
                        Elegí un libro de la conversación
                      </option>
                      {pickerBooks.map((book) => (
                        <option key={book.id} value={book.title}>
                          {book.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.newConversationField}>
                    <span>Punto de encuentro</span>
                    <input
                      aria-label="Punto de encuentro"
                      value={agreementForm.meetingPoint}
                      onChange={(event) =>
                        setAgreementForm((form) => ({
                          ...form,
                          meetingPoint: event.target.value,
                        }))
                      }
                      placeholder="Ej. Café de la esquina"
                    />
                  </label>
                  <label className={styles.newConversationField}>
                    <span>Zona</span>
                    <input
                      aria-label="Zona"
                      value={agreementForm.area}
                      onChange={(event) =>
                        setAgreementForm((form) => ({
                          ...form,
                          area: event.target.value,
                        }))
                      }
                      placeholder="Ej. Palermo"
                    />
                  </label>
                  <div className={styles.agreementFields}>
                    <label className={styles.newConversationField}>
                      <span>Fecha</span>
                      <input
                        aria-label="Fecha"
                        type="date"
                        value={agreementForm.date}
                        onChange={(event) =>
                          setAgreementForm((form) => ({
                            ...form,
                            date: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className={styles.newConversationField}>
                      <span>Hora</span>
                      <input
                        aria-label="Hora"
                        type="time"
                        value={agreementForm.time}
                        onChange={(event) =>
                          setAgreementForm((form) => ({
                            ...form,
                            time: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                  {agreementCreateMutation.isError ? (
                    <p className={styles.bookPickerError} role="alert">
                      No pudimos crear el acuerdo. Intentá nuevamente.
                    </p>
                  ) : null}
                  <div className={styles.newConversationActions}>
                    <button
                      type="button"
                      className={styles.newConversationCancel}
                      onClick={() => setAgreementOpen(false)}
                    >
                      Cancelar
                    </button>
                    <PrototypeButton
                      type="submit"
                      tone="primary"
                      disabled={
                        agreementCreateMutation.isPending ||
                        !agreementForm.bookTitle ||
                        !agreementForm.meetingPoint ||
                        !agreementForm.area ||
                        !agreementForm.date ||
                        !agreementForm.time
                      }
                    >
                      Crear acuerdo
                    </PrototypeButton>
                  </div>
                </form>
              </Panel>
            </div>
          </div>
        ) : null}
        {newConversationOpen ? (
          <div className={styles.modalBackdrop}>
            <div
              ref={modalRef}
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
        <EmojiPickerModal
          open={emojiPickerOpen}
          onClose={() => setEmojiPickerOpen(false)}
          onSelect={insertEmoji}
        />
      </PrototypePage>
    </BaseLayout>
  )
}
