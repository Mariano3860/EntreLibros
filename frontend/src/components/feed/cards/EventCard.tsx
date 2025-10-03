import { useTranslation } from 'react-i18next'

import { track } from '@src/utils/analytics'

import { FeedActions } from '../FeedActions'
import type { EventItem } from '../FeedItem.types'

import styles from './FeedCard.module.scss'
import { FeedCardHeader } from './FeedCardHeader'

interface Props {
  item: EventItem
}

export const EventCard = ({ item }: Props) => {
  const { t } = useTranslation()

  const handleGo = () => {
    track('feed.cta', { type: 'event', action: 'go' })
  }

  const image = `https://picsum.photos/seed/${item.title}/600/400`

  return (
    <article className={styles.card}>
      <FeedCardHeader item={item} />
      <img src={image} alt={item.title} className={styles.image} />
      <FeedActions initialLikes={item.likes} />
      <div className={styles.content}>
        <h3 className={styles.title}>{item.title}</h3>
        <p>
          {item.date} · {item.location}
        </p>
        <button
          className={styles.primaryButton}
          onClick={handleGo}
          aria-label={t('community.feed.cta.go')}
        >
          {t('community.feed.cta.go')}
        </button>
      </div>
    </article>
  )
}
