import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { useAuth } from '@contexts/auth/AuthContext'
import { useNavigate } from 'react-router-dom'

import { HOME_URLS } from '@src/constants/constants'
import { usePrototype } from '@src/features/prototype/PrototypeContext'
import {
  FixtureState,
  KpiCard,
  Panel,
  PrototypeBookCard,
  PrototypeButton,
  PrototypePage,
  SectionHeading,
} from '@src/features/prototype/PrototypeUI'

import styles from './HomePage.module.scss'

export const HomePage = () => {
  const { isLoading } = useAuth()
  const { catalog } = usePrototype()
  const navigate = useNavigate()

  if (isLoading) return null

  return (
    <BaseLayout id="home-page">
      <PrototypePage>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>
              ¡Bienvenido de nuevo, <em>Mariano</em>!
            </h1>
            <p>Hay nuevas historias, libros y rincones esperando cerca tuyo.</p>
            <PrototypeButton
              tone="primary"
              onClick={() => navigate(`/${HOME_URLS.BOOKS}`)}
            >
              Explorar libros <span aria-hidden="true">→</span>
            </PrototypeButton>
          </div>
        </section>

        <FixtureState region="kpis">
          <section className={styles.kpiGrid} aria-label="Resumen de hoy">
            {catalog.homeKpis.map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} />
            ))}
          </section>
        </FixtureState>

        <section className={styles.booksSection}>
          <SectionHeading
            title="Libros que podrían gustarte"
            action={
              <PrototypeButton
                tone="ghost"
                size="small"
                onClick={() => navigate('/books')}
              >
                Ver todos →
              </PrototypeButton>
            }
          />
          <FixtureState region="books">
            <div className={styles.bookRail}>
              {catalog.books.map((book) => (
                <PrototypeBookCard
                  key={book.id}
                  book={book}
                  onClick={() => navigate(`/books/${book.id}`)}
                />
              ))}
            </div>
          </FixtureState>
        </section>

        <Panel className={styles.activityPanel}>
          <SectionHeading
            title="Actividad reciente"
            action={<span className={styles.live}>● En vivo</span>}
          />
          <FixtureState region="activity">
            <div className={styles.activityList}>
              {catalog.activity.map((item) => (
                <article key={item.title}>
                  <span
                    className={`${styles.activityIcon} ${styles[item.tone]}`}
                  >
                    {item.icon}
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.meta}</small>
                  </div>
                  <button aria-label={`Abrir ${item.title}`}>→</button>
                </article>
              ))}
            </div>
          </FixtureState>
        </Panel>
      </PrototypePage>
    </BaseLayout>
  )
}
