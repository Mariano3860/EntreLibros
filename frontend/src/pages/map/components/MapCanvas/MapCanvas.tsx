import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type {
  MapActivityPoint,
  MapBoundingBox,
  MapCornerPin,
  MapLayerToggles,
  MapPin,
  MapPublicationPin,
} from '@src/api/map/map.types'

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

type PinNode = {
  id: string
  type: 'corner' | 'publication'
  lat: number
  lon: number
  corner?: MapCornerPin
  publication?: MapPublicationPin
}

type Cluster = {
  id: string
  lat: number
  lon: number
  members: PinNode[]
}

type ProjectedPoint = {
  x: number
  y: number
}

const projectPoint = (
  lat: number,
  lon: number,
  bbox: MapBoundingBox
): ProjectedPoint => {
  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(value, max))

  const eastWestRange = bbox.east - bbox.west || 1
  const northSouthRange = bbox.north - bbox.south || 1
  const x = ((lon - bbox.west) / eastWestRange) * 100
  const y = (1 - (lat - bbox.south) / northSouthRange) * 100
  return {
    x: clamp(x, 2, 98),
    y: clamp(y, 2, 98),
  }
}

const euclideanDistance = (a: PinNode, b: PinNode) => {
  const latDiff = a.lat - b.lat
  const lonDiff = a.lon - b.lon
  return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff)
}

const buildClusters = (nodes: PinNode[]): Cluster[] => {
  const clusters: Cluster[] = []
  const radius = 0.02

  nodes.forEach((node) => {
    const cluster = clusters.find((candidate) => {
      const centroid = { lat: candidate.lat, lon: candidate.lon } as PinNode
      return euclideanDistance(node, centroid) < radius
    })

    if (cluster) {
      cluster.members.push(node)
    } else {
      clusters.push({
        id: `cluster-${node.id}`,
        lat: node.lat,
        lon: node.lon,
        members: [node],
      })
    }
  })

  return clusters
}

const createPinNodes = (
  corners: MapCornerPin[],
  publications: MapPublicationPin[],
  layers: MapLayerToggles
): PinNode[] => {
  const nodes: PinNode[] = []
  const cornerIndex = new Map(corners.map((corner) => [corner.id, corner]))

  if (layers.corners) {
    nodes.push(
      ...corners.map((corner) => ({
        id: corner.id,
        type: 'corner' as const,
        lat: corner.lat,
        lon: corner.lon,
        corner,
      }))
    )
  }

  if (layers.publications) {
    nodes.push(
      ...publications.map((publication, index) => {
        const corner = cornerIndex.get(publication.cornerId)
        const baseLat = publication.lat ?? corner?.lat ?? 0
        const baseLon = publication.lon ?? corner?.lon ?? 0
        const offset = (index % 4) * 0.002
        return {
          id: `publication-${publication.id}`,
          type: 'publication' as const,
          lat: baseLat + offset,
          lon: baseLon + offset,
          publication,
        }
      })
    )
  }

  return nodes
}

const buildPinFromNode = (node: PinNode): MapPin | null => {
  if (node.type === 'corner' && node.corner) {
    return { type: 'corner', data: node.corner }
  }
  if (node.type === 'publication' && node.publication) {
    return { type: 'publication', data: node.publication }
  }
  return null
}

type PinTooltipProps = {
  title: string
  subtitle: string
  distance?: string
}

const PinTooltip = ({ title, subtitle, distance }: PinTooltipProps) => {
  return (
    <div className={styles.tooltip} role="tooltip">
      <strong>{title}</strong>
      <div>{subtitle}</div>
      {distance ? <div>{distance}</div> : null}
    </div>
  )
}

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
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(
    null
  )
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null)

  const nodes = useMemo(
    () => createPinNodes(corners, publications, layers),
    [corners, publications, layers]
  )

  const clusters = useMemo(() => buildClusters(nodes), [nodes])

  const singlePins = clusters.filter((cluster) => cluster.members.length === 1)
  const multiPins = clusters.filter((cluster) => cluster.members.length > 1)

  const handleClusterClick = (clusterId: string) => {
    setExpandedClusterId((current) =>
      current === clusterId ? null : clusterId
    )
  }

  const renderPin = (node: PinNode) => {
    const projected = projectPoint(node.lat, node.lon, bbox)
    const mapPin = buildPinFromNode(node)
    if (!mapPin) return null

    const isSelected =
      (selectedPin?.type === 'corner' &&
        node.type === 'corner' &&
        selectedPin.data.id === node.corner?.id) ||
      (selectedPin?.type === 'publication' &&
        node.type === 'publication' &&
        selectedPin.data.id === node.publication?.id)

    const tooltipTitle =
      node.type === 'corner'
        ? (node.corner?.name ?? '')
        : (node.publication?.title ?? '')

    const tooltipSubtitle =
      node.type === 'corner'
        ? `${node.corner?.barrio ?? ''}`
        : `${node.publication?.authors?.[0] ?? ''}`

    const tooltipDistance =
      node.type === 'publication'
        ? t('map.publications.distance', {
            count: node.publication?.distanceKm ?? 0,
          })
        : undefined

    const buttonClasses = [
      styles.pinBase,
      node.type === 'corner' ? styles.pinCorner : styles.pinPublication,
      isSelected ? styles.pinSelected : '',
    ]

    return (
      <button
        key={node.id}
        type="button"
        className={buttonClasses.filter(Boolean).join(' ')}
        style={{ left: `${projected.x}%`, top: `${projected.y}%` }}
        onClick={() => onSelectPin(mapPin)}
        onMouseEnter={() => setHoveredPinId(node.id)}
        onMouseLeave={() =>
          setHoveredPinId((current) => (current === node.id ? null : current))
        }
        onFocus={() => setHoveredPinId(node.id)}
        onBlur={() =>
          setHoveredPinId((current) => (current === node.id ? null : current))
        }
        aria-label={tooltipTitle}
      >
        <span
          className={[
            styles.pinIcon,
            node.type === 'corner' ? styles.pinCorner : styles.pinPublication,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {node.type === 'corner' ? '📚' : '📖'}
        </span>
        <span className={styles.halo} aria-hidden="true" />
        {hoveredPinId === node.id ? (
          <PinTooltip
            title={tooltipTitle}
            subtitle={tooltipSubtitle}
            distance={tooltipDistance}
          />
        ) : null}
      </button>
    )
  }

  return (
    <div className={styles.canvas} role="presentation">
      <div className={styles.grid} aria-hidden="true" />
      {layers.activity ? (
        <div
          className={styles.layer}
          aria-hidden="true"
          data-testid="heat-layer"
        >
          {activity.map((cell) => {
            const projected = projectPoint(cell.lat, cell.lon, bbox)
            return (
              <span
                key={cell.id}
                className={styles.heatCell}
                style={{ left: `${projected.x}%`, top: `${projected.y}%` }}
              />
            )
          })}
        </div>
      ) : null}

      {singlePins.map((cluster) => renderPin(cluster.members[0]))}

      {multiPins.map((cluster) => {
        const projected = projectPoint(cluster.lat, cluster.lon, bbox)
        const isExpanded = expandedClusterId === cluster.id

        if (!isExpanded) {
          return (
            <button
              key={cluster.id}
              type="button"
              className={[styles.pinBase, styles.clusterPin].join(' ')}
              style={{ left: `${projected.x}%`, top: `${projected.y}%` }}
              onClick={() => handleClusterClick(cluster.id)}
              aria-label={t('map.cluster.more', {
                count: cluster.members.length,
              })}
            >
              {cluster.members.length}
            </button>
          )
        }

        return (
          <div
            key={cluster.id}
            className={styles.clusterExpansion}
            style={{
              left: `${projected.x}%`,
              top: `${projected.y}%`,
              position: 'absolute',
            }}
          >
            {cluster.members.map((member, index) => {
              const angle = (index / cluster.members.length) * Math.PI * 2
              const offsetRadius = 6
              const nodeWithOffset: PinNode = {
                ...member,
                id: `${member.id}-${index}`,
                lat: member.lat + (Math.sin(angle) * offsetRadius) / 100,
                lon: member.lon + (Math.cos(angle) * offsetRadius) / 100,
              }
              return renderPin(nodeWithOffset)
            })}
            <button
              type="button"
              className={[styles.pinBase, styles.clusterPin].join(' ')}
              style={{ left: `${projected.x}%`, top: `${projected.y}%` }}
              onClick={() => handleClusterClick(cluster.id)}
              aria-label={t('map.cluster.collapse')}
            >
              ×
            </button>
          </div>
        )
      })}

      {isLoading || isFetching ? (
        <div className={styles.loadingOverlay} aria-live="polite">
          {t('map.status.loading')}
        </div>
      ) : null}

      {isEmpty && !isLoading && !isFetching ? (
        <div className={styles.emptyOverlay}>{t('map.empty.description')}</div>
      ) : null}
    </div>
  )
}
