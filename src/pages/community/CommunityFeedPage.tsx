import { FeedFilters } from '@components/feed/FeedFilters'
import { FeedList } from '@components/feed/FeedList'
import { filterItems } from '@components/feed/filterItems'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import feedData from '../../../mocks/data/feed.mock'

import styles from './CommunityFeedPage.module.scss'

export const CommunityFeedPage = () => {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')
  const [items, setItems] = useState(feedData)

  const filtered = filterItems(items, filter)
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
        <header className={styles.header}>
          <h1>{t('community.title')}</h1>
          <button
            className={styles.publishButton}
            aria-label={t('community.feed.cta.publish')}
          >
            {t('community.feed.cta.publish')}
          </button>
        </header>
        <FeedFilters filter={filter} onFilterChange={setFilter} />
        <FeedList items={filtered} />
        <div ref={loaderRef} className={styles.loader} />
      </div>
    </BaseLayout>
  )
}
