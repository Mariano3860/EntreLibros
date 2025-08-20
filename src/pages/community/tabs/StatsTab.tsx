import { getInitials } from '@utils/getInitials'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { COMMUNITY_STATS_RANGES, HOME_URLS } from '@src/constants/constants'

import commonStyles from '../CommunityPage.module.scss'
import {
  kpis,
  trendExchanges,
  trendNewBooks,
  topContributors,
  hotSearches,
  activeHousesMapMock,
} from '../mocks/communityStats.mock'

import styles from './StatsTab.module.scss'

type Range = (typeof COMMUNITY_STATS_RANGES)[number]

export const StatsTab = () => {
  const { t } = useTranslation()
  const [range, setRange] = useState<Range>(COMMUNITY_STATS_RANGES[0])

  const rangeText = t('community.stats.filters.lastDays', { count: range })

  const kpiItems = [
    { key: 'exchanges', value: kpis.exchanges, icon: '🔄' },
    { key: 'activeHouses', value: kpis.activeHouses, icon: '🏠' },
    { key: 'activeUsers', value: kpis.activeUsers, icon: '👥' },
    { key: 'booksPublished', value: kpis.booksPublished, icon: '📚' },
  ] as const

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

      <div className={styles.kpiGrid}>
        {kpiItems.map((item) => (
          <div key={item.key} className={styles.kpiCard}>
            <span aria-hidden="true" className={styles.icon}>
              {item.icon}
            </span>
            <div className={styles.value}>{item.value.toLocaleString()}</div>
            <div className={styles.label}>
              {t(`community.stats.kpis.${item.key}`)}
            </div>
            <span className={styles.badge}>{rangeText}</span>
          </div>
        ))}
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.trendCard}>
          <h3>{t('community.stats.trends.exchanges')}</h3>
          <div className={styles.trendPlaceholder}>
            {trendExchanges.map((h, idx) => (
              <div key={idx} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className={styles.trendCard}>
          <h3>{t('community.stats.trends.newBooks')}</h3>
          <div className={styles.trendPlaceholder}>
            {trendNewBooks.map((h, idx) => (
              <div key={`${h}-${idx}`} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className={styles.topContributorsCard}>
          <h3>{t('community.stats.topContributors.title')}</h3>
          <ul aria-label="top-contributors">
            {topContributors.map((user) => (
              <li key={user.username}>
                <span
                  className={styles.avatar}
                  role="img"
                  aria-label={user.username}
                >
                  {getInitials(user.username)}
                </span>
                <span className={styles.name}>{user.username}</span>
                <span className={styles.metric}>
                  {t(`community.stats.topContributors.metric.${user.metric}`, {
                    count: user.value,
                  })}
                </span>
              </li>
            ))}
          </ul>
          <Link to={`/${HOME_URLS.COMMUNITY}`} className={styles.viewCommunity}>
            {t('community.stats.topContributors.viewCommunity')}
          </Link>
        </div>
        <div className={styles.mapCard}>
          <h3>{t('community.stats.map.title')}</h3>
          <div className={styles.mapPlaceholder}>
            {activeHousesMapMock.map((pin, idx) => (
              <span
                key={idx}
                className={styles.pin}
                style={{ top: pin.top, left: pin.left }}
              />
            ))}
          </div>
          <p>{t('community.stats.map.description')}</p>
        </div>
        <div className={styles.hotSearchesCard}>
          <h3>{t('community.stats.hotSearches.title')}</h3>
          <div className={styles.chips}>
            {hotSearches.map((item) => (
              <span key={item.term} className={styles.chip}>
                {item.term} ({item.count})
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
