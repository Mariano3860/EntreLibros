import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { showToast } from '@/components/ui/toaster/Toaster'
import { HOME_URLS } from '@/constants/constants'
import { useRegister } from '@/hooks/api/useRegister'

import styles from './RegisterForm.module.scss'
import { RegisterFormProps } from './RegisterForm.types'

type FormValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export const RegisterForm = ({ onSubmit }: RegisterFormProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutate: doRegister, isPending } = useRegister()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>()

  const getErrorMessage = (error: unknown) => {
    const err = error as { response?: { data?: { message?: string } } }
    const message = err.response?.data?.message || 'auth.errors.unknown'
    return t(message)
  }

  const onSubmitForm = (data: FormValues) => {
    doRegister(
      { name: data.name, email: data.email, password: data.password },
      {
        onSuccess: (response) => {
          showToast(t('auth.success.register'), 'success')
          onSubmit?.(response)
          navigate(`/${HOME_URLS.LOGIN}`)
        },
        onError: (error: unknown) => {
          showToast(getErrorMessage(error), 'error')
        },
      }
    )
  }

  const password = watch('password')

  return (
    <form className={styles.registerForm} onSubmit={handleSubmit(onSubmitForm)}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('welcome')}</h2>
        <p className={styles.subtitle}>{t('login_subtitle')}</p>
      </div>

      <div className={styles.formGroup}>
        <input
          type="text"
          placeholder={t('name')}
          className={styles.input}
          {...register('name', { required: true })}
        />
        {errors.name && (
          <span className={styles.errorMessage}>
            {t('form.errors.required')}
          </span>
        )}
        <input
          type="email"
          placeholder={t('email')}
          className={styles.input}
          {...register('email', { required: true })}
        />
        {errors.email && (
          <span className={styles.errorMessage}>
            {t('form.errors.required')}
          </span>
        )}
        <input
          type="password"
          placeholder={t('password')}
          className={styles.input}
          {...register('password', { required: true, minLength: 6 })}
        />
        {errors.password && (
          <span className={styles.errorMessage}>
            {t('form.errors.min_length', { count: 6 })}
          </span>
        )}
        <input
          type="password"
          placeholder={t('confirm_password')}
          className={styles.input}
          {...register('confirmPassword', {
            validate: (value) => value === password,
          })}
        />
        {errors.confirmPassword && (
          <span className={styles.errorMessage}>
            {t('form.errors.required')}
          </span>
        )}
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isPending}
      >
        {isPending ? t('authenticating') : t('register')}
      </button>

      <p className={styles.loginLink}>
        {t('have_account')} <Link to={`/${HOME_URLS.LOGIN}`}>{t('login')}</Link>
      </p>
    </form>
  )
}
