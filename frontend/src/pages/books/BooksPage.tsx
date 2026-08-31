import { fetchBookById, fetchBooks } from '@api/books/books.service'
import { fetchUserBooks } from '@api/books/userBooks.service'
import { BookDetailModal } from '@components/book/BookDetailModal/BookDetailModal'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { PublishBookModal } from '@components/publish/PublishBookModal/PublishBookModal'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useMatch, useNavigate } from 'react-router-dom'

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

const BookResults = ({
  books,
  onSelect,
}: {
  books: PrototypeBook[]
  onSelect: (book: PrototypeBook) => void
}) =>
  books.length ? (
    <div className={styles.grid}>
      {books.map((book) => (
        <PrototypeBookCard
          key={book.id}
          book={book}
          onClick={() => onSelect(book)}
        />
      ))}
    </div>
  ) : (
    <Panel className={styles.empty}>
      <strong>No encontramos libros</strong>
      <span>Probá con otra búsqueda o eliminá algunos filtros.</span>
    </Panel>
  )

export const BooksPage = () => {
  const { isAuthenticated } = useAuth()
  const { catalog } = usePrototype()
  const { t } = useTranslation()
  const mockMode = isApiMockMode()
  const navigate = useNavigate()
  const location = useLocation()
  const publishMatch = useMatch('/books/new')
  const [search, setSearch] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedBook, setSelectedBook] = useState<PrototypeBook | null>(null)
  const segment = location.pathname.replace(/^\/books\/?/, '').split('/')[0]
  const bookId = /^\d+$/.test(segment) ? Number(segment) : null
  const active = tabs.find((tab) => tab.path === segment)?.key ?? 'all'
  const publicBooksQuery = useQuery({
    queryKey: ['prototype', 'books', active, search],
    queryFn: () =>
      fetchBooks({
        q: search.trim() || undefined,
        ...(active === 'seeking' ? { type: 'want' as const } : {}),
      }),
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
    let result = [
      ...(active === 'mine' || active === 'all'
        ? catalog.userBooks
        : catalog.books),
    ]
    if (active === 'trade')
      result = result.filter((book) => book.mode === 'Intercambio')
    if (active === 'seeking')
      result = result.filter((book) => book.mode === 'Buscado')
    if (active === 'sale')
      result = result.filter((book) => book.mode === 'Venta')
    const normalized = search.trim().toLowerCase()
    return normalized
      ? result.filter((book) =>
          `${book.title} ${book.author}`.toLowerCase().includes(normalized)
        )
      : result
  }, [active, catalog.books, catalog.userBooks, search])
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
  const realBooks: ApiBook[] =
    active === 'mine' || active === 'all'
      ? (ownBooksQuery.data ?? [])
      : (publicBooksQuery.data ?? [])
  const activeIsLoading =
    active === 'mine' || active === 'all'
      ? ownBooksQuery.isLoading
      : publicBooksQuery.isLoading
  const activeHasError =
    active === 'mine' || active === 'all'
      ? ownBooksQuery.isError
      : publicBooksQuery.isError
  const books = mockMode
    ? mockBooks
    : realBooks.map((book) => toPrototypeBook(book))
  const totalPages = Math.max(1, Math.ceil(books.length / BOOKS_PER_PAGE))
  const activePage = Math.min(currentPage, totalPages - 1)
  const visibleBooks = books.slice(
    activePage * BOOKS_PER_PAGE,
    (activePage + 1) * BOOKS_PER_PAGE
  )

  useEffect(() => {
    setCurrentPage(0)
  }, [active, search])

  return (
    <BaseLayout id="books-page">
      <PrototypePage>
        <PageHeader
          title="Explorar libros"
          description="Descubrí libros cerca tuyo para intercambiar, comprar o sumar a tu lista."
          actions={
            <PrototypeButton
              tone="primary"
              onClick={() => navigate('/books/new')}
            >
              ＋ Publicar un libro
            </PrototypeButton>
          }
        />
        <div className={styles.toolbar}>
          <label className={styles.search}>
            <span aria-hidden="true">⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por título, autor o género"
              aria-label="Buscar libros"
            />
          </label>
          <PrototypeButton
            onClick={() => setFiltersOpen((value) => !value)}
            aria-expanded={filtersOpen}
          >
            ☷ Filtros
          </PrototypeButton>
        </div>
        {filtersOpen ? (
          <Panel className={styles.filters}>
            <button>Hasta 2 km</button>
            <button>Buen estado</button>
            <button>Disponible hoy</button>
            <button>Ordenar: cercanos</button>
          </Panel>
        ) : null}
        <div
          className={styles.tabs}
          role="tablist"
          aria-label="Tipos de libros"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={active === tab.key}
              onClick={() =>
                navigate(tab.path ? `/books/${tab.path}` : '/books')
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
        {mockMode ? (
          <FixtureState region="books">
            <BookResults books={visibleBooks} onSelect={setSelectedBook} />
          </FixtureState>
        ) : activeIsLoading ? (
          <Panel className={styles.empty}>Cargando libros…</Panel>
        ) : activeHasError ? (
          <Panel className={styles.empty}>
            No pudimos cargar los libros. Intentá nuevamente.
          </Panel>
        ) : (
          <BookResults books={visibleBooks} onSelect={setSelectedBook} />
        )}
        <nav
          className={styles.pagination}
          aria-label={t('booksPage.pagination.label')}
        >
          <button
            type="button"
            aria-label={t('booksPage.pagination.previous')}
            disabled={activePage === 0}
            onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
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
                onClick={() => setCurrentPage(page)}
              >
                {page + 1}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label={t('booksPage.pagination.next')}
            disabled={activePage === totalPages - 1}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages - 1, page + 1))
            }
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
    </BaseLayout>
  )
}
