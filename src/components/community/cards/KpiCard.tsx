import { ReactNode } from 'react'

import styles from '../StatsTab.module.scss'

type Props = {
  icon: ReactNode
  value: number
  label: string
  badge: string
}

export const KpiCard = ({ icon, value, label, badge }: Props) => (
  <div className={styles.kpiCard}>
    <span aria-hidden="true" className={styles.icon}>
      {icon}
    </span>
    <div className={styles.value}>{value.toLocaleString()}</div>
    <div className={styles.label}>{label}</div>
    <span className={styles.badge}>{badge}</span>
  </div>
)
