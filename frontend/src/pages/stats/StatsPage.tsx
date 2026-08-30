import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'

import { usePrototype } from '@src/features/prototype/PrototypeContext'
import {
  Avatar,
  KpiCard,
  MiniMap,
  PageHeader,
  Panel,
  PrototypeButton,
  PrototypePage,
  SectionHeading,
} from '@src/features/prototype/PrototypeUI'

import styles from './StatsPage.module.scss'

const points = (values: readonly number[]) =>
  values
    .map(
      (value, index) =>
        `${index * (600 / (values.length - 1))},${170 - value * 1.45}`
    )
    .join(' ')

export const StatsPage = () => {
  const { catalog, period, setPeriod } = usePrototype()

  return (
    <BaseLayout id="stats-page">
      <PrototypePage>
        <PageHeader
          title="Estadísticas"
          description="Mirá cómo crecen las lecturas, intercambios y encuentros de EntreLibros."
          actions={
            <>
              <label className={styles.period}>
                <span>Período</span>
                <select
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                >
                  <option>Últimos 7 días</option>
                  <option>Últimos 30 días</option>
                  <option>Este año</option>
                </select>
              </label>
              <PrototypeButton>⇩ Exportar</PrototypeButton>
            </>
          }
        />

        <section className={styles.kpis}>
          {catalog.stats.kpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </section>

        <div className={styles.dashboard}>
          <Panel className={`${styles.card} ${styles.wide}`}>
            <SectionHeading
              title="Intercambios esta semana"
              action={<span className={styles.growth}>↗ 12,4%</span>}
            />
            <div className={styles.legend}>
              <span>● Intercambios</span>
              <small>{period}</small>
            </div>
            <svg
              className={styles.lineChart}
              viewBox="0 0 600 190"
              role="img"
              aria-label="Intercambios por día"
            >
              <defs>
                <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#42d7c7" stopOpacity=".35" />
                  <stop offset="1" stopColor="#42d7c7" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[35, 70, 105, 140].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="600"
                  y2={y}
                  stroke="#294553"
                  strokeDasharray="4 5"
                />
              ))}
              <polygon
                points={`0,180 ${points(catalog.stats.weekly)} 600,180`}
                fill="url(#chart-fill)"
              />
              <polyline
                points={points(catalog.stats.weekly)}
                fill="none"
                stroke="#42d7c7"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {catalog.stats.weekly.map((value, index) => (
                <circle
                  key={index}
                  cx={index * 100}
                  cy={170 - value * 1.45}
                  r="5"
                  fill="#0b1d2a"
                  stroke="#42d7c7"
                  strokeWidth="3"
                />
              ))}
            </svg>
            <div className={styles.axis}>
              {catalog.stats.dayLabels.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </Panel>

          <Panel className={styles.card}>
            <SectionHeading
              title="Publicaciones"
              action={<button className={styles.menu}>•••</button>}
            />
            <div className={styles.barChart}>
              {catalog.stats.posts.map((value, index) => (
                <div key={index}>
                  <span style={{ height: `${value}%` }} />
                  <small>{catalog.stats.shortDayLabels[index]}</small>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className={styles.card}>
            <SectionHeading title="Rincones más activos" />
            <ol className={styles.ranking}>
              {catalog.corners.map((corner, index) => (
                <li key={corner.id}>
                  <b>{index + 1}</b>
                  <span>
                    <strong>{corner.name}</strong>
                    <small>
                      {corner.category} · {corner.distance}
                    </small>
                  </span>
                  <em>{catalog.stats.rankingVisits[index]}</em>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel className={styles.card}>
            <SectionHeading
              title="Mapa de actividad"
              action={<span className={styles.growth}>En vivo</span>}
            />
            <MiniMap />
          </Panel>

          <Panel className={`${styles.card} ${styles.wide}`}>
            <SectionHeading
              title="Contribuyentes destacados"
              action={
                <PrototypeButton size="small" tone="ghost">
                  Ver ranking →
                </PrototypeButton>
              }
            />
            <div className={styles.contributors}>
              {catalog.stats.contributors.map((person, index) => (
                <article key={person.name}>
                  <span className={styles.position}>{index + 1}</span>
                  <Avatar initials={person.initials} accent={person.accent} />
                  <div>
                    <strong>{person.name}</strong>
                    <small>{person.value}</small>
                  </div>
                  <span className={styles.badge}>★ Nivel {8 - index}</span>
                </article>
              ))}
            </div>
          </Panel>
        </div>
      </PrototypePage>
    </BaseLayout>
  )
}
