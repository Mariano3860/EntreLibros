import { useTranslation } from 'react-i18next'

import { TemplateMessage, TextMessage } from '../Messages.types'

import { BubbleBase, BubbleTemplateLabel, BubbleTone } from './BubbleBase'

export type BubbleTextProps = {
  message: TextMessage | TemplateMessage
  timeLabel: string
}

export const BubbleText = ({ message, timeLabel }: BubbleTextProps) => {
  const { t } = useTranslation()
  const tone: BubbleTone = message.role === 'me' ? 'primary' : 'secondary'

  const header =
    message.type === 'template' ? (
      <BubbleTemplateLabel>
        {message.templateLabel || t('community.messages.chat.labels.template')}
      </BubbleTemplateLabel>
    ) : null

  return (
    <BubbleBase
      role={message.role}
      tone={tone}
      header={header}
      meta={<time dateTime={message.createdAt}>{timeLabel}</time>}
    >
      <p>{message.text}</p>
    </BubbleBase>
  )
}
