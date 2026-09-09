import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

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
          title="Estadísticas"
          description="Mirá cómo crecen las lecturas, intercambios y encuentros de EntreLibros."
          actions={
            <label className={styles.period}>
              <span>Período</span>
              <select
                value={days}
                onChange={(event) =>
                  setDays(Number(event.target.value) as 7 | 30 | 90)
                }
              >
                <option value={7}>Últimos 7 días</option>
                <option value={30}>Últimos 30 días</option>
                <option value={90}>Últimos 90 días</option>
              </select>
            </label>
          }
        />

        {statsQuery.isLoading ? (
          <Panel className={styles.card}>Cargando estadísticas…</Panel>
        ) : statsQuery.isError || !stats ? (
          <Panel className={styles.card} role="alert">
            No pudimos cargar las estadísticas de la comunidad.
          </Panel>
        ) : (
          <>
            <section className={styles.kpis}>
              <KpiCard
                icon="↔"
                label="Intercambios"
                value={String(stats.kpis.exchanges)}
                tone="teal"
              />
              <KpiCard
                icon="⌂"
                label="Rincones activos"
                value={String(stats.kpis.activeHouses)}
                tone="blue"
              />
              <KpiCard
                icon="●"
                label="Personas activas"
                value={String(stats.kpis.activeUsers)}
                tone="purple"
              />
              <KpiCard
                icon="▣"
                label="Libros publicados"
                value={String(stats.kpis.booksPublished)}
                tone="orange"
              />
            </section>

            <div className={styles.dashboard}>
              <Panel className={`${styles.card} ${styles.wide}`}>
                <SectionHeading title="Intercambios recientes" />
                {stats.trendExchanges.length > 1 ? (
                  <svg
                    className={styles.lineChart}
                    viewBox="0 0 600 190"
                    role="img"
                    aria-label="Intercambios por período"
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
                  <p>Sin datos suficientes para mostrar una tendencia.</p>
                )}
              </Panel>

              <Panel className={styles.card}>
                <SectionHeading title="Métricas persistidas" />
                {metricsQuery.isLoading ? (
                  <p>Cargando métricas…</p>
                ) : metricsQuery.isError ? (
                  <p>No pudimos cargar las métricas del período.</p>
                ) : metricsQuery.data?.status === 'no_data' ? (
                  <p>Sin datos para el período seleccionado.</p>
                ) : metricsQuery.data ? (
                  <div className={styles.metricGrid}>
                    <div>
                      <strong>{metricsQuery.data.activeListings}</strong>
                      <span>Publicaciones activas</span>
                    </div>
                    <div>
                      <strong>{metricsQuery.data.activeCorners}</strong>
                      <span>Rincones activos</span>
                    </div>
                    <div>
                      <strong>{metricsQuery.data.confirmedAgreements}</strong>
                      <span>Acuerdos confirmados</span>
                    </div>
                    <div>
                      <strong>{metricsQuery.data.funnel.contacts}</strong>
                      <span>Contactos iniciados</span>
                    </div>
                  </div>
                ) : null}
              </Panel>

              <Panel className={styles.card}>
                <SectionHeading title="Contribuyentes destacados" />
                <ol className={styles.ranking}>
                  {stats.topContributors.map((person, index) => (
                    <li key={`${person.username}-${person.metric}`}>
                      <b>{index + 1}</b>
                      <span>
                        <strong>{person.username}</strong>
                        <small>
                          {person.metric === 'books'
                            ? 'Libros publicados'
                            : 'Intercambios'}
                        </small>
                      </span>
                      <em>{person.value}</em>
                    </li>
                  ))}
                </ol>
              </Panel>

              <Panel className={styles.card}>
                <SectionHeading title="Mapa de actividad" />
                <MiniMap />
              </Panel>

              <Panel className={`${styles.card} ${styles.wide}`}>
                <SectionHeading title="Búsquedas populares" />
                <ol className={styles.ranking}>
                  {stats.hotSearches.length === 0 ? (
                    <li>Sin búsquedas registradas.</li>
                  ) : (
                    stats.hotSearches.map((item, index) => (
                      <li key={item.term}>
                        <b>{index + 1}</b>
                        <span>
                          <strong>{item.term}</strong>
                          <small>Consultas</small>
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
