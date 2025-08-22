import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useMessages } from '@src/hooks/api/useMessages'
import { useSendMessage } from '@src/hooks/api/useSendMessage'

import styles from './MessagesTab.module.scss'

export const MessagesTab = () => {
  const { t } = useTranslation()
  const { data: messages = [] } = useMessages()
  const sendMessage = useSendMessage()
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      sendMessage.mutate(value)
      setValue('')
    }
  }

  return (
    <section className={styles.messagesSection}>
      <h2>{t('community.messages.title')}</h2>
      <div className={styles.messagesList}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.message} ${msg.sender === 'user' ? styles.user : styles.other}`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('community.messages.input_placeholder')}
        />
        <button type="submit">{t('community.messages.send')}</button>
      </form>
    </section>
  )
}
