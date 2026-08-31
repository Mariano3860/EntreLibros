import { fetchHomeBooks } from '@api/books/books.service'
import { fetchCommunityStats } from '@api/community/communityStats.service'
import { fetchUserActivity } from '@api/user/activity.service'
import { BookDetailModal } from '@components/book/BookDetailModal/BookDetailModal'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { useAuth } from '@contexts/auth/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { HOME_URLS } from '@src/constants/constants'
import type { PrototypeBook } from '@src/features/prototype/catalog'
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
import { toPrototypeBook } from '@src/features/prototype/realData.adapters'
import { isApiMockMode } from '@src/utils/runtimeEnv'

import styles from './HomePage.module.scss'

export const HomePage = () => {
  const { isLoading, user } = useAuth()
  const { catalog } = usePrototype()
  const mockMode = isApiMockMode()
  const navigate = useNavigate()
  const [selectedBook, setSelectedBook] = useState<PrototypeBook | null>(null)
  const booksQuery = useQuery({
    queryKey: ['prototype', 'home', 'books'],
    queryFn: fetchHomeBooks,
    enabled: !mockMode,
  })
  const activityQuery = useQuery({
    queryKey: ['prototype', 'home', 'activity'],
    queryFn: fetchUserActivity,
    enabled: !mockMode,
  })
  const statsQuery = useQuery({
    queryKey: ['prototype', 'home', 'stats'],
    queryFn: fetchCommunityStats,
    enabled: !mockMode,
  })

  if (isLoading) return null
  const books = mockMode
    ? catalog.books
    : (booksQuery.data ?? []).map((book) => toPrototypeBook(book))
  const kpis = mockMode
    ? catalog.homeKpis
    : statsQuery.data
      ? [
          {
            icon: '↔',
            value: statsQuery.data.kpis.exchanges.toLocaleString('es-AR'),
            label: 'intercambios',
            tone: 'teal',
          },
          {
            icon: '⌂',
            value: statsQuery.data.kpis.activeHouses.toLocaleString('es-AR'),
            label: 'rincones activos',
            tone: 'orange',
          },
          {
            icon: '◉',
            value: statsQuery.data.kpis.activeUsers.toLocaleString('es-AR'),
            label: 'lectores activos',
            tone: 'purple',
          },
          {
            icon: '✦',
            value: statsQuery.data.kpis.booksPublished.toLocaleString('es-AR'),
            label: 'libros publicados',
            tone: 'blue',
          },
        ]
      : []
  const activities = mockMode
    ? catalog.activity
    : (activityQuery.data ?? []).map((item) => ({
        icon: item.action === 'exchanged' ? '✓' : '↔',
        title: `${item.action === 'exchanged' ? 'Completaste un intercambio de' : 'Ofreciste'} “${item.bookTitle}”`,
        meta: new Date(item.timestamp).toLocaleString('es-AR'),
        tone: item.action === 'exchanged' ? 'purple' : 'teal',
      }))

  return (
    <BaseLayout id="home-page">
      <PrototypePage>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>
              ¡Bienvenido de nuevo,{' '}
              <em>{mockMode ? 'Mariano' : (user?.name ?? 'lector')}!</em>
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
        {mockMode ? (
          <FixtureState region="kpis">
            <KpiRegion kpis={kpis} />
          </FixtureState>
        ) : statsQuery.isLoading ? (
          <Panel className={styles.state}>Cargando resumen…</Panel>
        ) : statsQuery.isError ? (
          <Panel className={styles.state}>
            El resumen no está disponible ahora.
          </Panel>
        ) : (
          <KpiRegion kpis={kpis} />
        )}
        <section className={styles.booksSection}>
          <SectionHeading
            title="Libros que podrían gustarte"
            action={
              <PrototypeButton
                tone="ghost"
                size="small"
                onClick={() => navigate('/books/mine')}
              >
                Ver mis libros →
              </PrototypeButton>
            }
          />
          {mockMode ? (
            <FixtureState region="books">
              <BookRail books={books} onOpen={setSelectedBook} />
            </FixtureState>
          ) : booksQuery.isLoading ? (
            <Panel className={styles.state}>Cargando libros…</Panel>
          ) : booksQuery.isError ? (
            <Panel className={styles.state}>
              No pudimos cargar los libros.
            </Panel>
          ) : (
            <BookRail books={books} onOpen={setSelectedBook} />
          )}
        </section>
        <Panel className={styles.activityPanel}>
          <SectionHeading
            title="Actividad reciente"
            action={<span className={styles.live}>● En vivo</span>}
          />
          {mockMode ? (
            <FixtureState region="activity">
              <ActivityRegion items={activities} />
            </FixtureState>
          ) : activityQuery.isLoading ? (
            <div className={styles.state}>Cargando actividad…</div>
          ) : activityQuery.isError ? (
            <div className={styles.state}>No pudimos cargar la actividad.</div>
          ) : (
            <ActivityRegion items={activities} />
          )}
        </Panel>
        <BookDetailModal
          isOpen={selectedBook !== null}
          bookId={selectedBook?.id}
          bookPreview={
            selectedBook
              ? {
                  title: selectedBook.title,
                  author: selectedBook.author,
                  coverUrl:
                    selectedBook.coverUrl ??
                    `/prototype/book-cover.svg?book=${selectedBook.id}`,
                }
              : undefined
          }
          onClose={() => setSelectedBook(null)}
        />
      </PrototypePage>
    </BaseLayout>
  )
}

const KpiRegion = ({
  kpis,
}: {
  kpis: ReadonlyArray<{
    icon: string
    value: string
    label: string
    tone: string
  }>
}) => (
  <section className={styles.kpiGrid} aria-label="Resumen de hoy">
    {kpis.map((kpi) => (
      <KpiCard key={kpi.label} {...kpi} />
    ))}
  </section>
)
const BookRail = ({
  books,
  onOpen,
}: {
  books: ReturnType<typeof toPrototypeBook>[]
  onOpen: (book: PrototypeBook) => void
}) => (
  <div className={styles.bookRail}>
    {books.length ? (
      books.map((book) => (
        <PrototypeBookCard
          key={book.id}
          book={book}
          onClick={() => onOpen(book)}
        />
      ))
    ) : (
      <Panel className={styles.state}>No hay libros disponibles todavía.</Panel>
    )}
  </div>
)
const ActivityRegion = ({
  items,
}: {
  items: ReadonlyArray<{
    icon: string
    title: string
    meta: string
    tone: string
  }>
}) => (
  <div className={styles.activityList}>
    {items.length ? (
      items.map((item) => (
        <article key={`${item.title}-${item.meta}`}>
          <span className={`${styles.activityIcon} ${styles[item.tone]}`}>
            {item.icon}
          </span>
          <div>
            <strong>{item.title}</strong>
            <small>{item.meta}</small>
          </div>
          <button aria-label={`Abrir ${item.title}`}>→</button>
        </article>
      ))
    ) : (
      <div className={styles.state}>Todavía no hay actividad.</div>
    )}
  </div>
)
