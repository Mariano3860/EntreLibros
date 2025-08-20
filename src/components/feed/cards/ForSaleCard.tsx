import { useTranslation } from 'react-i18next'

import { track } from '@src/utils/analytics'

import type { SaleItem } from '../FeedItem.types'

import styles from './FeedCard.module.scss'

interface Props {
  item: SaleItem
}

export const ForSaleCard = ({ item }: Props) => {
  const { t } = useTranslation()

  const image = `https://picsum.photos/seed/${item.id}/600/300`

  const handleBuy = () => {
    track('feed.cta', { type: 'sale', action: 'buy' })
  }

  return (
    <article className={styles.card}>
      <img src={image} alt={item.title} className={styles.image} />
      <h3 className={styles.title}>{item.title}</h3>
      <p>{t('community.feed.sale.price', { price: item.price })}</p>
      <div className={styles.actions}>
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
