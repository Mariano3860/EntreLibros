import { useTranslation } from 'react-i18next'
import { useNotifications } from '@src/hooks/api/useNotifications'

export const NotificationCenter = () => {
  const { t } = useTranslation()
  const { data = [], isLoading, isError, markRead } = useNotifications()
  if (isLoading) return <section aria-label={t('notifications.title')}>{t('notifications.loading')}</section>
  if (isError) return <section role="status">{t('notifications.error')}</section>
  return (
    <section aria-label={t('notifications.title')}>
      <h2>{t('notifications.title')}</h2>
      {data.length === 0 ? <p>{t('notifications.empty')}</p> : (
        <ul>
          {data.map((notification) => (
            <li key={notification.id}>
              <strong>{t(notification.titleKey)}</strong>
              <p>{t(notification.bodyKey)}</p>
              {!notification.readAt && <button type="button" onClick={() => markRead.mutate(notification.id)}>{t('notifications.markRead')}</button>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
