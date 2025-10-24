import { cx } from '@utils/cx'
import type { ReactNode } from 'react'

import styles from './Badge.module.scss'

type BadgeTone = 'success' | 'warning' | 'error' | 'info' | 'neutral'

type BadgeProps = {
  label: string
  tone?: BadgeTone
  icon?: ReactNode
  className?: string
}

export const Badge = ({
  label,
  tone = 'neutral',
  icon,
  className,
}: BadgeProps) => {
  const toneClass = styles[tone]
  const classes = cx(styles.badge, toneClass, className)

  return (
    <span className={classes} aria-label={label} role="status">
      {icon}
      {label}
    </span>
  )
}
