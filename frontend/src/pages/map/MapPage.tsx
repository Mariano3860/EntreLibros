import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { CornerEditModal } from '@components/map/CornerEditModal/CornerEditModal'
import { CreateCornerFab } from '@components/map/CreateCornerFab/CreateCornerFab'
import {
  FilterRail,
  type MapExplorationActivityItem,
} from '@components/map/FilterRail/FilterRail'
import { MapCanvas } from '@components/map/MapCanvas/MapCanvas'
import { MapSelectionCard } from '@components/map/MapSelectionCard/MapSelectionCard'
import { PublishCornerModal } from '@components/publish/PublishCornerModal'
import { ReportModal } from '@components/reports/ReportModal'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'

import {
  cornerKeys,
  fetchCornerDetail,
  updateCorner,
} from '@src/api/community/corners.service'
import type {
  CommunityCornerDetail,
  UpdateCornerPayload,
} from '@src/api/community/corners.types'
import type {
  MapBoundingBox,
  MapCornerPin,
  MapLayerToggles,
  MapPin,
  MapResponse,
  MapRadiusKm,
} from '@src/api/map/map.types'
import { mapKeys } from '@src/api/map/mapApi'
import { fetchProfile } from '@src/api/user/profile.service'
import {
  ActionButton,
  PageFrame,
} from '@src/components/ui/presentation/Presentation'
import { useAuth } from '@src/contexts/auth/AuthContext'
import { useAuthRequired } from '@src/contexts/auth/AuthRequiredContext'
import { useMockExperience } from '@src/contexts/mock/MockExperienceContext'
import { useTheme } from '@src/contexts/theme/ThemeContext'
import { useMapData } from '@src/hooks/api/useMapData'
import {
  boundingBoxFromCenter,
  haversineDistanceKm,
  isWithinRadiusKm,
} from '@src/utils/geospatial'
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
const MAP_RESULT_LIMITS = { corners: 50, publications: 100, activity: 100 }
const EMPTY_CORNERS: MapCornerPin[] = []
const EMPTY_PUBLICATIONS: MapResponse['publications'] = []
const EMPTY_ACTIVITY: MapResponse['activity'] = []
const parseRequestedRadius = (value: string | null): MapRadiusKm | null => {
  if (value === null) return null
  const parsed = Number(value)
  return [1, 5, 30, 50].includes(parsed) ? (parsed as MapRadiusKm) : null
}

const toDisplayCorner = (corner: MapCornerPin): MapCorner => ({
  id: corner.id,
  name: corner.name,
  category: corner.themes[1] ?? corner.themes[0] ?? corner.barrio,
  distance:
    corner.distanceKm === null
      ? 'Sin distancia'
      : `${corner.distanceKm.toLocaleString('es-AR')} km`,
  activity: corner.lastSignalAt
    ? 'Actividad reciente'
    : 'Sin actividad reciente',
  isOpenNow: corner.isOpenNow,
})

export const MapPage = () => {
  const { fixtures } = useMockExperience()
  const { theme } = useTheme()
  const { t } = useTranslation()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { runIfAuthenticated } = useAuthRequired()
  const mockMode = isApiMockMode()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedCornerId = searchParams.get('corner')
  const [distance, setDistance] = useState(() =>
    parseRequestedRadius(searchParams.get('radius'))
  )
  const [search, setSearch] = useState('')
  const [viewportBbox, setViewportBbox] = useState<MapBoundingBox>(MAP_BOUNDS)
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [locationDenied, setLocationDenied] = useState(false)
  const [openNow, setOpenNow] = useState(false)
  const [mapLayers] = useState<MapLayerToggles>({
    corners: true,
    publications: false,
    activity: true,
  })
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null)
  const [cornerDetailsOpen, setCornerDetailsOpen] = useState(false)
  const [cornerReportOpen, setCornerReportOpen] = useState(false)
  const [focusRequest, setFocusRequest] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(true)
  const [selectionDismissed, setSelectionDismissed] = useState(false)
  const [editingCorner, setEditingCorner] =
    useState<CommunityCornerDetail | null>(null)

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    enabled: !mockMode && isAuthenticated,
    retry: false,
  })
  const profileLocation = profileQuery.data?.location ?? null
  const discoveryLocation = location ?? profileLocation

  const mockMapData = useMemo<MapResponse>(
    () => ({
      corners: fixtures.corners.map((corner, index) => {
        const latitude =
          MAP_BOUNDS.south +
          ((100 - corner.y) / 100) * (MAP_BOUNDS.north - MAP_BOUNDS.south)
        const longitude =
          MAP_BOUNDS.west +
          (corner.x / 100) * (MAP_BOUNDS.east - MAP_BOUNDS.west)
        const scope =
          index % 2 === 0 ? 'Espacio abierto' : 'Espacio semiprivado'
        return {
          id: corner.id,
          name: corner.name,
          barrio: corner.category,
          city: 'Buenos Aires',
          lat: latitude,
          lon: longitude,
          distanceKm: null,
          lastSignalAt: new Date(
            Date.parse(MOCK_MAP_REFERENCE_DATE) - (index + 1) * 12 * 60_000
          ).toISOString(),
          photos: ['/illustrations/reading-room.svg'],
          themes: ['Comunidad', scope],
          isOpenNow: true,
          status: 'active',
        }
      }),
      publications: [],
      activity: fixtures.corners.map((corner, index) => {
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
      meta: {
        bbox: MAP_BOUNDS,
        generatedAt: MOCK_MAP_REFERENCE_DATE,
        truncated: false,
        limits: MAP_RESULT_LIMITS,
      },
    }),
    [fixtures.corners]
  )

  const effectiveDistance = discoveryLocation ? distance : null
  const radialBbox = useMemo(
    () =>
      effectiveDistance !== null && discoveryLocation
        ? boundingBoxFromCenter(
            discoveryLocation.latitude,
            discoveryLocation.longitude,
            effectiveDistance,
            { minDistanceKm: MIN_MAP_RADIUS_KM }
          )
        : null,
    [discoveryLocation, effectiveDistance]
  )
  const mapBbox = radialBbox ?? viewportBbox

  const mockFilteredMapData = useMemo<MapResponse>(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const getDistanceKm = (corner: MapCornerPin) =>
      discoveryLocation
        ? Math.round(
            haversineDistanceKm(
              discoveryLocation.latitude,
              discoveryLocation.longitude,
              corner.lat,
              corner.lon
            ) * 10
          ) / 10
        : null
    const matchesDistance = (latitude: number, longitude: number) =>
      effectiveDistance === null ||
      !discoveryLocation ||
      isWithinRadiusKm(
        discoveryLocation,
        { latitude, longitude },
        effectiveDistance
      )
    const matchesViewport = (latitude: number, longitude: number) =>
      effectiveDistance !== null ||
      (latitude >= viewportBbox.south &&
        latitude <= viewportBbox.north &&
        (viewportBbox.east >= viewportBbox.west
          ? longitude >= viewportBbox.west && longitude <= viewportBbox.east
          : longitude >= viewportBbox.west || longitude <= viewportBbox.east))
    const matchesSearch = (value: string) =>
      normalizedSearch.length === 0 ||
      value.toLowerCase().includes(normalizedSearch)
    const visibleCorners = mockMapData.corners
      .filter(
        (corner) =>
          (matchesSearch(corner.name) ||
            matchesSearch(corner.barrio) ||
            matchesSearch(corner.city)) &&
          (!openNow || corner.isOpenNow !== false) &&
          matchesDistance(corner.lat, corner.lon) &&
          matchesViewport(corner.lat, corner.lon)
      )
      .map((corner) => ({
        ...corner,
        distanceKm: getDistanceKm(corner),
      }))
    if (discoveryLocation) {
      visibleCorners.sort(
        (left, right) =>
          (left.distanceKm ?? Number.POSITIVE_INFINITY) -
          (right.distanceKm ?? Number.POSITIVE_INFINITY)
      )
    }
    const limitedCorners = visibleCorners.slice(0, MAP_RESULT_LIMITS.corners)
    const visibleCornerIds = new Set(limitedCorners.map((corner) => corner.id))
    const visibleActivity = mapLayers.activity
      ? mockMapData.activity.filter((point) =>
          visibleCornerIds.has(point.id.replace(/-activity$/, ''))
        )
      : []
    const limitedActivity = visibleActivity.slice(0, MAP_RESULT_LIMITS.activity)

    return {
      ...mockMapData,
      corners: mapLayers.corners ? limitedCorners : [],
      publications: mapLayers.publications
        ? mockMapData.publications.filter((publication) =>
            visibleCornerIds.has(publication.cornerId)
          )
        : [],
      activity: limitedActivity,
      meta: {
        ...mockMapData.meta,
        bbox: mapBbox,
        truncated: visibleCorners.length > MAP_RESULT_LIMITS.corners,
      },
    }
  }, [
    discoveryLocation,
    effectiveDistance,
    mapBbox,
    mapLayers,
    mockMapData,
    openNow,
    search,
    viewportBbox,
  ])

  const mapQuery = useMapData(
    {
      bbox: mapBbox,
      center:
        effectiveDistance !== null
          ? (discoveryLocation ?? undefined)
          : undefined,
      searchTerm: search.trim() || undefined,
      filters: {
        distanceKm: effectiveDistance,
        themes: [],
        openNow,
        recentActivity: mapLayers.activity,
      },
      layers: mapLayers,
      locale: 'es',
    },
    { enabled: !mockMode }
  )
  const mapData = mockMode ? mockFilteredMapData : mapQuery.data
  const mapResultsTruncated = mapData?.meta.truncated === true
  const mapCorners = mapData?.corners ?? EMPTY_CORNERS
  const visibleCornerIds = useMemo(
    () => new Set(mapCorners.map((corner) => corner.id)),
    [mapCorners]
  )
  const mapPublications = EMPTY_PUBLICATIONS
  const mapActivity = useMemo(
    () =>
      (mapData?.activity ?? EMPTY_ACTIVITY).filter((point) =>
        visibleCornerIds.has(point.id.replace(/-activity$/, ''))
      ),
    [mapData?.activity, visibleCornerIds]
  )
  const isMapEmpty =
    mapCorners.length + mapPublications.length + mapActivity.length === 0

  const selectCorner = useCallback(
    (corner: MapCorner, openDetails = false) => {
      setSelectionDismissed(false)
      setCornerDetailsOpen(openDetails)
      const mapCorner = mapCorners.find((item) => item.id === corner.id)
      if (!mapCorner) return
      setSelectedPin({ type: 'corner', data: mapCorner })
      setFocusRequest((current) => current + 1)
    },
    [mapCorners]
  )

  const handleSelectPin = useCallback((pin: MapPin) => {
    setSelectionDismissed(false)
    setSelectedPin(pin)
    setCornerDetailsOpen(false)
    if (pin.type === 'corner') {
      setFocusRequest((current) => current + 1)
    }
  }, [])

  useEffect(() => {
    if (!mapCorners.length) {
      setSelectedPin(null)
      setCornerDetailsOpen(false)
      return
    }

    if (requestedCornerId) {
      const requestedCorner = mapCorners.find(
        (corner) => corner.id === requestedCornerId
      )
      if (!requestedCorner) {
        setSelectedPin(null)
        setCornerDetailsOpen(false)
        return
      }

      if (
        selectedPin?.type !== 'corner' ||
        selectedPin.data.id !== requestedCorner.id
      ) {
        setSelectionDismissed(false)
        setCornerDetailsOpen(false)
        setSelectedPin({ type: 'corner', data: requestedCorner })
        setFocusRequest((current) => current + 1)
      }
      return
    }

    if (selectionDismissed && !selectedPin) return

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
      setSelectionDismissed(false)
      setCornerDetailsOpen(false)
      setSelectedPin({ type: 'corner', data: firstCorner })
    }
  }, [
    mapCorners,
    mapPublications,
    requestedCornerId,
    selectedPin,
    selectionDismissed,
  ])

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationDenied(true)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLocationDenied(false)
      },
      () => setLocationDenied(true),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    )
  }, [])

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) locate()
  }, [isAuthLoading, isAuthenticated, locate])

  const handleViewportChange = useCallback(
    (nextBbox: MapBoundingBox) => {
      if (effectiveDistance === null) setViewportBbox(nextBbox)
    },
    [effectiveDistance]
  )

  const handleDistanceChange = useCallback(
    (nextDistance: MapRadiusKm | null) => {
      setDistance(nextDistance)
      setSearchParams(
        (current) => {
          const nextParams = new URLSearchParams(current)
          if (nextDistance === null) nextParams.delete('radius')
          else nextParams.set('radius', String(nextDistance))
          return nextParams
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const selectedMapCorner =
    selectedPin?.type === 'corner' ? selectedPin.data : null
  const selectedPublication =
    selectedPin?.type === 'publication' ? selectedPin.data : null
  const mockCornerDetail = useMemo<CommunityCornerDetail | null>(() => {
    if (!selectedMapCorner) return null
    return {
      id: selectedMapCorner.id,
      name: selectedMapCorner.name,
      scope: 'public',
      hostAlias: 'EntreLibros',
      rules: selectedMapCorner.rules ?? null,
      schedule: null,
      status: selectedMapCorner.status,
      visibilityPreference: 'approximate',
      imageUrl: selectedMapCorner.photos[0] ?? null,
      isOwner: false,
      location: {
        city: selectedMapCorner.city,
        neighborhood: selectedMapCorner.barrio,
        referencePointLabel:
          selectedMapCorner.referencePointLabel ?? selectedMapCorner.barrio,
        latitude: selectedMapCorner.lat,
        longitude: selectedMapCorner.lon,
        approximate: true,
      },
      activity: {
        totalExchanges: 0,
        weeklyExchanges: 0,
        lastActivityAt: selectedMapCorner.lastSignalAt,
      },
    }
  }, [selectedMapCorner])

  const cornerDetailQuery = useQuery({
    queryKey: cornerKeys.detail(selectedMapCorner?.id ?? ''),
    queryFn: () => fetchCornerDetail(selectedMapCorner?.id ?? ''),
    enabled: cornerDetailsOpen && !mockMode && Boolean(selectedMapCorner?.id),
    retry: false,
  })
  const selectedCornerDetail = mockMode
    ? mockCornerDetail
    : (cornerDetailQuery.data ?? null)

  const cornerUpdateMutation = useMutation({
    mutationFn: (input: { id: string; payload: UpdateCornerPayload }) =>
      updateCorner(input.id, input.payload),
    onSuccess: (data, input) => {
      queryClient.setQueryData(cornerKeys.detail(input.id), data)
      void queryClient.invalidateQueries({ queryKey: mapKeys.all })
    },
  })

  const handleToggleCornerDetails = useCallback(() => {
    if (!selectedMapCorner) return
    setCornerDetailsOpen((current) => !current)
  }, [selectedMapCorner])

  const handleViewPublication = useCallback(() => {
    if (!selectedPublication) return
    const listingId = selectedPublication.id.replace(/^listing-/, '')
    if (!/^\d+$/.test(listingId)) return
    navigate(`/books/${listingId}`)
  }, [navigate, selectedPublication])

  const handleCloseSelection = useCallback(() => {
    setSelectedPin(null)
    setCornerDetailsOpen(false)
    setSelectionDismissed(true)
  }, [])

  const handleSaveCorner = useCallback(
    async (payload: UpdateCornerPayload) => {
      if (!selectedCornerDetail) return
      await cornerUpdateMutation.mutateAsync({
        id: selectedCornerDetail.id,
        payload,
      })
      setEditingCorner(null)
    },
    [cornerUpdateMutation, selectedCornerDetail]
  )

  const handleToggleCornerStatus = useCallback(() => {
    if (!selectedCornerDetail?.isOwner) return
    void cornerUpdateMutation.mutateAsync({
      id: selectedCornerDetail.id,
      payload: {
        status: selectedCornerDetail.status === 'active' ? 'paused' : 'active',
      },
    })
  }, [cornerUpdateMutation, selectedCornerDetail])

  const activityItems = useMemo<MapExplorationActivityItem[]>(
    () =>
      mapCorners.map((corner) => ({
        id: corner.id,
        title: corner.name,
        meta: `${
          corner.lastSignalAt
            ? t('map.exploration.activitySignal')
            : t('map.exploration.nearbyCorner')
        } · ${
          corner.distanceKm === null
            ? t('map.selection.distanceUnavailable')
            : `${corner.distanceKm.toLocaleString('es-AR')} km`
        }`,
        photo: corner.photos[0],
        icon: 'book',
        isSelected:
          selectedPin?.type === 'corner' && selectedPin.data.id === corner.id,
        onSelect: () => selectCorner(toDisplayCorner(corner)),
      })),
    [mapCorners, selectCorner, selectedPin, t]
  )

  return (
    <BaseLayout id="map-page" mainClassName={styles.layoutMain}>
      <PageFrame className={styles.page}>
        <div
          className={styles.mapShell}
          data-map-theme={theme}
          data-panel-open={panelOpen}
          role="region"
          aria-label={t('map.exploration.mapLabel')}
        >
          <MapCanvas
            bbox={mapBbox}
            corners={mapCorners}
            publications={mapPublications}
            activity={mapActivity}
            layers={mapLayers}
            selectedPin={selectedPin}
            focusRequest={focusRequest}
            onSelectPin={handleSelectPin}
            isLoading={!mockMode && mapQuery.isLoading}
            isFetching={!mockMode && mapQuery.isFetching}
            isEmpty={!mapQuery.isError && isMapEmpty}
            userLocation={discoveryLocation}
            radiusKm={effectiveDistance}
            onViewportChange={handleViewportChange}
            className={styles.mapCanvas}
          />

          <header className={styles.topBar}>
            <div className={styles.titleBlock}>
              <span>{t('map.exploration.eyebrow')}</span>
              <h1>{t('map.exploration.title')}</h1>
              <p>
                {location
                  ? t('map.exploration.nearbyLocation')
                  : profileLocation
                    ? t('map.exploration.profileLocation')
                    : t('map.exploration.fallbackLocation')}
              </p>
            </div>
            <div className={styles.topActions}>
              <button
                type="button"
                className={styles.filterToggle}
                onClick={() => setPanelOpen((current) => !current)}
                aria-expanded={panelOpen}
                aria-controls="map-exploration-panel"
              >
                <span aria-hidden="true">☷</span>
                {panelOpen ? t('map.filters.hide') : t('map.filters.show')}
              </button>
              <ActionButton
                className={styles.locationButton}
                onClick={locate}
                aria-label={t('map.filters.locateMe')}
              >
                <span aria-hidden="true">◎</span>
                {t('map.exploration.locate')}
              </ActionButton>
              <CreateCornerFab
                placement="inline"
                onClick={() => runIfAuthenticated(() => setCreateOpen(true))}
              />
            </div>
          </header>

          <div id="map-exploration-panel" className={styles.panelLayer}>
            <FilterRail
              searchValue={search}
              onSearchChange={setSearch}
              distanceKm={distance}
              onDistanceChange={handleDistanceChange}
              openNow={openNow}
              onToggleOpenNow={() => setOpenNow((current) => !current)}
              activityItems={activityItems}
              isOpen={panelOpen}
              onClose={() => setPanelOpen(false)}
            />
          </div>

          {mapQuery.isError && !mockMode ? (
            <div className={styles.mapNotice} role="alert">
              <span>{t('map.status.error')}</span>
              <button type="button" onClick={() => void mapQuery.refetch()}>
                {t('map.status.retry')}
              </button>
            </div>
          ) : null}
          {mapResultsTruncated ? (
            <div className={styles.mapNotice} role="status">
              {t('map.status.truncated')}
            </div>
          ) : null}
          {locationDenied ? (
            <div className={styles.locationNotice} role="status">
              {discoveryLocation
                ? t('map.location.deniedWithProfile')
                : t('map.location.deniedWithoutProfile')}
            </div>
          ) : null}

          <MapSelectionCard
            pin={selectedPin}
            cornerDetail={selectedCornerDetail}
            cornerDetailsOpen={cornerDetailsOpen}
            isLoading={!mockMode && cornerDetailQuery.isLoading}
            isError={!mockMode && cornerDetailQuery.isError}
            isUpdating={cornerUpdateMutation.isPending}
            error={
              cornerUpdateMutation.isError
                ? t('map.cornerDetail.updateError')
                : undefined
            }
            onClose={handleCloseSelection}
            onOpenDetails={handleToggleCornerDetails}
            onOpenPublication={handleViewPublication}
            onRetry={() => void cornerDetailQuery.refetch()}
            onEdit={
              selectedCornerDetail?.isOwner
                ? () => setEditingCorner(selectedCornerDetail)
                : undefined
            }
            onToggleStatus={handleToggleCornerStatus}
            onReport={() => runIfAuthenticated(() => setCornerReportOpen(true))}
          />
        </div>
      </PageFrame>

      {editingCorner ? (
        <CornerEditModal
          corner={editingCorner}
          isSaving={cornerUpdateMutation.isPending}
          onClose={() => setEditingCorner(null)}
          onSave={handleSaveCorner}
        />
      ) : null}

      <PublishCornerModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false)
          void mapQuery.refetch()
        }}
      />
      <ReportModal
        isOpen={cornerReportOpen && Boolean(selectedCornerDetail)}
        targetType="corner_missing"
        targetId={selectedCornerDetail?.id ?? ''}
        onClose={() => setCornerReportOpen(false)}
      />
    </BaseLayout>
  )
}
