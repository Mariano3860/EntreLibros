import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import styles from './CommunityPage.module.scss'
import { ActivityTab } from './tabs/ActivityTab'
import { ForumsTab } from './tabs/ForumsTab'
import { MessagesTab } from './tabs/MessagesTab'
import { EventsTab } from './tabs/EventsTab'
import { StatsTab } from './tabs/StatsTab'

export const CommunityPage = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const basePath = '/community'

  const tabs = [
    { path: '', label: t('community.tabs.activity') },
    { path: 'forums', label: t('community.tabs.forums') },
    { path: 'messages', label: t('community.tabs.messages') },
    { path: 'events', label: t('community.tabs.events') },
    { path: 'stats', label: t('community.tabs.stats') },
  ]

  return (
    <BaseLayout>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1>{t('community.title')}</h1>
        </header>

        <nav className={styles.tabs} role="tablist">
          {tabs.map((tab) => {
            const fullPath = `${basePath}${tab.path ? `/${tab.path}` : ''}`
            const isActive = location.pathname === fullPath
            return (
              <Link
                key={tab.path || 'activity'}
                to={tab.path}
                className={`${styles.tab} ${isActive ? styles.active : ''}`}
                role="tab"
                aria-selected={isActive}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>

        <Routes>
          <Route index element={<ActivityTab />} />
          <Route path="forums" element={<ForumsTab />} />
          <Route path="messages" element={<MessagesTab />} />
          <Route path="events" element={<EventsTab />} />
          <Route path="stats" element={<StatsTab />} />
        </Routes>
      </div>
    </BaseLayout>
  )
}
