import { formatDistanceToNow } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'

import styles from './UserActivityItem.module.scss'

type UserActivityItemProps = {
  bookTitle: string
  action: 'added' | 'exchanged'
  coverUrl: string
  timestamp: string // ISO 8601
}

export const UserActivityItem = ({
  bookTitle,
  action,
  coverUrl,
  timestamp,
}: UserActivityItemProps) => {
  const { t, i18n } = useTranslation()

  const currentLocale = i18n.language === 'es' ? es : enUS

  const actionText = {
    added: t('activity.added'),
    exchanged: t('activity.exchanged'),
  }[action]

  const timeAgo = formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
    locale: currentLocale,
  })

  return (
    <div className={styles.activityItem}>
      <img src={coverUrl} alt={t('activity.cover_alt', { title: bookTitle })} />
      <div className={styles.info}>
        <p className={styles.action}>
          {actionText} <strong>{bookTitle}</strong>
        </p>
        <span className={styles.time}>{timeAgo}</span>
      </div>
    </div>
  )
}
