import { useTranslation } from 'react-i18next'

import { AgreementDetails } from '../../Messages.types'
import {
  BubbleBase,
  BubbleBaseProps,
  BubbleRole,
} from '../BubbleBase/BubbleBase'

import styles from './BubbleAgreement.module.scss'

type BubbleAgreementProposalProps = {
  role?: BubbleRole
  proposal: AgreementDetails
  time?: string
  className?: string
} & Pick<BubbleBaseProps, 'ariaLabel'>

export const BubbleAgreementProposal = ({
  role = 'me',
  proposal,
  time,
  className,
  ariaLabel,
}: BubbleAgreementProposalProps) => {
  const { t } = useTranslation()

  const meetingPointLabel = `${proposal.meetingPoint} — ${proposal.area}`

  const autoAriaLabel = t('community.messages.agreement.proposal.ariaLabel', {
    defaultValue:
      'Agreement proposal: {{meetingPoint}}, {{date}} at {{time}} for the book {{book}}',
    meetingPoint: meetingPointLabel,
    date: proposal.date,
    time: proposal.time,
    book: proposal.bookTitle,
  })

  return (
    <BubbleBase
      role={role}
      tone="warning"
      header={t('community.messages.agreement.proposal.title')}
      className={className}
      meta={time ? <span className={styles.time}>{time}</span> : null}
      ariaLabel={ariaLabel ?? autoAriaLabel}
      actions={
        <>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.actionButtonSuggest}`}
          >
            {t('community.messages.agreement.actions.suggestChange')}
          </button>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.actionButtonConfirm}`}
          >
            {t('community.messages.agreement.actions.confirm')}
          </button>
        </>
      }
    >
      <div className={styles.summary}>
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
