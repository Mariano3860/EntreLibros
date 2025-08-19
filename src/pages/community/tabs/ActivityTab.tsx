import { useTranslation } from 'react-i18next'

import styles from '../CommunityPage.module.scss'

export const ActivityTab = () => {
  const { t } = useTranslation()
  const items = [
    t('community.activity.feed.new_book'),
    t('community.activity.feed.exchange'),
    t('community.activity.feed.new_house'),
    t('community.activity.feed.comment'),
    t('community.activity.feed.event'),
  ]

  return (
    <section className={styles.tabContent}>
      <h2>{t('community.activity.title')}</h2>
      <ul className={styles.feedList}>
        {items.map((text, idx) => (
          <li key={idx}>{text}</li>
        ))}
      </ul>
    </section>
  )
}
