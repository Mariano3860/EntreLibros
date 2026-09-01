import {
  MAP_RADIUS_OPTIONS,
  type MapLayerKey,
  type MapLayerToggles,
  type MapRadiusKm,
} from '@api/map/map.types'
import { useTranslation } from 'react-i18next'

import styles from './FilterRail.module.scss'

type FilterRailProps = {
  distanceKm: MapRadiusKm | null
  onDistanceChange: (value: MapRadiusKm | null) => void
  layers: MapLayerToggles
  onToggleLayer: (layer: MapLayerKey) => void
  openNow: boolean
  onToggleOpenNow: () => void
  recentActivity: boolean
  onToggleRecentActivity: () => void
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

  return (
    <div
      className={styles.radiusOptions}
      role="group"
      aria-label={t('map.filters.radiusAriaLabel', {
        defaultValue: 'Radio geográfico',
      })}
    >
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          aria-pressed={distanceKm === option.value}
          onClick={() => onDistanceChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export const FilterRail = ({
  distanceKm,
  onDistanceChange,
  layers,
  onToggleLayer,
  openNow,
  onToggleOpenNow,
  recentActivity,
  onToggleRecentActivity,
}: FilterRailProps) => {
  const { t } = useTranslation()

  return (
    <aside
      className={styles.rail}
      aria-label={t('map.filters.ariaLabel') ?? ''}
    >
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('map.filters.distance')}</h3>
        <RadiusSelector
          distanceKm={distanceKm}
          onDistanceChange={onDistanceChange}
        />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('map.filters.types.label')}</h3>
        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              checked={layers.corners}
              onChange={() => onToggleLayer('corners')}
            />
            {t('map.filters.types.corners')}
          </label>
          <label>
            <input
              type="checkbox"
              checked={layers.publications}
              onChange={() => onToggleLayer('publications')}
            />
            {t('map.filters.types.publications')}
          </label>
          <label>
            <input
              type="checkbox"
              checked={layers.activity}
              onChange={() => onToggleLayer('activity')}
            />
            {t('map.filters.activity')}
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('map.filters.more')}</h3>
        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              checked={openNow}
              onChange={onToggleOpenNow}
            />
            {t('map.filters.openNow')}
          </label>
          <label>
            <input
              type="checkbox"
              checked={recentActivity}
              onChange={onToggleRecentActivity}
            />
            {t('map.filters.recentActivity')}
          </label>
        </div>
      </section>
    </aside>
  )
}
