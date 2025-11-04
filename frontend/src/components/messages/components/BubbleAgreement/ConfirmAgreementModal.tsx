import { FormEvent, RefObject, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { ComposerModal } from '../../composer/ComposerModal'
import { AgreementDetails } from '../../Messages.types'

import styles from './BubbleAgreement.module.scss'

type ConfirmAgreementModalProps = {
  open: boolean
  title: string
  description?: string
  details: AgreementDetails
  onClose: () => void
  onConfirm: () => void
  confirmLabel: string
  cancelLabel?: string
  errorMessage?: string | null
  confirmDisabled?: boolean
}

export const ConfirmAgreementModal = ({
  open,
  title,
  description,
  details,
  onClose,
  onConfirm,
  confirmLabel,
  cancelLabel,
  errorMessage,
  confirmDisabled,
}: ConfirmAgreementModalProps) => {
  const { t } = useTranslation()
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const node = confirmButtonRef.current
    if (node) {
      requestAnimationFrame(() => node.focus())
    }
  }, [open])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onConfirm()
  }

  const meetingPointLabel = `${details.meetingPoint} — ${details.area}`

  return (
    <ComposerModal
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      closeLabel={
        cancelLabel ??
        t('community.messages.composer.cancel', {
          defaultValue: 'Cancelar',
        })
      }
      initialFocusRef={confirmButtonRef as RefObject<HTMLElement>}
    >
      <form className={styles.summary} onSubmit={handleSubmit}>
        <div className={styles.summaryItem}>
          <span className={styles.label}>
            {t('community.messages.agreement.fields.place')}
          </span>
          <span className={`${styles.value} ${styles.valueStrong}`}>
            {meetingPointLabel}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.label}>
            {t('community.messages.agreement.fields.schedule')}
          </span>
          <span className={styles.value}>
            {details.date} · {details.time}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.label}>
            {t('community.messages.agreement.fields.book')}
          </span>
          <span className={styles.value}>{details.bookTitle}</span>
        </div>
        {errorMessage ? (
          <p className={styles.statusLine} role="alert">
            {errorMessage}
          </p>
        ) : null}
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.actionButtonSuggest}`}
            onClick={onClose}
          >
            {cancelLabel ??
              t('community.messages.composer.cancel', {
                defaultValue: 'Cancelar',
              })}
          </button>
          <button
            ref={confirmButtonRef}
            type="submit"
            className={`${styles.actionButton} ${styles.actionButtonConfirm}`}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </ComposerModal>
  )
}
