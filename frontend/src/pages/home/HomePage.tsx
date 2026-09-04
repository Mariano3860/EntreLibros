import { fetchHomeBooks } from '@api/books/books.service'
import { fetchActivityItems } from '@api/community/activity.service'
import { fetchCommunityStats } from '@api/community/communityStats.service'
import { fetchUserActivity } from '@api/user/activity.service'
import { BookDetailModal } from '@components/book/BookDetailModal/BookDetailModal'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { useAuth } from '@contexts/auth/AuthContext'
import { useAuthRequired } from '@contexts/auth/AuthRequiredContext'
import { useBookContact } from '@hooks/useBookContact'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { isAuthenticated, isLoading, user } = useAuth()
  const { runIfAuthenticated } = useAuthRequired()
  const { t } = useTranslation()
  const { catalog } = usePrototype()
  const mockMode = isApiMockMode()
  const navigate = useNavigate()
  const [selectedBook, setSelectedBook] = useState<PrototypeBook | null>(null)
  const [recommendationOffset, setRecommendationOffset] = useState(0)
  const [railDirection, setRailDirection] = useState<'next' | 'previous'>(
    'next'
  )
  const handleContactSuccess = useCallback(
    (conversation: { id: number }) => {
      setSelectedBook(null)
      navigate('/messages', { state: { conversationId: conversation.id } })
    },
    [navigate]
  )
  const contactMutation = useBookContact({ onSuccess: handleContactSuccess })
  const booksQuery = useQuery({
    queryKey: ['prototype', 'home', 'books', recommendationOffset],
    queryFn: () => fetchHomeBooks(recommendationOffset),
    enabled: !mockMode,
    placeholderData: (previousData) => previousData,
  })
  const privateActivityQuery = useQuery({
    queryKey: ['prototype', 'home', 'activity', 'private'],
    queryFn: fetchUserActivity,
    enabled: !mockMode && isAuthenticated,
  })
  const publicActivityQuery = useQuery({
    queryKey: ['prototype', 'home', 'activity', 'public'],
    queryFn: fetchActivityItems,
    enabled: !mockMode && !isAuthenticated,
  })
  const statsQuery = useQuery({
    queryKey: ['prototype', 'home', 'stats'],
    queryFn: fetchCommunityStats,
    enabled: !mockMode,
  })

  if (isLoading) return null
  const books = mockMode
    ? catalog.books.slice(0, 5)
    : (booksQuery.data?.items ?? []).map((book) => toPrototypeBook(book))
  const recommendationPage = mockMode
    ? { hasNext: false, hasPrevious: false }
    : (booksQuery.data?.page ?? { hasNext: false, hasPrevious: false })
  const kpis = mockMode
    ? isAuthenticated
      ? catalog.homeKpis
      : [
          {
            icon: '↔',
            value: '134',
            label: 'intercambios hoy',
            tone: 'teal',
          },
          {
            icon: '⌂',
            value: '52',
            label: 'rincones activos',
            tone: 'orange',
          },
          {
            icon: '◉',
            value: '248',
            label: 'lectores activos',
            tone: 'purple',
          },
          {
            icon: '✦',
            value: '1.327',
            label: 'libros publicados',
            tone: 'blue',
          },
        ]
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
    ? isAuthenticated
      ? catalog.activity
      : catalog.communityPosts.map((post) => ({
          icon: '↔',
          title: `${post.author} compartió una historia`,
          meta: post.meta,
          tone: 'teal',
        }))
    : isAuthenticated
      ? (privateActivityQuery.data ?? []).map((item) => ({
          icon: item.action === 'exchanged' ? '✓' : '↔',
          title: `${item.action === 'exchanged' ? 'Completaste un intercambio de' : 'Ofreciste'} “${item.bookTitle}”`,
          meta: new Date(item.timestamp).toLocaleString('es-AR'),
          tone: item.action === 'exchanged' ? 'purple' : 'teal',
        }))
      : (publicActivityQuery.data ?? []).map((item) => ({
          icon: '↔',
          title: `${item.user} participa en la comunidad`,
          meta: 'Actividad pública reciente',
          tone: 'teal',
        }))

  const showNextRecommendations = () => {
    setRailDirection('next')
    setRecommendationOffset((offset) => offset + 5)
  }
  const showPreviousRecommendations = () => {
    setRailDirection('previous')
    setRecommendationOffset((offset) => Math.max(offset - 5, 0))
  }

  return (
    <BaseLayout id="home-page">
      <PrototypePage>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            {isAuthenticated ? (
              <>
                <h1>
                  ¡Bienvenido de nuevo,{' '}
                  <em>{mockMode ? 'Mariano' : (user?.name ?? 'lector')}!</em>
                </h1>
                <p>
                  Hay nuevas historias, libros y rincones esperando cerca tuyo.
                </p>
              </>
            ) : (
              <>
                <h1>Encontrá tu próxima historia.</h1>
                <p>
                  Descubrí libros cerca tuyo, conectá con otros lectores e
                  intercambiá los que ya terminaste.
                </p>
              </>
            )}
            <PrototypeButton
              tone="primary"
              onClick={() => navigate(`/${HOME_URLS.BOOKS}`)}
            >
              {t('home.explore_books', { defaultValue: 'Explorar libros' })}{' '}
              <span aria-hidden="true">→</span>
            </PrototypeButton>
            {!isAuthenticated ? (
              <PrototypeButton
                tone="ghost"
                onClick={() => navigate(`/${HOME_URLS.REGISTER}`)}
              >
                {t('auth.required.register')}
              </PrototypeButton>
            ) : null}
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
                onClick={() =>
                  navigate(isAuthenticated ? '/books/mine' : '/books')
                }
              >
                {isAuthenticated ? 'Ver mis libros →' : 'Ver catálogo →'}
              </PrototypeButton>
            }
          />
          {mockMode ? (
            <FixtureState region="books">
              <BookRail
                books={books}
                hasNext={recommendationPage.hasNext}
                hasPrevious={recommendationPage.hasPrevious}
                isRefreshing={booksQuery.isFetching}
                direction={railDirection}
                onNext={showNextRecommendations}
                onOpen={setSelectedBook}
                onPrevious={showPreviousRecommendations}
              />
            </FixtureState>
          ) : booksQuery.isLoading ? (
            <Panel className={styles.state}>Cargando libros…</Panel>
          ) : booksQuery.isError ? (
            <Panel className={styles.state}>
              No pudimos cargar los libros.
            </Panel>
          ) : (
            <BookRail
              books={books}
              hasNext={recommendationPage.hasNext}
              hasPrevious={recommendationPage.hasPrevious}
              isRefreshing={booksQuery.isFetching}
              direction={railDirection}
              onNext={showNextRecommendations}
              onOpen={setSelectedBook}
              onPrevious={showPreviousRecommendations}
            />
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
          ) : (
              isAuthenticated
                ? privateActivityQuery.isLoading
                : publicActivityQuery.isLoading
            ) ? (
            <div className={styles.state}>Cargando actividad…</div>
          ) : (
              isAuthenticated
                ? privateActivityQuery.isError
                : publicActivityQuery.isError
            ) ? (
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
                  isSeeking: selectedBook.mode === 'Buscado',
                  ownerName: selectedBook.owner,
                }
              : undefined
          }
          onClose={() => setSelectedBook(null)}
          onStartConversation={
            selectedBook
              ? (ownerId) =>
                  runIfAuthenticated(() =>
                    contactMutation.mutate({ ownerId, book: selectedBook })
                  )
              : undefined
          }
          isStartingConversation={contactMutation.isPending}
          contactError={
            contactMutation.isError ? t('bookDetail.contactError') : undefined
          }
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
  direction,
  hasNext,
  hasPrevious,
  isRefreshing,
  onNext,
  onOpen,
  onPrevious,
}: {
  books: ReturnType<typeof toPrototypeBook>[]
  direction: 'next' | 'previous'
  hasNext: boolean
  hasPrevious: boolean
  isRefreshing: boolean
  onNext: () => void
  onOpen: (book: PrototypeBook) => void
  onPrevious: () => void
}) => {
  const previousBooks = useRef(books)
  const [outgoingBooks, setOutgoingBooks] = useState<PrototypeBook[]>([])
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    const previousIds = previousBooks.current.map((book) => book.id).join(',')
    const currentIds = books.map((book) => book.id).join(',')
    if (previousIds === currentIds) return

    setOutgoingBooks(previousBooks.current)
    setAnimationKey((key) => key + 1)
    previousBooks.current = books

    const timeout = window.setTimeout(() => setOutgoingBooks([]), 260)
    return () => window.clearTimeout(timeout)
  }, [books])

  const visibleBooks = books.slice(0, 5)
  const incomingClass =
    animationKey > 0
      ? direction === 'next'
        ? styles.railIncomingNext
        : styles.railIncomingPrevious
      : ''
  const outgoingClass =
    direction === 'next' ? styles.railOutgoingNext : styles.railOutgoingPrevious

  return (
    <div className={styles.bookRailShell}>
      <div className={styles.bookRailViewport}>
        {outgoingBooks.length ? (
          <div
            aria-hidden="true"
            className={`${styles.bookRail} ${styles.railOutgoing} ${outgoingClass}`}
            inert
          >
            {outgoingBooks.slice(0, 5).map((book) => (
              <PrototypeBookCard decorative key={book.id} book={book} />
            ))}
          </div>
        ) : null}
        <div
          className={`${styles.bookRail} ${incomingClass}`}
          key={animationKey}
        >
          {visibleBooks.length ? (
            visibleBooks.map((book) => (
              <PrototypeBookCard
                key={book.id}
                book={book}
                onClick={() => onOpen(book)}
              />
            ))
          ) : (
            <Panel className={styles.state}>
              No hay libros disponibles todavía.
            </Panel>
          )}
        </div>
        {hasPrevious ? (
          <button
            aria-label="Ver recomendaciones anteriores"
            className={`${styles.railArrow} ${styles.railArrowPrevious}`}
            disabled={isRefreshing}
            onClick={onPrevious}
            type="button"
          >
            <span aria-hidden="true" className={styles.railArrowGlyph}>
              &lt;
            </span>
          </button>
        ) : null}
        {hasNext && visibleBooks.length === 5 ? (
          <button
            aria-label="Ver más recomendaciones"
            className={`${styles.railArrow} ${styles.railArrowNext}`}
            disabled={isRefreshing}
            onClick={onNext}
            type="button"
          >
            <span aria-hidden="true" className={styles.railArrowGlyph}>
              &gt;
            </span>
          </button>
        ) : null}
      </div>
      <span aria-live="polite" className={styles.railStatus}>
        {isRefreshing ? 'Actualizando recomendaciones' : ''}
      </span>
    </div>
  )
}
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
