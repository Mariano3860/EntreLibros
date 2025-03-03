import styles from './Home.module.scss'
import { LoginForm } from '@components/login/LoginForm'
import { Header } from '@components/layout/header/Header'

const Home = () => {
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

export default Home
