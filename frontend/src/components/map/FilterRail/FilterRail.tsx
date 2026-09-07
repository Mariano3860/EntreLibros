import {
  MAP_RADIUS_OPTIONS,
  type MapLayerKey,
  type MapLayerToggles,
  type MapRadiusKm,
} from '@api/map/map.types'
import { useTranslation } from 'react-i18next'

import styles from './FilterRail.module.scss'

export type MapExplorationActivityItem = {
  id: string
  title: string
  meta: string
  onSelect: () => void
}

type FilterRailProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  distanceKm: MapRadiusKm | null
  onDistanceChange: (value: MapRadiusKm | null) => void
  categories: string[]
  selectedCategory: string
  onCategoryChange: (value: string) => void
  layers: MapLayerToggles
  onToggleLayer: (layer: MapLayerKey) => void
  openNow: boolean
  onToggleOpenNow: () => void
  recentActivity: boolean
  onToggleRecentActivity: () => void
  activityItems: MapExplorationActivityItem[]
  isFetching?: boolean
  isOpen?: boolean
  onClose?: () => void
}

type RadiusSelectorProps = Pick<
  FilterRailProps,
  'distanceKm' | 'onDistanceChange'
>

export const RadiusSelector = ({
  distanceKm,
  onDistanceChange,
}: RadiusSelectorProps) => {
  const { t } = useTranslation()
  const options: Array<{ value: MapRadiusKm | null; label: string }> = [
    ...MAP_RADIUS_OPTIONS.map((value) => ({
      value,
      label: `${value} km`,
    })),
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
        onChange={(event) => {
          const option = options[Number(event.target.value)]
          onDistanceChange(option?.value ?? null)
        }}
      />
      <div className={styles.rangeLabels} aria-hidden="true">
        {options.map((option) => (
          <span key={option.value ?? 'unlimited'}>{option.label}</span>
        ))}
      </div>
    </div>
  )
}

export const FilterRail = ({
  searchValue,
  onSearchChange,
  distanceKm,
  onDistanceChange,
  categories,
  selectedCategory,
  onCategoryChange,
  layers,
  onToggleLayer,
  openNow,
  onToggleOpenNow,
  recentActivity,
  onToggleRecentActivity,
  activityItems,
  isFetching = false,
  isOpen = true,
  onClose,
}: FilterRailProps) => {
  const { t } = useTranslation()

  return (
    <aside
      className={`${styles.rail} ${isOpen ? styles.railOpen : styles.railClosed}`}
      aria-label={t('map.filters.ariaLabel') ?? ''}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div className={styles.railHeader}>
        <div>
          <span className={styles.eyebrow}>{t('map.exploration.eyebrow')}</span>
          <h2>{t('map.exploration.title')}</h2>
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
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('map.search.placeholder')}
          aria-label={t('map.search.placeholder')}
        />
      </label>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <h3>{t('map.filters.distance')}</h3>
          <strong>
            {distanceKm === null
              ? t('map.filters.unlimited')
              : t('map.filters.withinKm', { count: distanceKm })}
          </strong>
        </div>
        <RadiusSelector
          distanceKm={distanceKm}
          onDistanceChange={onDistanceChange}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <h3>{t('map.filters.themes')}</h3>
          <span className={styles.resultStatus} aria-live="polite">
            {isFetching ? t('map.status.updating') : t('map.status.ready')}
          </span>
        </div>
        <div className={styles.categories} role="group">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`${styles.category} ${
                selectedCategory === category ? styles.categoryActive : ''
              }`}
              aria-pressed={selectedCategory === category}
              onClick={() => onCategoryChange(category)}
            >
              <span className={styles.categoryIcon} aria-hidden="true">
                {category === 'Todo' ? '✦' : '•'}
              </span>
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <h3>{t('map.exploration.layersTitle')}</h3>
        </div>
        <div className={styles.layerControls}>
          <button
            type="button"
            className={styles.layerButton}
            aria-pressed={layers.corners}
            onClick={() => onToggleLayer('corners')}
          >
            <span className={styles.layerDot} aria-hidden="true" />
            {t('map.filters.types.corners')}
          </button>
          <button
            type="button"
            className={styles.layerButton}
            aria-pressed={layers.publications}
            onClick={() => onToggleLayer('publications')}
          >
            <span className={styles.layerDot} aria-hidden="true" />
            {t('map.filters.types.publications')}
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <h3>{t('map.exploration.availabilityTitle')}</h3>
        </div>
        <label className={styles.switchRow}>
          <span>
            <strong>{t('map.filters.openNow')}</strong>
            <small>{t('map.exploration.openNowHint')}</small>
          </span>
          <input
            type="checkbox"
            checked={openNow}
            onChange={onToggleOpenNow}
            aria-label={t('map.filters.openNow')}
          />
        </label>
        <label className={styles.switchRow}>
          <span>
            <strong>{t('map.exploration.activityVisible')}</strong>
            <small>{t('map.exploration.activityVisibleHint')}</small>
          </span>
          <input
            type="checkbox"
            checked={recentActivity}
            onChange={onToggleRecentActivity}
            aria-label={t('map.exploration.activityVisible')}
          />
        </label>
      </section>

      <section className={styles.activity}>
        <div className={styles.sectionHeading}>
          <h3>{t('map.exploration.nearbyActivity')}</h3>
          <span className={styles.activityCount}>{activityItems.length}</span>
        </div>
        {activityItems.length ? (
          <div className={styles.activityList}>
            {activityItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={styles.activityItem}
                onClick={item.onSelect}
              >
                <span className={styles.activityIcon} aria-hidden="true">
                  ↗
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.meta}</small>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className={styles.activityEmpty}>
            {t('map.exploration.noNearbyActivity')}
          </p>
        )}
      </section>
    </aside>
  )
}
