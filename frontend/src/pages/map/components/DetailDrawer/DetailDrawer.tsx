import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type {
  MapActivityPoint,
  MapCornerPin,
  MapPin,
  MapPublicationPin,
} from '@src/api/map/map.types'

import { Badge } from '../common/Badge'
import { HeatLayerLegend } from '../common/HeatLayerLegend'
import { KeyValue } from '../common/KeyValue'

import styles from './DetailDrawer.module.scss'

const LIVE_THRESHOLD_HOURS = 6

export type DetailTab = 'corner' | 'publications' | 'activity'

type DetailDrawerProps = {
  isOpen: boolean
  selectedPin: MapPin | null
  corner: MapCornerPin | null
  publications: MapPublicationPin[]
  activity: MapActivityPoint[]
  activeTab: DetailTab
  onTabChange: (tab: DetailTab) => void
  onClose: () => void
  onProposeMeeting: () => void
  onStartChat: (context?: { publicationId?: string }) => void
  onOpenReference: () => void
}

const getLiveStatus = (corner: MapCornerPin | null) => {
  if (!corner?.lastSignalAt) return false
  const lastSignal = new Date(corner.lastSignalAt).getTime()
  if (Number.isNaN(lastSignal)) return false
  const diffHours = (Date.now() - lastSignal) / (1000 * 60 * 60)
  return diffHours <= LIVE_THRESHOLD_HOURS
}

const formatAuthors = (authors: string[]) => {
  if (authors.length === 0) return '—'
  return authors.join(', ')
}

export const DetailDrawer = ({
  isOpen,
  selectedPin,
  corner,
  publications,
  activity,
  activeTab,
  onTabChange,
  onClose,
  onProposeMeeting,
  onStartChat,
  onOpenReference,
}: DetailDrawerProps) => {
  const { t } = useTranslation()
  const isLive = getLiveStatus(corner)

  const sortedPublications = useMemo(
    () => publications.slice(0, 5).sort((a, b) => a.distanceKm - b.distanceKm),
    [publications]
  )

  const activitySummary = useMemo(() => {
    if (activity.length === 0) {
      return t('map.activity.empty')
    }
    const total = activity.reduce((sum, point) => sum + point.intensity, 0)
    return t('map.activity.summary', { count: total })
  }, [activity, t])

  const handleStartChat = (publicationId?: string) => {
    onStartChat(publicationId ? { publicationId } : undefined)
  }

  const cover = corner?.photos?.[0]

  return (
    <div
      className={[styles.drawer, isOpen ? styles.open : '']
        .filter(Boolean)
        .join(' ')}
      aria-hidden={!isOpen}
    >
      <span className={styles.handle} aria-hidden="true" />
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div>
            <h2 className={styles.title}>
              {corner?.name ?? t('map.drawer.placeholderTitle')}
            </h2>
            <div>
              {isLive ? (
                <Badge label={t('map.badge.live')} tone="success" />
              ) : null}
              <Badge label={t('map.badge.privacy')} tone="info" />
            </div>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label={t('map.drawer.close') ?? ''}
          >
            ×
          </button>
        </div>
        <div className={styles.tabs} role="tablist">
          {(
            [
              { key: 'corner', label: t('map.drawer.tabs.corner') },
              { key: 'publications', label: t('map.drawer.tabs.publications') },
              { key: 'activity', label: t('map.drawer.tabs.activity') },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={[
                styles.tabButton,
                activeTab === tab.key ? styles.tabActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => onTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.content} role="tabpanel">
        {activeTab === 'corner' ? (
          <>
            {cover ? (
              <img
                src={cover}
                alt={corner?.name ?? ''}
                className={styles.cover}
              />
            ) : null}
            <div className={styles.ctaGroup}>
              <button
                type="button"
                className={styles.primaryCta}
                onClick={onProposeMeeting}
              >
                {t('map.cta.proposeMeeting')}
              </button>
              <button
                type="button"
                className={styles.secondaryCta}
                onClick={() => handleStartChat()}
              >
                {t('map.cta.sendMessage')}
              </button>
              <button
                type="button"
                className={styles.secondaryCta}
                onClick={onOpenReference}
              >
                {t('map.cta.openReference')}
              </button>
            </div>
            <p className={styles.note}>
              {t('map.detail.corner.noInventoryNote')}
            </p>
            <KeyValue
              label={t('map.detail.corner.location')}
              value={
                corner
                  ? `${corner.barrio}, ${corner.city}`
                  : t('map.detail.corner.locationUnknown')
              }
            />
            {corner?.referencePointLabel ? (
              <KeyValue
                label={t('map.detail.corner.referencePoint')}
                value={corner.referencePointLabel}
              />
            ) : null}
            {corner?.rules ? (
              <KeyValue
                label={t('map.detail.corner.rules')}
                value={corner.rules}
              />
            ) : null}
          </>
        ) : null}

        {activeTab === 'publications' ? (
          <div className={styles.list}>
            {sortedPublications.map((publication) => (
              <div key={publication.id} className={styles.listItem}>
                {publication.photo ? (
                  <img
                    src={publication.photo}
                    alt={publication.title}
                    className={styles.listItemImage}
                  />
                ) : (
                  <div className={styles.listItemImage} aria-hidden="true" />
                )}
                <div className={styles.listItemContent}>
                  <span className={styles.listItemTitle}>
                    {publication.title}
                  </span>
                  <span>{formatAuthors(publication.authors)}</span>
                  <span>
                    {t(`map.publications.types.${publication.type}`)} ·
                    {t('map.publications.distance', {
                      count: publication.distanceKm,
                    })}
                  </span>
                  <button
                    type="button"
                    className={styles.secondaryCta}
                    onClick={() => handleStartChat(publication.id)}
                  >
                    {t('map.cta.sendMessage')}
                  </button>
                </div>
              </div>
            ))}
            {sortedPublications.length === 0 ? (
              <p className={styles.note}>{t('map.publications.empty')}</p>
            ) : null}
          </div>
        ) : null}

        {activeTab === 'activity' ? (
          <div className={styles.list}>
            <HeatLayerLegend label={t('map.activity.legend')} />
            <p className={styles.note}>{activitySummary}</p>
          </div>
        ) : null}
      </div>

      {selectedPin === null ? (
        <p className={styles.note}>{t('map.drawer.empty')}</p>
      ) : null}
    </div>
  )
}
