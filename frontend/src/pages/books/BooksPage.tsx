import {
  fetchBookById,
  fetchBooks,
  type BookCatalogFilters,
} from '@api/books/books.service'
import { fetchUserBooks } from '@api/books/userBooks.service'
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

import type { ApiBook } from '@src/api/books/books.types'
import { useAuth } from '@src/contexts/auth/AuthContext'
import type { PrototypeBook } from '@src/features/prototype/catalog'
import { usePrototype } from '@src/features/prototype/PrototypeContext'
import {
  FixtureState,
  PageHeader,
  Panel,
  PrototypeBookCard,
  PrototypeButton,
  PrototypePage,
} from '@src/features/prototype/PrototypeUI'
import { toPrototypeBook } from '@src/features/prototype/realData.adapters'
import { isApiMockMode } from '@src/utils/runtimeEnv'

import styles from './BooksPage.module.scss'

const BOOKS_PER_PAGE = 5

const tabs = [
  { key: 'all', path: '', label: 'Todos' },
  { key: 'mine', path: 'mine', label: 'Mis libros' },
  { key: 'trade', path: 'trade', label: 'Disponibles para intercambio' },
  { key: 'seeking', path: 'seeking', label: 'Buscando' },
  { key: 'sale', path: 'sale', label: 'A la venta' },
] as const

const filterKeys = [
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

const conditions: Array<{ value: Condition; label: string }> = [
  { value: 'new', label: 'Nuevo' },
  { value: 'very_good', label: 'Muy bueno' },
  { value: 'good', label: 'Bueno' },
  { value: 'acceptable', label: 'Aceptable' },
]

const sortOptions: Array<{ value: Sort; label: string }> = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'nearby', label: 'Más cercanos' },
  { value: 'price_asc', label: 'Precio menor' },
  { value: 'price_desc', label: 'Precio mayor' },
]

const hasFilterValue = (searchParams: URLSearchParams) =>
  filterKeys.some((key) => searchParams.has(key))

const toNumber = (value: string | null) => {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const normalizeCondition = (condition?: string) => {
  const normalized = condition?.toLowerCase().replace(/\s+/g, '_')
  if (normalized === 'nuevo') return 'new'
  if (normalized === 'muy_bueno') return 'very_good'
  if (normalized === 'bueno') return 'good'
  if (normalized === 'aceptable') return 'acceptable'
  return normalized
}

const isBookMatchingFilters = (
  book: PrototypeBook,
  filters: {
    condition?: string
    status?: string
    type?: string
    trade?: boolean
    sale?: boolean
  }
) => {
  const modeMatches =
    filters.type === undefined ||
    (filters.type === 'want' && book.mode === 'Buscado') ||
    (filters.type === 'offer' && book.mode !== 'Buscado')
  const conditionMatches =
    filters.condition === undefined ||
    normalizeCondition(book.condition ?? 'good') === filters.condition
  const statusMatches =
    filters.status === undefined || filters.status === 'available'
  const tradeMatches = !filters.trade || book.mode === 'Intercambio'
  const saleMatches = !filters.sale || book.mode === 'Venta'
  return (
    modeMatches &&
    conditionMatches &&
    statusMatches &&
    tradeMatches &&
    saleMatches
  )
}

const BookResults = ({
  books,
  onSelect,
  onClearFilters,
}: {
  books: PrototypeBook[]
  onSelect: (book: PrototypeBook) => void
  onClearFilters?: () => void
}) => {
  const { t } = useTranslation()

  if (!books.length) {
    return (
      <Panel className={styles.empty}>
        <strong>{t('booksPage.empty.filtered')}</strong>
        <span>{t('booksPage.empty.filteredHint')}</span>
        {onClearFilters ? (
          <button
            type="button"
            className={styles.clearEmpty}
            onClick={onClearFilters}
          >
            {t('booksPage.filters.reset')}
          </button>
        ) : null}
      </Panel>
    )
  }

  return (
    <div className={styles.grid}>
      {books.map((book) => {
        return (
          <article key={book.id} className={styles.resultCard}>
            <PrototypeBookCard book={book} onClick={() => onSelect(book)} />
          </article>
        )
      })}
    </div>
  )
}

export const BooksPage = () => {
  const { isAuthenticated } = useAuth()
  const { catalog } = usePrototype()
  const { t } = useTranslation()
  const mockMode = isApiMockMode()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const publishMatch = useMatch('/books/new')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<PrototypeBook | null>(null)
  const [wantBook, setWantBook] = useState<WantBookSource | undefined>()
  const [isWantModalOpen, setIsWantModalOpen] = useState(false)
  const [coordinates, setCoordinates] = useState<
    { latitude: number; longitude: number } | undefined
  >()
  const [locationError, setLocationError] = useState(false)

  const search = searchParams.get('q') ?? ''
  const selectedTopic = searchParams.get('topic') ?? ''
  const selectedInterest = searchParams.get('interest') ?? ''
  const segment = location.pathname.replace(/^\/books\/?/, '').split('/')[0]
  const bookId = /^\d+$/.test(segment) ? Number(segment) : null
  const active = tabs.find((tab) => tab.path === segment)?.key ?? 'all'
  const selectedCondition = searchParams.get('condition') as Condition | null
  const selectedStatus = searchParams.get('status')
  const selectedType = searchParams.get('type') as 'offer' | 'want' | null
  const selectedSort =
    (searchParams.get('sort') as Sort | null) ?? ('recent' as const)
  const selectedRadius = searchParams.get('radiusKm')
  const selectedTrade = searchParams.get('trade') === 'true'
  const selectedSale = searchParams.get('sale') === 'true'
  const hasActiveFilters = hasFilterValue(searchParams)

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

  const catalogFilters = useMemo<BookCatalogFilters>(() => {
    const type =
      active === 'seeking' ? 'want' : (selectedType ?? ('offer' as const))
    return {
      q: search.trim() || undefined,
      topic: selectedTopic.trim() || undefined,
      interest: selectedInterest.trim() || undefined,
      condition: selectedCondition ?? undefined,
      status: selectedStatus ?? undefined,
      type,
      trade: active === 'trade' ? true : selectedTrade || undefined,
      sale: active === 'sale' ? true : selectedSale || undefined,
      sort: selectedSort,
      ...(coordinates && selectedRadius
        ? {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            radiusKm: Number(selectedRadius),
          }
        : {}),
    }
  }, [
    active,
    coordinates,
    selectedInterest,
    search,
    selectedTopic,
    selectedCondition,
    selectedRadius,
    selectedSale,
    selectedSort,
    selectedStatus,
    selectedTrade,
    selectedType,
  ])

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

  const publicBooksQuery = useQuery({
    queryKey: ['prototype', 'books', active, catalogFilters],
    queryFn: () => fetchBooks(catalogFilters),
    enabled:
      !mockMode && active !== 'mine' && active !== 'all' && bookId === null,
  })
  const ownBooksQuery = useQuery({
    queryKey: ['prototype', 'books', 'mine'],
    queryFn: fetchUserBooks,
    enabled:
      !mockMode &&
      isAuthenticated &&
      (active === 'mine' || active === 'all') &&
      bookId === null,
  })

  const mockBooks = useMemo(() => {
    let result: PrototypeBook[] = [
      ...(active === 'mine' || active === 'all'
        ? catalog.userBooks
        : catalog.books),
    ]
    const localFilters = {
      condition: selectedCondition ?? undefined,
      status: selectedStatus ?? undefined,
      type: active === 'seeking' ? 'want' : (selectedType ?? undefined),
      trade: active === 'trade' || selectedTrade,
      sale: active === 'sale' || selectedSale,
    }
    result = result.filter((book) => isBookMatchingFilters(book, localFilters))
    const normalized = search.trim().toLowerCase()
    if (normalized) {
      result = result.filter((book) =>
        `${book.title} ${book.author} ${book.genre}`
          .toLowerCase()
          .includes(normalized)
      )
    }
    if (selectedSort === 'price_asc' || selectedSort === 'price_desc') {
      result.sort((a, b) => {
        const priceA = a.price ? Number(a.price.replace(/\D/g, '')) : null
        const priceB = b.price ? Number(b.price.replace(/\D/g, '')) : null
        if (priceA === null && priceB === null) return 0
        if (priceA === null) return 1
        if (priceB === null) return -1
        return selectedSort === 'price_asc' ? priceA - priceB : priceB - priceA
      })
    }
    return result
  }, [
    active,
    catalog.books,
    catalog.userBooks,
    search,
    selectedCondition,
    selectedSale,
    selectedSort,
    selectedStatus,
    selectedTrade,
    selectedType,
  ])
  const detailQuery = useQuery({
    queryKey: ['prototype', 'book', bookId],
    queryFn: () => fetchBookById(bookId ?? 0),
    enabled: !mockMode && bookId !== null,
  })
  useEffect(() => {
    if (bookId === null) return
    if (mockMode) {
      setSelectedBook(
        mockBooks.find((book) => Number(book.id) === bookId) ?? null
      )
    } else if (detailQuery.data) {
      setSelectedBook(toPrototypeBook(detailQuery.data))
    }
  }, [bookId, detailQuery.data, mockMode, mockBooks])

  const realBooks = useMemo<ApiBook[]>(
    () =>
      active === 'mine' || active === 'all'
        ? (ownBooksQuery.data ?? [])
        : (publicBooksQuery.data ?? []),
    [active, ownBooksQuery.data, publicBooksQuery.data]
  )

  const books = mockMode
    ? mockBooks
    : realBooks
        .filter((book) =>
          isBookMatchingFilters(toPrototypeBook(book), {
            condition: selectedCondition ?? undefined,
            status: selectedStatus ?? undefined,
            type: active === 'seeking' ? 'want' : (selectedType ?? undefined),
            trade: active === 'trade' || selectedTrade,
            sale: active === 'sale' || selectedSale,
          })
        )
        .map((book) => toPrototypeBook(book))

  const currentPage = Math.max(0, (toNumber(searchParams.get('page')) ?? 1) - 1)
  const totalPages = Math.max(1, Math.ceil(books.length / BOOKS_PER_PAGE))
  const activePage = Math.min(currentPage, totalPages - 1)
  const visibleBooks = books.slice(
    activePage * BOOKS_PER_PAGE,
    (activePage + 1) * BOOKS_PER_PAGE
  )
  const activeIsLoading =
    active === 'mine' || active === 'all'
      ? ownBooksQuery.isLoading
      : publicBooksQuery.isLoading
  const activeHasError =
    active === 'mine' || active === 'all'
      ? ownBooksQuery.isError
      : publicBooksQuery.isError

  useEffect(() => {
    if (currentPage > totalPages - 1) {
      updateParams({ page: String(totalPages) })
    }
  }, [currentPage, totalPages, updateParams])

  const setPage = (page: number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('page', String(page + 1))
      return next
    })
  }

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

  const filterSummary = [
    selectedTopic || null,
    selectedInterest || null,
    selectedCondition
      ? conditions.find((item) => item.value === selectedCondition)?.label
      : null,
    selectedStatus ? t(`booksPage.filters.status.${selectedStatus}`) : null,
    selectedType ? t(`booksPage.filters.type.${selectedType}`) : null,
    selectedTrade ? t('booksPage.filters.trade') : null,
    selectedSale ? t('booksPage.filters.sale') : null,
    selectedRadius ? `${selectedRadius} km` : null,
  ].filter((value): value is string => Boolean(value))

  return (
    <BaseLayout id="books-page">
      <PrototypePage>
        <PageHeader
          title="Explorar libros"
          description="Descubri libros cerca tuyo para intercambiar, comprar o sumar a tu lista."
          actions={
            <div className={styles.headerActions}>
              <PrototypeButton onClick={() => openWantModal()}>
                {t('booksPage.want.open')}
              </PrototypeButton>
              <PrototypeButton
                tone="primary"
                onClick={() => navigate('/books/new')}
              >
                + Publicar un libro
              </PrototypeButton>
            </div>
          }
        />
        <div className={styles.toolbar}>
          <label className={styles.search}>
            <span aria-hidden="true">⌕</span>
            <input
              value={search}
              onChange={(event) => updateParams({ q: event.target.value })}
              placeholder="Buscar por título, autor o género"
              aria-label="Buscar libros"
            />
          </label>
          <PrototypeButton
            onClick={() => setFiltersOpen((value) => !value)}
            aria-expanded={filtersOpen}
            aria-controls="books-filters"
          >
            ⚙ {t('booksPage.filters.button')}
          </PrototypeButton>
        </div>
        {filtersOpen ? (
          <Panel className={styles.filters}>
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
                    {condition.label}
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
                    {option.label}
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
          aria-label="Tipos de libros"
          aria-orientation="horizontal"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={active === tab.key}
              onClick={() => handleTabChange(tab.path)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {mockMode ? (
          <FixtureState region="books">
            <BookResults
              books={visibleBooks}
              onSelect={setSelectedBook}
              onClearFilters={hasActiveFilters ? resetFilters : undefined}
            />
          </FixtureState>
        ) : activeIsLoading ? (
          <Panel className={styles.empty}>{t('booksPage.loading')}</Panel>
        ) : activeHasError ? (
          <Panel className={styles.empty}>{t('booksPage.error')}</Panel>
        ) : (
          <BookResults
            books={visibleBooks}
            onSelect={setSelectedBook}
            onClearFilters={hasActiveFilters ? resetFilters : undefined}
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
                aria-label={t('booksPage.pagination.page', {
                  page: page + 1,
                })}
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
                    `/prototype/book-cover.svg?book=${selectedBook.id}`,
                  isSeeking: selectedBook.mode === 'Buscado',
                }
              : undefined
          }
          onClose={() => setSelectedBook(null)}
        />
      </PrototypePage>
      {publishMatch ? (
        <PublishBookModal
          isOpen
          onClose={() => navigate('/books', { replace: true })}
          onPublished={(bookId) =>
            navigate(`/books/${bookId}`, { replace: true })
          }
        />
      ) : null}
      <WantBookModal
        isOpen={isWantModalOpen}
        initialBook={wantBook}
        onClose={closeWantModal}
        onCreated={() => {
          void queryClient.invalidateQueries({
            queryKey: ['prototype', 'books'],
          })
          void queryClient.invalidateQueries({
            queryKey: ['prototype', 'books', 'mine'],
          })
          closeWantModal()
        }}
      />
    </BaseLayout>
  )
}
