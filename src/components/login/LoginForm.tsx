import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './LoginForm.module.scss'
import { LoginFormProps } from './LoginForm.types'
import { showToast } from '@/components/ui/toaster/Toaster'
import { useLogin } from '@hooks/api/useLogin'

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { mutate: login, isPending } = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(
      { email, password },
      {
        onSuccess: (data) => {
          showToast(t('auth.success.login'), 'success') // Notificación de éxito
          onSubmit?.(data)
        },
        onError: (error: any) => {
          showToast(
            t(error.response?.data?.message || 'auth.errors.unknown'),
            'error'
          ) // Notificación de error
        },
      }
    )
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
        disabled={isPending}
      >
        {isPending ? t('authenticating') : t('login')}
      </button>
    </form>
  )
}
