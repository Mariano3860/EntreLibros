import { useTranslation } from 'react-i18next'

import { track } from '@src/utils/analytics'

import type { SeekingItem } from '../FeedItem.types'

import styles from './FeedCard.module.scss'

interface Props {
  item: SeekingItem
}

export const SeekingCard = ({ item }: Props) => {
  const { t } = useTranslation()

  const image = `https://picsum.photos/seed/${item.id}/600/300`

  const handleOffer = () => {
    track('feed.cta', { type: 'seeking', action: 'offer' })
  }

  return (
    <article className={styles.card}>
      <img src={image} alt={item.title} className={styles.image} />
      <h3 className={styles.title}>{item.user}</h3>
      <p>{t('community.feed.seeking.description', { title: item.title })}</p>
      <div className={styles.actions}>
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
