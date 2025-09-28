import { useTranslation } from 'react-i18next'

import { Book } from '../../Messages.types'
import {
  BubbleBase,
  BubbleBaseProps,
  BubbleRole,
  BubbleTone,
} from '../BubbleBase/BubbleBase'

import styles from './BubbleText.module.scss'

export type BubbleTextProps = {
  role?: BubbleRole
  tone?: BubbleTone
  text?: string
  book?: Book
  time?: string
  className?: string
} & Pick<BubbleBaseProps, 'ariaLabel'>

export const BubbleText = ({
  role = 'them',
  tone = 'neutral',
  text,
  book,
  time,
  className,
  ariaLabel,
}: BubbleTextProps) => {
  const { t } = useTranslation()

  const otherUserFallback = t('community.messages.bookBubble.otherUser', {
    defaultValue: 'la otra persona',
  })

  const ownershipLabel = book?.ownership
    ? book.ownership === 'mine'
      ? t('community.messages.bookBubble.mine', {
          defaultValue: 'Tu libro',
        })
      : t('community.messages.bookBubble.theirs', {
          defaultValue: 'Libro de {{name}}',
          name: book.ownerName ?? otherUserFallback,
        })
    : null

  const bookCardClassName = [styles.bookCard]
  if (book?.ownership) {
    bookCardClassName.push(styles[`ownership-${book.ownership}`])
  }

  return (
    <BubbleBase
      role={role}
      tone={tone}
      ariaLabel={ariaLabel}
      className={className}
      meta={time ? <span className={styles.time}>{time}</span> : null}
    >
      {text ? <p className={styles.text}>{text}</p> : null}
      {book ? (
        <div className={bookCardClassName.join(' ')}>
          <img
            src={book.cover}
            alt={t('community.messages.bookBubble.coverAlt', {
              defaultValue: 'Portada de {{title}}',
              title: book.title,
            })}
            className={styles.bookCover}
            loading="lazy"
          />
          <div className={styles.bookInfo}>
            {ownershipLabel ? (
              <span className={styles.bookOwnership}>{ownershipLabel}</span>
            ) : null}
            <span className={styles.bookTitle}>{book.title}</span>
            <span className={styles.bookAuthor}>{book.author}</span>
          </div>
        </div>
      ) : null}
    </BubbleBase>
  )
}
