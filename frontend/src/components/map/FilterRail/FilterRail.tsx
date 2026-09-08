import { MAP_RADIUS_OPTIONS, type MapRadiusKm } from '@api/map/map.types'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MAP_ICON_PATHS, type MapIconName } from '../mapPresentation'

import styles from './FilterRail.module.scss'

export type MapExplorationActivityItem = {
  id: string
  title: string
  meta: string
  photo?: string
  icon: MapIconName
  isSelected?: boolean
  onSelect: () => void
}

type FilterRailProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  distanceKm: MapRadiusKm | null
  onDistanceChange: (value: MapRadiusKm | null) => void
  openNow: boolean
  onToggleOpenNow: () => void
  activityItems: MapExplorationActivityItem[]
  isOpen?: boolean
  onClose?: () => void
}

export const RadiusSelector = ({
  distanceKm,
  onDistanceChange,
}: Pick<FilterRailProps, 'distanceKm' | 'onDistanceChange'>) => {
  const { t } = useTranslation()
  const options: Array<{ value: MapRadiusKm | null; label: string }> = [
    ...MAP_RADIUS_OPTIONS.map((value) => ({ value, label: `${value} km` })),
    {
      value: null,
      label: t('map.filters.unlimited', { defaultValue: 'Sin límite' }),
    },
  ]
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === distanceKm)
  )
  return (
    <div className={styles.slider}>
      <input
        type="range"
        min={0}
        max={options.length - 1}
        step={1}
        value={selectedIndex}
        aria-label={t('map.filters.radiusAriaLabel', {
          defaultValue: 'Radio geográfico',
        })}
        aria-valuetext={options[selectedIndex]?.label}
        style={{
          backgroundSize: `${(selectedIndex / (options.length - 1)) * 100}% 6px`,
        }}
        onChange={(event) =>
          onDistanceChange(options[Number(event.target.value)]?.value ?? null)
        }
      />
      <div className={styles.rangeLabels} aria-hidden="true">
        {options.map((option) => (
          <span key={option.value ?? 'unlimited'}>{option.label}</span>
        ))}
      </div>
    </div>
  )
}

const MapIcon = ({ icon }: { icon: MapIconName }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={MAP_ICON_PATHS[icon]} />
  </svg>
)

export const FilterRail = ({
  searchValue,
  onSearchChange,
  distanceKm,
  onDistanceChange,
  openNow,
  onToggleOpenNow,
  activityItems,
  isOpen = true,
  onClose,
}: FilterRailProps) => {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)
  const visibleItems = showAll ? activityItems : activityItems.slice(0, 3)
  return (
    <aside
      className={`${styles.rail} ${isOpen ? styles.railOpen : styles.railClosed}`}
      aria-label={t('map.filters.ariaLabel')}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div className={styles.railHeader}>
        <div>
          <h1>{t('map.exploration.title')}</h1>
          <p>{t('map.exploration.subtitle')}</p>
        </div>
        {onClose ? (
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label={t('map.exploration.closePanel')}
          >
            ×
          </button>
        ) : null}
      </div>
      <label className={styles.search}>
        <MapIcon icon="search" />
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('map.search.placeholder')}
          aria-label={t('map.search.placeholder')}
        />
      </label>
      <div className={styles.quickFilters}>
        <span className={styles.cornerLabel}>
          {t('map.filters.types.corners')}
        </span>
        <button
          type="button"
          className={styles.filterChip}
          aria-pressed={openNow}
          onClick={onToggleOpenNow}
        >
          {t('map.filters.openNow')}
        </button>
      </div>
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2>{t('map.filters.distance')}</h2>
          <span>
            {distanceKm === null
              ? t('map.filters.unlimited')
              : `${distanceKm} km`}
          </span>
        </div>
        <RadiusSelector
          distanceKm={distanceKm}
          onDistanceChange={onDistanceChange}
        />
      </section>
      <section
        className={styles.activity}
        aria-label={t('map.exploration.nearbyActivity')}
      >
        <div className={styles.sectionHeading}>
          <h2>{t('map.exploration.nearbyActivity')}</h2>
          {activityItems.length > 3 ? (
            <button
              type="button"
              className={styles.viewAll}
              aria-expanded={showAll}
              onClick={() => setShowAll((current) => !current)}
            >
              {t(
                showAll ? 'map.exploration.viewLess' : 'map.exploration.viewAll'
              )}
            </button>
          ) : null}
        </div>
        {visibleItems.length ? (
          <div className={styles.activityList}>
            {visibleItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={styles.activityItem}
                onClick={item.onSelect}
                aria-pressed={item.isSelected === true}
              >
                <span className={styles.activityIcon}>
                  {item.photo ? (
                    <img src={item.photo} alt="" />
                  ) : (
                    <MapIcon icon={item.icon} />
                  )}
                </span>
                <span className={styles.activityText}>
                  <strong>{item.title}</strong>
                  <small>{item.meta}</small>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className={styles.activityEmpty}>
            {t('map.exploration.noNearbyCorners')}
          </p>
        )}
      </section>
    </aside>
  )
}
