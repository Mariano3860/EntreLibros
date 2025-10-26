import { useTranslation } from 'react-i18next'

import { Book, SwapProposalDetails } from '../../Messages.types'
import {
  BubbleBase,
  BubbleBaseProps,
  BubbleRole,
  BubbleTone,
} from '../BubbleBase/BubbleBase'

import styles from './BubbleSwapProposal.module.scss'

type BubbleSwapProposalProps = {
  role?: BubbleRole
  tone?: BubbleTone
  swap: SwapProposalDetails
  time?: string
} & Pick<BubbleBaseProps, 'className'>

const buildOwnershipLabel = (book: Book, t: (key: string, options?: Record<string, unknown>) => string) => {
  if (!book.ownership) return null
  if (book.ownership === 'mine') {
    return t('community.messages.bookBubble.mine', {
      defaultValue: 'Tu libro',
    })
  }

  return t('community.messages.bookBubble.theirs', {
    defaultValue: 'Libro de {{name}}',
    name: book.ownerName ?? t('community.messages.bookBubble.otherUser', {
      defaultValue: 'la otra persona',
    }),
  })
}

export const BubbleSwapProposal = ({
  role = 'them',
  tone = 'neutral',
  swap,
  time,
  className,
}: BubbleSwapProposalProps) => {
  const { t } = useTranslation()
  const offeredOwnership = buildOwnershipLabel(swap.offered, t)
  const requestedOwnership = buildOwnershipLabel(swap.requested, t)

  const ariaLabel = t('community.messages.swap.proposal.ariaLabel', {
    defaultValue:
      'Propuesta de intercambio: ofrecés {{offered}} por {{requested}}',
    offered: swap.offered.title,
    requested: swap.requested.title,
  })

  return (
    <BubbleBase
      role={role}
      tone={tone}
      ariaLabel={ariaLabel}
      className={className}
      meta={time ? <span className={styles.time}>{time}</span> : null}
      header={t('community.messages.swap.proposal.title', {
        defaultValue: 'Propuesta de intercambio',
      })}
    >
      <div className={styles.content}>
        <div className={styles.section}>
          <span className={styles.label}>
            {t('community.messages.swap.proposal.offered', {
              defaultValue: 'Ofrecés',
            })}
          </span>
          {offeredOwnership ? (
            <span className={styles.bookAuthor}>{offeredOwnership}</span>
          ) : null}
          <span className={styles.bookTitle}>{swap.offered.title}</span>
          <span className={styles.bookAuthor}>{swap.offered.author}</span>
        </div>
        <div className={styles.section}>
          <span className={styles.label}>
            {t('community.messages.swap.proposal.requested', {
              defaultValue: 'Querés recibir',
            })}
          </span>
          {requestedOwnership ? (
            <span className={styles.bookAuthor}>{requestedOwnership}</span>
          ) : null}
          <span className={styles.bookTitle}>{swap.requested.title}</span>
          <span className={styles.bookAuthor}>{swap.requested.author}</span>
        </div>
        {swap.note ? <p className={styles.note}>{swap.note}</p> : null}
      </div>
    </BubbleBase>
  )
}
