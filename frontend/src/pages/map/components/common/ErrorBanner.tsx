import { cx } from '@utils/cx'

import styles from './ErrorBanner.module.scss'

type ErrorBannerTone = 'error' | 'warning' | 'info'

type ErrorBannerProps = {
  message: string
  tone?: ErrorBannerTone
  onDismiss?: () => void
}

export const ErrorBanner = ({
  message,
  tone = 'error',
  onDismiss,
}: ErrorBannerProps) => {
  const toneClass = styles[tone]
  const classes = cx(styles.banner, toneClass)

  return (
    <div role="alert" className={classes}>
      <span>{message}</span>
      {onDismiss ? (
        <button type="button" className={styles.dismiss} onClick={onDismiss}>
          ×
        </button>
      ) : null}
    </div>
  )
}
