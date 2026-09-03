import type {
  MapActivityPoint,
  MapBoundingBox,
  MapCornerPin,
  MapLayerToggles,
  MapPin,
  MapPublicationPin,
} from '@api/map/map.types'
import { useTheme } from '@contexts/theme/ThemeContext'
import { divIcon } from 'leaflet'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'

import styles from './MapCanvas.module.scss'

const userLocationIcon = divIcon({
  className: styles.userLocationIcon,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  html: `<span class="${styles.userLocationIconInner}" aria-hidden="true">
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M12 21s7-6.1 7-12A7 7 0 1 0 5 9c0 5.9 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  </span>`,
})

const cornerMarkerColors = [
  'var(--prototype-orange)',
  'var(--prototype-purple)',
  'var(--prototype-teal)',
] as const

type MapCanvasProps = {
  bbox: MapBoundingBox
  corners: MapCornerPin[]
  publications: MapPublicationPin[]
  activity: MapActivityPoint[]
  layers: MapLayerToggles
  selectedPin: MapPin | null
  focusRequest?: number
  onSelectPin: (pin: MapPin) => void
  isLoading: boolean
  isFetching: boolean
  isEmpty: boolean
  userLocation?: { latitude: number; longitude: number } | null
  radiusKm?: number | null
  className?: string
}

const BoundsController = ({ bbox }: { bbox: MapBoundingBox }) => {
  const map = useMap()

  useEffect(() => {
    const southWest: [number, number] = [bbox.south, bbox.west]
    const northEast: [number, number] = [bbox.north, bbox.east]
    map.fitBounds([southWest, northEast], { padding: [16, 16] })
  }, [map, bbox])

  return null
}

const LocationController = ({
  userLocation,
}: {
  userLocation: { latitude: number; longitude: number } | null
}) => {
  const map = useMap()

  useEffect(() => {
    if (!userLocation) return
    map.setView(
      [userLocation.latitude, userLocation.longitude],
      map.getZoom(),
      {
        animate: false,
      }
    )
  }, [map, userLocation])

  return null
}

const SelectedPinController = ({
  selectedPin,
  focusRequest,
}: {
  selectedPin: MapPin | null
  focusRequest: number
}) => {
  const map = useMap()
  const selectedPinRef = useRef(selectedPin)

  useEffect(() => {
    selectedPinRef.current = selectedPin
  }, [selectedPin])

  useEffect(() => {
    if (focusRequest <= 0) return
    const pin = selectedPinRef.current
    if (pin?.type !== 'corner') return

    map.flyTo([pin.data.lat, pin.data.lon], Math.max(map.getZoom(), 15), {
      animate: true,
      duration: 0.6,
    })
  }, [map, focusRequest])

  return null
}

const MapControls = ({
  bbox,
  userLocation,
}: {
  bbox: MapBoundingBox
  userLocation: { latitude: number; longitude: number } | null
}) => {
  const map = useMap()

  const centerMap = () => {
    if (userLocation) {
      map.setView(
        [userLocation.latitude, userLocation.longitude],
        map.getZoom(),
        {
          animate: true,
        }
      )
      return
    }

    const southWest: [number, number] = [bbox.south, bbox.west]
    const northEast: [number, number] = [bbox.north, bbox.east]
    map.fitBounds([southWest, northEast], { padding: [16, 16], animate: true })
  }

  return (
    <div className={styles.controls} aria-label="Controles del mapa">
      <button type="button" aria-label="Acercar" onClick={() => map.zoomIn()}>
        ＋
      </button>
      <button type="button" aria-label="Alejar" onClick={() => map.zoomOut()}>
        −
      </button>
      <button type="button" aria-label="Centrar mapa" onClick={centerMap}>
        ⌖
      </button>
    </div>
  )
}

const resolvePublicationPosition = (
  publication: MapPublicationPin,
  cornerLookup: Map<string, MapCornerPin>
): [number, number] => {
  const corner = cornerLookup.get(publication.cornerId)
  const lat = publication.lat ?? corner?.lat ?? 0
  const lon = publication.lon ?? corner?.lon ?? 0
  return [lat, lon]
}

const cornerToPin = (corner: MapCornerPin): MapPin => ({
  type: 'corner',
  data: corner,
})

const publicationToPin = (publication: MapPublicationPin): MapPin => ({
  type: 'publication',
  data: publication,
})

export const MapCanvas = ({
  bbox,
  corners,
  publications,
  activity,
  layers,
  selectedPin,
  focusRequest = 0,
  onSelectPin,
  isLoading,
  isFetching,
  isEmpty,
  userLocation = null,
  radiusKm = null,
  className = '',
}: MapCanvasProps) => {
  const { t } = useTranslation()
  const { theme } = useTheme()

  const center = useMemo(() => {
    const lat = (bbox.north + bbox.south) / 2
    const lon = (bbox.east + bbox.west) / 2
    return [lat, lon] as [number, number]
  }, [bbox])

  const cornerLookup = useMemo(
    () => new Map(corners.map((corner) => [corner.id, corner])),
    [corners]
  )

  const cornerPins = useMemo(() => {
    if (!layers.corners) return []
    return corners.map((corner, index) => {
      const isSelected =
        selectedPin?.type === 'corner' && selectedPin.data.id === corner.id
      const markerColor =
        cornerMarkerColors[index % cornerMarkerColors.length] ??
        'var(--primary-color)'

      return (
        <CircleMarker
          key={corner.id}
          center={[corner.lat, corner.lon]}
          radius={isSelected ? 12 : 8}
          pathOptions={{
            color: markerColor,
            fillColor: markerColor,
            fillOpacity: isSelected ? 0.9 : 0.7,
            weight: isSelected ? 4 : 2,
          }}
          eventHandlers={{
            click: () => onSelectPin(cornerToPin(corner)),
          }}
          className={styles.cornerMarker}
        >
          <Tooltip
            direction="top"
            offset={[0, -12]}
            sticky
            className={styles.tooltip}
            permanent={isSelected}
          >
            <div className={styles.tooltipContent}>
              <strong>{corner.name}</strong>
              <span>{corner.barrio}</span>
            </div>
          </Tooltip>
        </CircleMarker>
      )
    })
  }, [corners, layers.corners, onSelectPin, selectedPin])

  const publicationPins = useMemo(() => {
    if (!layers.publications) return []
    return publications.map((publication) => {
      const [lat, lon] = resolvePublicationPosition(publication, cornerLookup)
      const isSelected =
        selectedPin?.type === 'publication' &&
        selectedPin.data.id === publication.id

      return (
        <CircleMarker
          key={publication.id}
          center={[lat, lon]}
          radius={isSelected ? 10 : 7}
          pathOptions={{
            color: 'var(--color-info)',
            fillColor: 'var(--color-info)',
            fillOpacity: isSelected ? 0.85 : 0.65,
            weight: isSelected ? 4 : 2,
          }}
          eventHandlers={{
            click: () => onSelectPin(publicationToPin(publication)),
          }}
          className={styles.publicationMarker}
        >
          <Tooltip
            direction="top"
            offset={[0, -10]}
            sticky
            className={styles.tooltip}
            permanent={isSelected}
          >
            <div className={styles.tooltipContent}>
              <strong>{publication.title}</strong>
              <span>{publication.authors[0] ?? ''}</span>
              <span className={styles.tooltipMeta}>
                {publication.distanceKm === null
                  ? t('map.publications.distanceUnavailable')
                  : t('map.publications.distance', {
                      count: publication.distanceKm,
                    })}
              </span>
            </div>
          </Tooltip>
        </CircleMarker>
      )
    })
  }, [
    cornerLookup,
    layers.publications,
    onSelectPin,
    publications,
    selectedPin,
    t,
  ])

  const activityMarkers = useMemo(() => {
    if (!layers.activity) return []
    return activity.map((point) => (
      <CircleMarker
        key={point.id}
        center={[point.lat, point.lon]}
        radius={Math.max(6, point.intensity * 3)}
        pathOptions={{
          color: 'var(--color-warning)',
          fillColor: 'var(--color-warning)',
          fillOpacity: 0.25,
          weight: 0,
        }}
        className={styles.activityMarker}
      />
    ))
  }, [activity, layers.activity])

  return (
    <div
      className={`${styles.canvas} ${className}`}
      data-map-theme={theme}
      role="presentation"
      data-testid="map-canvas"
    >
      <MapContainer
        center={center}
        zoom={13}
        className={styles.mapRoot}
        zoomControl={false}
        scrollWheelZoom
      >
        <BoundsController bbox={bbox} />
        <LocationController userLocation={userLocation} />
        <SelectedPinController
          selectedPin={selectedPin}
          focusRequest={focusRequest}
        />
        <MapControls bbox={bbox} userLocation={userLocation} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {userLocation ? (
          <>
            {radiusKm !== null ? (
              <Circle
                center={[userLocation.latitude, userLocation.longitude]}
                radius={radiusKm * 1000}
                pathOptions={{
                  color: 'var(--color-info)',
                  fillColor: 'var(--color-info)',
                  fillOpacity: 0.1,
                  weight: 3,
                  dashArray: '6 8',
                }}
              />
            ) : null}
            <CircleMarker
              center={[userLocation.latitude, userLocation.longitude]}
              radius={18}
              pathOptions={{
                color: 'var(--color-info)',
                fillColor: 'var(--color-info)',
                fillOpacity: 0.18,
                weight: 2,
              }}
              className={styles.userLocationMarker}
            />
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={userLocationIcon}
              title={t('map.location.youAreHere', {
                defaultValue: 'Tu ubicación aproximada',
              })}
            >
              <Tooltip direction="top" offset={[0, -17]}>
                {t('map.location.youAreHere')}
              </Tooltip>
            </Marker>
          </>
        ) : null}
        {activityMarkers}
        {cornerPins}
        {publicationPins}
      </MapContainer>

      {isLoading || isFetching ? (
        <div className={styles.overlay} aria-live="polite">
          {t('map.status.loading')}
        </div>
      ) : null}

      {isEmpty && !isLoading && !isFetching ? (
        <div className={styles.overlay}>{t('map.empty.description')}</div>
      ) : null}
    </div>
  )
}
