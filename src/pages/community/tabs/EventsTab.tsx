import { useTranslation } from 'react-i18next'

import styles from '../CommunityPage.module.scss'

export const EventsTab = () => {
  const { t } = useTranslation()
  return (
    <section className={styles.tabContent}>
      <h2>{t('community.events.title')}</h2>
      <p>{t('community.events.placeholder')}</p>
    </section>
  )
}
