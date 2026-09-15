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

import {
  FixtureState,
  KpiCard,
  Panel,
  CatalogBookCard,
  ActionButton,
  PageFrame,
  SectionHeading,
} from '@src/components/ui/presentation/Presentation'
import { HOME_URLS } from '@src/constants/constants'
import { useMockExperience } from '@src/contexts/mock/MockExperienceContext'
import type { BookCardView } from '@src/mocks/fixtures/experience'
import { toBookCardView } from '@src/shared/view-models/adapters'
import { isApiMockMode } from '@src/utils/runtimeEnv'

import styles from './HomePage.module.scss'

export const HomePage = () => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const { runIfAuthenticated } = useAuthRequired()
  const { t, i18n } = useTranslation()
  const { fixtures } = useMockExperience()
  const mockMode = isApiMockMode()
  const navigate = useNavigate()
  const [selectedBook, setSelectedBook] = useState<BookCardView | null>(null)
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
    queryKey: ['home', 'books', recommendationOffset],
    queryFn: () => fetchHomeBooks(recommendationOffset),
    enabled: !mockMode,
    placeholderData: (previousData) => previousData,
  })
  const privateActivityQuery = useQuery({
    queryKey: ['home', 'activity', 'private'],
    queryFn: fetchUserActivity,
    enabled: !mockMode && isAuthenticated,
  })
  const publicActivityQuery = useQuery({
    queryKey: ['home', 'activity', 'public'],
    queryFn: fetchActivityItems,
    enabled: !mockMode && !isAuthenticated,
  })
  const statsQuery = useQuery({
    queryKey: ['home', 'stats'],
    queryFn: fetchCommunityStats,
    enabled: !mockMode,
  })

  if (isLoading) return null
  const books = mockMode
    ? fixtures.books.slice(0, 5)
    : (booksQuery.data?.items ?? []).map((book) => toBookCardView(book))
  const recommendationPage = mockMode
    ? { hasNext: false, hasPrevious: false }
    : (booksQuery.data?.page ?? { hasNext: false, hasPrevious: false })
  const kpis = mockMode
    ? isAuthenticated
      ? fixtures.homeKpis
      : [
          {
            icon: '↔',
            value: '134',
            label: t('localizedUi.home.exchanges'),
            tone: 'teal',
          },
          {
            icon: '⌂',
            value: '52',
            label: t('localizedUi.home.activeCorners'),
            tone: 'orange',
          },
          {
            icon: '◉',
            value: '248',
            label: t('localizedUi.home.activeReaders'),
            tone: 'purple',
          },
          {
            icon: '✦',
            value: '1.327',
            label: t('localizedUi.home.publishedBooks'),
            tone: 'blue',
          },
        ]
    : statsQuery.data
      ? [
          {
            icon: '↔',
            value: statsQuery.data.kpis.exchanges.toLocaleString(i18n.language),
            label: t('localizedUi.home.exchanges'),
            tone: 'teal',
          },
          {
            icon: '⌂',
            value: statsQuery.data.kpis.activeHouses.toLocaleString(
              i18n.language
            ),
            label: t('localizedUi.home.activeCorners'),
            tone: 'orange',
          },
          {
            icon: '◉',
            value: statsQuery.data.kpis.activeUsers.toLocaleString(
              i18n.language
            ),
            label: t('localizedUi.home.activeReaders'),
            tone: 'purple',
          },
          {
            icon: '✦',
            value: statsQuery.data.kpis.booksPublished.toLocaleString(
              i18n.language
            ),
            label: t('localizedUi.home.publishedBooks'),
            tone: 'blue',
          },
        ]
      : []
  const activities = mockMode
    ? isAuthenticated
      ? fixtures.activity
      : fixtures.communityPosts.map((post) => ({
          icon: '↔',
          title: t('localizedUi.home.sharedStory', { name: post.author }),
          meta: post.meta,
          tone: 'teal',
        }))
    : isAuthenticated
      ? (privateActivityQuery.data ?? []).map((item) => ({
          icon: item.action === 'exchanged' ? '✓' : '↔',
          title: t(
            item.action === 'exchanged'
              ? 'localizedUi.home.completedExchange'
              : 'localizedUi.home.offered',
            { title: item.bookTitle }
          ),
          meta: new Date(item.timestamp).toLocaleString(i18n.language),
          tone: item.action === 'exchanged' ? 'purple' : 'teal',
        }))
      : (publicActivityQuery.data ?? []).map((item) => ({
          icon: '↔',
          title: t('localizedUi.home.sharedStory', { name: item.user }),
          meta: t('localizedUi.home.publicActivity'),
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
      <PageFrame>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            {isAuthenticated ? (
              <>
                <h1>
                  {t('localizedUi.home.welcome', {
                    name: mockMode
                      ? 'Mariano'
                      : (user?.name ?? t('localizedUi.common.member')),
                  })}
                </h1>
                <p>{t('localizedUi.home.subtitle')}</p>
              </>
            ) : (
              <>
                <h1>{t('localizedUi.homeStates.guestTitle')}</h1>
                <p>{t('localizedUi.homeStates.guestSubtitle')}</p>
              </>
            )}
            <ActionButton
              tone="primary"
              onClick={() =>
                navigate(
                  isAuthenticated
                    ? `/${HOME_URLS.BOOKS}`
                    : `/${HOME_URLS.COMMUNITY}`
                )
              }
            >
              {t(isAuthenticated ? 'home.my_books' : 'home.explore_community')}{' '}
              <span aria-hidden="true">→</span>
            </ActionButton>
            {!isAuthenticated ? (
              <ActionButton
                tone="ghost"
                onClick={() => navigate(`/${HOME_URLS.REGISTER}`)}
              >
                {t('auth.required.register')}
              </ActionButton>
            ) : null}
          </div>
        </section>
        {mockMode ? (
          <FixtureState region="kpis">
            <KpiRegion kpis={kpis} />
          </FixtureState>
        ) : statsQuery.isLoading ? (
          <Panel className={styles.state}>
            {t('localizedUi.homeStates.loadingSummary')}
          </Panel>
        ) : statsQuery.isError ? (
          <Panel className={styles.state}>
            {t('localizedUi.home.summaryUnavailable')}
          </Panel>
        ) : (
          <KpiRegion kpis={kpis} />
        )}
        <section className={styles.booksSection}>
          <SectionHeading
            title={t('localizedUi.home.recommendations')}
            action={
              <ActionButton
                tone="ghost"
                size="small"
                onClick={() =>
                  navigate(isAuthenticated ? '/books' : '/community')
                }
              >
                {isAuthenticated
                  ? t('home.my_books')
                  : t('home.explore_community')}{' '}
                →
              </ActionButton>
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
            <Panel className={styles.state}>
              {t('localizedUi.homeStates.loadingBooks')}
            </Panel>
          ) : booksQuery.isError ? (
            <Panel className={styles.state}>
              {t('localizedUi.homeStates.booksError')}
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
            title={t('localizedUi.home.recentActivity')}
            action={
              <span className={styles.live}>
                ● {t('localizedUi.homeStates.live')}
              </span>
            }
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
            <div className={styles.state}>
              {t('localizedUi.homeStates.loadingActivity')}
            </div>
          ) : (
              isAuthenticated
                ? privateActivityQuery.isError
                : publicActivityQuery.isError
            ) ? (
            <div className={styles.state}>
              {t('localizedUi.homeStates.activityError')}
            </div>
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
                    `/illustrations/book-cover.svg?book=${selectedBook.id}`,
                  isSeeking:
                    selectedBook.intentions?.includes('seeking') ?? false,
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
      </PageFrame>
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
}) => {
  const { t } = useTranslation()
  return (
    <section
      className={styles.kpiGrid}
      aria-label={t('localizedUi.home.summary')}
    >
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} {...kpi} />
      ))}
    </section>
  )
}
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
  books: ReturnType<typeof toBookCardView>[]
  direction: 'next' | 'previous'
  hasNext: boolean
  hasPrevious: boolean
  isRefreshing: boolean
  onNext: () => void
  onOpen: (book: BookCardView) => void
  onPrevious: () => void
}) => {
  const { t } = useTranslation()
  const previousBooks = useRef(books)
  const [outgoingBooks, setOutgoingBooks] = useState<BookCardView[]>([])
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
              <CatalogBookCard decorative key={book.id} book={book} />
            ))}
          </div>
        ) : null}
        <div
          className={`${styles.bookRail} ${incomingClass}`}
          key={animationKey}
        >
          {visibleBooks.length ? (
            visibleBooks.map((book) => (
              <CatalogBookCard
                key={book.id}
                book={book}
                onClick={() => onOpen(book)}
              />
            ))
          ) : (
            <Panel className={styles.state}>
              {t('localizedUi.home.noBooks')}
            </Panel>
          )}
        </div>
        {hasPrevious ? (
          <button
            aria-label={t('localizedUi.home.previous')}
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
            aria-label={t('localizedUi.home.next')}
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
        {isRefreshing ? t('localizedUi.home.refreshing') : ''}
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
}) => {
  const { t } = useTranslation()
  return (
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
            <button
              aria-label={t('localizedUi.home.openActivity', {
                title: item.title,
              })}
            >
              →
            </button>
          </article>
        ))
      ) : (
        <div className={styles.state}>{t('localizedUi.home.noActivity')}</div>
      )}
    </div>
  )
}
