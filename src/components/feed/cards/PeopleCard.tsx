import { useTranslation } from 'react-i18next'

import { track } from '@src/utils/analytics'

import type { PersonItem } from '../FeedItem.types'

import styles from './FeedCard.module.scss'

interface Props {
  item: PersonItem
}

export const PeopleCard = ({ item }: Props) => {
  const { t } = useTranslation()

  const avatar = `https://i.pravatar.cc/300?u=${item.id}`

  const handleMessage = () => {
    track('feed.cta', { type: 'person', action: 'message' })
  }

  return (
    <article className={styles.card}>
      <img src={avatar} alt={item.name} className={styles.avatar} />
      <h3 className={styles.title}>{item.name}</h3>
      <p>{t('community.feed.person.match', { match: item.match })}</p>
      <div className={styles.actions}>
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
