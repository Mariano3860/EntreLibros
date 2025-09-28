import { useTranslation } from 'react-i18next'

import { SafetyTipMessage } from '../Messages.types'

import { BubbleBase } from './BubbleBase'

export type BubbleTipProps = {
  message: SafetyTipMessage
  timeLabel: string
}

export const BubbleTip = ({ message, timeLabel }: BubbleTipProps) => {
  const { t } = useTranslation()

  return (
    <BubbleBase
      role={message.role}
      tone="secondary"
      header={t('community.messages.chat.labels.tip')}
      meta={<time dateTime={message.createdAt}>{timeLabel}</time>}
      ariaLabel={t('community.messages.chat.a11y.tip')}
    >
      <p>{message.tip}</p>
    </BubbleBase>
  )
}
