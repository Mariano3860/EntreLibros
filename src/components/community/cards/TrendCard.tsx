import styles from '../StatsTab.module.scss'

type Props = {
  title: string
  data: number[]
}

export const TrendCard = ({ title, data }: Props) => (
  <div className={styles.trendCard}>
    <h3>{title}</h3>
    <div className={styles.trendPlaceholder}>
      {data.map((h, idx) => (
        <div key={`${h}-${idx}`} style={{ height: `${h}%` }} />
      ))}
    </div>
  </div>
)
