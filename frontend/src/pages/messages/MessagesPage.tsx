import {
  commandAgreement,
  fetchAgreement,
  recordAgreementOutcome,
  type AgreementDetails,
  type AgreementOutcome,
  type AgreementSnapshot,
} from '@api/agreements/agreements'
import {
  createConversation,
  fetchConversationBooks,
  fetchConversations,
  fetchMessagingContacts,
  fetchMessageHistory,
  markMessagesRead,
  messageQueryKeys,
  type ConversationBook,
  type MessagingContact,
  type ApiMessageDraft,
  type ApiMessageDraftAttachment,
} from '@api/messages/messages'
import { notificationKeys } from '@api/notifications/notifications'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { MessageDraftCard } from '@components/messages/drafts/MessageDraftCard'
import { useAuth } from '@contexts/auth/AuthContext'
import { useFocusTrap } from '@hooks/useFocusTrap'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

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
import { useMessageDraft } from '@src/hooks/useMessageDraft'
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

const conversationIdFromRouteState = (state: unknown): number | null => {
  if (!state || typeof state !== 'object' || !('conversationId' in state)) {
    return null
  }
  const id = state.conversationId
  return typeof id === 'number' && Number.isSafeInteger(id) ? id : null
}

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

const AgreementOutcomePanel = ({
  agreement,
  userId,
  pending,
  onSave,
}: {
  agreement: AgreementSnapshot
  userId: number
  pending: boolean
  onSave: (outcome: AgreementOutcome['outcome'], reason: string) => void
}) => {
  const { t } = useTranslation()
  const ownOutcome = agreement.outcomes?.find((item) => item.userId === userId)
  const [outcome, setOutcome] = useState<AgreementOutcome['outcome']>(
    ownOutcome?.outcome ?? 'completed'
  )
  const [reason, setReason] = useState(ownOutcome?.reason ?? '')

  return (
    <Panel className={styles.proposal} as="article">
      <span className={styles.proposalLabel}>
        {t('community.messages.outcome.title', {
          defaultValue: 'Resultado del encuentro',
        })}
      </span>
      <p>
        {t('community.messages.outcome.description', {
          defaultValue: 'Registrá el resultado solo para esta conversación.',
        })}
      </p>
      <select
        value={outcome}
        onChange={(event) =>
          setOutcome(event.target.value as AgreementOutcome['outcome'])
        }
        aria-label={t('community.messages.outcome.title', {
          defaultValue: 'Resultado del encuentro',
        })}
      >
        <option value="completed">
          {t('community.messages.outcome.completed', {
            defaultValue: 'Se completó',
          })}
        </option>
        <option value="not_completed">
          {t('community.messages.outcome.notCompleted', {
            defaultValue: 'No se completó',
          })}
        </option>
      </select>
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder={t('community.messages.outcome.notePlaceholder', {
          defaultValue: 'Nota opcional',
        })}
        rows={2}
      />
      <PrototypeButton
        size="small"
        tone="primary"
        onClick={() => onSave(outcome, reason)}
        disabled={pending}
      >
        {t('community.messages.outcome.saved', {
          defaultValue: 'Guardar resultado',
        })}
      </PrototypeButton>
    </Panel>
  )
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
  const {
    catalog,
    chatMessages,
    markConversationRead,
    readConversationIds,
    sendMessage,
  } = usePrototype()
  const { t } = useTranslation()
  const [selected, setSelected] = useState('lucia')
  const [search, setSearch] = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [message, setMessage] = useState('')
  const [mockDrafts, setMockDrafts] = useState<Record<string, ApiMessageDraft>>(
    () => {
      try {
        const stored = localStorage.getItem(
          `entrelibros:prototype:message-drafts:${catalog.user.id}`
        )
        return stored
          ? (JSON.parse(stored) as Record<string, ApiMessageDraft>)
          : {}
      } catch {
        return {}
      }
    }
  )
  const [bookPicker, setBookPicker] = useState<'attach' | 'proposal' | null>(
    null
  )
  const [agreementOpen, setAgreementOpen] = useState(false)
  const [agreementForm, setAgreementForm] = useState({
    meetingPoint: 'Biblioteca Literaria',
    area: 'Palermo',
    date: '2026-09-10',
    time: '18:30',
    bookTitle: catalog.books[0]?.title ?? '',
  })
  const [composerMenuOpen, setComposerMenuOpen] = useState(false)
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const messageInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const activeConversation =
    catalog.conversations.find(
      (conversation) => conversation.id === selected
    ) ?? catalog.conversations[1]
  const mockConversationId = Math.max(
    catalog.conversations.findIndex(
      (conversation) => conversation.id === selected
    ) + 1,
    1
  )
  const conversations = catalog.conversations
    .map((conversation) =>
      readConversationIds.has(conversation.id)
        ? { ...conversation, unread: undefined }
        : conversation
    )
    .filter((conversation) =>
      conversation.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((conversation) => !unreadOnly || Boolean(conversation.unread))
  const activeDraft = mockDrafts[selected] ?? null

  useEffect(() => {
    try {
      localStorage.setItem(
        `entrelibros:prototype:message-drafts:${catalog.user.id}`,
        JSON.stringify(mockDrafts)
      )
    } catch {
      // La vista mock sigue funcionando aunque el navegador bloquee el almacenamiento.
    }
  }, [catalog.user.id, mockDrafts])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ block: 'end' })
  }, [chatMessages, selected])
  useEffect(() => {
    markConversationRead(selected)
  }, [markConversationRead, selected])

  const saveMockDraft = (
    body: string,
    attachmentMetadata: ApiMessageDraftAttachment | null = null
  ) => {
    setMockDrafts((current) => {
      const previous = current[selected]
      const now = new Date().toISOString()
      return {
        ...current,
        [selected]: {
          id: previous?.id ?? Date.now(),
          conversationId: mockConversationId,
          authorId: 1,
          body: body.trim(),
          attachmentMetadata,
          revision: (previous?.revision ?? 0) + 1,
          createdAt: previous?.createdAt ?? now,
          updatedAt: now,
        },
      }
    })
  }

  const discardMockDraft = () => {
    setMockDrafts((current) => {
      const next = { ...current }
      delete next[selected]
      return next
    })
    setMessage('')
  }

  const sendMockDraft = () => {
    if (!activeDraft) return
    const attachment = activeDraft.attachmentMetadata
    const kind =
      attachment?.kind === 'book'
        ? 'book'
        : attachment?.kind === 'swap' ||
            attachment?.kind === 'agreementProposal'
          ? 'proposal'
          : undefined
    const text =
      activeDraft.body ||
      (attachment?.kind === 'agreementProposal'
        ? attachment.details.bookTitle
        : attachment?.kind === 'book'
          ? attachment.title
          : 'Propuesta de intercambio')
    sendMessage(text, kind)
    discardMockDraft()
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!message.trim() && !activeDraft?.attachmentMetadata) return
    saveMockDraft(message, activeDraft?.attachmentMetadata ?? null)
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
            <div
              className={styles.railTabs}
              role="tablist"
              aria-label={t('community.messages.filterLabel', {
                defaultValue: 'Filtro de conversaciones',
              })}
            >
              <button
                type="button"
                className={!unreadOnly ? styles.active : ''}
                role="tab"
                aria-selected={!unreadOnly}
                onClick={() => setUnreadOnly(false)}
              >
                {t('community.messages.filters.all', { defaultValue: 'Todos' })}
              </button>
              <button
                type="button"
                className={unreadOnly ? styles.active : ''}
                role="tab"
                aria-selected={unreadOnly}
                onClick={() => setUnreadOnly(true)}
              >
                {t('community.messages.filters.unread', {
                  defaultValue: 'No leídos',
                })}
              </button>
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
              {activeDraft ? (
                <MessageDraftCard
                  draft={activeDraft}
                  onEdit={() => {
                    setMessage(activeDraft.body)
                    if (activeDraft.attachmentMetadata?.kind === 'book') {
                      setBookPicker('attach')
                    } else if (
                      activeDraft.attachmentMetadata?.kind === 'swap'
                    ) {
                      setBookPicker('proposal')
                    } else if (
                      activeDraft.attachmentMetadata?.kind ===
                      'agreementProposal'
                    ) {
                      setAgreementForm(activeDraft.attachmentMetadata.details)
                      setAgreementOpen(true)
                    }
                  }}
                  onDiscard={discardMockDraft}
                  onSend={sendMockDraft}
                />
              ) : null}
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
                  onPrepareAgreement={() => {
                    setComposerMenuOpen(false)
                    setAgreementOpen(true)
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
                      if (bookPicker === 'attach') {
                        saveMockDraft(message || book.title, {
                          key: `book:${book.id}`,
                          contentType: 'application/x-entrelibros-book',
                          size: 1,
                          kind: 'book',
                          bookId: book.id,
                          title: book.title,
                          author: book.author,
                          coverUrl:
                            'coverUrl' in book &&
                            typeof book.coverUrl === 'string'
                              ? book.coverUrl
                              : '',
                        })
                      } else {
                        const offered = catalog.userBooks[0] ?? book
                        const requested = catalog.books[0] ?? book
                        saveMockDraft(message, {
                          key: `swap:${offered.id}:${requested.id}`,
                          contentType: 'application/x-entrelibros-swap',
                          size: 1,
                          kind: 'swap',
                          offered: {
                            id: offered.id,
                            title: offered.title,
                            author: offered.author,
                            coverUrl:
                              'coverUrl' in offered &&
                              typeof offered.coverUrl === 'string'
                                ? offered.coverUrl
                                : '',
                          },
                          requested: {
                            id: requested.id,
                            title: requested.title,
                            author: requested.author,
                            coverUrl:
                              'coverUrl' in requested &&
                              typeof requested.coverUrl === 'string'
                                ? requested.coverUrl
                                : '',
                          },
                          ...(message.trim() ? { note: message.trim() } : {}),
                        })
                      }
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
        {agreementOpen ? (
          <div className={styles.modalBackdrop}>
            <Panel className={styles.bookPicker} as="div">
              <header>
                <div>
                  <span>
                    {t('community.messages.drafts.agreementTitle', {
                      defaultValue: 'Propuesta de acuerdo',
                    })}
                  </span>
                  <h2>
                    {t('community.messages.composer.agreementModal.title', {
                      defaultValue: 'Propuesta de acuerdo',
                    })}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setAgreementOpen(false)}
                  aria-label={t('community.messages.composer.close', {
                    defaultValue: 'Cerrar',
                  })}
                >
                  ×
                </button>
              </header>
              <form
                className={styles.newConversationForm}
                onSubmit={(event) => {
                  event.preventDefault()
                  saveMockDraft('', {
                    key: `agreement-proposal:${selected}`,
                    contentType: 'application/x-entrelibros-agreement-proposal',
                    size: 1,
                    kind: 'agreementProposal',
                    listingIds: [1],
                    details: agreementForm,
                  })
                  setAgreementOpen(false)
                }}
              >
                <label className={styles.newConversationField}>
                  <span>
                    {t('community.messages.composer.agreementModal.bookLabel', {
                      defaultValue: 'Libro a intercambiar',
                    })}
                  </span>
                  <select
                    aria-label={t(
                      'community.messages.composer.agreementModal.bookLabel',
                      { defaultValue: 'Libro a intercambiar' }
                    )}
                    value={agreementForm.bookTitle}
                    onChange={(event) =>
                      setAgreementForm((current) => ({
                        ...current,
                        bookTitle: event.target.value,
                      }))
                    }
                  >
                    {catalog.books.map((book) => (
                      <option key={book.id} value={book.title}>
                        {book.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.newConversationField}>
                  <span>
                    {t(
                      'community.messages.composer.agreementModal.meetingLabel',
                      { defaultValue: 'Punto de encuentro' }
                    )}
                  </span>
                  <input
                    value={agreementForm.meetingPoint}
                    onChange={(event) =>
                      setAgreementForm((current) => ({
                        ...current,
                        meetingPoint: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className={styles.newConversationField}>
                  <span>
                    {t('community.messages.composer.agreementModal.areaLabel', {
                      defaultValue: 'Zona o barrio',
                    })}
                  </span>
                  <input
                    value={agreementForm.area}
                    onChange={(event) =>
                      setAgreementForm((current) => ({
                        ...current,
                        area: event.target.value,
                      }))
                    }
                  />
                </label>
                <div className={styles.agreementFields}>
                  <label className={styles.newConversationField}>
                    <span>
                      {t(
                        'community.messages.composer.agreementModal.dateLabel',
                        {
                          defaultValue: 'Día sugerido',
                        }
                      )}
                    </span>
                    <input
                      type="date"
                      value={agreementForm.date}
                      onChange={(event) =>
                        setAgreementForm((current) => ({
                          ...current,
                          date: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className={styles.newConversationField}>
                    <span>
                      {t(
                        'community.messages.composer.agreementModal.timeLabel',
                        {
                          defaultValue: 'Horario',
                        }
                      )}
                    </span>
                    <input
                      type="time"
                      value={agreementForm.time}
                      onChange={(event) =>
                        setAgreementForm((current) => ({
                          ...current,
                          time: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
                <div className={styles.newConversationActions}>
                  <button
                    type="button"
                    className={styles.newConversationCancel}
                    onClick={() => setAgreementOpen(false)}
                  >
                    {t('community.messages.composer.cancel', {
                      defaultValue: 'Cancelar',
                    })}
                  </button>
                  <PrototypeButton type="submit" tone="primary">
                    Guardar borrador
                  </PrototypeButton>
                </div>
              </form>
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
  const location = useLocation()
  const queryClient = useQueryClient()
  const {
    conversationMessages: liveMessages,
    joinConversation,
    isConnected,
  } = useChatSocket()
  const [selected, setSelected] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)
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
  const [contactSearch, setContactSearch] = useState('')
  const [selectedContactId, setSelectedContactId] = useState<number | null>(
    null
  )
  const requestedConversationIdRef = useRef(
    conversationIdFromRouteState(location.state)
  )
  const [sendError, setSendError] = useState<string | null>(null)
  const [attachError, setAttachError] = useState<string | null>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const lastReadSequenceRef = useRef(new Map<number, number>())
  const hydratedDraftConversationRef = useRef<number | null>(null)
  const draftSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const draftAutosaveSignatureRef = useRef<string | null>(null)
  const [draftSaveState, setDraftSaveState] = useState<
    'idle' | 'pending' | 'saved' | 'error'
  >('idle')
  const conversationsQuery = useQuery({
    queryKey: messageQueryKeys.conversations(),
    queryFn: fetchConversations,
  })
  const conversations = conversationsQuery.data
  const contactsQuery = useQuery({
    queryKey: messageQueryKeys.contacts(contactSearch),
    queryFn: () => fetchMessagingContacts(contactSearch),
    enabled: newConversationOpen,
  })
  const activeConversation =
    conversations?.find((item) => item.id === selected) ?? null
  const counterpartId = activeConversation?.participantIds.find(
    (id) => id !== user?.id
  )
  const historyQuery = useQuery({
    queryKey: messageQueryKeys.history(selected ?? 0),
    queryFn: () => fetchMessageHistory(selected ?? 0),
    enabled: selected !== null,
  })
  const draftState = useMessageDraft(selected)
  const booksQuery = useQuery({
    queryKey: messageQueryKeys.books(selected ?? 0),
    queryFn: () => fetchConversationBooks(selected ?? 0),
    enabled: selected !== null && (bookPickerMode !== null || agreementOpen),
  })
  const agreementQuery = useQuery({
    queryKey: ['prototype', 'agreement', activeConversation?.agreementId],
    queryFn: () => fetchAgreement(activeConversation?.agreementId ?? 0),
    enabled:
      activeConversation?.agreementId !== null && activeConversation !== null,
  })
  const activeAgreement = agreementQuery.data
  const isCounterProposal =
    activeAgreement?.state === 'proposed' ||
    activeAgreement?.state === 'partially_confirmed'
  const saveDraft = useCallback(
    async (value: {
      body: string
      attachmentMetadata?: ApiMessageDraftAttachment | null
    }) => {
      if (selected === null) return Promise.resolve(null)
      const draftValue = {
        body: value.body,
        attachmentMetadata: value.attachmentMetadata ?? null,
      }
      draftAutosaveSignatureRef.current = JSON.stringify(draftValue)
      setDraftSaveState('pending')
      return draftState.save
        .mutateAsync(draftValue)
        .then((draft) => {
          setDraftSaveState('saved')
          return draft
        })
        .catch((error: unknown) => {
          setDraftSaveState('error')
          throw error
        })
    },
    [draftState.save, selected]
  )
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
        queryKey: messageQueryKeys.all,
      })
      void queryClient.invalidateQueries({
        queryKey: messageQueryKeys.history(agreement.conversationId),
      })
    },
  })
  const outcomeMutation = useMutation({
    mutationFn: ({
      agreementId,
      outcome,
      reason,
    }: {
      agreementId: number
      outcome: AgreementOutcome['outcome']
      reason: string
    }) =>
      recordAgreementOutcome({
        agreementId,
        outcome,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      }),
    onSuccess: async (agreement) => {
      queryClient.setQueryData(
        ['prototype', 'agreement', agreement.id],
        agreement
      )
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: messageQueryKeys.history(agreement.conversationId),
        }),
        queryClient.invalidateQueries({
          queryKey: messageQueryKeys.conversations(),
        }),
      ])
    },
  })
  const cancelAgreement = () =>
    agreementMutation.mutate({
      command: 'cancel',
      reason: t('community.messages.agreement.cancellation.defaultReason', {
        defaultValue: 'El acuerdo fue cancelado.',
      }),
    })
  const saveAgreementDraft = async (details: AgreementDetails) => {
    if (!selected) return
    const selectedBook = [
      ...(booksQuery.data?.myBooks ?? []),
      ...(booksQuery.data?.theirBooks ?? []),
    ].find((book) => book.title === details.bookTitle)
    const listingId =
      selectedBook?.id && /^\d+$/.test(selectedBook.id)
        ? Number(selectedBook.id)
        : null
    if (!listingId) {
      setAttachError(
        t('community.messages.drafts.agreementBookRequired', {
          defaultValue: 'Elegí un libro válido de la conversación.',
        })
      )
      return
    }
    setAttachError(null)
    try {
      await saveDraft({
        body: '',
        attachmentMetadata: {
          key: `agreement-proposal:${selected}:${listingId}`,
          contentType: 'application/x-entrelibros-agreement-proposal',
          size: 1,
          kind: 'agreementProposal',
          listingIds: [listingId],
          details,
          ...(isCounterProposal && activeAgreement
            ? {
                agreementId: activeAgreement.id,
                expectedVersion: activeAgreement.currentVersion,
              }
            : {}),
        },
      })
      setAgreementOpen(false)
      setAgreementForm({
        meetingPoint: '',
        area: '',
        date: '',
        time: '',
        bookTitle: '',
      })
    } catch {
      setAttachError(
        t('community.messages.drafts.saveError', {
          defaultValue: 'No pudimos guardar el borrador. Intentá nuevamente.',
        })
      )
    }
  }
  const conversationMutation = useMutation({
    mutationFn: async () => {
      if (
        !selectedContactId ||
        selectedContactId === user?.id ||
        !(contactsQuery.data ?? []).some(
          (contact) => contact.id === selectedContactId
        )
      ) {
        throw new Error('self_conversation')
      }
      const existing = conversations?.find((conversation) =>
        conversation.participantIds.includes(selectedContactId)
      )
      return existing ?? createConversation(selectedContactId)
    },
    onSuccess: async (conversation) => {
      setNewConversationOpen(false)
      setContactSearch('')
      setSelectedContactId(null)
      await queryClient.invalidateQueries({
        queryKey: messageQueryKeys.conversations(),
      })
      setSelected(conversation.id)
    },
  })

  useEffect(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const filteredConversations = (conversations ?? [])
      .filter((item) =>
        (item.participantName ?? (item.isBot ? 'Bot' : ''))
          .toLowerCase()
          .includes(normalizedSearch)
      )
      .filter((item) => !unreadOnly || item.unreadCount > 0)
    if (filteredConversations.some((item) => item.id === selected)) return
    const nextConversation = filteredConversations[0]?.id ?? null
    if (nextConversation !== selected) setSelected(nextConversation)
  }, [conversations, search, selected, unreadOnly])
  useEffect(() => {
    const requestedConversationId = requestedConversationIdRef.current
    if (requestedConversationId === null || !conversations) return
    if (conversations.some((item) => item.id === requestedConversationId)) {
      setSelected(requestedConversationId)
      requestedConversationIdRef.current = null
    }
  }, [conversations])
  useEffect(() => {
    if (selected === null) {
      hydratedDraftConversationRef.current = null
      draftAutosaveSignatureRef.current = null
      setMessage('')
      setDraftSaveState('idle')
      return
    }
    if (draftState.query.isLoading) return
    if (hydratedDraftConversationRef.current === selected) return
    hydratedDraftConversationRef.current = selected
    draftAutosaveSignatureRef.current = null
    setMessage(draftState.query.data?.body ?? '')
    setDraftSaveState(draftState.query.data ? 'saved' : 'idle')
  }, [draftState.query.data, draftState.query.isLoading, selected])
  useEffect(() => {
    const attachmentMetadata = draftState.query.data?.attachmentMetadata ?? null
    const currentValue = { body: message, attachmentMetadata }
    const currentSignature = JSON.stringify(currentValue)
    const savedSignature = JSON.stringify({
      body: draftState.query.data?.body ?? '',
      attachmentMetadata,
    })
    if (
      selected === null ||
      draftState.query.isLoading ||
      hydratedDraftConversationRef.current !== selected ||
      (!message.trim() && !attachmentMetadata) ||
      currentSignature === savedSignature ||
      draftAutosaveSignatureRef.current === currentSignature ||
      draftState.save.isPending
    ) {
      return
    }
    setDraftSaveState('pending')
    if (draftSaveTimerRef.current) clearTimeout(draftSaveTimerRef.current)
    draftSaveTimerRef.current = setTimeout(() => {
      draftAutosaveSignatureRef.current = currentSignature
      void saveDraft(currentValue).catch(() => undefined)
      draftSaveTimerRef.current = null
    }, 500)
    return () => {
      if (draftSaveTimerRef.current) {
        clearTimeout(draftSaveTimerRef.current)
        draftSaveTimerRef.current = null
      }
    }
  }, [
    draftState.query.data,
    draftState.query.isLoading,
    draftState.save.isPending,
    message,
    saveDraft,
    selected,
  ])
  useEffect(() => {
    if (selected === null || !isConnected) return
    joinConversation(selected, historyQuery.data?.nextAfter ?? 0)
  }, [historyQuery.data?.nextAfter, isConnected, joinConversation, selected])
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ block: 'end' })
    if (selected === null) return
    const persistedLast = historyQuery.data?.messages.at(-1)?.sequence ?? 0
    const liveLast = liveMessages
      .filter((item) => item.conversationId === selected)
      .reduce((lastSequence, item) => Math.max(lastSequence, item.sequence), 0)
    const lastSequence = Math.max(persistedLast, liveLast)
    const previousSequence = lastReadSequenceRef.current.get(selected) ?? 0
    if (lastSequence <= previousSequence) return

    lastReadSequenceRef.current.set(selected, lastSequence)
    void markMessagesRead(selected, lastSequence)
      .then(async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: messageQueryKeys.conversations(),
          }),
          queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
        ])
      })
      .catch(() => {
        if (lastReadSequenceRef.current.get(selected) === lastSequence) {
          lastReadSequenceRef.current.delete(selected)
        }
      })
  }, [historyQuery.data, liveMessages, queryClient, selected])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (
      !selected ||
      (!message.trim() && !draftState.query.data?.attachmentMetadata)
    ) {
      return
    }
    setSendError(null)
    void saveDraft({
      body: message.trim(),
      attachmentMetadata: draftState.query.data?.attachmentMetadata ?? null,
    }).catch(() => {
      setSendError(
        t('community.messages.drafts.saveError', {
          defaultValue: 'No pudimos guardar el borrador. Intentá nuevamente.',
        })
      )
    })
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
      await saveDraft({
        body: message.trim() || book.title,
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
          ...(book.condition ? { condition: book.condition } : {}),
        },
      })
      setBookPickerMode(null)
      setComposerMenuOpen(false)
      setAttachError(null)
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
    if (!selected || !counterpartId || !user) return
    const offered = booksQuery.data?.myBooks.find(
      (book) => book.id === offeredId
    )
    const requested = booksQuery.data?.theirBooks.find(
      (book) => book.id === requestedId
    )
    if (!offered || !requested) {
      setAttachError(
        t('community.messages.drafts.swapBooksRequired', {
          defaultValue: 'Elegí un libro propio y uno de la otra persona.',
        })
      )
      return
    }
    setAttachError(null)
    try {
      await saveDraft({
        body: swapNote.trim(),
        attachmentMetadata: {
          key: `swap:${offered.id}:${requested.id}`,
          contentType: 'application/x-entrelibros-swap',
          size: 1,
          kind: 'swap',
          offered: {
            ...offered,
            ownerId: user.id,
            ...(offered.condition ? { condition: offered.condition } : {}),
          },
          requested: {
            ...requested,
            ownerId: counterpartId,
            ...(requested.condition ? { condition: requested.condition } : {}),
          },
          ...(swapNote.trim() ? { note: swapNote.trim() } : {}),
        },
      })
      setBookPickerMode(null)
      setComposerMenuOpen(false)
      setOfferedId('')
      setRequestedId('')
      setSwapNote('')
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
    setAgreementForm(
      isCounterProposal && activeAgreement
        ? activeAgreement.details
        : {
            meetingPoint: '',
            area: '',
            date: '',
            time: '',
            bookTitle: '',
          }
    )
    setAgreementOpen(true)
  }
  const visibleConversations = (conversations ?? [])
    .filter((item) =>
      (item.participantName ?? (item.isBot ? 'Bot' : ''))
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    )
    .filter((item) => !unreadOnly || item.unreadCount > 0)
  const availableContacts = (contactsQuery.data ?? []).filter(
    (contact) => contact.id !== user?.id
  )
  const followedContacts = availableContacts.filter(
    (contact) => contact.isFollowing
  )
  const suggestedContacts = availableContacts.filter(
    (contact) => !contact.isFollowing
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

  const renderContactOption = (contact: MessagingContact) => {
    const initials = contact.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.slice(0, 1).toUpperCase())
      .join('')
    return (
      <button
        key={contact.id}
        type="button"
        className={`${styles.contactOption} ${
          selectedContactId === contact.id ? styles.contactOptionSelected : ''
        }`}
        aria-pressed={selectedContactId === contact.id}
        onClick={() => setSelectedContactId(contact.id)}
      >
        <span className={styles.contactAvatar} aria-hidden="true">
          {initials || '?'}
        </span>
        <span className={styles.contactCopy}>
          <strong>{contact.name}</strong>
          <small>
            {contact.alias && contact.alias !== contact.name
              ? `@${contact.alias}`
              : t('community.messages.newConversation.member', {
                  defaultValue: 'Miembro de EntreLibros',
                })}
          </small>
        </span>
        <span className={styles.contactSelection} aria-hidden="true">
          {selectedContactId === contact.id ? '✓' : '+'}
        </span>
      </button>
    )
  }

  const handleEditDraft = () => {
    const draft = draftState.query.data
    if (!draft) return
    const attachment = draft.attachmentMetadata
    setMessage(draft.body)
    if (!attachment) {
      messageInputRef.current?.focus()
    } else if (attachment.kind === 'book') {
      openBookPicker('attach')
    } else if (attachment.kind === 'swap') {
      setOfferedId(attachment.offered.id)
      setRequestedId(attachment.requested.id)
      setSwapNote(attachment.note ?? draft.body)
      openBookPicker('swap')
    } else {
      setAgreementForm(attachment.details)
      setAgreementOpen(true)
    }
  }

  const handleDiscardDraft = async () => {
    try {
      await draftState.discard.mutateAsync()
      setMessage('')
      setDraftSaveState('idle')
    } catch {
      setSendError(
        t('community.messages.drafts.discardError', {
          defaultValue: 'No pudimos descartar el borrador.',
        })
      )
    }
  }

  const handleSendDraft = async () => {
    if (!draftState.query.data) return
    setSendError(null)
    try {
      await draftState.send.mutateAsync(createClientKey())
      setMessage('')
      setDraftSaveState('idle')
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: messageQueryKeys.history(selected ?? 0),
        }),
        queryClient.invalidateQueries({
          queryKey: messageQueryKeys.conversations(),
        }),
      ])
    } catch {
      setSendError(
        t('community.messages.drafts.sendError', {
          defaultValue: 'No pudimos enviar el borrador. Intentá nuevamente.',
        })
      )
    }
  }

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
                onClick={() => {
                  setContactSearch('')
                  setSelectedContactId(null)
                  setNewConversationOpen(true)
                }}
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
            <div
              className={styles.railTabs}
              role="tablist"
              aria-label={t('community.messages.filterLabel', {
                defaultValue: 'Filtro de conversaciones',
              })}
            >
              <button
                type="button"
                className={!unreadOnly ? styles.active : ''}
                role="tab"
                aria-selected={!unreadOnly}
                onClick={() => setUnreadOnly(false)}
              >
                {t('community.messages.filters.all', { defaultValue: 'Todos' })}
              </button>
              <button
                type="button"
                className={unreadOnly ? styles.active : ''}
                role="tab"
                aria-selected={unreadOnly}
                onClick={() => setUnreadOnly(true)}
              >
                {t('community.messages.filters.unread', {
                  defaultValue: 'No leídos',
                })}
              </button>
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
              ) : visibleConversations.length === 0 ? (
                <div className={styles.conversationState} role="status">
                  <span className={styles.stateMark} aria-hidden="true">
                    {unreadOnly ? '✓' : '·'}
                  </span>
                  <strong>
                    {unreadOnly
                      ? t('community.messages.states.emptyUnread', {
                          defaultValue: 'No hay conversaciones no leídas.',
                        })
                      : search.trim()
                        ? t('community.messages.states.emptySearch', {
                            defaultValue:
                              'No encontramos conversaciones con ese nombre.',
                          })
                        : t('community.messages.states.emptyConversations', {
                            defaultValue: 'Todavía no tenés conversaciones.',
                          })}
                  </strong>
                </div>
              ) : (
                visibleConversations.map((conversation) => {
                  const view = toPrototypeConversation(conversation, {
                    unread: conversation.unreadCount,
                  })
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
                        {view.unread ? (
                          <b aria-label={`${view.unread} mensajes sin leer`}>
                            {view.unread > 99 ? '99+' : view.unread}
                          </b>
                        ) : null}
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
                  {draftState.query.data ? (
                    <MessageDraftCard
                      draft={draftState.query.data}
                      onEdit={handleEditDraft}
                      onDiscard={() => void handleDiscardDraft()}
                      onSend={() => void handleSendDraft()}
                      isDiscarding={draftState.discard.isPending}
                      isSending={draftState.send.isPending}
                    />
                  ) : null}
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
                {agreementQuery.data &&
                user &&
                (agreementQuery.data.state === 'confirmed' ||
                  agreementQuery.data.state === 'completed') ? (
                  <AgreementOutcomePanel
                    agreement={agreementQuery.data}
                    userId={user.id}
                    pending={outcomeMutation.isPending}
                    onSave={(outcome, reason) =>
                      outcomeMutation.mutate({
                        agreementId: agreementQuery.data?.id ?? 0,
                        outcome,
                        reason,
                      })
                    }
                  />
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
                {draftSaveState !== 'idle' ? (
                  <div
                    className={styles.draftSaveStatus}
                    role={draftSaveState === 'error' ? 'alert' : 'status'}
                  >
                    {draftSaveState === 'pending'
                      ? t('community.messages.drafts.saving', {
                          defaultValue: 'Guardando borrador…',
                        })
                      : draftSaveState === 'error'
                        ? t('community.messages.drafts.saveError', {
                            defaultValue:
                              'No pudimos guardar el borrador. Intentá nuevamente.',
                          })
                        : t('community.messages.drafts.saved', {
                            defaultValue: 'Borrador guardado',
                          })}
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
                      {t('community.messages.drafts.agreementTitle', {
                        defaultValue: 'Propuesta de acuerdo',
                      })}
                    </span>
                    <h2 id="agreement-title">
                      {isCounterProposal
                        ? t('community.messages.agreement.change.modalTitle', {
                            defaultValue: 'Proponer cambios',
                          })
                        : t(
                            'community.messages.composer.agreementModal.title',
                            {
                              defaultValue: 'Propuesta de acuerdo',
                            }
                          )}
                    </h2>
                    <p>
                      {isCounterProposal
                        ? t(
                            'community.messages.agreement.change.modalDescription',
                            {
                              defaultValue:
                                'Ajustá la propuesta actualizando al menos un dato.',
                            }
                          )
                        : t(
                            'community.messages.composer.agreementModal.description',
                            {
                              defaultValue:
                                'Definí los datos del encuentro para que queden guardados en la conversación.',
                            }
                          )}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.modalCloseButton}
                    onClick={() => setAgreementOpen(false)}
                    aria-label={t('community.messages.composer.close', {
                      defaultValue: 'Cerrar',
                    })}
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
                      void saveAgreementDraft(agreementForm)
                    }
                  }}
                >
                  <label className={styles.newConversationField}>
                    <span>
                      {t(
                        'community.messages.composer.agreementModal.bookLabel',
                        {
                          defaultValue: 'Libro a intercambiar',
                        }
                      )}
                    </span>
                    <select
                      aria-label={t(
                        'community.messages.composer.agreementModal.bookLabel',
                        { defaultValue: 'Libro a intercambiar' }
                      )}
                      value={agreementForm.bookTitle}
                      disabled={isCounterProposal}
                      onChange={(event) =>
                        setAgreementForm((form) => ({
                          ...form,
                          bookTitle: event.target.value,
                        }))
                      }
                    >
                      <option value="">
                        {t(
                          'community.messages.composer.agreementModal.noBooks',
                          {
                            defaultValue: 'Elegí un libro de la conversación',
                          }
                        )}
                      </option>
                      {pickerBooks.map((book) => (
                        <option key={book.id} value={book.title}>
                          {book.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.newConversationField}>
                    <span>
                      {t(
                        'community.messages.composer.agreementModal.meetingLabel',
                        { defaultValue: 'Punto de encuentro' }
                      )}
                    </span>
                    <input
                      aria-label={t(
                        'community.messages.composer.agreementModal.meetingLabel',
                        { defaultValue: 'Punto de encuentro' }
                      )}
                      value={agreementForm.meetingPoint}
                      onChange={(event) =>
                        setAgreementForm((form) => ({
                          ...form,
                          meetingPoint: event.target.value,
                        }))
                      }
                      placeholder={t(
                        'community.messages.composer.agreementModal.meetingPlaceholder',
                        { defaultValue: 'Ej. Café de la esquina' }
                      )}
                    />
                  </label>
                  <label className={styles.newConversationField}>
                    <span>
                      {t(
                        'community.messages.composer.agreementModal.areaLabel',
                        {
                          defaultValue: 'Zona o barrio',
                        }
                      )}
                    </span>
                    <input
                      aria-label={t(
                        'community.messages.composer.agreementModal.areaLabel',
                        { defaultValue: 'Zona o barrio' }
                      )}
                      value={agreementForm.area}
                      onChange={(event) =>
                        setAgreementForm((form) => ({
                          ...form,
                          area: event.target.value,
                        }))
                      }
                      placeholder={t(
                        'community.messages.composer.agreementModal.areaPlaceholder',
                        { defaultValue: 'Ej. Palermo' }
                      )}
                    />
                  </label>
                  <div className={styles.agreementFields}>
                    <label className={styles.newConversationField}>
                      <span>
                        {t(
                          'community.messages.composer.agreementModal.dateLabel',
                          { defaultValue: 'Día sugerido' }
                        )}
                      </span>
                      <input
                        aria-label={t(
                          'community.messages.composer.agreementModal.dateLabel',
                          { defaultValue: 'Día sugerido' }
                        )}
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
                      <span>
                        {t(
                          'community.messages.composer.agreementModal.timeLabel',
                          {
                            defaultValue: 'Horario',
                          }
                        )}
                      </span>
                      <input
                        aria-label={t(
                          'community.messages.composer.agreementModal.timeLabel',
                          { defaultValue: 'Horario' }
                        )}
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
                  {attachError ? (
                    <p className={styles.bookPickerError} role="alert">
                      {attachError}
                    </p>
                  ) : null}
                  <div className={styles.newConversationActions}>
                    <button
                      type="button"
                      className={styles.newConversationCancel}
                      onClick={() => setAgreementOpen(false)}
                    >
                      {t('community.messages.composer.cancel', {
                        defaultValue: 'Cancelar',
                      })}
                    </button>
                    <PrototypeButton
                      type="submit"
                      tone="primary"
                      disabled={
                        draftState.save.isPending ||
                        !agreementForm.bookTitle ||
                        !agreementForm.meetingPoint ||
                        !agreementForm.area ||
                        !agreementForm.date ||
                        !agreementForm.time
                      }
                    >
                      {isCounterProposal
                        ? t('community.messages.drafts.saveChanges', {
                            defaultValue: 'Guardar cambios',
                          })
                        : t('community.messages.drafts.saveAgreement', {
                            defaultValue: 'Guardar borrador',
                          })}
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
                    if (selectedContactId) conversationMutation.mutate()
                  }}
                >
                  <label className={styles.newConversationField}>
                    <span>
                      {t('community.messages.newConversation.fieldLabel', {
                        defaultValue: 'Buscar personas',
                      })}
                    </span>
                    <input
                      id="new-conversation-contact"
                      autoFocus
                      value={contactSearch}
                      onChange={(event) => {
                        setContactSearch(event.target.value)
                        setSelectedContactId(null)
                        conversationMutation.reset()
                      }}
                      placeholder={t(
                        'community.messages.newConversation.placeholder',
                        { defaultValue: 'Nombre, apellido o alias' }
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
                          'Elegí una persona para abrir una conversación nueva.',
                      })}
                    </span>
                  </p>
                  {contactsQuery.isLoading ? (
                    <div className={styles.contactState} role="status">
                      <span
                        className={styles.stateSpinner}
                        aria-hidden="true"
                      />
                      <span>
                        {t('community.messages.newConversation.loading', {
                          defaultValue: 'Buscando personas...',
                        })}
                      </span>
                    </div>
                  ) : contactsQuery.isError ? (
                    <div className={styles.contactState} role="alert">
                      <span className={styles.stateMark} aria-hidden="true">
                        !
                      </span>
                      <span>
                        {t('community.messages.newConversation.error', {
                          defaultValue: 'No pudimos cargar los contactos.',
                        })}
                      </span>
                      <button
                        type="button"
                        className={styles.retryButton}
                        onClick={() => void contactsQuery.refetch()}
                      >
                        {t('community.messages.states.retry', {
                          defaultValue: 'Reintentar',
                        })}
                      </button>
                    </div>
                  ) : contactsQuery.data?.length ? (
                    <div className={styles.contactSections}>
                      {followedContacts.length ? (
                        <section className={styles.contactSection}>
                          <h3>
                            {t('community.messages.newConversation.followed', {
                              defaultValue: 'Personas que seguís',
                            })}
                          </h3>
                          <div className={styles.contactList}>
                            {followedContacts.map(renderContactOption)}
                          </div>
                        </section>
                      ) : null}
                      {suggestedContacts.length ? (
                        <section className={styles.contactSection}>
                          <h3>
                            {t(
                              'community.messages.newConversation.suggestions',
                              { defaultValue: 'Sugerencias para vos' }
                            )}
                          </h3>
                          <div className={styles.contactList}>
                            {suggestedContacts.map(renderContactOption)}
                          </div>
                        </section>
                      ) : null}
                    </div>
                  ) : (
                    <p className={styles.contactEmpty}>
                      {contactSearch.trim()
                        ? t('community.messages.newConversation.emptySearch', {
                            defaultValue:
                              'No encontramos personas con ese nombre.',
                          })
                        : t('community.messages.newConversation.empty', {
                            defaultValue:
                              'No hay contactos disponibles todavía.',
                          })}
                    </p>
                  )}
                  {conversationMutation.isError ? (
                    <p className={styles.contactError} role="alert">
                      {t('community.messages.newConversation.createError', {
                        defaultValue:
                          'No pudimos iniciar la conversación. Intentá nuevamente.',
                      })}
                    </p>
                  ) : null}
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
                        !selectedContactId ||
                        selectedContactId === user?.id ||
                        !availableContacts.some(
                          (contact) => contact.id === selectedContactId
                        ) ||
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
