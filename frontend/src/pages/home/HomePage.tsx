import { BookCard } from '@components/book/BookCard'
import { CommunitySectionLoggedIn } from '@components/home/CommunitySectionLoggedIn'
import { HeroLoggedIn } from '@components/home/HeroLoggedIn'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { UserActivityItem } from '@components/user/UserActivityItem'
import { useAuth } from '@contexts/auth/AuthContext'
import { useUserActivity } from '@hooks/api/useUserActivity'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { HOME_URLS } from '@src/constants/constants'
import { useBooks } from '@src/hooks/api/useBooks'

import styles from './HomePage.module.scss'

export const HomePage = () => {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading } = useAuth()
  const { data: booksData } = useBooks()
  const books = Array.isArray(booksData) ? booksData : []
  const {
    data: activity = [],
    isLoading: isActivityLoading,
    isError: isActivityError,
  } = useUserActivity(isAuthenticated)
  const navigate = useNavigate()

  if (isLoading) return null

  return (
    <BaseLayout id={'home-page'}>
      <div className={styles.homeWrapper}>
        {/* HERO */}
        {isAuthenticated ? (
          <HeroLoggedIn />
        ) : (
          <section className={styles.hero}>
            <h1>{t('home.hero_title')}</h1>
            <p>{t('home.hero_subtitle')}</p>
            <button
              className={styles.ctaButton}
              onClick={() => navigate(`/${HOME_URLS.LOGIN}`)}
            >
              {t('home.hero_cta')}
            </button>
          </section>
        )}

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
            <button
              className={styles.linkButton}
              onClick={() => navigate(`/${HOME_URLS.BOOKS}`)}
            >
              {t('home.see_all')}
            </button>
          </div>
          <div className={styles.bookList}>
            {books?.map((book, idx) => (
              <BookCard key={idx} {...book} />
            ))}
          </div>
        </section>

        {/* MIS LIBROS - FEED */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>{t('home.my_activity')}</h2>
          </div>
          <div className={styles.activityFeed}>
            {isActivityLoading ? (
              <p>{t('home.activity_loading')}</p>
            ) : isActivityError ? (
              <p role="status">{t('home.activity_error')}</p>
            ) : activity.length > 0 ? (
              activity.map((item) => (
                <UserActivityItem key={item.id} {...item} />
              ))
            ) : (
              <p>{t('home.activity_empty')}</p>
            )}
          </div>
        </section>

        {/* CTA COMUNIDAD */}
        {isAuthenticated ? (
          <CommunitySectionLoggedIn />
        ) : (
          <section className={styles.communitySection}>
            <h2>{t('home.community_title')}</h2>
            <p>{t('home.community_subtitle')}</p>
            <button
              className={styles.ctaButton}
              onClick={() => navigate(`/${HOME_URLS.LOGIN}`)}
            >
              {t('home.explore_community')}
            </button>
          </section>
        )}
      </div>
    </BaseLayout>
  )
}
