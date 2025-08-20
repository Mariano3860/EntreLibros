import { useTranslation } from 'react-i18next'

import { track } from '@src/utils/analytics'

import type { EventItem } from '../FeedItem.types'

import styles from './FeedCard.module.scss'

interface Props {
  item: EventItem
}

export const EventCard = ({ item }: Props) => {
  const { t } = useTranslation()

  const handleGo = () => {
    track('feed.cta', { type: 'event', action: 'going' })
  }

  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{item.title}</h3>
      <p>{item.location}</p>
      <div className={styles.actions}>
        <button onClick={handleGo} aria-label={t('community.feed.cta.go')}>
          {t('community.feed.cta.go')}
        </button>
      </div>
    </article>
  )
}
