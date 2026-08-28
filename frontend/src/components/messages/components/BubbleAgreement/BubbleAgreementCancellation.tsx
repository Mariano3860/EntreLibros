import { useTranslation } from 'react-i18next'

import { AgreementDetails } from '../../Messages.types'
import {
  BubbleBase,
  BubbleBaseProps,
  BubbleRole,
} from '../BubbleBase/BubbleBase'

import styles from './BubbleAgreement.module.scss'

type BubbleAgreementCancellationProps = {
  role?: BubbleRole
  cancelledBy: string
  reason?: string
  details?: AgreementDetails
  time?: string
  className?: string
  statusLabel?: string
  onProposeNew?: () => void
  proposeNewDisabled?: boolean
} & Pick<BubbleBaseProps, 'ariaLabel'>

export const BubbleAgreementCancellation = ({
  role = 'them',
  cancelledBy,
  reason,
  details,
  time,
  className,
  ariaLabel,
  statusLabel,
  onProposeNew,
  proposeNewDisabled,
}: BubbleAgreementCancellationProps) => {
  const { t } = useTranslation()

  const meetingPointLabel = details
    ? `${details.meetingPoint} — ${details.area}`
    : null

  const autoAriaLabel = t(
    'community.messages.agreement.cancellation.ariaLabel',
    {
      defaultValue: 'Agreement cancelled by {{name}} for the book {{book}}',
      name: cancelledBy,
      book: details?.bookTitle ?? '',
    }
  )

  return (
    <BubbleBase
      role={role}
      tone="secondary"
      header={t('community.messages.agreement.cancellation.title')}
      className={className}
      meta={time ? <span className={styles.time}>{time}</span> : null}
      ariaLabel={ariaLabel ?? autoAriaLabel}
      actions={
        onProposeNew ? (
          <button
            type="button"
            className={`${styles.actionButton} ${styles.actionButtonSuggest}`}
            onClick={onProposeNew}
            disabled={proposeNewDisabled}
          >
            {t('community.messages.agreement.cancellation.proposeNew')}
          </button>
        ) : null
      }
    >
      <div className={styles.summary}>
        {statusLabel ? (
          <p className={styles.statusLine}>{statusLabel}</p>
        ) : null}
        <p className={styles.summaryItem}>
          {t('community.messages.agreement.cancellation.by', {
            defaultValue: 'Cancelled by {{name}}',
            name: cancelledBy,
          })}
        </p>
        {reason ? (
          <p className={styles.summaryItem}>
            {t('community.messages.agreement.cancellation.reason', {
              defaultValue: 'Reason: {{reason}}',
              reason,
            })}
          </p>
        ) : null}
        {details ? (
          <>
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
          </>
        ) : null}
      </div>
    </BubbleBase>
  )
}
