import { BookCard } from '@components/book/BookCard'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './BooksPage.module.scss'
import type { Book } from './BooksPage.types'

// TODO: reemplazar este arreglo por datos provenientes del backend
const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Matisse en Bélgica',
    author: 'Carlos Argan',
    coverUrl: 'https://covers.openlibrary.org/b/id/9875161-L.jpg',
    condition: 'bueno',
    status: 'available',
    isForSale: true,
    price: 15000,
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    coverUrl: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
    condition: 'muy bueno',
    status: 'reserved',
    isForTrade: true,
    tradePreferences: ['Dune', 'Fahrenheit 451'],
  },
  {
    id: '3',
    title: 'El cuervo',
    author: 'Edgar Allan Poe',
    coverUrl: 'https://covers.openlibrary.org/b/id/8231996-L.jpg',
    condition: 'aceptable',
    status: 'sold',
    isForSale: true,
    price: 12000,
    isForTrade: true,
    tradePreferences: ['Lovecraft', 'Drácula', 'Sherlock Holmes'],
  },
  {
    id: '4',
    title: 'El pulpo invisible',
    author: 'A. G. Rivadera',
    coverUrl: 'https://covers.openlibrary.org/b/id/10521241-L.jpg',
    isSeeking: true,
  },
  {
    id: '5',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    coverUrl: 'https://covers.openlibrary.org/b/id/11172236-L.jpg',
    condition: 'nuevo',
    status: 'exchanged',
    isForTrade: true,
    tradePreferences: ['Homo Deus'],
  },
]

export const BooksPage = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<
    'mine' | 'trade' | 'seeking' | 'sale'
  >('mine')
  const [search, setSearch] = useState('')

  const tabs = useMemo(
    () => [
      { key: 'mine', label: t('booksPage.tabs.mine') },
      { key: 'trade', label: t('booksPage.tabs.for_trade') },
      { key: 'seeking', label: t('booksPage.tabs.seeking') },
      { key: 'sale', label: t('booksPage.tabs.for_sale') },
    ],
    [t]
  )

  // TODO: mover este filtro a un hook reutilizable si se complica
  const filterByTab = (book: Book) => {
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

  const filteredBooks = mockBooks.filter((book) => {
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

        <div className={styles.tabs} role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
            >
              {tab.label}
            </button>
          ))}
          <button className={styles.seeAll}>
            {t('booksPage.tabs.see_all')}
          </button>
        </div>

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
