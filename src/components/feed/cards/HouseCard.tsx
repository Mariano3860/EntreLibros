import { useTranslation } from 'react-i18next'

import { track } from '@src/utils/analytics'

import type { HouseItem } from '../FeedItem.types'

import styles from './FeedCard.module.scss'

interface Props {
  item: HouseItem
}

export const HouseCard = ({ item }: Props) => {
  const { t } = useTranslation()

  const image = `https://picsum.photos/seed/${item.id}/600/300`

  const handleOpen = () => {
    track('feed.cta', { type: 'house', action: 'open' })
  }

  return (
    <article className={styles.card}>
      <img src={image} alt={item.name} className={styles.image} />
      <h3 className={styles.title}>{item.name}</h3>
      <p>{t('community.feed.house.distance', { distance: item.distance })}</p>
      <div className={styles.actions}>
        <button
          className={styles.primaryButton}
          onClick={handleOpen}
          aria-label={t('community.feed.cta.open_map')}
        >
          {t('community.feed.cta.open_map')}
        </button>
      </div>
    </article>
  )
}
