import { http, HttpResponse } from 'msw'

import { MAP_RADIUS_OPTIONS, type MapRadiusKm } from '@src/api/map/map.types'
import { RELATIVE_API_ROUTES } from '@src/api/routes'
import { isWithinRadiusKm } from '@src/utils/geospatial'

import { apiRouteMatcher } from '../utils'

import { generateMapResponse } from './fakers/map.faker'

const normalize = (value: string | null) => value?.trim().toLowerCase() ?? ''

const isMapRadius = (value: number): value is MapRadiusKm =>
  MAP_RADIUS_OPTIONS.includes(value as MapRadiusKm)

const parseBooleanParam = (value: string | null, defaultValue: boolean) => {
  if (value === null) return defaultValue
  const normalized = value.trim().toLowerCase()
  return normalized === '1' || normalized === 'true'
}

export const mapHandler = http.get(
  apiRouteMatcher(RELATIVE_API_ROUTES.MAP.ROOT),
  ({ request }) => {
    const base = generateMapResponse()
    const url = new URL(request.url)

    const searchTerm = normalize(url.searchParams.get('search'))
    const rawRadius = url.searchParams.get('distanceKm')
    const radiusParam = rawRadius === null ? null : Number(rawRadius)
    if (
      radiusParam !== null &&
      (!Number.isFinite(radiusParam) || !isMapRadius(radiusParam))
    ) {
      return HttpResponse.json(
        { error: 'BadRequest', message: 'map.errors.distance_invalid' },
        { status: 400 }
      )
    }
    const radiusKm = radiusParam
    const rawCenterLat = url.searchParams.get('centerLat')
    const rawCenterLon = url.searchParams.get('centerLon')
    const centerLat = rawCenterLat === null ? null : Number(rawCenterLat)
    const centerLon = rawCenterLon === null ? null : Number(rawCenterLon)
    const hasCenterParam = rawCenterLat !== null || rawCenterLon !== null
    if (
      hasCenterParam &&
      (centerLat === null ||
        centerLon === null ||
        !Number.isFinite(centerLat) ||
        !Number.isFinite(centerLon) ||
        centerLat < -90 ||
        centerLat > 90 ||
        centerLon < -180 ||
        centerLon > 180)
    ) {
      return HttpResponse.json(
        { error: 'BadRequest', message: 'map.errors.center_invalid' },
        { status: 400 }
      )
    }
    const center =
      centerLat !== null && centerLon !== null
        ? { latitude: centerLat, longitude: centerLon }
        : null
    const themesParam = url.searchParams.get('themes') ?? ''
    const openNow = parseBooleanParam(url.searchParams.get('openNow'), false)
    const recentActivity = parseBooleanParam(
      url.searchParams.get('recentActivity'),
      true
    )
    const layersParam = url.searchParams.get('layers') ?? ''
    const layers = new Set(layersParam.split(',').filter(Boolean))
    if (layers.size === 0) {
      layers.add('corners')
      layers.add('publications')
      layers.add('activity')
    }

    const themeFilters = themesParam
      .split(',')
      .map((theme) => theme.trim())
      .filter(Boolean)

    const corners = base.corners.filter((corner) => {
      const matchesSearch =
        !searchTerm ||
        corner.name.toLowerCase().includes(searchTerm) ||
        corner.barrio.toLowerCase().includes(searchTerm) ||
        corner.city.toLowerCase().includes(searchTerm)
      const matchesTheme =
        themeFilters.length === 0 ||
        themeFilters.some((theme) => corner.themes.includes(theme))
      const matchesOpen = !openNow || corner.isOpenNow
      const matchesRadius =
        radiusKm === null ||
        !center ||
        isWithinRadiusKm(
          center,
          { latitude: corner.lat, longitude: corner.lon },
          radiusKm
        )
      return matchesSearch && matchesTheme && matchesOpen && matchesRadius
    })
    const visibleCornerIds = new Set(corners.map((corner) => corner.id))

    const publications = base.publications.filter((publication) => {
      const matchesSearch =
        !searchTerm ||
        publication.title.toLowerCase().includes(searchTerm) ||
        publication.authors.some((author) =>
          author.toLowerCase().includes(searchTerm)
        )
      const corner = base.corners.find(
        (item) => item.id === publication.cornerId
      )
      const matchesTheme =
        themeFilters.length === 0 ||
        themeFilters.some((theme) => corner?.themes.includes(theme) ?? false)
      const latitude = publication.lat ?? corner?.lat
      const longitude = publication.lon ?? corner?.lon
      const matchesRadius =
        radiusKm === null ||
        !center ||
        (latitude !== undefined &&
          longitude !== undefined &&
          isWithinRadiusKm(
            center,
            {
              latitude,
              longitude,
            },
            radiusKm
          ))
      return (
        visibleCornerIds.has(publication.cornerId) &&
        matchesSearch &&
        matchesTheme &&
        matchesRadius
      )
    })

    const activity = recentActivity
      ? base.activity.filter(
          (point) =>
            radiusKm === null ||
            !center ||
            isWithinRadiusKm(
              center,
              { latitude: point.lat, longitude: point.lon },
              radiusKm
            )
        )
      : []

    const payload = {
      corners: layers.has('corners') ? corners : [],
      publications: layers.has('publications') ? publications : [],
      activity: layers.has('activity') ? activity : [],
      meta: base.meta,
    }

    return HttpResponse.json(payload)
  }
)
