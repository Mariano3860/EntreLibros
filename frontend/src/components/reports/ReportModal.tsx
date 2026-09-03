import { createReport, type ReportTargetType } from '@api/reports/reports'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Panel, PrototypeButton } from '@src/features/prototype/PrototypeUI'

import styles from './ReportModal.module.scss'

export const ReportModal = ({
  isOpen,
  targetType,
  targetId,
  onClose,
}: {
  isOpen: boolean
  targetType: ReportTargetType
  targetId: string
  onClose: () => void
}) => {
  const { t } = useTranslation()
  const [reason, setReason] = useState('')
  const mutation = useMutation({
    mutationFn: () =>
      createReport({ targetType, targetId, reason: reason.trim() }),
  })
  const resetMutationRef = useRef(mutation.reset)

  useEffect(() => {
    if (!isOpen) {
      setReason('')
      resetMutationRef.current()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={styles.backdrop} role="presentation">
      <Panel className={styles.modal} as="div" aria-label={t('reports.report')}>
        <header className={styles.header}>
          <div>
            <span>
              {t(
                `reports.categories.${targetType === 'corner_missing' ? 'cornerMissing' : targetType}`
              )}
            </span>
            <h2>{t('reports.report')}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>
        {mutation.isSuccess ? (
          <div className={styles.success} role="status">
            <p>{t('reports.submitted')}</p>
            <PrototypeButton tone="primary" onClick={onClose}>
              {t('bookDetail.close', { defaultValue: 'Cerrar' })}
            </PrototypeButton>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              mutation.mutate()
            }}
          >
            <label className={styles.field}>
              <span>{t('reports.reason')}</span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                minLength={3}
                maxLength={1000}
                required
                rows={5}
              />
            </label>
            {mutation.isError ? (
              <p className={styles.error} role="alert">
                {t('reports.error')}
              </p>
            ) : null}
            <div className={styles.actions}>
              <PrototypeButton type="button" onClick={onClose}>
                {t('bookDetail.cancel', { defaultValue: 'Cancelar' })}
              </PrototypeButton>
              <PrototypeButton
                type="submit"
                tone="primary"
                disabled={mutation.isPending || reason.trim().length < 3}
              >
                {mutation.isPending
                  ? t('reports.sending')
                  : t('reports.submit')}
              </PrototypeButton>
            </div>
          </form>
        )}
      </Panel>
    </div>
  )
}
