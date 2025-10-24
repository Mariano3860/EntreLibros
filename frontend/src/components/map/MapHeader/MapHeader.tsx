import type { MapLayerKey, MapLayerToggles } from '@api/map/map.types'
import { cx } from '@utils/cx'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './MapHeader.module.scss'

type MapHeaderProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  layers: MapLayerToggles
  onToggleLayer: (layer: MapLayerKey) => void
  openNow: boolean
  onToggleOpenNow: () => void
  recentActivity: boolean
  onToggleRecentActivity: () => void
  onToggleRail: () => void
  railOpen: boolean
  isFetching: boolean
  onLocateMe: () => void
  geolocationDenied: boolean
  zoneFallback: string
  onZoneFallbackChange: (value: string) => void
}

export const MapHeader = ({
  searchValue,
  onSearchChange,
  layers,
  onToggleLayer,
  openNow,
  onToggleOpenNow,
  recentActivity,
  onToggleRecentActivity,
  onToggleRail,
  railOpen,
  isFetching,
  onLocateMe,
  geolocationDenied,
  zoneFallback,
  onZoneFallbackChange,
}: MapHeaderProps) => {
  const { t } = useTranslation()

  const chips = useMemo(
    () => [
      {
        key: 'corners' as const,
        label: t('map.filters.types.corners'),
        active: layers.corners,
        onClick: () => onToggleLayer('corners'),
      },
      {
        key: 'publications' as const,
        label: t('map.filters.types.publications'),
        active: layers.publications,
        onClick: () => onToggleLayer('publications'),
      },
      {
        key: 'activity' as const,
        label: t('map.filters.activity'),
        active: layers.activity,
        onClick: () => onToggleLayer('activity'),
      },
      {
        key: 'openNow' as const,
        label: t('map.filters.openNow'),
        active: openNow,
        onClick: onToggleOpenNow,
      },
      {
        key: 'recentActivity' as const,
        label: t('map.filters.recentActivity'),
        active: recentActivity,
        onClick: onToggleRecentActivity,
      },
    ],
    [
      layers.activity,
      layers.corners,
      layers.publications,
      onToggleLayer,
      onToggleOpenNow,
      onToggleRecentActivity,
      openNow,
      recentActivity,
      t,
    ]
  )

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.filterToggle}
        onClick={onToggleRail}
        aria-pressed={railOpen}
      >
        {railOpen ? t('map.filters.hide') : t('map.filters.show')}
      </button>
      <div className={styles.searchGroup}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder={t('map.search.placeholder') ?? ''}
          aria-label={t('map.search.placeholder') ?? ''}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <button
          className={styles.mapButton}
          type="button"
          onClick={onLocateMe}
          aria-label={t('map.filters.locateMe') ?? ''}
        >
          📍
        </button>
      </div>
      <div className={styles.chips}>
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            className={cx(styles.chip, chip.active ? styles.chipActive : '')}
            onClick={chip.onClick}
            aria-pressed={chip.active}
          >
            {chip.label}
          </button>
        ))}
      </div>
      <span className={styles.status} aria-live="polite">
        {isFetching ? t('map.status.updating') : t('map.status.ready')}
      </span>
      {geolocationDenied ? (
        <input
          type="text"
          className={styles.searchInput}
          placeholder={t('map.search.zoneFallback') ?? ''}
          aria-label={t('map.search.zoneFallback') ?? ''}
          value={zoneFallback}
          onChange={(event) => onZoneFallbackChange(event.target.value)}
        />
      ) : null}
    </header>
  )
}
