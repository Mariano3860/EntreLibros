import { useTranslation } from 'react-i18next'

import styles from '../CommunityPage.module.scss'

export const ForumsTab = () => {
  const { t } = useTranslation()
  return (
    <section className={styles.tabContent}>
      <h2>{t('community.forums.title')}</h2>
      <p>{t('community.forums.placeholder')}</p>
    </section>
  )
}
