import { useTranslation } from 'react-i18next'

import { ApiEventsMetrics } from '@src/api/events/events.types'

import styles from './EventsMetrics.module.scss'

interface Props {
  metrics: ApiEventsMetrics
}

export const EventsMetrics = ({ metrics }: Props) => {
  const { t } = useTranslation()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.metric}>
        <span className={styles.metricNumber}>{metrics.eventsThisMonth}</span>
        <span className={styles.metricLabel}>
          {t('community.events.metrics.events_this_month')}
        </span>
      </div>
      <div className={styles.metric}>
        <span className={styles.metricNumber}>{metrics.hostHouses}</span>
        <span className={styles.metricLabel}>
          {t('community.events.metrics.host_houses')}
        </span>
      </div>
      <div className={styles.metric}>
        <span className={styles.metricNumber}>{metrics.confirmedUsers}</span>
        <span className={styles.metricLabel}>
          {t('community.events.metrics.confirmed_users')}
        </span>
      </div>
    </aside>
  )
}
