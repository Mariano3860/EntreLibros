import { useTranslation } from 'react-i18next'

import { ProposalMessage } from '../Messages.types'

import { AgreementDetailsSummary } from './AgreementDetails'
import { BubbleActionButton, BubbleBase } from './BubbleBase'

export type BubbleProposalProps = {
  message: ProposalMessage
  timeLabel: string
}

export const BubbleProposal = ({ message, timeLabel }: BubbleProposalProps) => {
  const { t } = useTranslation()

  return (
    <BubbleBase
      role={message.role}
      tone="warning"
      header={t('community.messages.chat.labels.proposal')}
      meta={<time dateTime={message.createdAt}>{timeLabel}</time>}
      ariaLabel={t('community.messages.chat.a11y.proposal')}
    >
      <AgreementDetailsSummary details={message.proposal} />
      <BubbleActionButton variant="primary">
        {t('community.messages.chat.actions.confirm')}
      </BubbleActionButton>
      <BubbleActionButton>
        {t('community.messages.chat.actions.proposeChange')}
      </BubbleActionButton>
    </BubbleBase>
  )
}
