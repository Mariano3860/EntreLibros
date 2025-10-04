import { CornersStrip } from '@components/community/corners/CornersStrip'
import { ActivityBar } from '@components/feed/ActivityBar'
import { FeedFilters } from '@components/feed/FeedFilters'
import { FeedList } from '@components/feed/FeedList'
import { filterItems } from '@components/feed/filterItems'
import { RightPanel } from '@components/feed/RightPanel'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { LogoEntreLibros } from '@components/logo/LogoEntreLibros'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { HOME_URLS } from '@src/constants/constants'
import { useCommunityFeed } from '@src/hooks/api/useCommunityFeed'

import styles from './CommunityFeedPage.module.scss'

export const CommunityFeedPage = () => {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const { data, fetchNextPage, hasNextPage } = useCommunityFeed()
  const items = data?.pages.flat() ?? []

  const filtered = filterItems(items, filter).filter((item) => {
    const q = search.toLowerCase()
    if (!q) return true
    if ('title' in item && item.title.toLowerCase().includes(q)) return true
    if ('name' in item && item.name.toLowerCase().includes(q)) return true
    if ('user' in item && item.user.toLowerCase().includes(q)) return true
    return false
  })
  const loaderRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      return
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage()
      }
    })

    const node = loaderRef.current
    if (node) {
      observer.observe(node)
    }

    return () => {
      observer.disconnect()
    }
  }, [fetchNextPage, hasNextPage])

  return (
    <BaseLayout id={'community-page'}>
      <div className={styles.wrapper}>
        <main className={styles.main}>
          <header className={styles.header}>
            <LogoEntreLibros />
            <Link
              to={`/${HOME_URLS.MAP}`}
              className={styles.mapButton}
              aria-label={t('community.feed.cta.viewMap')}
            >
              {t('community.feed.cta.viewMap')}
            </Link>
            <button
              className={styles.publishButton}
              aria-label={t('community.feed.cta.publish')}
            >
              {t('community.feed.cta.publish')}
            </button>
          </header>
          <ActivityBar />
          <FeedFilters
            filter={filter}
            onFilterChange={setFilter}
            onSearchChange={setSearch}
          />
          <CornersStrip />
          <FeedList items={filtered} />
          <div ref={loaderRef} className={styles.loader} />
        </main>
        <RightPanel />
      </div>
    </BaseLayout>
  )
}
