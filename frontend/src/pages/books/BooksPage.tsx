import { BookCard } from '@components/book/BookCard'
import { BookDetailModal } from '@components/book/BookDetailModal/BookDetailModal'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { PublishBookModal } from '@components/publish/PublishBookModal/PublishBookModal'
import { TabsMenu } from '@components/ui/tabs-menu/TabsMenu'
import { useUserBooks } from '@hooks/api/useUserBooks'
import { getPathSegment } from '@utils/path'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useMatch, useNavigate } from 'react-router-dom'

import type { ApiUserBook } from '@src/api/books/userBooks.types'

import styles from './BooksPage.module.scss'

export const BooksPage = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data: booksData } = useUserBooks()
  const books = Array.isArray(booksData) ? booksData : []

  const basePath = '/books'

  const tabs = useMemo(
    () => [
      { key: 'mine', path: 'mine', label: t('booksPage.tabs.mine') },
      { key: 'trade', path: 'trade', label: t('booksPage.tabs.for_trade') },
      { key: 'seeking', path: 'seeking', label: t('booksPage.tabs.seeking') },
      { key: 'sale', path: 'sale', label: t('booksPage.tabs.for_sale') },
    ],
    [t]
  )

  const pathSegment = getPathSegment(location.pathname, basePath)
  const activeTab = (tabs.find((tab) => tab.path === pathSegment)?.key ??
    'mine') as 'mine' | 'trade' | 'seeking' | 'sale'

  const publishMatch = useMatch('/books/new')
  const detailMatch = useMatch('/books/:bookId')
  // Exclude 'new' from being treated as a book ID
  const selectedBook =
    detailMatch && detailMatch.params?.bookId !== 'new'
      ? books.find((book) => book.id === detailMatch.params?.bookId)
      : null

  // TODO: mover este filtro a un hook reutilizable si se complica
  const filterByTab = (book: ApiUserBook) => {
    switch (activeTab) {
      case 'trade':
        return !!book.isForTrade
      case 'seeking':
        return !!book.isSeeking
      case 'sale':
        return !!book.isForSale
      default:
        return true
    }
  }

  const filteredBooks = books.filter((book) => {
    const matchesSearch = `${book.title} ${book.author}`
      .toLowerCase()
      .includes(search.toLowerCase())
    return matchesSearch && filterByTab(book)
  })

  const handleOpenModal = () => {
    navigate('/books/new', { state: { from: location.pathname } })
  }

  const handleCloseModal = () => {
    navigate('/books', { replace: true })
  }

  const handlePublished = (bookId: string) => {
    navigate(`/books/${bookId}`, { replace: true })
  }

  const handleCardClick = (bookId: string) => {
    navigate(`/books/${bookId}`)
  }

  const handleCloseDetail = () => {
    navigate('/books', { replace: true })
  }

  return (
    <BaseLayout id={'books-page'}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1>{t('booksPage.title')}</h1>
          <div className={styles.searchRow}>
            <input
              type="text"
              className={styles.search}
              placeholder={t('booksPage.search_placeholder') ?? ''}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className={styles.chips}>
              <span className={styles.chip}>{t('booksPage.filter.near')}</span>
              <span className={styles.chip}>
                {t('booksPage.filter.available')}
              </span>
            </div>
            <button className={styles.publishButton} onClick={handleOpenModal}>
              {t('booksPage.publish_button')}
            </button>
          </div>
        </header>

        {selectedBook && (
          <section aria-live="polite" className={styles.highlight}>
            <h2>{t('booksPage.recently_published')}</h2>
            <BookCard {...selectedBook} />
          </section>
        )}

        <TabsMenu items={tabs} basePath={basePath}>
          <button className={styles.seeAll}>
            {t('booksPage.tabs.see_all')}
          </button>
        </TabsMenu>

        {filteredBooks.length === 0 ? (
          <div className={styles.empty}>
            {t(`booksPage.empty.${activeTab}`)}
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                {...book}
                onClick={() => handleCardClick(book.id)}
              />
            ))}
          </div>
        )}
      </div>
      {publishMatch && (
        <PublishBookModal
          isOpen={true}
          onClose={handleCloseModal}
          onPublished={handlePublished}
        />
      )}
      <BookDetailModal
        isOpen={!!detailMatch && detailMatch.params?.bookId !== 'new'}
        bookId={detailMatch?.params?.bookId}
        onClose={handleCloseDetail}
      />
    </BaseLayout>
  )
}
