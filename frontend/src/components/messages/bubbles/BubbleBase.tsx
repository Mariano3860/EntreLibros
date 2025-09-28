import { ReactNode } from 'react'

import { MessageRole } from '../Messages.types'

import styles from './BubbleBase.module.scss'

export type BubbleTone =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'info'
  | 'secondary'

export type BubbleBaseProps = {
  role: MessageRole
  tone?: BubbleTone
  header?: ReactNode
  children: ReactNode
  actions?: ReactNode
  meta?: ReactNode
  className?: string
  ariaLabel?: string
}

export const BubbleBase = ({
  role,
  tone = 'neutral',
  header,
  children,
  actions,
  meta,
  className,
  ariaLabel,
}: BubbleBaseProps) => {
  const toneClass = tone !== 'neutral' ? styles[`tone-${tone}`] : undefined
  const classes = [styles.wrapper, styles[role], toneClass, className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} role="group" aria-label={ariaLabel}>
      <div className={styles.surface}>
        {header && <div className={styles.header}>{header}</div>}
        <div className={styles.body}>{children}</div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
        {meta ? <div className={styles.meta}>{meta}</div> : null}
      </div>
    </div>
  )
}

export const BubbleTemplateLabel = ({ children }: { children: ReactNode }) => (
  <span className={styles.templateLabel}>{children}</span>
)

export type BubbleActionVariant = 'primary' | 'secondary' | 'ghost'

export type BubbleActionButtonProps = {
  children: ReactNode
  onClick?: () => void
  variant?: BubbleActionVariant
  ariaLabel?: string
}

export const BubbleActionButton = ({
  children,
  onClick,
  variant = 'secondary',
  ariaLabel,
}: BubbleActionButtonProps) => {
  const variantClass =
    variant === 'primary'
      ? styles.actionButtonPrimary
      : variant === 'ghost'
        ? styles.actionButtonGhost
        : styles.actionButtonSecondary

  return (
    <button
      type="button"
      className={`${styles.actionButton} ${variantClass}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}
