import { BookCard } from '@components/book/BookCard'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { TabsMenu } from '@components/ui/tabs-menu/TabsMenu'
import { getPathSegment } from '@utils/path'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import styles from './BooksPage.module.scss'
import { useUserBooks } from '@src/hooks/api/useUserBooks'
import type { ApiUserBook } from '@src/api/books/userBooks.types'

export const BooksPage = () => {
  const { t } = useTranslation()
  const location = useLocation()
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

  return (
    <BaseLayout>
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
            <button className={styles.publishButton}>
              {t('booksPage.publish_button')}
            </button>
          </div>
        </header>

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
              <BookCard key={book.id} {...book} />
            ))}
          </div>
        )}
      </div>
    </BaseLayout>
  )
}
