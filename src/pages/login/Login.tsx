import { Header } from '@components/layout/header/Header'
import { LoginForm } from '@components/login/LoginForm'

import styles from './Login.module.scss'

const Login = () => {
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

export default Login
