import { JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './LoginForm.module.scss'
import { LoginFormProps } from './LoginForm.types'

export const LoginForm = ({
  onSubmit,
  isLoading = false,
}: LoginFormProps): JSX.Element => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ email, password })
  }

  return (
    <form className={styles.loginForm} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('welcome')}</h2>
        <p className={styles.subtitle}>{t('login_subtitle')}</p>
      </div>

      <div className={styles.formGroup}>
        <input
          type="email"
          placeholder={t('email')}
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder={t('password')}
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? t('authenticating') : t('login')}
      </button>
    </form>
  )
}
