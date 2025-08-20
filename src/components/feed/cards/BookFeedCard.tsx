import { useTranslation } from 'react-i18next'

import { track } from '@src/utils/analytics'

import type { BookItem } from '../FeedItem.types'

import styles from './FeedCard.module.scss'

interface Props {
  item: BookItem
}

export const BookFeedCard = ({ item }: Props) => {
  const { t } = useTranslation()

  const handlePrimary = () => {
    track('feed.cta', { type: 'book', action: 'primary' })
  }

  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{item.title}</h3>
      <p>{item.author}</p>
      <div className={styles.actions}>
        <button
          className={styles.primaryButton}
          onClick={handlePrimary}
          aria-label={t('community.feed.cta.propose_swap')}
        >
          {t('community.feed.cta.propose_swap')}
        </button>
      </div>
    </article>
  )
}
