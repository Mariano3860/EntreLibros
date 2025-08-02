import { Header } from '@components/layout/header/Header'
import { LoginForm } from '@components/login/LoginForm'

import styles from './LoginPage.module.scss'

const LoginPage = () => {
  return (
    <div className={styles.homeContainer}>
      <Header></Header>
      <main className={styles.mainContent}>
        <div className={styles.authSection}>
          <LoginForm onSubmit={() => {}} />
        </div>
      </main>
    </div>
  )
}

export default LoginPage
