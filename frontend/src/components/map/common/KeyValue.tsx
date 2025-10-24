import type { ReactNode } from 'react'

import styles from './KeyValue.module.scss'

type KeyValueProps = {
  label: ReactNode
  value: ReactNode
}

export const KeyValue = ({ label, value }: KeyValueProps) => {
  return (
    <div className={styles.item}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  )
}
