import { Header } from '@components/layout/header/Header'
import { RegisterForm } from '@components/register/RegisterForm'
import { useNavigate } from 'react-router-dom'

import styles from './RegisterPage.module.scss'

const RegisterPage = () => {
  const navigate = useNavigate()

  const handleRegisterSubmit = () => {
    navigate('/login')
  }

  return (
    <div className={styles.homeContainer}>
      <Header></Header>
      <main className={styles.mainContent}>
        <div className={styles.authSection}>
          <RegisterForm onSubmit={handleRegisterSubmit} />
        </div>
      </main>
    </div>
  )
}

export default RegisterPage
