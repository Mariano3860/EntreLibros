import { useTranslation } from 'react-i18next'

import { AgreementDetails } from '../../Messages.types'
import {
  BubbleBase,
  BubbleBaseProps,
  BubbleRole,
} from '../BubbleBase/BubbleBase'

import styles from './BubbleAgreement.module.scss'

type BubbleAgreementChangeProps = {
  role?: BubbleRole
  proposal: AgreementDetails
  time?: string
  className?: string
  statusLabel?: string
  onSuggestChange?: () => void
  onConfirm?: () => void
  onCancel?: () => void
  confirmDisabled?: boolean
  changeDisabled?: boolean
  cancelDisabled?: boolean
} & Pick<BubbleBaseProps, 'ariaLabel'>

export const BubbleAgreementChange = ({
  role = 'them',
  proposal,
  time,
  className,
  ariaLabel,
  statusLabel,
  onSuggestChange,
  onConfirm,
  onCancel,
  confirmDisabled,
  changeDisabled,
  cancelDisabled,
}: BubbleAgreementChangeProps) => {
  const { t } = useTranslation()

  const meetingPointLabel = `${proposal.meetingPoint} — ${proposal.area}`

  const autoAriaLabel = t('community.messages.agreement.change.ariaLabel', {
    defaultValue:
      'Agreement change proposal: {{meetingPoint}}, {{date}} at {{time}} for the book {{book}}',
    meetingPoint: meetingPointLabel,
    date: proposal.date,
    time: proposal.time,
    book: proposal.bookTitle,
  })

  return (
    <BubbleBase
      role={role}
      tone="info"
      header={t('community.messages.agreement.change.title')}
      className={className}
      meta={time ? <span className={styles.time}>{time}</span> : null}
      ariaLabel={ariaLabel ?? autoAriaLabel}
      actions={
        <>
          {onSuggestChange ? (
            <button
              type="button"
              className={`${styles.actionButton} ${styles.actionButtonSuggest}`}
              onClick={onSuggestChange}
              disabled={changeDisabled}
            >
              {t('community.messages.agreement.actions.suggestChange')}
            </button>
          ) : null}
          {onCancel ? (
            <button
              type="button"
              className={`${styles.actionButton} ${styles.actionButtonCancel}`}
              onClick={onCancel}
              disabled={cancelDisabled}
            >
              {t('community.messages.agreement.actions.cancel')}
            </button>
          ) : null}
          {onConfirm ? (
            <button
              type="button"
              className={`${styles.actionButton} ${styles.actionButtonConfirm}`}
              onClick={onConfirm}
              disabled={confirmDisabled}
            >
              {t('community.messages.agreement.actions.confirm')}
            </button>
          ) : null}
        </>
      }
    >
      <div className={styles.summary}>
        {statusLabel ? (
          <p className={styles.statusLine}>{statusLabel}</p>
        ) : null}
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
            {proposal.date} · {proposal.time}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.label}>
            {t('community.messages.agreement.fields.book')}
          </span>
          <span className={styles.value}>{proposal.bookTitle}</span>
        </div>
      </div>
    </BubbleBase>
  )
}
