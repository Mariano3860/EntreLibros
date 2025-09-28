import { useTranslation } from 'react-i18next'

import { CancellationMessage } from '../Messages.types'

import { AgreementDetailsSummary } from './AgreementDetails'
import { BubbleBase } from './BubbleBase'
import styles from './BubbleContent.module.scss'

export type BubbleCancellationProps = {
  message: CancellationMessage
  timeLabel: string
}

export const BubbleCancellation = ({
  message,
  timeLabel,
}: BubbleCancellationProps) => {
  const { t } = useTranslation()

  return (
    <BubbleBase
      role={message.role}
      tone="secondary"
      header={t('community.messages.chat.labels.cancellation')}
      meta={<time dateTime={message.createdAt}>{timeLabel}</time>}
      ariaLabel={t('community.messages.chat.a11y.cancellation')}
    >
      <p className={styles.note}>
        {t('community.messages.chat.cancellation.reason', {
          reason: message.cancellation.reason,
        })}
      </p>
      {message.cancellation.details ? (
        <AgreementDetailsSummary details={message.cancellation.details} />
      ) : null}
    </BubbleBase>
  )
}
