import { useTranslation } from 'react-i18next'

import { ConfirmationMessage } from '../Messages.types'

import { AgreementDetailsSummary } from './AgreementDetails'
import { BubbleBase } from './BubbleBase'

export type BubbleConfirmationProps = {
  message: ConfirmationMessage
  timeLabel: string
}

export const BubbleConfirmation = ({
  message,
  timeLabel,
}: BubbleConfirmationProps) => {
  const { t } = useTranslation()

  return (
    <BubbleBase
      role={message.role}
      tone="success"
      header={t('community.messages.chat.labels.confirmation')}
      meta={<time dateTime={message.createdAt}>{timeLabel}</time>}
      ariaLabel={t('community.messages.chat.a11y.confirmation')}
    >
      <p>
        {t('community.messages.chat.confirmedBy', {
          name: message.confirmation.confirmedBy,
        })}
      </p>
      <AgreementDetailsSummary details={message.confirmation} />
    </BubbleBase>
  )
}
