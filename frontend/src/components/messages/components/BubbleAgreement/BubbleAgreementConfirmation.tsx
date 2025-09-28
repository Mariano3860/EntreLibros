import { useTranslation } from 'react-i18next'

import { AgreementDetails } from '../../Messages.types'
import {
  BubbleBase,
  BubbleBaseProps,
  BubbleRole,
} from '../BubbleBase/BubbleBase'

import styles from './BubbleAgreement.module.scss'

type BubbleAgreementConfirmationProps = {
  role?: BubbleRole
  agreement: AgreementDetails
  confirmedBy: string
  time?: string
  className?: string
} & Pick<BubbleBaseProps, 'ariaLabel'>

export const BubbleAgreementConfirmation = ({
  role = 'them',
  agreement,
  confirmedBy,
  time,
  className,
  ariaLabel,
}: BubbleAgreementConfirmationProps) => {
  const { t } = useTranslation()

  const meetingPointLabel = `${agreement.meetingPoint} — ${agreement.area}`

  const autoAriaLabel = t(
    'community.messages.agreement.confirmation.ariaLabel',
    {
      defaultValue:
        'Agreement confirmed by {{name}}: {{meetingPoint}}, {{date}} at {{time}} for the book {{book}}',
      name: confirmedBy,
      meetingPoint: meetingPointLabel,
      date: agreement.date,
      time: agreement.time,
      book: agreement.bookTitle,
    }
  )

  return (
    <BubbleBase
      role={role}
      tone="success"
      header={t('community.messages.agreement.confirmation.title')}
      className={className}
      meta={time ? <span className={styles.time}>{time}</span> : null}
      ariaLabel={ariaLabel ?? autoAriaLabel}
    >
      <div className={styles.summary}>
        <p className={styles.statusLine}>
          {t('community.messages.agreement.confirmation.status', {
            name: confirmedBy,
          })}
        </p>
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
            {agreement.date} · {agreement.time}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.label}>
            {t('community.messages.agreement.fields.book')}
          </span>
          <span className={styles.value}>{agreement.bookTitle}</span>
        </div>
      </div>
    </BubbleBase>
  )
}
