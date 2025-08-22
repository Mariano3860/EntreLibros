import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './Messages.module.scss'

interface Book {
  title: string
  author: string
  cover: string
}

interface Message {
  id: number
  sender: 'me' | 'them'
  text?: string
  book?: Book
  time: string
}

interface Conversation {
  id: number
  user: {
    name: string
    avatar: string
    online: boolean
    lastSeen?: string
  }
  badges: ('unread' | 'book' | 'swap')[]
  messages: Message[]
}

const mockConversations: Conversation[] = [
  {
    id: 1,
    user: {
      name: 'Samuel',
      avatar: 'https://i.pravatar.cc/40?img=1',
      online: true,
    },
    badges: ['book'],
    messages: [
      {
        id: 1,
        sender: 'them',
        text: "I'll trade it for your book",
        time: '4:30 PM',
      },
      {
        id: 2,
        sender: 'me',
        text: "Hi! I'm interested in To Kill a Mockingbird",
        time: '4:32 PM',
      },
      {
        id: 3,
        sender: 'them',
        text: 'Sure! Are you offering a book for exchange?',
        time: '4:35 PM',
      },
      {
        id: 4,
        sender: 'me',
        text: "I'll trade it for your book",
        book: {
          title: 'The Wind-Up Bird Chronicle',
          author: 'Haruki Murakami',
          cover: 'https://covers.openlibrary.org/b/id/240726-S.jpg',
        },
        time: '4:37 PM',
      },
      {
        id: 5,
        sender: 'them',
        text: 'Sounds good!',
        time: '4:37 PM',
      },
    ],
  },
  {
    id: 2,
    user: {
      name: 'Laura',
      avatar: 'https://i.pravatar.cc/40?img=2',
      online: false,
      lastSeen: '2h ago',
    },
    badges: ['unread'],
    messages: [
      {
        id: 1,
        sender: 'them',
        text: 'Great, thanks!',
        time: '1:15 PM',
      },
    ],
  },
  {
    id: 3,
    user: {
      name: 'Pablo',
      avatar: 'https://i.pravatar.cc/40?img=3',
      online: false,
      lastSeen: '5m ago',
    },
    badges: ['swap'],
    messages: [
      {
        id: 1,
        sender: 'them',
        text: 'Swap request pending',
        time: 'Yesterday',
      },
    ],
  },
  {
    id: 4,
    user: {
      name: 'Sophia',
      avatar: 'https://i.pravatar.cc/40?img=4',
      online: false,
      lastSeen: 'online',
    },
    badges: [],
    messages: [
      {
        id: 1,
        sender: 'them',
        text: 'Whoa, sounds like a great book!',
        time: 'Yesterday',
      },
    ],
  },
]

export const Messages = () => {
  const { t } = useTranslation()
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [text, setText] = useState('')

  const selected = conversations.find((c) => c.id === selectedId)

  const handleSend = () => {
    if (!text.trim() || selectedId === null) return
    const newMsg: Message = {
      id: Date.now(),
      sender: 'me',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, messages: [...c.messages, newMsg] } : c)),
    )
    setText('')
  }

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>{t('community.messages.title')}</h2>
          <input className={styles.search} placeholder="Search" />
        </div>
        <ul className={styles.conversationList}>
          {conversations.map((conv) => (
            <li
              key={conv.id}
              className={`${styles.conversationItem} ${selectedId === conv.id ? styles.conversationItemActive : ''}`}
              onClick={() => setSelectedId(conv.id)}
            >
              <img src={conv.user.avatar} alt={conv.user.name} className={styles.avatar} />
              <div className={styles.conversationInfo}>
                <span className={styles.name}>{conv.user.name}</span>
                <span className={styles.snippet}>{conv.messages[conv.messages.length - 1]?.text}</span>
              </div>
              <div className={styles.badges}>
                {conv.badges.includes('unread') && (
                  <span className={`${styles.badge} ${styles.badgeUnread}`}>Unread</span>
                )}
                {conv.badges.includes('book') && (
                  <span className={`${styles.badge} ${styles.badgeBook}`}>Book</span>
                )}
                {conv.badges.includes('swap') && (
                  <span className={`${styles.badge} ${styles.badgeSwap}`}>Swap Offer</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </aside>
      {selected ? (
        <div className={styles.chat}>
          <header className={styles.chatHeader}>
            <img src={selected.user.avatar} alt={selected.user.name} className={styles.avatar} />
            <div className={styles.chatHeaderInfo}>
              <span className={styles.name}>{selected.user.name}</span>
              <span className={styles.status}>
                {selected.user.online ? 'Online' : `Last seen ${selected.user.lastSeen}`}
              </span>
            </div>
            <div className={styles.actions}>
              <button aria-label="Call">📞</button>
              <button aria-label="Video call">📹</button>
              <button aria-label="Profile info">ℹ️</button>
            </div>
          </header>
          <div className={styles.messages}>
            {selected.messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.message} ${msg.sender === 'me' ? styles.me : ''}`}
              >
                {msg.text && <p>{msg.text}</p>}
                {msg.book && (
                  <div className={styles.bookCard}>
                    <img src={msg.book.cover} alt={`Cover of ${msg.book.title}`} />
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
                <button aria-label="Attach book">📎</button>
                <button aria-label="Emoji">😊</button>
                <button aria-label="Attach image">🖼️</button>
              </div>
            </div>
            <button aria-label="Send" onClick={handleSend} className={styles.sendButton}>
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
