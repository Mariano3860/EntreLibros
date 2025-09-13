import { mockConversations } from '@components/messages/Messages.mock'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ReactComponent as AttachIcon } from '@src/assets/icons/attachments.svg'
import { ReactComponent as EmojiIcon } from '@src/assets/icons/emoji.svg'
import { ReactComponent as InfoIcon } from '@src/assets/icons/info.svg'

import styles from './Messages.module.scss'
import { Conversation, Message } from './Messages.types'
import { useChatSocket } from '@hooks/socket/useChatSocket'

export const Messages = () => {
  const { t } = useTranslation()
  const [conversations] = useState<Conversation[]>(mockConversations)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [text, setText] = useState('')
  const { messages, sendMessage, currentUser } = useChatSocket()

  const selected = conversations.find((c) => c.id === selectedId)

  const mappedMessages: Message[] = useMemo(
    () =>
      messages.map((m, idx) => ({
        id: idx,
        sender: m.user.id === currentUser?.id ? 'me' : 'them',
        text: m.text,
        time: new Date(m.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      })),
    [messages, currentUser]
  )

  const handleSend = () => {
    if (!text.trim() || selectedId === null) return
    sendMessage(text.trim())
    setText('')
  }

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>{t('community.messages.title')}</h2>
          <input
            className={styles.search}
            placeholder="Search"
            aria-label="Search conversations"
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
                    if (lastMsg?.text) return lastMsg.text
                    if (lastMsg?.book) return 'Shared a book'
                    return ''
                  })()}
                </span>
              </div>
              <div className={styles.badges}>
                {conv.badges.includes('unread') && (
                  <span className={`${styles.badge} ${styles.badgeUnread}`}>
                    Unread
                  </span>
                )}
                {conv.badges.includes('book') && (
                  <span className={`${styles.badge} ${styles.badgeBook}`}>
                    Book
                  </span>
                )}
                {conv.badges.includes('swap') && (
                  <span className={`${styles.badge} ${styles.badgeSwap}`}>
                    Swap Offer
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
                  ? 'Online'
                  : `Last seen ${selected.user.lastSeen}`}
              </span>
            </div>
            <div className={styles.actions}>
              <button aria-label="Profile info">
                <InfoIcon />
              </button>
            </div>
          </header>
          <div className={styles.messages}>
            {mappedMessages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.message} ${msg.sender === 'me' ? styles.me : ''}`}
              >
                {msg.text && <p>{msg.text}</p>}
                {msg.book && (
                  <div className={styles.bookCard}>
                    <img
                      src={msg.book.cover}
                      alt={`Cover of ${msg.book.title}`}
                    />
                    <div>
                      <div className={styles.bookTitle}>{msg.book.title}</div>
                      <div className={styles.bookAuthor}>{msg.book.author}</div>
                    </div>
                  </div>
                )}
                <span className={styles.time}>{msg.time}</span>
              </div>
            ))}
          </div>
          <div className={styles.inputArea}>
            <div className={styles.inputWrapper}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Message..."
              />
              <div className={styles.inputIcons}>
                <button aria-label="Attachments">
                  <AttachIcon />
                </button>
                <button aria-label="Emoji">
                  <EmojiIcon />
                </button>
              </div>
            </div>
            <button
              aria-label="Send"
              onClick={handleSend}
              className={styles.sendButton}
            >
              ➤
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.placeholder}>Select a conversation to start</div>
      )}
    </div>
  )
}
