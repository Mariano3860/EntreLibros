import classNames from 'classnames'
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

  return (
    <button
      type="button"
      className={classNames(styles.chip, className)}
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
