import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { EventStatus } from '@src/api/events/events.types'
import { useEvents } from '@src/hooks/api/useEvents'
import { useEventsMetrics } from '@src/hooks/api/useEventsMetrics'

import communityStyles from '../CommunityPage.module.scss'
import styles from './EventsTab.module.scss'
import { EventsFilters } from './events/EventsFilters'
import { EventCard } from './events/EventCard'
import { EventsMetrics } from './events/EventsMetrics'
import { EventsEmptyState } from './events/EventsEmptyState'

export const EventsTab = () => {
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('upcoming')
  const [nearby, setNearby] = useState(false)

  const { data: events = [] } = useEvents()
  const { data: metrics } = useEventsMetrics()

  const filteredEvents = events.filter((event) => {
    if (statusFilter === 'all') return true
    return event.status === statusFilter
  })

  return (
    <section className={`${communityStyles.tabContent} ${styles.eventsTab}`}>
      <header className={styles.header}>
        <div>
          <h2>{t('community.events.title')}</h2>
          <p className={styles.subtitle}>{t('community.events.subtitle')}</p>
        </div>
        <button className={styles.createButton}>
          {t('community.events.create')}
        </button>
      </header>

      <EventsFilters
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        nearby={nearby}
        onToggleNearby={() => setNearby((p) => !p)}
      />

      <div className={styles.main}>
        {filteredEvents.length === 0 ? (
          <EventsEmptyState status={statusFilter} />
        ) : (
          <div className={styles.grid}>
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {metrics && <EventsMetrics metrics={metrics} />}
      </div>
    </section>
  )
}

