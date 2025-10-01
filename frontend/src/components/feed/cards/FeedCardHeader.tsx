import { CornerChip } from '@components/feed/CornerChip'
import classNames from 'classnames'

import type { FeedBase } from '../FeedItem.types'

import styles from './FeedCard.module.scss'

type FeedCardHeaderProps = {
  item: FeedBase
  className?: string
}

export const FeedCardHeader = ({ item, className }: FeedCardHeaderProps) => {
  return (
    <header className={classNames(styles.header, className)}>
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
