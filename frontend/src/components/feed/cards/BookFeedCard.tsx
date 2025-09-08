import { useTranslation } from 'react-i18next'

import { track } from '@src/utils/analytics'

import { FeedActions } from '../FeedActions'
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
      <header className={styles.header}>
        <img src={item.avatar} alt={item.user} />
        <span>{item.user}</span>
      </header>
      <img src={item.cover} alt={item.title} className={styles.image} />
      <FeedActions initialLikes={item.likes} />
      <div className={styles.content}>
        <h3 className={styles.title}>{item.title}</h3>
        <p>{item.author}</p>
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
