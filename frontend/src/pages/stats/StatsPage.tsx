import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { fetchCommunityStats } from '@src/api/community/communityStats.service'
import { fetchMvpMetrics } from '@src/api/community/mvpMetrics.service'
import {
  KpiCard,
  MiniMap,
  PageHeader,
  Panel,
  PageFrame,
  SectionHeading,
} from '@src/components/ui/presentation/Presentation'

import styles from './StatsPage.module.scss'

const points = (values: readonly number[]) =>
  values.length < 2
    ? ''
    : values
        .map(
          (value, index) =>
            `${index * (600 / (values.length - 1))},${170 - value * 1.45}`
        )
        .join(' ')

export const StatsPage = () => {
  const { t } = useTranslation()
  const [days, setDays] = useState<7 | 30 | 90>(30)
  const statsQuery = useQuery({
    queryKey: ['community', 'stats'],
    queryFn: fetchCommunityStats,
  })
  const metricsQuery = useQuery({
    queryKey: ['community', 'metrics', days],
    queryFn: () => fetchMvpMetrics({ days }),
    retry: false,
  })

  const stats = statsQuery.data

  return (
    <BaseLayout id="stats-page">
      <PageFrame>
        <PageHeader
          title={t('localizedUi.stats.title')}
          description={t('localizedUi.stats.description')}
          actions={
            <label className={styles.period}>
              <span>{t('localizedUi.stats.period')}</span>
              <select
                value={days}
                onChange={(event) =>
                  setDays(Number(event.target.value) as 7 | 30 | 90)
                }
              >
                <option value={7}>
                  {t('localizedUi.stats.lastDays', { days: 7 })}
                </option>
                <option value={30}>
                  {t('localizedUi.stats.lastDays', { days: 30 })}
                </option>
                <option value={90}>
                  {t('localizedUi.stats.lastDays', { days: 90 })}
                </option>
              </select>
            </label>
          }
        />

        {statsQuery.isLoading ? (
          <Panel className={styles.card}>
            {t('localizedUi.stats.loading')}
          </Panel>
        ) : statsQuery.isError || !stats ? (
          <Panel className={styles.card} role="alert">
            {t('localizedUi.stats.error')}
          </Panel>
        ) : (
          <>
            <section className={styles.kpis}>
              <KpiCard
                icon="↔"
                label={t('localizedUi.stats.exchanges')}
                value={String(stats.kpis.exchanges)}
                tone="teal"
              />
              <KpiCard
                icon="⌂"
                label={t('localizedUi.stats.activeCorners')}
                value={String(stats.kpis.activeHouses)}
                tone="blue"
              />
              <KpiCard
                icon="●"
                label={t('localizedUi.stats.activePeople')}
                value={String(stats.kpis.activeUsers)}
                tone="purple"
              />
              <KpiCard
                icon="▣"
                label={t('localizedUi.stats.publishedBooks')}
                value={String(stats.kpis.booksPublished)}
                tone="orange"
              />
            </section>

            <div className={styles.dashboard}>
              <Panel className={`${styles.card} ${styles.wide}`}>
                <SectionHeading
                  title={t('localizedUi.stats.recentExchanges')}
                />
                {stats.trendExchanges.length > 1 ? (
                  <svg
                    className={styles.lineChart}
                    viewBox="0 0 600 190"
                    role="img"
                    aria-label={t('localizedUi.stats.trendAria')}
                  >
                    <polyline
                      points={points(stats.trendExchanges)}
                      fill="none"
                      stroke="#42d7c7"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <p>{t('localizedUi.stats.noTrend')}</p>
                )}
              </Panel>

              <Panel className={styles.card}>
                <SectionHeading
                  title={t('localizedUi.stats.persistedMetrics')}
                />
                {metricsQuery.isLoading ? (
                  <p>{t('localizedUi.stats.loadingMetrics')}</p>
                ) : metricsQuery.isError ? (
                  <p>{t('localizedUi.stats.metricsError')}</p>
                ) : metricsQuery.data?.status === 'no_data' ? (
                  <p>{t('localizedUi.stats.noMetrics')}</p>
                ) : metricsQuery.data ? (
                  <div className={styles.metricGrid}>
                    <div>
                      <strong>{metricsQuery.data.activeListings}</strong>
                      <span>{t('localizedUi.stats.activeListings')}</span>
                    </div>
                    <div>
                      <strong>{metricsQuery.data.activeCorners}</strong>
                      <span>{t('localizedUi.stats.activeCorners')}</span>
                    </div>
                    <div>
                      <strong>{metricsQuery.data.confirmedAgreements}</strong>
                      <span>{t('localizedUi.stats.confirmedAgreements')}</span>
                    </div>
                    <div>
                      <strong>{metricsQuery.data.funnel.contacts}</strong>
                      <span>{t('localizedUi.stats.contactsStarted')}</span>
                    </div>
                  </div>
                ) : null}
              </Panel>

              <Panel className={styles.card}>
                <SectionHeading
                  title={t('localizedUi.stats.topContributors')}
                />
                <ol className={styles.ranking}>
                  {stats.topContributors.map((person, index) => (
                    <li key={`${person.username}-${person.metric}`}>
                      <b>{index + 1}</b>
                      <span>
                        <strong>{person.username}</strong>
                        <small>
                          {person.metric === 'books'
                            ? t('localizedUi.stats.publishedBooks')
                            : t('localizedUi.stats.exchanges')}
                        </small>
                      </span>
                      <em>{person.value}</em>
                    </li>
                  ))}
                </ol>
              </Panel>

              <Panel className={styles.card}>
                <SectionHeading title={t('localizedUi.stats.activityMap')} />
                <MiniMap />
              </Panel>

              <Panel className={`${styles.card} ${styles.wide}`}>
                <SectionHeading
                  title={t('localizedUi.stats.popularSearches')}
                />
                <ol className={styles.ranking}>
                  {stats.hotSearches.length === 0 ? (
                    <li>{t('localizedUi.stats.noSearches')}</li>
                  ) : (
                    stats.hotSearches.map((item, index) => (
                      <li key={item.term}>
                        <b>{index + 1}</b>
                        <span>
                          <strong>{item.term}</strong>
                          <small>{t('localizedUi.stats.queries')}</small>
                        </span>
                        <em>{item.count}</em>
                      </li>
                    ))
                  )}
                </ol>
              </Panel>
            </div>
          </>
        )}
      </PageFrame>
    </BaseLayout>
  )
}
