import { ActivityBar } from '@components/feed/ActivityBar'
import { FeedFilters } from '@components/feed/FeedFilters'
import { FeedList } from '@components/feed/FeedList'
import { filterItems } from '@components/feed/filterItems'
import { RightPanel } from '@components/feed/RightPanel'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { LogoEntreLibros } from '@components/logo/LogoEntreLibros'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import feedData from '../../../mocks/data/feed.mock'

import styles from './CommunityFeedPage.module.scss'

export const CommunityFeedPage = () => {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')
  const [items, setItems] = useState(feedData)
  const [search, setSearch] = useState('')

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
      if (entries[0].isIntersecting) {
        setItems((prev) => [...prev, ...feedData])
      }
    })

    const node = loaderRef.current
    if (node) {
      observer.observe(node)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <BaseLayout>
      <div className={styles.wrapper}>
        <main className={styles.main}>
          <header className={styles.header}>
            <LogoEntreLibros />
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
          <FeedList items={filtered} />
          <div ref={loaderRef} className={styles.loader} />
        </main>
        <RightPanel />
      </div>
    </BaseLayout>
  )
}
