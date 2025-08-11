import { BookCard } from '@components/book/BookCard'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { UserActivityItem } from '@components/user/UserActivityItem'
import { useTranslation } from 'react-i18next'

import styles from './HomePage.module.scss'

// Mock books
const mockBooks = [
  {
    title: '1984',
    author: 'George Orwell',
    coverUrl: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
  },
  {
    title: 'Brave New World',
    author: 'Aldous Huxley',
    coverUrl: 'https://covers.openlibrary.org/b/id/8775116-L.jpg',
  },
  {
    title: 'Fahrenheit 451',
    author: 'Ray Bradbury',
    coverUrl: 'https://covers.openlibrary.org/b/id/11172235-L.jpg',
  },
]

// Mock activity
const mockActivities = [
  {
    bookTitle: 'Sapiens',
    action: 'added' as const,
    coverUrl: 'https://covers.openlibrary.org/b/id/11172236-L.jpg',
    timestamp: new Date(Date.now() - 3600 * 1000).toISOString(), // hace 1 hora
  },
  {
    bookTitle: 'The Hobbit',
    action: 'exchanged' as const,
    coverUrl: 'https://covers.openlibrary.org/b/id/6979861-L.jpg',
    timestamp: new Date(Date.now() - 86400 * 1000).toISOString(), // hace 1 día
  },
]

export const HomePage = () => {
  const { t } = useTranslation()

  return (
    <BaseLayout>
      <div className={styles.homeWrapper}>
        {/* HERO */}
        <section className={styles.hero}>
          <h1>{t('home.hero_title')}</h1>
          <p>{t('home.hero_subtitle')}</p>
          <button className={styles.ctaButton}>{t('home.hero_cta')}</button>
        </section>

        {/* STATS */}
        <section className={styles.stats}>
          <div className={styles.statCard}>
            📚 {t('home.books_today', { count: 134 })}
          </div>
          <div className={styles.statCard}>
            📍 {t('home.houses_active', { count: 52 })}
          </div>
        </section>

        {/* EXPLORAR LIBROS */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>{t('home.explore_books')}</h2>
            <button className={styles.linkButton}>{t('home.see_all')}</button>
          </div>
          <div className={styles.bookList}>
            {mockBooks.map((book, idx) => (
              <BookCard key={idx} {...book} />
            ))}
          </div>
        </section>

        {/* MIS LIBROS - FEED */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>{t('home.my_books')}</h2>
          </div>
          <div className={styles.activityFeed}>
            {mockActivities.map((activity, idx) => (
              <UserActivityItem key={idx} {...activity} />
            ))}
          </div>
        </section>

        {/* CTA COMUNIDAD */}
        <section className={styles.communitySection}>
          <h2>{t('home.community_title')}</h2>
          <p>{t('home.community_subtitle')}</p>
          <button className={styles.ctaButton}>
            {t('home.explore_community')}
          </button>
        </section>
      </div>
    </BaseLayout>
  )
}
