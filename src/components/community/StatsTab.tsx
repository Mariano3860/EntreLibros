import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { COMMUNITY_STATS_RANGES } from '@src/constants/constants'
import { useCommunityStats } from '@src/hooks/api/useCommunityStats'

import { HotSearchesCard } from './cards/HotSearchesCard'
import { KpiCard } from './cards/KpiCard'
import { MapCard } from './cards/MapCard'
import { TopContributorsCard } from './cards/TopContributorsCard'
import { TrendCard } from './cards/TrendCard'
import commonStyles from './CommunityTabs.module.scss'
import styles from './StatsTab.module.scss'

type Range = (typeof COMMUNITY_STATS_RANGES)[number]

export const StatsTab = () => {
  const { t } = useTranslation()
  const [range, setRange] = useState<Range>(COMMUNITY_STATS_RANGES[0])
  const { data } = useCommunityStats()

  const rangeText = t('community.stats.filters.lastDays', { count: range })
  const kpiItems = data
    ? ([
        { key: 'exchanges', value: data.kpis.exchanges, icon: '🔄' },
        { key: 'activeHouses', value: data.kpis.activeHouses, icon: '🏠' },
        { key: 'activeUsers', value: data.kpis.activeUsers, icon: '👥' },
        { key: 'booksPublished', value: data.kpis.booksPublished, icon: '📚' },
      ] as const)
    : []

  return (
    <section className={`${commonStyles.tabContent} ${styles.stats}`}>
      <header className={styles.header}>
        <h2>{t('community.stats.title')}</h2>
        <p>{t('community.stats.subtitle')}</p>
        <div
          className={styles.filters}
          role="group"
          aria-label={t('community.stats.filters.aria')}
        >
          {COMMUNITY_STATS_RANGES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={range === r}
              onClick={() => setRange(r)}
            >
              {t(`community.stats.filters.${r}d`)}
            </button>
          ))}
        </div>
      </header>
      {data && (
        <>
          <div className={styles.kpiGrid}>
            {kpiItems.map((item) => (
              <KpiCard
                key={item.key}
                icon={item.icon}
                value={item.value}
                label={t(`community.stats.kpis.${item.key}`)}
                badge={rangeText}
              />
            ))}
          </div>

          <div className={styles.detailsGrid}>
            <TrendCard
              title={t('community.stats.trends.exchanges')}
              data={data.trendExchanges}
            />
            <TrendCard
              title={t('community.stats.trends.newBooks')}
              data={data.trendNewBooks}
            />
            <TopContributorsCard contributors={data.topContributors} />
            <MapCard pins={data.activeHousesMap} />
            <HotSearchesCard searches={data.hotSearches} />
          </div>
        </>
      )}
    </section>
  )
}
