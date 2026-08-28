import {
  fetchAgreement,
  fetchAgreementHistory,
  type AgreementSnapshot,
} from '@api/agreements/agreements'
import { fetchBookAvailability } from '@api/community/messages'
import {
  fetchConversations,
  fetchMessageHistory,
  sendPersistedMessage,
  type ApiConversation,
  type ApiMessage,
} from '@api/messages/messages'
import { mockConversations } from '@components/messages/Messages.mock'
import { useChatSocket } from '@hooks/socket/useChatSocket'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ReactComponent as InfoIcon } from '@src/assets/icons/info.svg'

import { BubbleAgreementCancellation } from './components/BubbleAgreement/BubbleAgreementCancellation'
import { BubbleAgreementChange } from './components/BubbleAgreement/BubbleAgreementChange'
import { BubbleAgreementConfirmation } from './components/BubbleAgreement/BubbleAgreementConfirmation'
import { BubbleAgreementProposal } from './components/BubbleAgreement/BubbleAgreementProposal'
import { ConfirmAgreementModal } from './components/BubbleAgreement/ConfirmAgreementModal'
import { BubbleSwapProposal } from './components/BubbleSwap/BubbleSwapProposal'
import { BubbleText } from './components/BubbleText/BubbleText'
import { AgreementProposalModal } from './composer/AgreementProposalModal'
import { MessageComposer } from './MessageComposer'
import styles from './Messages.module.scss'
import {
  AgreementDetails,
  Conversation,
  Message,
  MessageRole,
  SwapProposalDetails,
  TextMessage,
} from './Messages.types'
import { AgreementVersion } from './Messages.types'
import { AgreementStoreError, useAgreementStore } from './useAgreementStore'

const isTextMessage = (message: Message): message is TextMessage =>
  message.type === undefined || message.type === 'text'

type ConfirmationRequest =
  | {
      kind: 'confirm'
      conversationId: number
      version: number
      details: AgreementDetails
      source: 'proposal' | 'change'
    }
  | {
      kind: 'cancel'
      conversationId: number
      version: number
      details: AgreementDetails
    }

type ChangeModalState = {
  open: boolean
  conversationId: number | null
  version: number | null
  initialDetails?: AgreementDetails
}

const hasVersion = (
  message: Message
): message is Message & { version: number } => 'version' in message

function toConversation(item: ApiConversation): Conversation {
  return {
    id: item.id,
    agreementId: item.agreementId,
    user: {
      name: `Conversación ${item.id}`,
      avatar: '',
      online: false,
    },
    badges: [],
    messages: [],
    myBooks: [],
    theirBooks: [],
  }
}

function toTextMessage(
  message: ApiMessage,
  currentUserId?: number
): TextMessage {
  return {
    id: message.id,
    role: message.senderId === currentUserId ? 'me' : 'them',
    tone: message.senderId === currentUserId ? 'primary' : 'neutral',
    type: 'text',
    text: message.body,
    time: new Date(message.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}

export const Messages = () => {
  const { t, i18n } = useTranslation()
  const useDemoConversations =
    import.meta.env.MODE === 'test' ||
    import.meta.env.PUBLIC_DEMO_MODE === 'true'
  const [conversations, setConversations] = useState<Conversation[]>(
    useDemoConversations ? mockConversations : []
  )
  const [isLoadingConversations, setIsLoadingConversations] =
    useState(!useDemoConversations)
  const [conversationError, setConversationError] = useState(false)
  const [conversationReloadKey, setConversationReloadKey] = useState(0)
  const [selectedId, setSelectedId] = useState<number | null>(
    useDemoConversations ? (mockConversations[0]?.id ?? null) : null
  )
  const {
    messages,
    conversationMessages,
    joinConversation,
    sendMessage,
    currentUser,
    isConnected,
    error,
  } = useChatSocket()
  const [serverMessages, setServerMessages] = useState<ApiMessage[]>([])
  const [serverAgreement, setServerAgreement] =
    useState<AgreementSnapshot | null>(null)
  const [serverAgreementHistory, setServerAgreementHistory] = useState<
    Awaited<ReturnType<typeof fetchAgreementHistory>>
  >([])
  const selected = conversations.find((c) => c.id === selectedId)

  const { getVersion, proposeVersion, confirmVersion, cancelVersion } =
    useAgreementStore(conversations)

  useEffect(() => {
    if (useDemoConversations) return
    let active = true
    setIsLoadingConversations(true)
    setConversationError(false)
    void fetchConversations()
      .then((items) => {
        if (!active) return
        const next = items.map(toConversation)
        setConversations(next)
        setSelectedId(next[0]?.id ?? null)
      })
      .catch(() => {
        if (!active) return
        setConversations([])
        setConversationError(true)
      })
      .finally(() => {
        if (active) setIsLoadingConversations(false)
      })
    return () => {
      active = false
    }
  }, [conversationReloadKey, useDemoConversations])

  useEffect(() => {
    if (useDemoConversations || selectedId === null) return
    let active = true
    setServerMessages([])
    void fetchMessageHistory(selectedId)
      .then((page) => {
        if (active) {
          setServerMessages(page.messages)
          joinConversation(selectedId, page.nextAfter)
        }
      })
      .catch(() => {
        if (active) setServerMessages([])
      })
    return () => {
      active = false
    }
  }, [isConnected, joinConversation, selectedId, useDemoConversations])

  useEffect(() => {
    if (useDemoConversations || !selected?.agreementId) {
      setServerAgreement(null)
      setServerAgreementHistory([])
      return
    }
    let active = true
    void Promise.all([
      fetchAgreement(selected.agreementId),
      fetchAgreementHistory(selected.agreementId),
    ])
      .then(([agreement, history]) => {
        if (!active) return
        setServerAgreement(agreement)
        setServerAgreementHistory(history)
      })
      .catch(() => {
        if (!active) return
        setServerAgreement(null)
        setServerAgreementHistory([])
      })
    return () => {
      active = false
    }
  }, [selected?.agreementId, useDemoConversations])

  const [changeModalState, setChangeModalState] = useState<ChangeModalState>({
    open: false,
    conversationId: null,
    version: null,
    initialDetails: undefined,
  })
  const [confirmationRequest, setConfirmationRequest] =
    useState<ConfirmationRequest | null>(null)
  const [confirmationError, setConfirmationError] = useState<string | null>(
    null
  )
  const [agreementError, setAgreementError] = useState<string | null>(null)
  const [isProcessingConfirmation, setIsProcessingConfirmation] =
    useState(false)

  const selfName =
    currentUser?.name ??
    t('community.messages.agreement.self', { defaultValue: 'Vos' })
  const changeConversation =
    changeModalState.conversationId !== null
      ? conversations.find(
          (conv) => conv.id === changeModalState.conversationId
        )
      : selected
  const listFormatter = useMemo(
    () =>
      new Intl.ListFormat(i18n.language, {
        style: 'long',
        type: 'conjunction',
      }),
    [i18n.language]
  )

  const buildStatusLabel = useCallback(
    (version?: AgreementVersion) => {
      if (!version) return undefined

      switch (version.status) {
        case 'pending':
          return t('community.messages.agreement.status.pending', {
            defaultValue: 'Pendiente',
          })
        case 'confirmed': {
          if (version.confirmedBy.length === 0) {
            return t('community.messages.agreement.status.confirmed', {
              defaultValue: 'Confirmado',
            })
          }
          const names = listFormatter.format(version.confirmedBy)
          return t('community.messages.agreement.status.confirmedBy', {
            defaultValue: 'Confirmado por {{names}}',
            names,
          })
        }
        case 'fullyConfirmed':
          return t('community.messages.agreement.status.both', {
            defaultValue: 'Acuerdo confirmado por ambas partes',
          })
        case 'inactive':
          return t('community.messages.agreement.status.inactive', {
            defaultValue: 'Acuerdo inactivo',
          })
        case 'cancelled':
          return t('community.messages.agreement.status.cancelled', {
            defaultValue: 'Acuerdo cancelado',
          })
        default:
          return undefined
      }
    },
    [listFormatter, t]
  )

  const mappedMessages: Message[] = useMemo(() => {
    if (!selected) return []

    if (!useDemoConversations) {
      const persisted = serverMessages.map((message) =>
        toTextMessage(message, currentUser?.id)
      )
      const live = conversationMessages
        .filter((message) => message.conversationId === selected.id)
        .filter(
          (message) =>
            !serverMessages.some(
              (stored) => stored.sequence === message.sequence
            )
        )
        .map((message) =>
          toTextMessage(
            {
              id: message.sequence,
              conversationId: message.conversationId,
              senderId: message.senderId,
              sequence: message.sequence,
              clientKey: message.clientKey,
              body: message.body,
              attachmentMetadata: null,
              createdAt: message.createdAt,
            },
            currentUser?.id
          )
        )
      return [...persisted, ...live]
    }

    const staticMessages: Message[] = selected.messages ?? []
    const maxStaticId = staticMessages.reduce(
      (maxId, message) => Math.max(maxId, message.id),
      0
    )
    const liveMessages = messages
      .filter((m) => m.channel === selected.user.name)
      .filter((m) => m.user.id !== currentUser?.id)
      .map((m, idx) => {
        const role: MessageRole = m.user.id === currentUser?.id ? 'me' : 'them'
        const tone: Message['tone'] = role === 'me' ? 'primary' : 'neutral'

        return {
          id: maxStaticId + idx + 1,
          role,
          tone,
          text: m.text,
          time: new Date(m.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          type: 'text' as const,
        }
      })

    return [...staticMessages, ...liveMessages]
  }, [
    conversationMessages,
    currentUser,
    messages,
    selected,
    serverMessages,
    useDemoConversations,
  ])

  const appendMessageToConversation = useCallback(
    (conversationId: number, message: Message) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? { ...conv, messages: [...conv.messages, message] }
            : conv
        )
      )
    },
    []
  )

  const createBaseMessage = (conversation: Conversation) => {
    const maxId = conversation.messages.reduce(
      (maxValue, msg) => Math.max(maxValue, msg.id),
      0
    )
    const nextId = maxId + 1

    return {
      id: nextId,
      role: 'me' as const,
      tone: 'primary' as const,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
  }

  const handleSendText = (draft: string) => {
    if (!draft.trim() || !selected || selectedId === null) return

    const baseMessage = createBaseMessage(selected)
    const newMessage: TextMessage = {
      ...baseMessage,
      type: 'text',
      text: draft.trim(),
    }

    if (useDemoConversations) {
      appendMessageToConversation(selectedId, newMessage)
      sendMessage(draft.trim(), selected.user.name)
      return
    }

    const clientKey = `${selectedId}-${Date.now()}-${Math.random()}`
    void sendPersistedMessage({
      conversationId: selectedId,
      clientKey,
      body: draft.trim(),
    }).then((message) => setServerMessages((prev) => [...prev, message]))
  }

  const handleAttachBook = (bookId: string, note?: string) => {
    if (!selected || selectedId === null) return

    const book =
      selected.myBooks.find((item) => item.id === bookId) ??
      selected.theirBooks.find((item) => item.id === bookId)

    if (!book) return

    const baseMessage = createBaseMessage(selected)
    const newMessage: Message = {
      ...baseMessage,
      type: 'bookCard',
      book,
      text: note?.trim() ? note.trim() : undefined,
    }

    appendMessageToConversation(selectedId, newMessage)
  }

  const handleSwapProposal = (details: SwapProposalDetails) => {
    if (!selected || selectedId === null) return

    const baseMessage = createBaseMessage(selected)

    appendMessageToConversation(selectedId, {
      ...baseMessage,
      type: 'swapProposal',
      swap: details,
    })
  }

  const handleAgreementProposal = (proposal: AgreementDetails) => {
    if (!selected || selectedId === null) return

    const baseMessage = createBaseMessage(selected)
    const version = proposeVersion(selectedId, proposal, selfName)
    if (!version) return

    appendMessageToConversation(selectedId, {
      ...baseMessage,
      type: 'agreementProposal',
      version: version.version,
      proposal,
    })
    setAgreementError(null)
  }

  const handleOpenChangeModal = useCallback(
    (conversationId: number, versionNumber: number) => {
      const version = getVersion(conversationId, versionNumber)
      if (!version) {
        const message = t('community.messages.agreement.errors.notFound', {
          defaultValue: 'La versión seleccionada ya no está disponible.',
        })
        setAgreementError(message)
        return
      }

      setAgreementError(null)
      setChangeModalState({
        open: true,
        conversationId,
        version: versionNumber,
        initialDetails: version.details,
      })
    },
    [getVersion, t]
  )

  const handleCloseChangeModal = useCallback(() => {
    setChangeModalState({
      open: false,
      conversationId: null,
      version: null,
      initialDetails: undefined,
    })
  }, [])

  const handleConfirmChange = (details: AgreementDetails) => {
    if (!changeModalState.open || changeModalState.conversationId === null) {
      return
    }

    const conversation = conversations.find(
      (conv) => conv.id === changeModalState.conversationId
    )
    if (!conversation) return

    const original = changeModalState.initialDetails
    const hasChanges =
      !original ||
      original.meetingPoint !== details.meetingPoint ||
      original.area !== details.area ||
      original.date !== details.date ||
      original.time !== details.time ||
      original.bookTitle !== details.bookTitle

    if (!hasChanges) {
      setAgreementError(
        t('community.messages.agreement.errors.noChanges', {
          defaultValue: 'Debes modificar al menos un dato antes de enviar.',
        })
      )
      return
    }

    const version = proposeVersion(conversation.id, details, selfName)
    if (!version) return

    const baseMessage = createBaseMessage(conversation)
    appendMessageToConversation(conversation.id, {
      ...baseMessage,
      type: 'agreementChange',
      version: version.version,
      proposal: details,
    })

    setAgreementError(null)
    handleCloseChangeModal()
  }

  const handleOpenConfirmDialog = useCallback(
    (
      conversationId: number,
      versionNumber: number,
      details: AgreementDetails,
      source: 'proposal' | 'change'
    ) => {
      const version = getVersion(conversationId, versionNumber)
      if (!version) {
        const message = t('community.messages.agreement.errors.notFound', {
          defaultValue: 'La versión seleccionada ya no está disponible.',
        })
        setAgreementError(message)
        return
      }

      if (version.status === 'inactive') {
        const message = t('community.messages.agreement.errors.inactive', {
          defaultValue: 'La versión ya no está activa.',
        })
        setAgreementError(message)
        return
      }

      if (version.status === 'cancelled') {
        const message = t('community.messages.agreement.errors.cancelled', {
          defaultValue: 'La versión ya fue cancelada.',
        })
        setAgreementError(message)
        return
      }

      setAgreementError(null)
      setConfirmationError(null)
      setConfirmationRequest({
        kind: 'confirm',
        conversationId,
        version: versionNumber,
        details,
        source,
      })
    },
    [getVersion, t]
  )

  const handleOpenCancelDialog = useCallback(
    (
      conversationId: number,
      versionNumber: number,
      details: AgreementDetails
    ) => {
      const version = getVersion(conversationId, versionNumber)
      if (!version) {
        const message = t('community.messages.agreement.errors.notFound', {
          defaultValue: 'La versión seleccionada ya no está disponible.',
        })
        setAgreementError(message)
        return
      }

      if (version.status === 'inactive') {
        const message = t('community.messages.agreement.errors.inactive', {
          defaultValue: 'La versión ya no está activa.',
        })
        setAgreementError(message)
        return
      }

      if (version.status === 'cancelled') {
        const message = t('community.messages.agreement.errors.cancelled', {
          defaultValue: 'La versión ya fue cancelada.',
        })
        setAgreementError(message)
        return
      }

      setAgreementError(null)
      setConfirmationError(null)
      setConfirmationRequest({
        kind: 'cancel',
        conversationId,
        version: versionNumber,
        details,
      })
    },
    [getVersion, t]
  )

  const handleCloseConfirmModal = useCallback(() => {
    setConfirmationRequest(null)
    setConfirmationError(null)
    setIsProcessingConfirmation(false)
    setAgreementError(null)
  }, [])

  const handleConfirmAction = useCallback(async () => {
    if (!confirmationRequest) return

    const conversation = conversations.find(
      (conv) => conv.id === confirmationRequest.conversationId
    )
    if (!conversation) {
      const message = t('community.messages.agreement.errors.notFound', {
        defaultValue: 'La versión seleccionada ya no está disponible.',
      })
      setAgreementError(message)
      setConfirmationError(message)
      setConfirmationRequest(null)
      return
    }

    setIsProcessingConfirmation(true)
    try {
      if (confirmationRequest.kind === 'confirm') {
        const version = getVersion(
          confirmationRequest.conversationId,
          confirmationRequest.version
        )
        if (!version) {
          const message = t('community.messages.agreement.errors.notFound', {
            defaultValue: 'La versión seleccionada ya no está disponible.',
          })
          setAgreementError(message)
          setConfirmationError(message)
          setConfirmationRequest(null)
          return
        }

        if (version.status === 'inactive') {
          const message = t('community.messages.agreement.errors.inactive', {
            defaultValue: 'La versión ya no está activa.',
          })
          setAgreementError(message)
          setConfirmationError(message)
          setConfirmationRequest(null)
          return
        }

        if (version.status === 'cancelled') {
          const message = t('community.messages.agreement.errors.cancelled', {
            defaultValue: 'La versión ya fue cancelada.',
          })
          setAgreementError(message)
          setConfirmationError(message)
          setConfirmationRequest(null)
          return
        }

        if (version.confirmedBy.includes(selfName)) {
          setAgreementError(null)
          setConfirmationError(null)
          setConfirmationRequest(null)
          return
        }

        const availability = await fetchBookAvailability(
          confirmationRequest.details.bookTitle
        )
        if (!availability.available) {
          const message = t('community.messages.agreement.errors.unavailable', {
            defaultValue: 'El libro ya no está disponible para intercambio.',
          })
          setAgreementError(message)
          setConfirmationError(message)
          return
        }

        confirmVersion(
          confirmationRequest.conversationId,
          confirmationRequest.version,
          selfName
        )

        const baseMessage = createBaseMessage(conversation)
        appendMessageToConversation(conversation.id, {
          ...baseMessage,
          type: 'agreementConfirmation',
          version: confirmationRequest.version,
          agreement: confirmationRequest.details,
          confirmedBy: selfName,
        })
        setAgreementError(null)
        setConfirmationError(null)
        setConfirmationRequest(null)
        return
      }

      cancelVersion(
        confirmationRequest.conversationId,
        confirmationRequest.version,
        selfName
      )

      const baseMessage = createBaseMessage(conversation)
      appendMessageToConversation(conversation.id, {
        ...baseMessage,
        type: 'agreementCancellation',
        version: confirmationRequest.version,
        cancelledBy: selfName,
        reason: t('community.messages.agreement.cancellation.defaultReason', {
          defaultValue: 'El acuerdo fue cancelado.',
        }),
      })
      setAgreementError(null)
      setConfirmationError(null)
      setConfirmationRequest(null)
    } catch (err) {
      let message = t('community.messages.agreement.errors.generic', {
        defaultValue: 'Ocurrió un error al procesar la acción.',
      })
      if (err instanceof AgreementStoreError) {
        if (err.code === 'version_inactive') {
          message = t('community.messages.agreement.errors.inactive', {
            defaultValue: 'La versión ya no está activa.',
          })
        } else if (err.code === 'version_cancelled') {
          message = t('community.messages.agreement.errors.cancelled', {
            defaultValue: 'La versión ya fue cancelada.',
          })
        } else if (err.code === 'version_not_found') {
          message = t('community.messages.agreement.errors.notFound', {
            defaultValue: 'No se encontró la versión seleccionada.',
          })
        }
      }
      setAgreementError(message)
      setConfirmationError(message)
    } finally {
      setIsProcessingConfirmation(false)
    }
  }, [
    appendMessageToConversation,
    cancelVersion,
    confirmationRequest,
    confirmVersion,
    conversations,
    getVersion,
    selfName,
    t,
  ])

  return (
    <div className={styles.wrapper}>
      {!isConnected && (
        <div className={styles.offlineBanner} role="alert">
          {error
            ? t('community.messages.status.disconnectedError', {
                defaultValue: `Desconectado: ${error}`,
                error,
              })
            : t('community.messages.status.disconnected', {
                defaultValue: 'Desconectado',
              })}
        </div>
      )}
      {agreementError ? (
        <div className={styles.agreementError} role="alert">
          {agreementError}
        </div>
      ) : null}
      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>{t('community.messages.title')}</h2>
            <input
              className={styles.search}
              placeholder={t('community.messages.searchPlaceholder', {
                defaultValue: 'Buscar',
              })}
              aria-label={t('community.messages.searchAriaLabel', {
                defaultValue: 'Buscar conversaciones',
              })}
            />
          </div>
          <ul className={styles.conversationList}>
            {isLoadingConversations ? (
              <li role="status">
                {t('community.messages.status.loading', {
                  defaultValue: 'Cargando conversaciones…',
                })}
              </li>
            ) : conversationError ? (
              <li role="alert">
                <span>
                  {t('community.messages.status.loadError', {
                    defaultValue: 'No se pudieron cargar las conversaciones.',
                  })}
                </span>{' '}
                <button
                  type="button"
                  onClick={() => setConversationReloadKey((key) => key + 1)}
                >
                  {t('community.messages.status.retry', {
                    defaultValue: 'Reintentar',
                  })}
                </button>
              </li>
            ) : conversations.length === 0 ? (
              <li role="status">
                {t('community.messages.status.empty', {
                  defaultValue: 'No hay conversaciones todavía.',
                })}
              </li>
            ) : (
              conversations.map((conv) => (
                <li
                  key={conv.id}
                  className={`${styles.conversationItem} ${selectedId === conv.id ? styles.conversationItemActive : ''}`}
                  onClick={() => setSelectedId(conv.id)}
                >
                  <img
                    src={conv.user.avatar}
                    alt={conv.user.name}
                    className={styles.avatar}
                  />
                  <div className={styles.conversationInfo}>
                    <span className={styles.name}>{conv.user.name}</span>
                    <span className={styles.snippet}>
                      {(() => {
                        const lastMsg = conv.messages[conv.messages.length - 1]
                        if (!lastMsg) return ''
                        if (lastMsg.type === 'agreementProposal') {
                          return t(
                            'community.messages.agreement.proposal.title'
                          )
                        }
                        if (lastMsg.type === 'agreementChange') {
                          return t('community.messages.agreement.change.title')
                        }
                        if (lastMsg.type === 'agreementConfirmation') {
                          return t(
                            'community.messages.agreement.confirmation.title'
                          )
                        }
                        if (lastMsg.type === 'agreementCancellation') {
                          return t(
                            'community.messages.agreement.cancellation.title'
                          )
                        }
                        if (lastMsg.type === 'swapProposal') {
                          return t('community.messages.swap.proposal.title', {
                            defaultValue: 'Propuesta de intercambio',
                          })
                        }
                        if (lastMsg.type === 'bookCard') {
                          return t('community.messages.snippets.sharedBook', {
                            defaultValue: 'Compartió un libro',
                          })
                        }
                        if (isTextMessage(lastMsg)) {
                          if (lastMsg.book)
                            return t('community.messages.snippets.sharedBook', {
                              defaultValue: 'Compartió un libro',
                            })
                          if (lastMsg.text) return lastMsg.text
                        }
                        return ''
                      })()}
                    </span>
                  </div>
                  <div className={styles.badges}>
                    {conv.badges.includes('unread') && (
                      <span className={`${styles.badge} ${styles.badgeUnread}`}>
                        {t('community.messages.badges.unread', {
                          defaultValue: 'Sin leer',
                        })}
                      </span>
                    )}
                    {conv.badges.includes('book') && (
                      <span className={`${styles.badge} ${styles.badgeBook}`}>
                        {t('community.messages.badges.book', {
                          defaultValue: 'Libro',
                        })}
                      </span>
                    )}
                    {conv.badges.includes('swap') && (
                      <span className={`${styles.badge} ${styles.badgeSwap}`}>
                        {t('community.messages.badges.swap', {
                          defaultValue: 'Oferta de intercambio',
                        })}
                      </span>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </aside>
        {selected ? (
          <div className={styles.chat}>
            <header className={styles.chatHeader}>
              <img
                src={selected.user.avatar}
                alt={selected.user.name}
                className={styles.avatar}
              />
              <div className={styles.chatHeaderInfo}>
                <span className={styles.name}>{selected.user.name}</span>
                <span className={styles.status}>
                  {selected.user.online
                    ? t('community.messages.status.online', {
                        defaultValue: 'En línea',
                      })
                    : t('community.messages.status.lastSeen', {
                        defaultValue: 'Última vez {{lastSeen}}',
                        lastSeen:
                          selected.user.lastSeen ??
                          t('community.messages.status.lastSeenFallback', {
                            defaultValue: 'hace un momento',
                          }),
                      })}
                </span>
              </div>
              <div className={styles.actions}>
                <button
                  aria-label={t('community.messages.actions.profile', {
                    defaultValue: 'Ver información del perfil',
                  })}
                >
                  <InfoIcon />
                </button>
              </div>
            </header>
            <div className={styles.messages}>
              {serverAgreement ? (
                <div role="status" aria-live="polite">
                  {t('community.messages.agreement.serverState', {
                    defaultValue:
                      'Estado del acuerdo: {{state}} (versión {{version}})',
                    state: serverAgreement.state,
                    version: serverAgreement.currentVersion,
                  })}
                  {serverAgreementHistory.length > 1 ? (
                    <span>
                      {' '}
                      {t('community.messages.agreement.historyCount', {
                        defaultValue: '{{count}} versiones registradas',
                        count: serverAgreementHistory.length,
                      })}
                    </span>
                  ) : null}
                </div>
              ) : null}
              {mappedMessages.map((msg) => {
                if (
                  selected &&
                  msg.type === 'agreementProposal' &&
                  hasVersion(msg)
                ) {
                  const versionInfo = getVersion(selected.id, msg.version)
                  const statusLabel = buildStatusLabel(versionInfo)
                  const confirmDisabled =
                    !versionInfo ||
                    versionInfo.status === 'inactive' ||
                    versionInfo.status === 'cancelled' ||
                    versionInfo.status === 'fullyConfirmed' ||
                    versionInfo.confirmedBy.includes(selfName)
                  const changeDisabled =
                    !versionInfo ||
                    versionInfo.status === 'inactive' ||
                    versionInfo.status === 'cancelled'
                  const cancelDisabled =
                    !versionInfo || versionInfo.status === 'cancelled'

                  return (
                    <BubbleAgreementProposal
                      key={msg.id}
                      role={msg.role}
                      proposal={msg.proposal}
                      time={msg.time}
                      statusLabel={statusLabel}
                      onSuggestChange={
                        changeDisabled
                          ? undefined
                          : () =>
                              handleOpenChangeModal(selected.id, msg.version)
                      }
                      onCancel={
                        cancelDisabled
                          ? undefined
                          : () =>
                              handleOpenCancelDialog(
                                selected.id,
                                msg.version,
                                msg.proposal
                              )
                      }
                      onConfirm={
                        confirmDisabled
                          ? undefined
                          : () =>
                              handleOpenConfirmDialog(
                                selected.id,
                                msg.version,
                                msg.proposal,
                                'proposal'
                              )
                      }
                      confirmDisabled={confirmDisabled}
                      changeDisabled={changeDisabled}
                      cancelDisabled={cancelDisabled}
                    />
                  )
                }

                if (
                  selected &&
                  msg.type === 'agreementChange' &&
                  hasVersion(msg)
                ) {
                  const versionInfo = getVersion(selected.id, msg.version)
                  const statusLabel = buildStatusLabel(versionInfo)
                  const confirmDisabled =
                    !versionInfo ||
                    versionInfo.status === 'inactive' ||
                    versionInfo.status === 'cancelled' ||
                    versionInfo.status === 'fullyConfirmed' ||
                    versionInfo.confirmedBy.includes(selfName)
                  const changeDisabled =
                    !versionInfo || versionInfo.status === 'cancelled'
                  const cancelDisabled =
                    !versionInfo || versionInfo.status === 'cancelled'

                  return (
                    <BubbleAgreementChange
                      key={msg.id}
                      role={msg.role}
                      proposal={msg.proposal}
                      time={msg.time}
                      statusLabel={statusLabel}
                      onSuggestChange={
                        changeDisabled
                          ? undefined
                          : () =>
                              handleOpenChangeModal(selected.id, msg.version)
                      }
                      onCancel={
                        cancelDisabled
                          ? undefined
                          : () =>
                              handleOpenCancelDialog(
                                selected.id,
                                msg.version,
                                msg.proposal
                              )
                      }
                      onConfirm={
                        confirmDisabled
                          ? undefined
                          : () =>
                              handleOpenConfirmDialog(
                                selected.id,
                                msg.version,
                                msg.proposal,
                                'change'
                              )
                      }
                      confirmDisabled={confirmDisabled}
                      changeDisabled={changeDisabled}
                      cancelDisabled={cancelDisabled}
                    />
                  )
                }

                if (
                  selected &&
                  msg.type === 'agreementCancellation' &&
                  hasVersion(msg)
                ) {
                  const versionInfo = getVersion(selected.id, msg.version)
                  const statusLabel = buildStatusLabel(versionInfo)

                  return (
                    <BubbleAgreementCancellation
                      key={msg.id}
                      role={msg.role}
                      cancelledBy={msg.cancelledBy}
                      reason={msg.reason}
                      details={versionInfo?.details}
                      time={msg.time}
                      statusLabel={statusLabel}
                      onProposeNew={() =>
                        handleOpenChangeModal(selected.id, msg.version)
                      }
                      proposeNewDisabled={!versionInfo}
                    />
                  )
                }

                if (msg.type === 'swapProposal') {
                  return (
                    <BubbleSwapProposal
                      key={msg.id}
                      role={msg.role}
                      tone={msg.tone}
                      swap={msg.swap}
                      time={msg.time}
                    />
                  )
                }

                if (
                  selected &&
                  msg.type === 'agreementConfirmation' &&
                  hasVersion(msg)
                ) {
                  const versionInfo = getVersion(selected.id, msg.version)
                  const statusLabel = buildStatusLabel(versionInfo)
                  return (
                    <BubbleAgreementConfirmation
                      key={msg.id}
                      role={msg.role}
                      agreement={msg.agreement}
                      confirmedBy={msg.confirmedBy}
                      time={msg.time}
                      statusLabel={statusLabel}
                    />
                  )
                }

                return (
                  <BubbleText
                    key={msg.id}
                    role={msg.role}
                    tone={msg.tone}
                    text={'text' in msg ? msg.text : undefined}
                    book={'book' in msg ? msg.book : undefined}
                    time={msg.time}
                  />
                )
              })}
            </div>
            <MessageComposer
              className={styles.inputArea}
              disabled={!isConnected}
              onSendText={handleSendText}
              onAttachBook={handleAttachBook}
              onProposeSwap={handleSwapProposal}
              onProposeAgreement={handleAgreementProposal}
              myBooks={selected.myBooks}
              theirBooks={selected.theirBooks}
              counterpartName={selected.user.name}
              conversationId={selected.id}
            />
            <AgreementProposalModal
              open={changeModalState.open}
              myBooks={changeConversation?.myBooks ?? selected.myBooks}
              theirBooks={changeConversation?.theirBooks ?? selected.theirBooks}
              counterpartName={
                changeConversation?.user.name ?? selected.user.name
              }
              onClose={handleCloseChangeModal}
              onConfirm={handleConfirmChange}
              initialDetails={changeModalState.initialDetails}
              titleOverride={t(
                'community.messages.agreement.change.modalTitle',
                {
                  defaultValue: 'Proponer cambios',
                }
              )}
              descriptionOverride={t(
                'community.messages.agreement.change.modalDescription',
                {
                  defaultValue:
                    'Ajustá la propuesta actualizando al menos un dato.',
                }
              )}
              submitLabelOverride={t(
                'community.messages.agreement.change.modalSubmit',
                { defaultValue: 'Enviar cambios' }
              )}
            />
            {confirmationRequest ? (
              <ConfirmAgreementModal
                open
                title={
                  confirmationRequest.kind === 'confirm'
                    ? t('community.messages.agreement.confirmModal.title', {
                        defaultValue: 'Confirmar acuerdo',
                      })
                    : t('community.messages.agreement.cancelModal.title', {
                        defaultValue: 'Confirmar cancelación',
                      })
                }
                description={
                  confirmationRequest.kind === 'confirm'
                    ? t(
                        'community.messages.agreement.confirmModal.description',
                        {
                          defaultValue:
                            'Revisá los datos antes de confirmar el acuerdo.',
                        }
                      )
                    : t(
                        'community.messages.agreement.cancelModal.description',
                        {
                          defaultValue:
                            'Esta acción cancelará el acuerdo vigente.',
                        }
                      )
                }
                details={confirmationRequest.details}
                onClose={handleCloseConfirmModal}
                onConfirm={handleConfirmAction}
                confirmLabel={
                  confirmationRequest.kind === 'confirm'
                    ? t('community.messages.agreement.actions.confirm')
                    : t(
                        'community.messages.agreement.cancellation.confirmAction',
                        { defaultValue: 'Cancelar acuerdo' }
                      )
                }
                cancelLabel={t('community.messages.composer.cancel', {
                  defaultValue: 'Cancelar',
                })}
                errorMessage={confirmationError}
                confirmDisabled={isProcessingConfirmation}
              />
            ) : null}
          </div>
        ) : (
          <div className={styles.placeholder}>
            {t('community.messages.placeholder', {
              defaultValue: 'Selecciona una conversación para comenzar',
            })}
          </div>
        )}
      </div>
    </div>
  )
}
