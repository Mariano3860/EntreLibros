import { useTranslation } from 'react-i18next'

import { ReminderMessage } from '../Messages.types'

import { AgreementDetailsSummary } from './AgreementDetails'
import { BubbleBase } from './BubbleBase'

export type BubbleReminderProps = {
  message: ReminderMessage
  timeLabel: string
}

export const BubbleReminder = ({ message, timeLabel }: BubbleReminderProps) => {
  const { t } = useTranslation()

  return (
    <BubbleBase
      role={message.role}
      tone="info"
      header={t('community.messages.chat.labels.reminder')}
      meta={<time dateTime={message.createdAt}>{timeLabel}</time>}
      ariaLabel={t('community.messages.chat.a11y.reminder')}
    >
      <p>{message.reminder.message}</p>
      <AgreementDetailsSummary details={message.reminder.details} />
    </BubbleBase>
  )
}
