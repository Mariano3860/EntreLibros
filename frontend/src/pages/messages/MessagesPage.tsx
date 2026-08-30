import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { FormEvent, useEffect, useRef, useState } from 'react'

import { usePrototype } from '@src/features/prototype/PrototypeContext'
import {
  Avatar,
  BookCover,
  Panel,
  PrototypeButton,
  PrototypePage,
} from '@src/features/prototype/PrototypeUI'

import styles from './MessagesPage.module.scss'

export const MessagesPage = () => {
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
