import { useFocusTrap } from '@hooks/useFocusTrap'
import { useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './AuthRequiredModal.module.scss'

type AuthRequiredModalProps = {
  open: boolean
  onClose: () => void
  onLogin: () => void
  onRegister: () => void
}

export const AuthRequiredModal = ({
  open,
  onClose,
  onLogin,
  onRegister,
}: AuthRequiredModalProps) => {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useFocusTrap({
    containerRef: dialogRef,
    active: open,
    onEscape: onClose,
  })

  useEffect(() => {
    if (!open) return
    document.body.classList.add('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [open])

  if (!open) return null

  return (
    <div className={styles.overlay} role="presentation">
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t('auth.required.close')}
        >
          ×
        </button>
        <img
          className={styles.illustration}
          src="/prototype/auth-required.svg"
          alt={t('auth.required.illustrationAlt')}
        />
        <h2 id={titleId}>{t('auth.required.title')}</h2>
        <p id={descriptionId} className={styles.description}>
          {t('auth.required.description')}
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={onRegister}>
            {t('auth.required.register')}
          </button>
          <span className={styles.separator} aria-hidden="true">
            {t('auth.required.or')}
          </span>
          <button type="button" className={styles.secondary} onClick={onLogin}>
            {t('auth.required.login')}
          </button>
        </div>
        <p className={styles.community}>{t('auth.required.community')}</p>
      </div>
    </div>
  )
}
