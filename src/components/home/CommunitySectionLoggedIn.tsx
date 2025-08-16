import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { HOME_URLS } from '@/constants/constants'
import styles from '@/pages/home/HomePage.module.scss'

export const CommunitySectionLoggedIn = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <section className={styles.communitySection}>
      <h2>{t('home.community_logged_in_title')}</h2>
      <p>{t('home.community_logged_in_subtitle')}</p>
      <button
        className={styles.ctaButton}
        onClick={() => navigate(`/${HOME_URLS.COMMUNITY}`)}
      >
        {t('home.community_logged_in_cta')}
      </button>
    </section>
  )
}
