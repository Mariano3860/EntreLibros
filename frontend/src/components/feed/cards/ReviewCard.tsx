import { useTranslation } from 'react-i18next'

import { track } from '@src/utils/analytics'

import { FeedActions } from '../FeedActions'
import type { ReviewItem } from '../FeedItem.types'

import styles from './FeedCard.module.scss'
import { FeedCardHeader } from './FeedCardHeader'

interface Props {
  item: ReviewItem
}

export const ReviewCard = ({ item }: Props) => {
  const { t } = useTranslation()

  const handleHelpful = () => {
    track('feed.cta', { type: 'review', action: 'helpful' })
  }

  const image = `https://picsum.photos/seed/${item.book}/600/400`

  return (
    <article className={styles.card}>
      <FeedCardHeader item={item} />
      <img src={image} alt={item.book} className={styles.image} />
      <FeedActions initialLikes={item.likes} />
      <div className={styles.content}>
        <h3 className={styles.title}>{item.book}</h3>
        <p>{item.quote}</p>
        <button
          className={styles.secondaryButton}
          onClick={handleHelpful}
          aria-label={t('community.feed.cta.helpful')}
        >
          {t('community.feed.cta.helpful')}
        </button>
      </div>
    </article>
  )
}
