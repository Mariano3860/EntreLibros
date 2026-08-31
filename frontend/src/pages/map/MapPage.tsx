import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { MapCanvas } from '@components/map/MapCanvas/MapCanvas'
import { PublishCornerModal } from '@components/publish/PublishCornerModal'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type {
  MapBoundingBox,
  MapCornerPin,
  MapPin,
  MapResponse,
} from '@src/api/map/map.types'
import { useTheme } from '@src/contexts/theme/ThemeContext'
import { usePrototype } from '@src/features/prototype/PrototypeContext'
import {
  Chip,
  Panel,
  PrototypeButton,
  PrototypePage,
  UnavailableState,
} from '@src/features/prototype/PrototypeUI'
import { useMapData } from '@src/hooks/api/useMapData'
import { boundingBoxFromCenter } from '@src/utils/geospatial'
import { isApiMockMode } from '@src/utils/runtimeEnv'

import styles from './MapPage.module.scss'

type UserLocation = { latitude: number; longitude: number }
type MapCorner = {
  id: string
  name: string
  category: string
  distance: string
  activity: string
  isOpenNow?: boolean
}

const MAP_BOUNDS: MapBoundingBox = {
  north: -34.54,
  south: -34.72,
  east: -58.36,
  west: -58.55,
}

const MIN_MAP_RADIUS_KM = 5.55
const MOCK_MAP_REFERENCE_DATE = '2025-01-15T12:00:00.000Z'

const realCategories = [
  'Todo',
  'Infancias',
  'Ciencia ficción',
  'Poesía',
  'Historia',
]

const toDisplayCorner = (corner: MapCornerPin): MapCorner => ({
  id: corner.id,
  name: corner.name,
  category: corner.themes[0] ?? corner.barrio,
  distance: 'Cerca',
  activity: corner.lastSignalAt
    ? 'Actividad reciente'
    : 'Sin actividad reciente',
  isOpenNow: corner.isOpenNow,
})

export const MapPage = () => {
  const { catalog } = usePrototype()
  const { theme } = useTheme()
  const mockMode = isApiMockMode()
  const [distance, setDistance] = useState(2)
  const [category, setCategory] = useState('Todo')
  const [search, setSearch] = useState('')
  const [bbox, setBbox] = useState<MapBoundingBox>(MAP_BOUNDS)
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [locationDenied, setLocationDenied] = useState(false)
  const [openNow, setOpenNow] = useState(false)
  const [recentActivity, setRecentActivity] = useState(true)
  const [selectedCorner, setSelectedCorner] = useState<MapCorner | null>(null)
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const distanceRef = useRef(distance)
  const mockMapData = useMemo<MapResponse>(
    () => ({
      corners: catalog.corners.map((corner, index) => {
        const latitude =
          MAP_BOUNDS.south +
          ((100 - corner.y) / 100) * (MAP_BOUNDS.north - MAP_BOUNDS.south)
        const longitude =
          MAP_BOUNDS.west +
          (corner.x / 100) * (MAP_BOUNDS.east - MAP_BOUNDS.west)
        return {
          id: corner.id,
          name: corner.name,
          barrio: corner.category,
          city: 'Buenos Aires',
          lat: latitude,
          lon: longitude,
          lastSignalAt: new Date(
            Date.parse(MOCK_MAP_REFERENCE_DATE) - (index + 1) * 12 * 60_000
          ).toISOString(),
          photos: [],
          themes: [corner.category],
          isOpenNow: true,
          status: 'active',
        }
      }),
      publications: [],
      activity: catalog.corners.map((corner, index) => {
        const latitude =
          MAP_BOUNDS.south +
          ((100 - corner.y) / 100) * (MAP_BOUNDS.north - MAP_BOUNDS.south)
        const longitude =
          MAP_BOUNDS.west +
          (corner.x / 100) * (MAP_BOUNDS.east - MAP_BOUNDS.west)
        return {
          id: `${corner.id}-activity`,
          lat: latitude,
          lon: longitude,
          intensity: Math.max(1, 4 - index),
        }
      }),
      meta: { bbox: MAP_BOUNDS, generatedAt: MOCK_MAP_REFERENCE_DATE },
    }),
    [catalog.corners]
  )
  const mapQuery = useMapData(
    {
      bbox,
      searchTerm: search.trim() || undefined,
      filters: {
        distanceKm: distance,
        themes: category === 'Todo' ? [] : [category],
        openNow,
        recentActivity,
      },
      layers: { corners: true, publications: true, activity: true },
      locale: 'es',
    },
    { enabled: !mockMode }
  )
  const mapData = mockMode ? mockMapData : mapQuery.data
  const mapCorners = useMemo(() => mapData?.corners ?? [], [mapData])
  const mapPublications = useMemo(() => mapData?.publications ?? [], [mapData])
  const mapActivity = useMemo(() => mapData?.activity ?? [], [mapData])
  const corners: ReadonlyArray<MapCorner> = mockMode
    ? catalog.corners
    : mapCorners.map(toDisplayCorner)
  const categories = mockMode ? catalog.mapCategories : realCategories
  const mapLayers = {
    corners: true,
    publications: true,
    activity: recentActivity,
  }
  const visibleActivity = mapLayers.activity ? mapActivity.length : 0
  const isMapEmpty =
    mapCorners.length + mapPublications.length + visibleActivity === 0

  const displayCornerForPin = useCallback(
    (pin: MapCornerPin) => {
      if (mockMode) {
        return (
          corners.find((corner) => corner.id === pin.id) ?? toDisplayCorner(pin)
        )
      }
      return toDisplayCorner(pin)
    },
    [corners, mockMode]
  )

  const selectCorner = useCallback(
    (corner: MapCorner) => {
      setSelectedCorner(corner)
      const mapCorner = mapCorners.find((item) => item.id === corner.id)
      if (mapCorner) setSelectedPin({ type: 'corner', data: mapCorner })
    },
    [mapCorners]
  )

  const handleSelectPin = useCallback(
    (pin: MapPin) => {
      setSelectedPin(pin)
      if (pin.type === 'corner') {
        setSelectedCorner(displayCornerForPin(pin.data))
      }
    },
    [displayCornerForPin]
  )

  useEffect(() => {
    if (!mapCorners.length) {
      setSelectedPin(null)
      setSelectedCorner(null)
      return
    }

    const isSelectedPinVisible =
      selectedPin &&
      ((selectedPin.type === 'corner' &&
        mapCorners.some((corner) => corner.id === selectedPin.data.id)) ||
        (selectedPin.type === 'publication' &&
          mapPublications.some(
            (publication) => publication.id === selectedPin.data.id
          )))

    if (!isSelectedPinVisible) {
      const firstCorner = mapCorners[0]
      setSelectedCorner(displayCornerForPin(firstCorner))
      setSelectedPin({ type: 'corner', data: firstCorner })
    }
  }, [displayCornerForPin, mapCorners, mapPublications, selectedPin])

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationDenied(true)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        setLocation(nextLocation)
        setBbox(
          boundingBoxFromCenter(
            nextLocation.latitude,
            nextLocation.longitude,
            distanceRef.current,
            { minDistanceKm: MIN_MAP_RADIUS_KM }
          )
        )
        setLocationDenied(false)
      },
      () => setLocationDenied(true),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    )
  }, [])

  useEffect(() => {
    distanceRef.current = distance
  }, [distance])

  useEffect(() => {
    locate()
  }, [locate])

  const selectedMapCorner =
    selectedPin?.type === 'corner' ? selectedPin.data : null
  const selectedPublication =
    selectedPin?.type === 'publication' ? selectedPin.data : null
  const selectedTitle =
    selectedPublication?.title ??
    selectedMapCorner?.name ??
    selectedCorner?.name ??
    (mapQuery.isLoading ? 'Cargando rincones…' : 'No encontramos rincones')
  const selectedSubtitle = selectedPublication
    ? selectedPublication.authors.join(', ')
    : selectedMapCorner
      ? `${selectedMapCorner.themes[0] ?? selectedMapCorner.barrio} · Cerca`
      : selectedCorner
        ? `${selectedCorner.category} · ${selectedCorner.distance}`
        : 'Esperando datos del mapa.'
  const selectedActivity = selectedPublication
    ? `${selectedPublication.distanceKm.toLocaleString('es-AR')} km del rincón`
    : selectedMapCorner?.lastSignalAt
      ? 'Actividad reciente'
      : (selectedCorner?.activity ?? 'Sin actividad reciente')

  if (!mockMode && mapQuery.isError)
    return (
      <BaseLayout id="map-page" mainClassName={styles.layoutMain}>
        <PrototypePage className={styles.page}>
          <UnavailableState
            title="No pudimos cargar el mapa"
            description="Probá nuevamente en unos instantes."
          />
        </PrototypePage>
      </BaseLayout>
    )

  return (
    <BaseLayout id="map-page" mainClassName={styles.layoutMain}>
      <PrototypePage className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1>Mapa de rincones</h1>
            <p>
              {location
                ? 'Mostrando lugares cerca de tu ubicación'
                : 'Buenos Aires · ubicación aproximada'}
            </p>
          </div>
          <div>
            <PrototypeButton onClick={locate}>⌖ Mi ubicación</PrototypeButton>
            <PrototypeButton tone="primary" onClick={() => setCreateOpen(true)}>
              ＋ Crear rincón
            </PrototypeButton>
          </div>
        </header>

        <div className={styles.mapLayout}>
          <Panel className={styles.rail} as="aside">
            <label className={styles.search}>
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar zona o rincón"
              />
            </label>
            <section>
              <h2>Distancia</h2>
              <div className={styles.distanceValue}>
                Hasta <strong>{distance} km</strong>
              </div>
              <input
                aria-label="Distancia"
                type="range"
                min="1"
                max="10"
                value={distance}
                onChange={(event) => setDistance(Number(event.target.value))}
              />
              <div className={styles.rangeLabels}>
                <span>1 km</span>
                <span>10 km</span>
              </div>
            </section>
            <section>
              <h2>Categorías</h2>
              <div className={styles.categories}>
                {categories.map((item) => (
                  <Chip
                    key={item}
                    active={category === item}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </Chip>
                ))}
              </div>
            </section>
            <section>
              <h2>Disponibilidad</h2>
              <label className={styles.switchRow}>
                <span>
                  <strong>Abierto ahora</strong>
                  <small>Rincones disponibles hoy</small>
                </span>
                <input
                  type="checkbox"
                  checked={openNow}
                  onChange={(event) => setOpenNow(event.target.checked)}
                />
              </label>
              <label className={styles.switchRow}>
                <span>
                  <strong>Con actividad</strong>
                  <small>Lectores en las últimas 2 h</small>
                </span>
                <input
                  type="checkbox"
                  checked={recentActivity}
                  onChange={(event) => setRecentActivity(event.target.checked)}
                />
              </label>
            </section>
            <section className={styles.activity}>
              <h2>Actividad cercana</h2>
              {corners.map((corner) => (
                <button
                  key={corner.id}
                  aria-label={corner.name}
                  onClick={() => selectCorner(corner)}
                >
                  <span>⌖</span>
                  <span>
                    <strong>{corner.name}</strong>
                    <small>
                      {corner.activity} · {corner.distance}
                    </small>
                  </span>
                </button>
              ))}
            </section>
          </Panel>

          <div
            className={styles.mapCanvas}
            data-map-theme={theme}
            role="img"
            aria-label={`Mapa ${theme === 'dark' ? 'oscuro' : 'claro'} con rincones hasta ${distance} kilómetros`}
          >
            <MapCanvas
              bbox={bbox}
              corners={mapCorners}
              publications={mapPublications}
              activity={mapActivity}
              layers={mapLayers}
              selectedPin={selectedPin}
              onSelectPin={handleSelectPin}
              isLoading={!mockMode && mapQuery.isLoading}
              isFetching={!mockMode && mapQuery.isFetching}
              isEmpty={isMapEmpty}
              userLocation={location}
              className={styles.leafletCanvas}
            />
            <Panel className={styles.placeCard} as="article">
              <div className={styles.placeImage}>
                <span>☕</span>
                {selectedPublication?.photo ? (
                  <img
                    src={selectedPublication.photo}
                    alt=""
                    className={styles.placeImageCover}
                    onError={(event) => {
                      event.currentTarget.hidden = true
                    }}
                  />
                ) : null}
              </div>
              <div>
                <span className={styles.open}>
                  {selectedPublication
                    ? '● Publicación disponible'
                    : selectedMapCorner?.isOpenNow === false
                      ? '● Cerrado ahora'
                      : '● Abierto ahora'}
                </span>
                <h2>{selectedTitle}</h2>
                <p>{selectedSubtitle}</p>
                <div className={styles.placeMeta}>
                  <span>★ 4,8</span>
                  <span>{selectedActivity}</span>
                </div>
              </div>
              <PrototypeButton tone="primary" size="small">
                Ver rincón
              </PrototypeButton>
            </Panel>
            {locationDenied ? (
              <div className={styles.locationNotice} role="status">
                No pudimos acceder a tu ubicación. Mostramos Buenos Aires.
              </div>
            ) : null}
          </div>
        </div>
      </PrototypePage>

      <PublishCornerModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false)
          void mapQuery.refetch()
        }}
      />
    </BaseLayout>
  )
}
