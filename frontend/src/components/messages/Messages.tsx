import { mockConversations } from '@components/messages/Messages.mock'
import { useChatSocket } from '@hooks/socket/useChatSocket'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ReactComponent as AttachIcon } from '@src/assets/icons/attachments.svg'
import { ReactComponent as EmojiIcon } from '@src/assets/icons/emoji.svg'
import { ReactComponent as InfoIcon } from '@src/assets/icons/info.svg'

import { BubbleAgreementConfirmation } from './components/BubbleAgreement/BubbleAgreementConfirmation'
import { BubbleAgreementProposal } from './components/BubbleAgreement/BubbleAgreementProposal'
import { BubbleText } from './components/BubbleText/BubbleText'
import styles from './Messages.module.scss'
import { Conversation, Message, MessageRole } from './Messages.types'

export const Messages = () => {
  const { t } = useTranslation()
  const [conversations] = useState<Conversation[]>(mockConversations)
  const [selectedId, setSelectedId] = useState<number | null>(
    mockConversations[0]?.id ?? null
  )
  const [text, setText] = useState('')
  const { messages, sendMessage, currentUser, isConnected, error } =
    useChatSocket()

  const selected = conversations.find((c) => c.id === selectedId)

  const mappedMessages: Message[] = useMemo(() => {
    if (!selected) return []

    const staticMessages: Message[] = selected.messages ?? []
    const maxStaticId = staticMessages.reduce(
      (maxId, message) => Math.max(maxId, message.id),
      0
    )
    const liveMessages = messages
      .filter((m) => m.channel === selected.user.name)
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
  }, [messages, currentUser, selected])

  const handleSend = () => {
    if (!text.trim() || selectedId === null || !selected) return
    sendMessage(text.trim(), selected.user.name)
    setText('')
  }

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
            {conversations.map((conv) => (
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
                        return t('community.messages.agreement.proposal.title')
                      }
                      if (lastMsg.type === 'agreementConfirmation') {
                        return t(
                          'community.messages.agreement.confirmation.title'
                        )
                      }
                      if ('book' in lastMsg && lastMsg.book)
                        return t('community.messages.snippets.sharedBook', {
                          defaultValue: 'Compartió un libro',
                        })
                      if ('text' in lastMsg && lastMsg.text) return lastMsg.text
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
            ))}
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
              {mappedMessages.map((msg) => {
                if (msg.type === 'agreementProposal') {
                  return (
                    <BubbleAgreementProposal
                      key={msg.id}
                      role={msg.role}
                      proposal={msg.proposal}
                      time={msg.time}
                    />
                  )
                }

                if (msg.type === 'agreementConfirmation') {
                  return (
                    <BubbleAgreementConfirmation
                      key={msg.id}
                      role={msg.role}
                      agreement={msg.agreement}
                      confirmedBy={msg.confirmedBy}
                      time={msg.time}
                    />
                  )
                }

                return (
                  <BubbleText
                    key={msg.id}
                    role={msg.role}
                    tone={msg.tone}
                    text={msg.text}
                    book={msg.book}
                    time={msg.time}
                  />
                )
              })}
            </div>
            <div className={styles.inputArea}>
              <div className={styles.inputWrapper}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t('community.messages.inputPlaceholder', {
                    defaultValue: 'Escribe un mensaje...',
                  })}
                  disabled={!isConnected}
                />
                <div className={styles.inputIcons}>
                  <button
                    aria-label={t('community.messages.actions.attachments', {
                      defaultValue: 'Adjuntar archivos',
                    })}
                  >
                    <AttachIcon />
                  </button>
                  <button
                    aria-label={t('community.messages.actions.emoji', {
                      defaultValue: 'Abrir selector de emojis',
                    })}
                  >
                    <EmojiIcon />
                  </button>
                </div>
              </div>
              <button
                aria-label={t('community.messages.actions.send', {
                  defaultValue: 'Enviar mensaje',
                })}
                onClick={handleSend}
                className={styles.sendButton}
                disabled={!isConnected}
              >
                ➤
              </button>
            </div>
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
