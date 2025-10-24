import type { MapLayerKey, MapLayerToggles } from '@api/map/map.types'
import { useTranslation } from 'react-i18next'

import styles from './FilterRail.module.scss'

type FilterRailProps = {
  distanceKm: number
  onDistanceChange: (value: number) => void
  layers: MapLayerToggles
  onToggleLayer: (layer: MapLayerKey) => void
  openNow: boolean
  onToggleOpenNow: () => void
  recentActivity: boolean
  onToggleRecentActivity: () => void
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
        <div className={styles.slider}>
          <input
            type="range"
            min={1}
            max={25}
            step={1}
            value={distanceKm}
            onChange={(event) => onDistanceChange(Number(event.target.value))}
            aria-valuetext={
              t('map.filters.distanceValue', { value: distanceKm }) ?? ''
            }
          />
          <span>{t('map.filters.withinKm', { count: distanceKm })}</span>
        </div>
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
