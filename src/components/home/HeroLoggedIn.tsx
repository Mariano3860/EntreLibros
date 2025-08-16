import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { HOME_URLS } from '@/constants/constants'
import styles from '@/pages/home/HomePage.module.scss'

export const HeroLoggedIn = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <section className={styles.hero}>
      <h1>{t('home.hero_logged_in_title')}</h1>
      <p>{t('home.hero_logged_in_subtitle')}</p>
      <button
        className={styles.ctaButton}
        onClick={() => navigate(`/${HOME_URLS.BOOKS}`)}
      >
        {t('home.hero_logged_in_cta')}
      </button>
    </section>
  )
}
