import { useTranslation } from 'react-i18next'

import styles from './CornerChip.module.scss'
import type { FeedCorner } from './FeedItem.types'

type CornerChipProps = {
  corner: FeedCorner
  className?: string
  onClick?: () => void
}

export const CornerChip = ({ corner, className, onClick }: CornerChipProps) => {
  const { t } = useTranslation()

  const chipClassName = className ? `${styles.chip} ${className}` : styles.chip

  return (
    <button
      type="button"
      className={chipClassName}
      onClick={onClick}
      aria-label={
        t('community.feed.cornerChip.ariaLabel', { name: corner.name }) ?? ''
      }
    >
      <span aria-hidden>📍</span>
      <span>{corner.name}</span>
    </button>
  )
}
