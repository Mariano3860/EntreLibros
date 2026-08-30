import { CommunityStoryModal } from '@components/community/CommunityStoryModal'
import { CornersStrip } from '@components/community/corners/CornersStrip'
import { ActivityBar } from '@components/feed/ActivityBar'
import { FeedFilters } from '@components/feed/FeedFilters'
import { FeedList } from '@components/feed/FeedList'
import { filterItems } from '@components/feed/filterItems'
import { RightPanel } from '@components/feed/RightPanel'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { LogoEntreLibros } from '@components/logo/LogoEntreLibros'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCommunityFeed } from '@src/hooks/api/useCommunityFeed'
import { useUserBooks } from '@src/hooks/api/useUserBooks'

import styles from './CommunityFeedPage.module.scss'

export const CommunityFeedPage = () => {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()
  const [isStoryOpen, setStoryOpen] = useState(false)
  const { data, fetchNextPage, hasNextPage } = useCommunityFeed()
  const { data: userBooksData } = useUserBooks()
  const items = data?.pages.flat() ?? []

  const filtered = filterItems(items, filter).filter((item) => {
    const q = search.toLowerCase()
    if (!q) return true

    if ('title' in item && item.title.toLowerCase().includes(q)) {
      return true
    }

    if ('name' in item && item.name.toLowerCase().includes(q)) {
      return true
    }

    if ('user' in item && item.user.toLowerCase().includes(q)) {
      return true
    }

    if (
      item.type === 'swap' &&
      [
        item.requester.displayName,
        item.requester.username,
        item.offered.title,
        item.offered.author,
        item.offered.owner.displayName,
        item.offered.owner.username,
        item.requested.title,
        item.requested.author,
        item.requested.owner.displayName,
        item.requested.owner.username,
      ]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(q))
    ) {
      return true
    }

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
            <button
              className={styles.publishButton}
              aria-label={t('community.feed.cta.publish')}
              onClick={() => setStoryOpen(true)}
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
      <CommunityStoryModal
        isOpen={isStoryOpen}
        books={Array.isArray(userBooksData) ? userBooksData : []}
        onClose={() => setStoryOpen(false)}
        onPublished={() => {
          setStoryOpen(false)
          void queryClient.invalidateQueries({ queryKey: ['communityFeed'] })
        }}
      />
    </BaseLayout>
  )
}
