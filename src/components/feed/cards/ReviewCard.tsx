import { useTranslation } from 'react-i18next'

import { track } from '@src/utils/analytics'

import type { ReviewItem } from '../FeedItem.types'

import styles from './FeedCard.module.scss'

interface Props {
  item: ReviewItem
}

export const ReviewCard = ({ item }: Props) => {
  const { t } = useTranslation()

  const image = `https://picsum.photos/seed/${item.id}/600/300`

  const handleHelpful = () => {
    track('feed.cta', { type: 'review', action: 'helpful' })
  }

  return (
    <article className={styles.card}>
      <img src={image} alt={item.book} className={styles.image} />
      <h3 className={styles.title}>{item.user}</h3>
      <p>{item.quote}</p>
      <div className={styles.actions}>
        <button
          className={styles.primaryButton}
          onClick={handleHelpful}
          aria-label={t('community.feed.cta.helpful')}
        >
          {t('community.feed.cta.helpful')}
        </button>
      </div>
    </article>
  )
}
