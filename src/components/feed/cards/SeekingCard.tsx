import { useTranslation } from 'react-i18next'

import { track } from '@src/utils/analytics'

import { FeedActions } from '../FeedActions'
import type { SeekingItem } from '../FeedItem.types'

import styles from './FeedCard.module.scss'

interface Props {
  item: SeekingItem
}

export const SeekingCard = ({ item }: Props) => {
  const { t } = useTranslation()

  const handleOffer = () => {
    track('feed.cta', { type: 'seeking', action: 'offer' })
  }

  const image = `https://picsum.photos/seed/${item.title}/600/400`

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <img src={item.avatar} alt={item.user} />
        <span>{item.user}</span>
      </header>
      <img src={image} alt={item.title} className={styles.image} />
      <FeedActions initialLikes={item.likes} />
      <div className={styles.content}>
        <p>
          {item.user} {t('community.feed.seeking.description', { title: item.title })}
        </p>
        <button
          className={styles.primaryButton}
          onClick={handleOffer}
          aria-label={t('community.feed.cta.offer_copy')}
        >
          {t('community.feed.cta.offer_copy')}
        </button>
      </div>
    </article>
  )
}
