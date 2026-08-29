import {
  useNotificationPreference,
  useNotifications,
} from '@hooks/api/useNotifications'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { ReactComponent as BellIcon } from '@src/assets/icons/bell.svg'
import { useAuth } from '@src/contexts/auth/AuthContext'

import styles from './NotificationBell.module.scss'

type MessageNotification = {
  id: number
  conversationId: number
  senderName: string
  createdAt: string
}

type MessageGroup = {
  conversationId: number
  senderName: string
  notifications: MessageNotification[]
  latestCreatedAt: string
}

type AgreementNotification = {
  id: number
  conversationId: number
  label: string
  createdAt: string
}

export const NotificationBell = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { data: notifications = [], markRead } = useNotifications({
    enabled: isAuthenticated,
  })
  const { data: inAppEnabled = true } = useNotificationPreference({
    enabled: isAuthenticated,
  })

  const unreadMessageNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          notification.kind === 'message' && !notification.readAt
      ),
    [notifications]
  )

  const messageGroups = useMemo(() => {
    const groups = new Map<number, MessageGroup>()
    unreadMessageNotifications.forEach((notification) => {
      const conversationId = Number(
        notification.data.conversationId ?? notification.entityId
      )
      if (!Number.isSafeInteger(conversationId) || conversationId <= 0) return
      const senderName =
        typeof notification.data.senderName === 'string'
          ? notification.data.senderName
          : t('notifications.message.senderFallback')
      const current = groups.get(conversationId)
      const message: MessageNotification = {
        id: notification.id,
        conversationId,
        senderName,
        createdAt: notification.createdAt,
      }
      if (current) {
        current.notifications.push(message)
        current.latestCreatedAt =
          message.createdAt > current.latestCreatedAt
            ? message.createdAt
            : current.latestCreatedAt
      } else {
        groups.set(conversationId, {
          conversationId,
          senderName,
          notifications: [message],
          latestCreatedAt: message.createdAt,
        })
      }
    })
    return [...groups.values()].sort((a, b) =>
      b.latestCreatedAt.localeCompare(a.latestCreatedAt)
    )
  }, [t, unreadMessageNotifications])

  const agreementNotifications = useMemo<AgreementNotification[]>(
    () =>
      notifications
        .filter(
          (notification) =>
            notification.kind === 'agreement' && !notification.readAt
        )
        .flatMap((notification) => {
          const conversationId = Number(notification.data.conversationId)
          if (!Number.isSafeInteger(conversationId) || conversationId <= 0) {
            return []
          }
          const name =
            typeof notification.data.participantName === 'string'
              ? notification.data.participantName
              : t('notifications.agreement.personFallback')
          return [
            {
              id: notification.id,
              conversationId,
              label: t('notifications.agreement.confirmedWith', { name }),
              createdAt: notification.createdAt,
            },
          ]
        }),
    [notifications, t]
  )

  const unreadCount =
    unreadMessageNotifications.length + agreementNotifications.length

  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (
    !isAuthenticated ||
    !inAppEnabled ||
    (messageGroups.length === 0 && agreementNotifications.length === 0)
  )
    return null

  const openConversation = (group: MessageGroup) => {
    group.notifications.forEach((notification) =>
      markRead.mutate(notification.id)
    )
    setIsOpen(false)
    navigate('/messages', { state: { conversationId: group.conversationId } })
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <button
        className={styles.trigger}
        type="button"
        aria-expanded={isOpen}
        aria-controls="notification-list"
        aria-label={t('notifications.open', {
          count: unreadCount,
        })}
        onClick={() => setIsOpen((current) => !current)}
      >
        <BellIcon aria-hidden="true" />
        <span className={styles.count} aria-hidden="true">
          {unreadMessageNotifications.length}
        </span>
      </button>
      {isOpen ? (
        <div
          id="notification-list"
          className={styles.panel}
          role="dialog"
          aria-label={t('notifications.title')}
        >
          <h2>{t('notifications.title')}</h2>
          <div className={styles.list}>
            {messageGroups.map((group) => (
              <button
                key={group.conversationId}
                className={styles.item}
                type="button"
                onClick={() => openConversation(group)}
              >
                {group.notifications.length === 1
                  ? t('notifications.message.from', {
                      name: group.senderName,
                    })
                  : t('notifications.message.multipleFrom', {
                      count: group.notifications.length,
                      name: group.senderName,
                    })}
              </button>
            ))}
            {agreementNotifications.map((notification) => (
              <button
                key={notification.id}
                className={styles.item}
                type="button"
                onClick={() => {
                  markRead.mutate(notification.id)
                  setIsOpen(false)
                  navigate('/messages', {
                    state: { conversationId: notification.conversationId },
                  })
                }}
              >
                {notification.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
