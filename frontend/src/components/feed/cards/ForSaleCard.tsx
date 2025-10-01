import { useTranslation } from 'react-i18next'

import { track } from '@src/utils/analytics'

import { FeedActions } from '../FeedActions'
import type { SaleItem } from '../FeedItem.types'

import styles from './FeedCard.module.scss'
import { FeedCardHeader } from './FeedCardHeader'

interface Props {
  item: SaleItem
}

export const ForSaleCard = ({ item }: Props) => {
  const { t } = useTranslation()

  const handleBuy = () => {
    track('feed.cta', { type: 'sale', action: 'buy' })
  }

  return (
    <article className={styles.card}>
      <FeedCardHeader item={item} />
      <img src={item.cover} alt={item.title} className={styles.image} />
      <FeedActions initialLikes={item.likes} />
      <div className={styles.content}>
        <h3 className={styles.title}>{item.title}</h3>
        <p>{t('community.feed.sale.price', { price: item.price })}</p>
        <button
          className={styles.primaryButton}
          onClick={handleBuy}
          aria-label={t('community.feed.cta.buy')}
        >
          {t('community.feed.cta.buy')}
        </button>
      </div>
    </article>
  )
}
