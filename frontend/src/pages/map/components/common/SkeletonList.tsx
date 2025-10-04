import { cx } from '@utils/cx'

import styles from './SkeletonList.module.scss'

type SkeletonListProps = {
  count?: number
  className?: string
}

export const SkeletonList = ({ count = 3, className }: SkeletonListProps) => {
  const classes = cx(styles.list, className)

  return (
    <div className={classes} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.item} />
      ))}
    </div>
  )
}
