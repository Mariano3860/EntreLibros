import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { showToast } from '@src/components/ui/toaster/Toaster'
import { HOME_URLS } from '@src/constants/constants'
import { useRegister } from '@src/hooks/api/useRegister'

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
  const { mutate: doRegister, isPending } = useRegister()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>()

  const getErrorMessage = (error: unknown) => {
    const err = error as { response?: { data?: { message?: string } } }
    const message = err.response?.data?.message
    if (!message) {
      return t('auth.errors.unknown')
    }
    const translated = t(message)
    return translated === message ? t('auth.errors.unknown') : translated
  }

  const onSubmitForm = (data: FormValues) => {
    doRegister(
      { name: data.name, email: data.email, password: data.password },
      {
        onSuccess: (response) => {
          showToast(t('auth.success.register'), 'success')
          onSubmit?.(response)
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
            {errors.password.type === 'required'
              ? t('form.errors.required')
              : t('form.errors.min_length', { count: 6 })}
          </span>
        )}
        <input
          type="password"
          placeholder={t('confirm_password')}
          className={styles.input}
          {...register('confirmPassword', {
            required: true,
            validate: (value) =>
              value === password || t('form.errors.password_mismatch'),
          })}
        />
        {errors.confirmPassword && (
          <span className={styles.errorMessage}>
            {errors.confirmPassword.type === 'required'
              ? t('form.errors.required')
              : (errors.confirmPassword.message as string)}
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
