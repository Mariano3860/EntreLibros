import type {
  MapActivityPoint,
  MapBoundingBox,
  MapCornerPin,
  MapLayerToggles,
  MapPin,
  MapPublicationPin,
} from '@api/map/map.types'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'

import styles from './MapCanvas.module.scss'

type MapCanvasProps = {
  bbox: MapBoundingBox
  corners: MapCornerPin[]
  publications: MapPublicationPin[]
  activity: MapActivityPoint[]
  layers: MapLayerToggles
  selectedPin: MapPin | null
  onSelectPin: (pin: MapPin) => void
  isLoading: boolean
  isFetching: boolean
  isEmpty: boolean
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
  onSelectPin,
  isLoading,
  isFetching,
  isEmpty,
}: MapCanvasProps) => {
  const { t } = useTranslation()

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
    return corners.map((corner) => {
      const isSelected =
        selectedPin?.type === 'corner' && selectedPin.data.id === corner.id

      return (
        <CircleMarker
          key={corner.id}
          center={[corner.lat, corner.lon]}
          radius={isSelected ? 12 : 8}
          pathOptions={{
            color: 'var(--primary-color)',
            fillColor: 'var(--primary-color)',
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
                {t('map.publications.distance', {
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
    <div className={styles.canvas} role="presentation" data-testid="map-canvas">
      <MapContainer
        center={center}
        zoom={13}
        className={styles.mapRoot}
        scrollWheelZoom
      >
        <BoundsController bbox={bbox} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
