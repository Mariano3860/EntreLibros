import styles from './EmptyState.module.scss'

type EmptyStateProps = {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <div className={styles.emptyState} role="status" aria-live="polite">
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {actionLabel && onAction ? (
        <button type="button" className={styles.cta} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
