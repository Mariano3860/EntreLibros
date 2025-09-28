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
}: BubbleTextProps) => (
  <BubbleBase
    role={role}
    tone={tone}
    ariaLabel={ariaLabel}
    className={className}
    meta={time ? <span className={styles.time}>{time}</span> : null}
  >
    {text ? <p className={styles.text}>{text}</p> : null}
    {book ? (
      <div className={styles.bookCard}>
        <img
          src={book.cover}
          alt={`Cover of ${book.title}`}
          className={styles.bookCover}
          loading="lazy"
        />
        <div className={styles.bookInfo}>
          <span className={styles.bookTitle}>{book.title}</span>
          <span className={styles.bookAuthor}>{book.author}</span>
        </div>
      </div>
    ) : null}
  </BubbleBase>
)
