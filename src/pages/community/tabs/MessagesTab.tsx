import { useTranslation } from 'react-i18next'

import styles from '../CommunityPage.module.scss'

export const MessagesTab = () => {
  const { t } = useTranslation()
  return (
    <section className={styles.tabContent}>
      <h2>{t('community.messages.title')}</h2>
      <p>{t('community.messages.placeholder')}</p>
    </section>
  )
}
