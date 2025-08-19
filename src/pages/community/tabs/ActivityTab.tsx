import { useTranslation } from 'react-i18next'

import styles from '../CommunityPage.module.scss'

export const ActivityTab = () => {
  const { t } = useTranslation()
  const itemKeys = [
    'community.activity.feed.new_book',
    'community.activity.feed.exchange',
    'community.activity.feed.new_house',
    'community.activity.feed.comment',
    'community.activity.feed.event',
  ]
  const items = itemKeys.map((key) => ({
    key,
    text: t(key),
  }))

  return (
    <section className={styles.tabContent}>
      <h2>{t('community.activity.title')}</h2>
      <ul className={styles.feedList}>
        {items.map((item) => (
          <li key={item.key}>{item.text}</li>
        ))}
      </ul>
    </section>
  )
}
