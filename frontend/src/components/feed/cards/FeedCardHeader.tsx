import { CornerChip } from '@components/feed/CornerChip'

import type { FeedBase } from '../FeedItem.types'

import styles from './FeedCard.module.scss'

type FeedCardHeaderProps = {
  item: FeedBase
  className?: string
}

export const FeedCardHeader = ({ item, className }: FeedCardHeaderProps) => {
  const headerClassName = className
    ? `${styles.header} ${className}`
    : styles.header

  return (
    <header className={headerClassName}>
      <img src={item.avatar} alt={item.user} />
      <div className={styles.headerContent}>
        <div className={styles.headerTop}>
          <span className={styles.userName}>{item.user}</span>
          <span className={styles.time}>{item.time}</span>
        </div>
        {item.corner && (
          <CornerChip className={styles.cornerChip} corner={item.corner} />
        )}
      </div>
    </header>
  )
}
