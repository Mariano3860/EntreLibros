import { cx } from '@utils/cx'
import { ReactNode } from 'react'

import type { MessageRole, MessageTone } from '../../Messages.types'

import styles from './BubbleBase.module.scss'

export type BubbleRole = MessageRole
export type BubbleTone = MessageTone

export type BubbleBaseProps = {
  role?: BubbleRole
  tone?: BubbleTone
  header?: ReactNode
  children: ReactNode
  actions?: ReactNode
  meta?: ReactNode
  className?: string
  bodyClassName?: string
  ariaLabel?: string
}

export const BubbleBase = ({
  role = 'them',
  tone = 'neutral',
  header,
  children,
  actions,
  meta,
  className,
  bodyClassName,
  ariaLabel,
}: BubbleBaseProps) => {
  const bubbleClassName = cx(
    styles.bubble,
    styles[`role-${role}`],
    styles[`tone-${tone}`],
    className
  )
  const bodyClassNames = cx(styles.body, bodyClassName)

  return (
    <article className={bubbleClassName} role="group" aria-label={ariaLabel}>
      {header ? <header className={styles.header}>{header}</header> : null}
      <div className={bodyClassNames}>{children}</div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
      {meta ? <div className={styles.meta}>{meta}</div> : null}
    </article>
  )
}
