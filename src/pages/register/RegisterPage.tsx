import { Header } from '@components/layout/header/Header'
import { RegisterForm } from '@components/register/RegisterForm'

import styles from './RegisterPage.module.scss'

const RegisterPage = () => {
  return (
    <div className={styles.homeContainer}>
      <Header></Header>
      <main className={styles.mainContent}>
        <div className={styles.authSection}>
          <RegisterForm onSubmit={() => {}} />
        </div>
      </main>
    </div>
  )
}

export default RegisterPage
