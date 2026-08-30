import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { PublishBookModal } from '@components/publish/PublishBookModal/PublishBookModal'
import { useMemo, useState } from 'react'
import { useLocation, useMatch, useNavigate } from 'react-router-dom'

import type { PrototypeBook } from '@src/features/prototype/catalog'
import { usePrototype } from '@src/features/prototype/PrototypeContext'
import {
  BookCover,
  FixtureState,
  PageHeader,
  Panel,
  PrototypeBookCard,
  PrototypeButton,
  PrototypePage,
} from '@src/features/prototype/PrototypeUI'

import styles from './BooksPage.module.scss'

const tabs = [
  { key: 'all', path: '', label: 'Todos' },
  { key: 'mine', path: 'mine', label: 'Mis libros' },
  { key: 'trade', path: 'trade', label: 'Disponibles para intercambio' },
  { key: 'seeking', path: 'seeking', label: 'Buscando' },
  { key: 'sale', path: 'sale', label: 'A la venta' },
] as const

export const BooksPage = () => {
  const { catalog } = usePrototype()
  const navigate = useNavigate()
  const location = useLocation()
  const publishMatch = useMatch('/books/new')
  const [search, setSearch] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<PrototypeBook | null>(null)
  const segment = location.pathname.replace(/^\/books\/?/, '').split('/')[0]
  const active = tabs.find((tab) => tab.path === segment)?.key ?? 'all'

  const books = useMemo(() => {
    let result = [...catalog.books]
    if (active === 'mine') result = result.slice(0, 2)
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
  }, [active, catalog.books, search])

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

        <FixtureState region="books">
          {books.length ? (
            <div className={styles.grid}>
              {books.map((book) => (
                <PrototypeBookCard
                  key={book.id}
                  book={book}
                  onClick={() => setSelectedBook(book)}
                />
              ))}
            </div>
          ) : (
            <Panel className={styles.empty}>
              <strong>No encontramos libros</strong>
              <span>Probá con otra búsqueda o eliminá algunos filtros.</span>
            </Panel>
          )}
        </FixtureState>

        <div className={styles.pagination} aria-label="Páginas de resultados">
          <button aria-label="Página anterior">←</button>
          <span className={styles.activeDot} />
          <span />
          <span />
          <button aria-label="Página siguiente">→</button>
        </div>

        {selectedBook ? (
          <div
            className={styles.modalBackdrop}
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedBook(null)
              }
            }}
          >
            <Panel className={styles.bookDialog} as="div">
              <div className={styles.dialogCover}>
                <BookCover book={selectedBook} />
              </div>
              <div>
                <button
                  className={styles.close}
                  onClick={() => setSelectedBook(null)}
                  aria-label="Cerrar detalle"
                >
                  ×
                </button>
                <span className={styles.dialogMode}>{selectedBook.mode}</span>
                <h2>{selectedBook.title}</h2>
                <p>{selectedBook.author}</p>
                <p className={styles.description}>
                  Una historia para perderse, conversar y compartir. El ejemplar
                  está en buen estado y disponible cerca tuyo.
                </p>
                <PrototypeButton tone="primary">
                  Contactar a {selectedBook.owner}
                </PrototypeButton>
              </div>
            </Panel>
          </div>
        ) : null}
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
