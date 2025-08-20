import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { TabsMenu } from '@components/ui/tabs-menu/TabsMenu'
import { useTranslation } from 'react-i18next'
import { Route, Routes } from 'react-router-dom'

import styles from './CommunityPage.module.scss'
import { ActivityTab } from './tabs/ActivityTab'
import { EventsTab } from './tabs/EventsTab'
import { ForumsTab } from './tabs/ForumsTab'
import { MessagesTab } from './tabs/MessagesTab'
import { StatsTab } from './tabs/StatsTab'

export const CommunityPage = () => {
  const { t } = useTranslation()
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

        <TabsMenu items={tabs} basePath={basePath} />

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
