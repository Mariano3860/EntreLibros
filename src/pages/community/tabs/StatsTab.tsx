import { useTranslation } from 'react-i18next'

import styles from '../CommunityPage.module.scss'

export const StatsTab = () => {
  const { t } = useTranslation()
  return (
    <section className={styles.tabContent}>
      <h2>{t('community.stats.title')}</h2>
      <p>{t('community.stats.placeholder')}</p>
    </section>
  )
}
