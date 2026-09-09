import {
  fetchPublicBookCatalog,
  fetchBookRelations,
  type BookCatalogFilters,
} from '@api/books/books.service'
import { BookDetailModal } from '@components/book/BookDetailModal/BookDetailModal'
import {
  WantBookModal,
  type WantBookSource,
} from '@components/books/WantBookModal/WantBookModal'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { PublishBookModal } from '@components/publish/PublishBookModal/PublishBookModal'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useLocation,
  useMatch,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import type { PersonalBookRelationsTab } from '@src/api/books/books.types'
import {
  PageHeader,
  Panel,
  CatalogBookCard,
  ActionButton,
  PageFrame,
} from '@src/components/ui/presentation/Presentation'
import { useAuth } from '@src/contexts/auth/AuthContext'
import { useAuthRequired } from '@src/contexts/auth/AuthRequiredContext'
import { useBookContact } from '@src/hooks/useBookContact'
import type { BookCardView } from '@src/mocks/fixtures/experience'
import { toBookCardView } from '@src/shared/view-models/adapters'

import styles from './BooksPage.module.scss'

const BOOKS_PER_PAGE = 5

const tabs: Array<{
  key: PersonalBookRelationsTab
  path: string
  labelKey: string
}> = [
  { key: 'all', path: '', labelKey: 'booksPage.tabs.all' },
  { key: 'trade', path: 'trade', labelKey: 'booksPage.tabs.for_trade' },
  { key: 'sale', path: 'sale', labelKey: 'booksPage.tabs.for_sale' },
  { key: 'seeking', path: 'seeking', labelKey: 'booksPage.tabs.seeking' },
]

const filterKeys = [
  'q',
  'topic',
  'interest',
  'condition',
  'status',
  'type',
  'trade',
  'sale',
  'sort',
  'radiusKm',
] as const

type Condition = NonNullable<BookCatalogFilters['condition']>
type Sort = NonNullable<BookCatalogFilters['sort']>

const conditions: Array<{ value: Condition; labelKey: string }> = [
  { value: 'new', labelKey: 'publishBook.preview.condition.new' },
  { value: 'very_good', labelKey: 'publishBook.preview.condition.very_good' },
  { value: 'good', labelKey: 'publishBook.preview.condition.good' },
  { value: 'acceptable', labelKey: 'publishBook.preview.condition.acceptable' },
]

const sortOptions: Array<{ value: Sort; labelKey: string }> = [
  { value: 'recent', labelKey: 'booksPage.sort.recent' },
  { value: 'nearby', labelKey: 'booksPage.sort.nearby' },
  { value: 'price_asc', labelKey: 'booksPage.sort.price_asc' },
  { value: 'price_desc', labelKey: 'booksPage.sort.price_desc' },
]

const hasFilterValue = (searchParams: URLSearchParams) =>
  filterKeys.some((key) => searchParams.has(key))

const toNumber = (value: string | null) => {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const emptyKeyForTab = (tab: PersonalBookRelationsTab) =>
  tab === 'all'
    ? 'booksPage.empty.all'
    : tab === 'trade'
      ? 'booksPage.empty.trade'
      : tab === 'sale'
        ? 'booksPage.empty.sale'
        : 'booksPage.empty.seeking'

const BookResults = ({
  books,
  tab,
  hasActiveFilters,
  showPublicContext,
  onSelect,
  onClearFilters,
  onPublish,
  onWant,
}: {
  books: BookCardView[]
  tab: PersonalBookRelationsTab
  hasActiveFilters: boolean
  showPublicContext: boolean
  onSelect: (book: BookCardView) => void
  onClearFilters?: () => void
  onPublish: () => void
  onWant: () => void
}) => {
  const { t } = useTranslation()
  const publicNotice = showPublicContext ? (
    <Panel className={styles.discoveryNotice} role="status">
      <strong>{t('booksPage.discovery.title')}</strong>
      <span>{t('booksPage.discovery.description')}</span>
    </Panel>
  ) : null

  if (!books.length) {
    return (
      <>
        {publicNotice}
        <Panel className={styles.empty}>
          <strong>
            {t(
              hasActiveFilters
                ? 'booksPage.empty.filtered'
                : emptyKeyForTab(tab)
            )}
          </strong>
          <span>
            {t(
              hasActiveFilters
                ? 'booksPage.empty.filteredHint'
                : 'booksPage.empty.contextualHint'
            )}
          </span>
          {hasActiveFilters && onClearFilters ? (
            <button
              type="button"
              className={styles.clearEmpty}
              onClick={onClearFilters}
            >
              {t('booksPage.filters.reset')}
            </button>
          ) : null}
          {!hasActiveFilters ? (
            <div className={styles.emptyActions}>
              <ActionButton
                size="small"
                tone={tab === 'seeking' ? 'primary' : 'ghost'}
                onClick={tab === 'seeking' ? onWant : onPublish}
              >
                {t(
                  tab === 'seeking'
                    ? 'booksPage.want.open'
                    : 'booksPage.publish_button'
                )}
              </ActionButton>
              {tab !== 'seeking' ? (
                <ActionButton size="small" onClick={onWant}>
                  {t('booksPage.want.open')}
                </ActionButton>
              ) : null}
            </div>
          ) : null}
        </Panel>
      </>
    )
  }

  return (
    <>
      {publicNotice}
      <div className={styles.grid}>
        {books.map((book) => (
          <article key={book.id} className={styles.resultCard}>
            <CatalogBookCard book={book} onClick={() => onSelect(book)} />
          </article>
        ))}
      </div>
    </>
  )
}

export const BooksPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { runIfAuthenticated } = useAuthRequired()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const publishMatch = useMatch('/books/new')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<BookCardView | null>(null)
  const [wantBook, setWantBook] = useState<WantBookSource | undefined>()
  const [isWantModalOpen, setIsWantModalOpen] = useState(false)
  const [coordinates, setCoordinates] = useState<
    { latitude: number; longitude: number } | undefined
  >()
  const [locationError, setLocationError] = useState(false)

  const segment = location.pathname.replace(/^\/books\/?/, '').split('/')[0]
  const activeTab: PersonalBookRelationsTab =
    tabs.find((tab) => tab.path === segment)?.key ?? 'all'
  const search = searchParams.get('q') ?? ''
  const selectedTopic = searchParams.get('topic') ?? ''
  const selectedInterest = searchParams.get('interest') ?? ''
  const selectedCondition = searchParams.get('condition') as Condition | null
  const selectedStatus = searchParams.get('status')
  const selectedType = searchParams.get('type') as 'offer' | 'want' | null
  const selectedSort =
    (searchParams.get('sort') as Sort | null) ?? ('recent' as const)
  const selectedRadius = searchParams.get('radiusKm')
  const selectedTrade = searchParams.get('trade') === 'true'
  const selectedSale = searchParams.get('sale') === 'true'
  const currentPage = Math.max(0, (toNumber(searchParams.get('page')) ?? 1) - 1)
  const hasActiveFilters = hasFilterValue(searchParams)
  const showPublicDiscovery = activeTab === 'all' && search.trim().length > 0

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        Object.entries(updates).forEach(([key, value]) => {
          if (value === undefined || value === '') next.delete(key)
          else next.set(key, value)
        })
        next.delete('page')
        return next
      })
    },
    [setSearchParams]
  )

  const resetFilters = useCallback(() => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      filterKeys.forEach((key) => next.delete(key))
      next.delete('page')
      return next
    })
  }, [setSearchParams])

  useEffect(() => {
    if (segment !== 'mine') return
    navigate('/books', { replace: true })
  }, [navigate, segment])

  const catalogFilters = useMemo<BookCatalogFilters>(
    () => ({
      q: search.trim() || undefined,
      topic: selectedTopic.trim() || undefined,
      interest: selectedInterest.trim() || undefined,
      condition: selectedCondition ?? undefined,
      status: selectedStatus ?? undefined,
      type: selectedType ?? undefined,
      trade: activeTab === 'trade' ? true : selectedTrade || undefined,
      sale: activeTab === 'sale' ? true : selectedSale || undefined,
      sort: selectedSort,
      limit: BOOKS_PER_PAGE,
      offset: currentPage * BOOKS_PER_PAGE,
      ...(coordinates && selectedRadius
        ? {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            radiusKm: Number(selectedRadius),
          }
        : {}),
    }),
    [
      activeTab,
      coordinates,
      currentPage,
      search,
      selectedCondition,
      selectedInterest,
      selectedRadius,
      selectedSale,
      selectedSort,
      selectedStatus,
      selectedTopic,
      selectedTrade,
      selectedType,
    ]
  )

  const relationFilters = useMemo(
    () => ({ ...catalogFilters, tab: activeTab }),
    [activeTab, catalogFilters]
  )

  useEffect(() => {
    if (!selectedRadius) {
      setLocationError(false)
      return
    }
    if (!navigator.geolocation) {
      setLocationError(true)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLocationError(false)
      },
      () => setLocationError(true),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300_000 }
    )
  }, [selectedRadius])

  const relationsQuery = useQuery({
    queryKey: ['bookRelations', relationFilters],
    queryFn: () => fetchBookRelations(relationFilters),
    enabled:
      !isLoading &&
      isAuthenticated &&
      segment !== 'mine' &&
      !showPublicDiscovery,
  })

  const publicCatalogQuery = useQuery({
    queryKey: ['publicBookCatalog', catalogFilters],
    queryFn: () => fetchPublicBookCatalog(catalogFilters),
    enabled:
      !isLoading &&
      isAuthenticated &&
      segment !== 'mine' &&
      showPublicDiscovery,
  })

  const activeItems = useMemo(
    () =>
      showPublicDiscovery
        ? (publicCatalogQuery.data?.items ?? [])
        : (relationsQuery.data?.items ?? []),
    [
      publicCatalogQuery.data?.items,
      relationsQuery.data?.items,
      showPublicDiscovery,
    ]
  )
  const books = useMemo(
    () =>
      activeItems.map((book) =>
        toBookCardView(book, {
          isExternal:
            user?.id !== undefined &&
            book.ownerId !== undefined &&
            String(book.ownerId) !== String(user.id),
        })
      ),
    [activeItems, user?.id]
  )
  const total = showPublicDiscovery
    ? (publicCatalogQuery.data?.page.total ?? 0)
    : (relationsQuery.data?.page.total ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / BOOKS_PER_PAGE))
  const activePage = Math.min(currentPage, totalPages - 1)
  const filterSummary = [
    selectedTopic || null,
    selectedInterest || null,
    selectedCondition
      ? t(
          conditions.find((item) => item.value === selectedCondition)
            ?.labelKey ?? selectedCondition
        )
      : null,
    selectedStatus ? t(`booksPage.filters.status.${selectedStatus}`) : null,
    selectedType ? t(`booksPage.filters.type.${selectedType}`) : null,
    selectedTrade ? t('booksPage.filters.trade') : null,
    selectedSale ? t('booksPage.filters.sale') : null,
    selectedRadius ? `${selectedRadius} km` : null,
  ].filter((value): value is string => Boolean(value))

  const openWantModal = () => {
    setWantBook(undefined)
    setIsWantModalOpen(true)
  }

  const closeWantModal = () => {
    setIsWantModalOpen(false)
    setWantBook(undefined)
  }

  const handleTabChange = (path: string) => {
    const next = new URLSearchParams(searchParams)
    next.delete('page')
    navigate(
      `${path ? `/books/${path}` : '/books'}${next.toString() ? `?${next}` : ''}`
    )
  }

  const setPage = (page: number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('page', String(page + 1))
      return next
    })
  }

  const contactMutation = useBookContact({
    onSuccess: (conversation) => {
      setSelectedBook(null)
      navigate('/messages', { state: { conversationId: conversation.id } })
    },
  })

  const invalidateRelations = () => {
    void queryClient.invalidateQueries({ queryKey: ['bookRelations'] })
    void queryClient.invalidateQueries({ queryKey: ['publicBookCatalog'] })
  }

  const activeQuery = showPublicDiscovery ? publicCatalogQuery : relationsQuery

  return (
    <BaseLayout id="books-page">
      <PageFrame>
        <PageHeader
          title={t('booksPage.title')}
          description={t('booksPage.description')}
          actions={
            <div className={styles.headerActions}>
              <ActionButton onClick={() => runIfAuthenticated(openWantModal)}>
                {t('booksPage.want.open')}
              </ActionButton>
              <ActionButton
                tone="primary"
                onClick={() => runIfAuthenticated(() => navigate('/books/new'))}
              >
                + {t('booksPage.publish_button')}
              </ActionButton>
            </div>
          }
        />
        <div className={styles.toolbar}>
          <label className={styles.search}>
            <span aria-hidden="true">⌕</span>
            <input
              value={search}
              onChange={(event) => updateParams({ q: event.target.value })}
              placeholder={t('booksPage.search_placeholder')}
              aria-label={t('booksPage.search_label')}
            />
          </label>
          <ActionButton
            onClick={() => setFiltersOpen((value) => !value)}
            aria-expanded={filtersOpen}
            aria-controls="books-filters"
          >
            ⚙ {t('booksPage.filters.button')}
          </ActionButton>
        </div>
        {filtersOpen ? (
          <Panel className={styles.filters} id="books-filters">
            <label className={styles.textFilter}>
              <span>{t('booksPage.filters.topic')}</span>
              <input
                value={selectedTopic}
                onChange={(event) =>
                  updateParams({ topic: event.target.value })
                }
                placeholder={t('booksPage.filters.topicPlaceholder')}
              />
            </label>
            <label className={styles.textFilter}>
              <span>{t('booksPage.filters.interest')}</span>
              <input
                value={selectedInterest}
                onChange={(event) =>
                  updateParams({ interest: event.target.value })
                }
                placeholder={t('booksPage.filters.interestPlaceholder')}
              />
            </label>
            <label className={styles.selectFilter}>
              <span>{t('booksPage.filters.condition')}</span>
              <select
                value={selectedCondition ?? ''}
                onChange={(event) =>
                  updateParams({ condition: event.target.value })
                }
              >
                <option value="">{t('booksPage.filters.any')}</option>
                {conditions.map((condition) => (
                  <option key={condition.value} value={condition.value}>
                    {t(condition.labelKey)}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.selectFilter}>
              <span>{t('booksPage.filters.status.label')}</span>
              <select
                value={selectedStatus ?? ''}
                onChange={(event) =>
                  updateParams({ status: event.target.value })
                }
              >
                <option value="">{t('booksPage.filters.any')}</option>
                <option value="available">
                  {t('booksPage.filters.status.available')}
                </option>
                <option value="reserved">
                  {t('booksPage.filters.status.reserved')}
                </option>
              </select>
            </label>
            <label className={styles.selectFilter}>
              <span>{t('booksPage.filters.type.label')}</span>
              <select
                value={selectedType ?? ''}
                onChange={(event) => updateParams({ type: event.target.value })}
              >
                <option value="">{t('booksPage.filters.any')}</option>
                <option value="offer">
                  {t('booksPage.filters.type.offer')}
                </option>
                <option value="want">{t('booksPage.filters.type.want')}</option>
              </select>
            </label>
            <label className={styles.selectFilter}>
              <span>{t('booksPage.filters.sort')}</span>
              <select
                value={selectedSort}
                onChange={(event) => updateParams({ sort: event.target.value })}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.selectFilter}>
              <span>{t('booksPage.filters.radius')}</span>
              <select
                value={selectedRadius ?? ''}
                onChange={(event) =>
                  updateParams({ radiusKm: event.target.value })
                }
              >
                <option value="">{t('booksPage.filters.any')}</option>
                <option value="1">1 km</option>
                <option value="5">5 km</option>
                <option value="30">30 km</option>
                <option value="50">50 km</option>
              </select>
            </label>
            <button
              type="button"
              className={`${styles.filterToggle} ${selectedTrade ? styles.filterToggleActive : ''}`}
              aria-pressed={selectedTrade}
              onClick={() =>
                updateParams({ trade: selectedTrade ? undefined : 'true' })
              }
            >
              {t('booksPage.filters.trade')}
            </button>
            <button
              type="button"
              className={`${styles.filterToggle} ${selectedSale ? styles.filterToggleActive : ''}`}
              aria-pressed={selectedSale}
              onClick={() =>
                updateParams({ sale: selectedSale ? undefined : 'true' })
              }
            >
              {t('booksPage.filters.sale')}
            </button>
            {hasActiveFilters ? (
              <button
                type="button"
                className={styles.resetFilters}
                onClick={resetFilters}
              >
                {t('booksPage.filters.reset')}
              </button>
            ) : null}
          </Panel>
        ) : null}
        {filterSummary.length || locationError ? (
          <div className={styles.activeFilters} role="status">
            <span>{t('booksPage.filters.active')}</span>
            {filterSummary.map((filter) => (
              <span key={filter} className={styles.activeFilter}>
                {filter}
              </span>
            ))}
            {locationError && selectedRadius ? (
              <span className={styles.locationHint}>
                {t('booksPage.filters.locationUnavailable')}
              </span>
            ) : null}
            <button type="button" onClick={resetFilters}>
              {t('booksPage.filters.reset')}
            </button>
          </div>
        ) : null}
        <div
          className={styles.tabs}
          role="tablist"
          aria-label={t('booksPage.tabs.label')}
          aria-orientation="horizontal"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => handleTabChange(tab.path)}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
        {activeQuery.isLoading ? (
          <Panel className={styles.empty}>{t('booksPage.loading')}</Panel>
        ) : activeQuery.isError ? (
          <Panel className={styles.empty}>{t('booksPage.error')}</Panel>
        ) : (
          <BookResults
            books={books}
            tab={activeTab}
            hasActiveFilters={hasActiveFilters}
            showPublicContext={showPublicDiscovery}
            onSelect={setSelectedBook}
            onClearFilters={hasActiveFilters ? resetFilters : undefined}
            onPublish={() => runIfAuthenticated(() => navigate('/books/new'))}
            onWant={() => runIfAuthenticated(openWantModal)}
          />
        )}
        <nav
          className={styles.pagination}
          aria-label={t('booksPage.pagination.label')}
        >
          <button
            type="button"
            aria-label={t('booksPage.pagination.previous')}
            disabled={activePage === 0}
            onClick={() => setPage(Math.max(0, activePage - 1))}
          >
            ←
          </button>
          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, page) => (
              <button
                key={page}
                type="button"
                className={page === activePage ? styles.pageActive : ''}
                aria-current={page === activePage ? 'page' : undefined}
                aria-label={t('booksPage.pagination.page', { page: page + 1 })}
                onClick={() => setPage(page)}
              >
                {page + 1}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label={t('booksPage.pagination.next')}
            disabled={activePage === totalPages - 1}
            onClick={() => setPage(Math.min(totalPages - 1, activePage + 1))}
          >
            →
          </button>
        </nav>
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
      {publishMatch ? (
        <PublishBookModal
          isOpen
          onClose={() => navigate('/books', { replace: true })}
          onPublished={() => {
            invalidateRelations()
            navigate('/books', { replace: true })
          }}
        />
      ) : null}
      <WantBookModal
        isOpen={isWantModalOpen}
        initialBook={wantBook}
        onClose={closeWantModal}
        onCreated={() => {
          invalidateRelations()
          closeWantModal()
        }}
      />
    </BaseLayout>
  )
}
