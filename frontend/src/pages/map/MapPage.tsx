import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import sharedStyles from '@styles/shared.module.scss'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type {
  MapBoundingBox,
  MapFilters,
  MapLayerKey,
  MapLayerToggles,
  MapPin,
} from '@src/api/map/map.types'
import { useMapData } from '@src/hooks/api/useMapData'
import { track } from '@src/utils/analytics'
import { cx } from '@src/utils/cx'

import { EmptyState } from './components/common/EmptyState'
import { ErrorBanner } from './components/common/ErrorBanner'
import { CreateCornerFab } from './components/CreateCornerFab/CreateCornerFab'
import { FilterRail } from './components/FilterRail/FilterRail'
import { MapCanvas } from './components/MapCanvas/MapCanvas'
import { MapHeader } from './components/MapHeader/MapHeader'
import styles from './MapPage.module.scss'

const DEFAULT_BBOX: MapBoundingBox = {
  north: -34.54,
  south: -34.72,
  east: -58.36,
  west: -58.55,
}

const AVAILABLE_THEMES = [
  'Club lector',
  'Infancias',
  'Ciencia ficción',
  'Poesía',
  'Ensayo',
  'True crime',
  'Historia',
]

const DEFAULT_FILTERS: MapFilters = {
  distanceKm: 5,
  themes: [],
  openNow: false,
  recentActivity: true,
}

const DEFAULT_LAYERS: MapLayerToggles = {
  corners: true,
  publications: true,
  activity: true,
}

const DEBOUNCE_MS = 300

const KM_PER_DEGREE = 111 // Approximate conversion factor

export const MapPage = () => {
  const { t, i18n } = useTranslation()
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS)
  const [layers, setLayers] = useState<MapLayerToggles>(DEFAULT_LAYERS)
  const [bbox, setBbox] = useState<MapBoundingBox>(DEFAULT_BBOX)
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null)
  const [isFilterRailOpen, setFilterRailOpen] = useState(true)
  const [geolocationDenied, setGeolocationDenied] = useState(false)
  const [zoneFallback, setZoneFallback] = useState('')

  const viewStartedAtRef = useRef<number | null>(null)
  const trackedFirstPinRef = useRef(false)
  const previousSearchRef = useRef('')

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearchTerm(searchInput)
    }, DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [searchInput])

  const mapQuery = useMemo(
    () => ({
      bbox,
      searchTerm,
      filters,
      layers,
      locale: i18n.language,
    }),
    [bbox, searchTerm, filters, layers, i18n.language]
  )

  const { data, isLoading, isFetching, isError, refetch } = useMapData(mapQuery)

  useEffect(() => {
    track('map.view_opened', { locale: i18n.language })
    viewStartedAtRef.current = performance.now()
    trackedFirstPinRef.current = false
  }, [i18n.language])

  useEffect(() => {
    if (previousSearchRef.current === '' && searchTerm === '') return
    if (previousSearchRef.current === searchTerm) return
    previousSearchRef.current = searchTerm
    track('map.filter_changed', { filter: 'search', value: searchTerm })
  }, [searchTerm])

  useEffect(() => {
    if (!data) return
    if (trackedFirstPinRef.current) return
    const hasPins =
      (layers.corners && data.corners.length > 0) ||
      (layers.publications && data.publications.length > 0)
    if (!hasPins) return
    if (!viewStartedAtRef.current) return
    trackedFirstPinRef.current = true
    track('time.to.first.pin', {
      milliseconds: Math.round(performance.now() - viewStartedAtRef.current),
    })
  }, [data, layers])

  const isEmpty = Boolean(
    data &&
      data.corners.length === 0 &&
      data.publications.length === 0 &&
      data.activity.length === 0
  )

  const activityPoints = filters.recentActivity ? (data?.activity ?? []) : []

  const handleToggleLayer = (layer: MapLayerKey) => {
    setLayers((prev) => {
      const next = { ...prev, [layer]: !prev[layer] }
      track('map.filter_changed', {
        filter: 'layer',
        layer,
        value: next[layer],
      })
      return next
    })
  }

  const handleDistanceChange = (value: number) => {
    setFilters((prev) => {
      const next = { ...prev, distanceKm: value }
      track('map.filter_changed', { filter: 'distance', value })
      return next
    })
  }

  const handleToggleTheme = (theme: string) => {
    setFilters((prev) => {
      const exists = prev.themes.includes(theme)
      const nextThemes = exists
        ? prev.themes.filter((item) => item !== theme)
        : [...prev.themes, theme]
      const next = { ...prev, themes: nextThemes }
      track('map.filter_changed', { filter: 'themes', value: nextThemes })
      return next
    })
  }

  const handleToggleOpenNow = () => {
    setFilters((prev) => {
      const next = { ...prev, openNow: !prev.openNow }
      track('map.filter_changed', { filter: 'openNow', value: next.openNow })
      return next
    })
  }

  const handleToggleRecentActivity = () => {
    setFilters((prev) => {
      const next = { ...prev, recentActivity: !prev.recentActivity }
      track('map.filter_changed', {
        filter: 'recentActivity',
        value: next.recentActivity,
      })
      return next
    })
  }

  const handleSelectPin = (pin: MapPin) => {
    setSelectedPin(pin)
    track('pin.opened', { type: pin.type, id: pin.data.id })
  }

  const handleCreateCorner = () => {
    track('cta.create_corner_clicked')
  }

  const handleLocateMe = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeolocationDenied(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const delta = Math.max(filters.distanceKm / KM_PER_DEGREE, 0.05)
        const nextBbox: MapBoundingBox = {
          north: latitude + delta,
          south: latitude - delta,
          east: longitude + delta,
          west: longitude - delta,
        }
        setBbox(nextBbox)
        setGeolocationDenied(false)
        setZoneFallback('')
        track('map.filter_changed', { filter: 'bbox', value: nextBbox })
      },
      () => {
        setGeolocationDenied(true)
      }
    )
  }

  const handleToggleRail = () => {
    setFilterRailOpen((current) => !current)
  }

  const handleZoneFallbackChange = (value: string) => {
    setZoneFallback(value)
    setSearchInput(value)
    track('map.filter_changed', { filter: 'zone', value })
  }

  return (
    <BaseLayout id={'map-page'}>
      <div className={styles.mapPage}>
        <MapHeader
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          layers={layers}
          onToggleLayer={handleToggleLayer}
          openNow={filters.openNow}
          onToggleOpenNow={handleToggleOpenNow}
          recentActivity={filters.recentActivity}
          onToggleRecentActivity={handleToggleRecentActivity}
          onToggleRail={handleToggleRail}
          railOpen={isFilterRailOpen}
          isFetching={isFetching}
          onLocateMe={handleLocateMe}
          geolocationDenied={geolocationDenied}
          zoneFallback={zoneFallback}
          onZoneFallbackChange={handleZoneFallbackChange}
        />

        <div className={cx(styles.content, sharedStyles.scrollbar)}>
          <div
            className={[
              styles.railWrapper,
              isFilterRailOpen ? '' : styles.railHidden,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <FilterRail
              distanceKm={filters.distanceKm}
              onDistanceChange={handleDistanceChange}
              layers={layers}
              onToggleLayer={handleToggleLayer}
              availableThemes={AVAILABLE_THEMES}
              selectedThemes={filters.themes}
              onToggleTheme={handleToggleTheme}
              openNow={filters.openNow}
              onToggleOpenNow={handleToggleOpenNow}
              recentActivity={filters.recentActivity}
              onToggleRecentActivity={handleToggleRecentActivity}
            />
          </div>

          <div className={styles.mapArea}>
            <div className={styles.mapCanvasWrapper}>
              <MapCanvas
                bbox={bbox}
                corners={data?.corners ?? []}
                publications={data?.publications ?? []}
                activity={activityPoints}
                layers={layers}
                selectedPin={selectedPin}
                onSelectPin={handleSelectPin}
                isLoading={isLoading}
                isFetching={isFetching}
                isEmpty={isEmpty}
              />
              {isEmpty && !isLoading ? (
                <EmptyState
                  title={t('map.empty.title')}
                  description={t('map.empty.description')}
                  actionLabel={t('map.empty.cta.createCorner')}
                  onAction={handleCreateCorner}
                />
              ) : null}
            </div>

            <div
              className={styles.detailPlaceholder}
              data-testid="map-detail-placeholder"
              aria-hidden="true"
              data-has-selection={Boolean(selectedPin)}
            />
          </div>
        </div>

        <CreateCornerFab onClick={handleCreateCorner} />

        <div className={styles.notifications}>
          {isError ? (
            <ErrorBanner
              message={t('map.status.error')}
              tone="error"
              onDismiss={refetch}
            />
          ) : null}
          {geolocationDenied ? (
            <ErrorBanner
              message={t('map.status.locationDenied')}
              tone="warning"
            />
          ) : null}
        </div>
      </div>
    </BaseLayout>
  )
}
