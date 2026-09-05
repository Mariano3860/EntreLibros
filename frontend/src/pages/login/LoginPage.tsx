import { Header } from '@components/layout/header/Header'
import { LoginForm } from '@components/login/LoginForm'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'

import { HOME_URLS } from '@src/constants/constants'
import { getSafeReturnTo } from '@src/contexts/auth/AuthRequiredContext'

import styles from './LoginPage.module.scss'

const LoginPage = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const requestedReturnTo = searchParams.get('returnTo')
  const returnTo = requestedReturnTo
    ? getSafeReturnTo(requestedReturnTo, '', '')
    : undefined
  return (
    <div className={styles.homeContainer}>
      <Header></Header>
      <main className={styles.mainContent}>
        <div className={styles.authSection}>
          {requestedReturnTo ? (
            <p role="status">{t('auth.required.loginNotice')}</p>
          ) : null}
          <LoginForm onSubmit={() => {}} redirectTo={returnTo} />
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
