import { useTranslation } from 'react-i18next'

import { PostCheckMessage } from '../Messages.types'

import { AgreementDetailsSummary } from './AgreementDetails'
import { BubbleActionButton, BubbleBase } from './BubbleBase'
import styles from './BubbleContent.module.scss'

export type BubblePostCheckProps = {
  message: PostCheckMessage
  timeLabel: string
}

export const BubblePostCheck = ({
  message,
  timeLabel,
}: BubblePostCheckProps) => {
  const { t } = useTranslation()

  return (
    <BubbleBase
      role={message.role}
      tone="secondary"
      header={t('community.messages.chat.labels.postMeeting')}
      meta={<time dateTime={message.createdAt}>{timeLabel}</time>}
      ariaLabel={t('community.messages.chat.a11y.postMeeting')}
    >
      <p>{message.question}</p>
      <AgreementDetailsSummary details={message.details} />
      <BubbleActionButton variant="primary">
        {t('community.messages.chat.actions.yes')}
      </BubbleActionButton>
      <BubbleActionButton>
        {t('community.messages.chat.actions.no')}
      </BubbleActionButton>
      <p className={styles.actionsNote}>
        {t('community.messages.chat.postCheck.note')}
      </p>
    </BubbleBase>
  )
}
