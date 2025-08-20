import { useTranslation } from 'react-i18next'

import { EventStatus } from '@src/api/events/events.types'

import styles from './EventsFilters.module.scss'

interface Props {
  statusFilter: EventStatus | 'all'
  onStatusChange: (status: EventStatus | 'all') => void
  nearby: boolean
  onToggleNearby: () => void
}

const statuses: (EventStatus | 'all')[] = ['upcoming', 'past', 'all']

export const EventsFilters = ({
  statusFilter,
  onStatusChange,
  nearby,
  onToggleNearby,
}: Props) => {
  const { t } = useTranslation()

  return (
    <div className={styles.filters}>
      {statuses.map((status) => (
      <button
        key={status}
        className={`${styles.chip} ${statusFilter === status ? styles.active : ''}`}
        aria-pressed={statusFilter === status}
        onClick={() => onStatusChange(status)}
      >
        {t(`community.events.filters.status.${status}`)}
      </button>
      ))}
      <button
        className={`${styles.chip} ${nearby ? styles.active : ''}`}
        aria-pressed={nearby}
        onClick={onToggleNearby}
      >
        {t('community.events.filters.nearby')}
      </button>
    </div>
  )
}
