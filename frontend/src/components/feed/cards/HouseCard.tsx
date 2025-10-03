import { useTranslation } from 'react-i18next'

import { track } from '@src/utils/analytics'

import { FeedActions } from '../FeedActions'
import type { HouseItem } from '../FeedItem.types'

import styles from './FeedCard.module.scss'
import { FeedCardHeader } from './FeedCardHeader'

interface Props {
  item: HouseItem
}

export const HouseCard = ({ item }: Props) => {
  const { t } = useTranslation()

  const handleMap = () => {
    track('feed.cta', { type: 'house', action: 'map' })
  }

  const image = `https://picsum.photos/seed/${item.name}/600/400`

  return (
    <article className={styles.card}>
      <FeedCardHeader item={item} />
      <img src={image} alt={item.name} className={styles.image} />
      <FeedActions initialLikes={item.likes} />
      <div className={styles.content}>
        <h3 className={styles.title}>{item.name}</h3>
        <p>{t('community.feed.house.distance', { distance: item.distance })}</p>
        <button
          className={styles.secondaryButton}
          onClick={handleMap}
          aria-label={t('community.feed.cta.open_map')}
        >
          {t('community.feed.cta.open_map')}
        </button>
      </div>
    </article>
  )
}
