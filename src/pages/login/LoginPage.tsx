import { Header } from '@components/layout/header/Header'
import { LoginForm } from '@components/login/LoginForm'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { HOME_URLS } from '@src/constants/constants'

import styles from './LoginPage.module.scss'

const LoginPage = () => {
  const { t } = useTranslation()
  return (
    <div className={styles.homeContainer}>
      <Header></Header>
      <main className={styles.mainContent}>
        <div className={styles.authSection}>
          <LoginForm onSubmit={() => {}} />
          <div className={styles.registerLink}>
            {t('no_account')}{' '}
            <Link to={`/${HOME_URLS.REGISTER}`}>{t('register')}</Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LoginPage
