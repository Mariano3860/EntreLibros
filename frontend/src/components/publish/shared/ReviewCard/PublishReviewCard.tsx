import React from 'react'

import styles from './PublishReviewCard.module.scss'

export type PublishReviewCardEntry = {
  label: string
  value: React.ReactNode
}

type PublishReviewCardProps = {
  title?: string
  entries?: PublishReviewCardEntry[]
  children?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export const PublishReviewCard: React.FC<PublishReviewCardProps> = ({
  title,
  entries,
  children,
  footer,
  className,
}) => {
  return (
    <div className={`${styles.wrapper} ${className ?? ''}`.trim()}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      {entries
        ? entries.map((entry) => (
            <div key={entry.label} className={styles.row}>
              <span className={styles.label}>{entry.label}</span>
              <span className={styles.value}>{entry.value}</span>
            </div>
          ))
        : null}
      {children}
      {footer}
    </div>
  )
}
