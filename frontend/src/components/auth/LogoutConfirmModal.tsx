import { useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './LogoutConfirmModal.module.scss'

type LogoutConfirmModalProps = {
  open: boolean
  pending?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export const LogoutConfirmModal = ({
  open,
  pending = false,
  onCancel,
  onConfirm,
}: LogoutConfirmModalProps) => {
  const { t } = useTranslation()
  const titleId = useId()
  const descriptionId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => cancelRef.current?.focus())

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending) {
        event.preventDefault()
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel, open, pending])

  if (!open) return null

  return (
    <div className={styles.overlay} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <h2 id={titleId}>
          {t('auth.logout.title', { defaultValue: 'Logout?' })}
        </h2>
        <p id={descriptionId}>
          {t('auth.logout.description', {
            defaultValue: 'Are you sure you want to log out?',
          })}
        </p>
        <div className={styles.actions}>
          <button
            ref={cancelRef}
            type="button"
            className={styles.cancel}
            onClick={onCancel}
            disabled={pending}
          >
            {t('auth.logout.cancel', { defaultValue: 'Cancel' })}
          </button>
          <button
            type="button"
            className={styles.confirm}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending
              ? t('auth.logout.confirming', { defaultValue: 'Logging out...' })
              : t('auth.logout.confirm', { defaultValue: 'Logout' })}
          </button>
        </div>
      </div>
    </div>
  )
}
