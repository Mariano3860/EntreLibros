import { useTranslation } from 'react-i18next'

import { ApiEvent } from '@src/api/events/events.types'

import styles from './EventCard.module.scss'

interface Props {
  event: ApiEvent
}

export const EventCard = ({ event }: Props) => {
  const { t, i18n } = useTranslation()

  const date = new Date(event.date)
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }
  const time = date.toLocaleTimeString(i18n.language, {
    hour: '2-digit',
    minute: '2-digit',
  })
  const formattedDate = `${date.toLocaleDateString(
    i18n.language,
    dateOptions
  )}, ${time}`

  return (
    <article className={styles.card}>
      <img
        src={event.imageUrl}
        alt={t('community.events.image_alt', { title: event.title })}
        className={styles.image}
      />
      <div className={styles.content}>
        <h3 className={styles.title}>{event.title}</h3>
        <p className={styles.info}>{formattedDate}</p>
        <p className={styles.info}>{event.location}</p>
        <p className={styles.info}>{event.description}</p>
        <span className={`${styles.status} ${styles[event.status]}`}>
          {t(`community.events.status.${event.status}`)}
        </span>
        <button className={styles.detailsButton}>
          {t('community.events.details')}
        </button>
      </div>
    </article>
  )
}
