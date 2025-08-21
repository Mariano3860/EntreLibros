import { useTranslation } from 'react-i18next'

import { track } from '@src/utils/analytics'

import { FeedActions } from '../FeedActions'
import type { PersonItem } from '../FeedItem.types'

import styles from './FeedCard.module.scss'

interface Props {
  item: PersonItem
}

export const PeopleCard = ({ item }: Props) => {
  const { t } = useTranslation()

  const handleMessage = () => {
    track('feed.cta', { type: 'person', action: 'message' })
  }

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <img src={item.avatar} alt={item.user} />
        <span>{item.user}</span>
      </header>
      <img src={item.avatar} alt={item.name} className={styles.image} />
      <FeedActions initialLikes={item.likes} />
      <div className={styles.content}>
        <h3 className={styles.title}>{item.name}</h3>
        <p>{t('community.feed.person.match', { match: item.match })}</p>
        <button
          className={styles.primaryButton}
          onClick={handleMessage}
          aria-label={t('community.feed.cta.message')}
        >
          {t('community.feed.cta.message')}
        </button>
      </div>
    </article>
  )
}
