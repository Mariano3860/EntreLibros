import { BookCard } from '@components/book/BookCard'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
// TODO import { UserActivityItem } from '@components/user/UserActivityItem'
import { useTranslation } from 'react-i18next'

import styles from './HomePage.module.scss'

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
            <BookCard
              title="1984"
              author="George Orwell"
              coverUrl="https://covers.openlibrary.org/b/id/7222246-L.jpg"
            />
            <BookCard
              title="1984"
              author="George Orwell"
              coverUrl="https://covers.openlibrary.org/b/id/7222246-L.jpg"
            />
            <BookCard
              title="1984"
              author="George Orwell"
              coverUrl="https://covers.openlibrary.org/b/id/7222246-L.jpg"
            />
          </div>
        </section>

        {/* MIS LIBROS - FEED */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>{t('home.my_books')}</h2>
          </div>
          <div className={styles.activityFeed}>
            {/* TODO Este componente aún no existe */}
            {/*<UserActivityItem />*/}
            {/*<UserActivityItem />*/}
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
