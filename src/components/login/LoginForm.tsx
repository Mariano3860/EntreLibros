import { useLogin } from '@hooks/api/useLogin'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { showToast } from '@src/components/ui/toaster/Toaster'
import { HOME_URLS } from '@src/constants/constants'

import styles from './LoginForm.module.scss'
import { LoginFormProps } from './LoginForm.types'

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { mutate: login, isPending } = useLogin()

  const getErrorMessage = (error: Error) => {
    const errorKeyMap: Record<string, string> = {
      invalid_credentials: 'auth.errors.invalid_credentials',
      'auth.errors.invalid_credentials': 'auth.errors.invalid_credentials',
    }

    const translationKey = errorKeyMap[error.message]

    if (translationKey) {
      const translated = t(translationKey)
      return translated === translationKey
        ? t('auth.errors.unknown')
        : translated
    }

    return error.message || t('auth.errors.unknown')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(
      { email, password },
      {
        onSuccess: (data) => {
          showToast(t('auth.success.login'), 'success')
          onSubmit?.(data)
          navigate(`/${HOME_URLS.HOME}`)
        },
        onError: (error: Error) => {
          showToast(getErrorMessage(error), 'error')
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
