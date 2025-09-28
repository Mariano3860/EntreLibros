import { mockConversations } from '@components/messages/Messages.mock'
import { useChatSocket } from '@hooks/socket/useChatSocket'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ReactComponent as AttachIcon } from '@src/assets/icons/attachments.svg'
import { ReactComponent as EmojiIcon } from '@src/assets/icons/emoji.svg'
import { ReactComponent as InfoIcon } from '@src/assets/icons/info.svg'

import { BubbleCancellation } from './bubbles/BubbleCancellation'
import { BubbleConfirmation } from './bubbles/BubbleConfirmation'
import { BubblePostCheck } from './bubbles/BubblePostCheck'
import { BubbleProposal } from './bubbles/BubbleProposal'
import { BubbleReminder } from './bubbles/BubbleReminder'
import { BubbleReschedule } from './bubbles/BubbleReschedule'
import { BubbleText } from './bubbles/BubbleText'
import { BubbleTip } from './bubbles/BubbleTip'
import styles from './Messages.module.scss'
import { Conversation, ConversationBadge, Message } from './Messages.types'

type TemplateShortcut = {
  id: string
  label: string
  text: string
}

const badgeClassMap: Record<ConversationBadge, string> = {
  proposalPending: styles.badgePending,
  agreementConfirmed: styles.badgeConfirmed,
  reminderScheduled: styles.badgeReminder,
  awaitingFeedback: styles.badgeAwaiting,
  cancelled: styles.badgeCancelled,
}

export const Messages = () => {
  const { t, i18n } = useTranslation()
  const [conversations] = useState<Conversation[]>(mockConversations)
  const [selectedId, setSelectedId] = useState<number | null>(
    mockConversations[0]?.id ?? null
  )
  const [text, setText] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const { messages, sendMessage, currentUser, isConnected, error } =
    useChatSocket()

  const selected = conversations.find((c) => c.id === selectedId) ?? null

  const templateShortcuts: TemplateShortcut[] = useMemo(
    () => [
      {
        id: 'interest',
        label: t('community.messages.chat.templates.interest.label'),
        text: t('community.messages.chat.templates.interest.text'),
      },
      {
        id: 'availability',
        label: t('community.messages.chat.templates.availability.label'),
        text: t('community.messages.chat.templates.availability.text'),
      },
      {
        id: 'place',
        label: t('community.messages.chat.templates.place.label'),
        text: t('community.messages.chat.templates.place.text'),
      },
    ],
    [t]
  )

  const realtimeMessages: Message[] = useMemo(() => {
    if (!selected) return []
    return messages
      .filter((m) => m.channel === selected.channel)
      .map((m, idx) => ({
        id: `socket-${idx}-${m.timestamp}`,
        role: m.user.id === currentUser?.id ? 'me' : 'them',
        type: 'text',
        text: m.text,
        createdAt: m.timestamp,
      }))
  }, [messages, currentUser, selected])

  const timeline: Message[] = useMemo(() => {
    if (!selected) return []
    return [...selected.messages, ...realtimeMessages].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime()
      const bTime = new Date(b.createdAt).getTime()
      return aTime - bTime
    })
  }, [selected, realtimeMessages])

  const formatTime = (message: Message) => {
    if (message.displayTime) return message.displayTime
    const locale = i18n?.language ?? 'es'
    return new Date(message.createdAt).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getSnippet = (message: Message) => {
    switch (message.type) {
      case 'text':
      case 'template':
        return message.text
      case 'proposal':
        return t('community.messages.chat.snippets.proposal', {
          book: message.proposal.book.title,
        })
      case 'confirmation':
        return t('community.messages.chat.snippets.confirmation', {
          book: message.confirmation.book.title,
        })
      case 'reminder':
        return t('community.messages.chat.snippets.reminder', {
          time: message.reminder.details.schedule.time,
        })
      case 'reschedule':
        return t('community.messages.chat.snippets.reschedule')
      case 'cancellation':
        return t('community.messages.chat.snippets.cancellation')
      case 'post-check':
        return t('community.messages.chat.snippets.postMeeting')
      case 'safety-tip':
        return t('community.messages.chat.snippets.tip')
      default:
        return ''
    }
  }

  const badgeLabels = useMemo(
    () => ({
      proposalPending: t('community.messages.chat.badges.proposalPending'),
      agreementConfirmed: t(
        'community.messages.chat.badges.agreementConfirmed'
      ),
      reminderScheduled: t('community.messages.chat.badges.reminderScheduled'),
      awaitingFeedback: t('community.messages.chat.badges.awaitingFeedback'),
      cancelled: t('community.messages.chat.badges.cancelled'),
    }),
    [t]
  )

  const handleSend = () => {
    if (!text.trim() || selectedId === null || !selected) return
    sendMessage(text.trim(), selected.channel)
    setText('')
  }

  const handleTemplateInsert = (value: string) => {
    setText(value)
    setShowTemplates(false)
  }

  const renderMessage = (message: Message) => {
    const timeLabel = formatTime(message)
    switch (message.type) {
      case 'text':
        return (
          <BubbleText
            key={message.id}
            message={message}
            timeLabel={timeLabel}
          />
        )
      case 'template':
        return (
          <BubbleText
            key={message.id}
            message={message}
            timeLabel={timeLabel}
          />
        )
      case 'proposal':
        return (
          <BubbleProposal
            key={message.id}
            message={message}
            timeLabel={timeLabel}
          />
        )
      case 'confirmation':
        return (
          <BubbleConfirmation
            key={message.id}
            message={message}
            timeLabel={timeLabel}
          />
        )
      case 'reminder':
        return (
          <BubbleReminder
            key={message.id}
            message={message}
            timeLabel={timeLabel}
          />
        )
      case 'reschedule':
        return (
          <BubbleReschedule
            key={message.id}
            message={message}
            timeLabel={timeLabel}
          />
        )
      case 'cancellation':
        return (
          <BubbleCancellation
            key={message.id}
            message={message}
            timeLabel={timeLabel}
          />
        )
      case 'post-check':
        return (
          <BubblePostCheck
            key={message.id}
            message={message}
            timeLabel={timeLabel}
          />
        )
      case 'safety-tip':
        return (
          <BubbleTip key={message.id} message={message} timeLabel={timeLabel} />
        )
      default:
        return null
    }
  }

  return (
    <div className={styles.wrapper}>
      {!isConnected && (
        <div className={styles.offlineBanner} role="alert">
          {error
            ? t('community.messages.chat.offlineWithError', { error })
            : t('community.messages.chat.offline')}
        </div>
      )}
      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>{t('community.messages.title')}</h2>
            <input
              className={styles.search}
              placeholder={t('community.messages.chat.searchPlaceholder')}
              aria-label={t('community.messages.chat.searchAria')}
            />
          </div>
          <ul className={styles.conversationList}>
            {conversations.map((conv) => {
              const lastMessage = conv.messages[conv.messages.length - 1]
              const snippet = lastMessage ? getSnippet(lastMessage) : ''
              return (
                <li
                  key={conv.id}
                  className={`${styles.conversationItem} ${selectedId === conv.id ? styles.conversationItemActive : ''}`}
                  onClick={() => {
                    setSelectedId(conv.id)
                    setShowTemplates(false)
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedId(conv.id)
                      setShowTemplates(false)
                    }
                  }}
                >
                  <img
                    src={conv.user.avatar}
                    alt={conv.user.name}
                    className={styles.avatar}
                  />
                  <div className={styles.conversationInfo}>
                    <span className={styles.name}>{conv.user.name}</span>
                    <span className={styles.snippet}>{snippet}</span>
                  </div>
                  <div className={styles.badges}>
                    {conv.badges.map((badge) => (
                      <span
                        key={badge}
                        className={`${styles.badge} ${badgeClassMap[badge]}`}
                      >
                        {badgeLabels[badge]}
                      </span>
                    ))}
                  </div>
                </li>
              )
            })}
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
                <span
                  className={styles.status}
                  data-online={selected.user.online}
                >
                  {selected.user.online
                    ? t('community.messages.chat.status.online')
                    : t('community.messages.chat.status.lastSeen', {
                        value: selected.user.lastSeen ?? '—',
                      })}
                </span>
              </div>
              <div className={styles.actions}>
                <button
                  aria-label={t('community.messages.chat.actions.profile')}
                >
                  <InfoIcon />
                </button>
              </div>
            </header>
            <div className={styles.messages}>
              {timeline.map((message) => renderMessage(message))}
            </div>
            <div className={styles.inputArea}>
              <div className={styles.templateToggle}>
                <button
                  type="button"
                  onClick={() => setShowTemplates((prev) => !prev)}
                  aria-expanded={showTemplates}
                  aria-controls="template-menu"
                >
                  {t('community.messages.chat.templateButton')}
                </button>
                {showTemplates ? (
                  <div
                    id="template-menu"
                    role="menu"
                    className={styles.templateMenu}
                  >
                    {templateShortcuts.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        role="menuitem"
                        onClick={() => handleTemplateInsert(template.text)}
                      >
                        <span className={styles.templateMenuLabel}>
                          {template.label}
                        </span>
                        <span className={styles.templateMenuText}>
                          {template.text}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className={styles.inputWrapper}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t('community.messages.chat.inputPlaceholder')}
                  disabled={!isConnected}
                />
                <div className={styles.inputIcons}>
                  <button
                    aria-label={t('community.messages.chat.actions.attach')}
                  >
                    <AttachIcon />
                  </button>
                  <button
                    aria-label={t('community.messages.chat.actions.emoji')}
                  >
                    <EmojiIcon />
                  </button>
                </div>
              </div>
              <button
                aria-label={t('community.messages.chat.actions.send')}
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
            {t('community.messages.chat.emptyState')}
          </div>
        )}
      </div>
    </div>
  )
}
