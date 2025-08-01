import styles from './Login.module.scss'
import { LoginForm } from '@components/login/LoginForm'
import { Header } from '@components/layout/header/Header'

const Login = () => {
  return (
    <div className={styles.homeContainer}>
      <Header></Header>
      <main className={styles.mainContent}>
        <div className={styles.authSection}>
          <LoginForm onSubmit={(credentials) => console.log(credentials)} />
        </div>
      </main>
    </div>
  )
}

export default Login
