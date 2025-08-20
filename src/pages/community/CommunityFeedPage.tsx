import { FeedFilters } from '@components/feed/FeedFilters'
import { FeedList } from '@components/feed/FeedList'
import { filterItems } from '@components/feed/filterItems'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import feedData from '../../../mocks/data/feed.mock'

import styles from './CommunityFeedPage.module.scss'

export const CommunityFeedPage = () => {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')
  const [items, setItems] = useState(feedData)

  const filtered = filterItems(items, filter)

  const loadMore = () => {
    setItems((prev) => [...prev, ...feedData])
  }

  return (
    <BaseLayout>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1>{t('community.title')}</h1>
          <button aria-label={t('community.feed.cta.publish')}>
            {t('community.feed.cta.publish')}
          </button>
        </header>
        <FeedFilters filter={filter} onFilterChange={setFilter} />
        <FeedList items={filtered} />
        <button onClick={loadMore} aria-label={t('community.feed.load_more')}>
          {t('community.feed.load_more')}
        </button>
      </div>
    </BaseLayout>
  )
}
