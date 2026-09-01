import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'
import { isWithinRadiusKm } from '@src/utils/geospatial'

import { apiRouteMatcher } from '../utils'

import { generateMapResponse } from './fakers/map.faker'

const normalize = (value: string | null) => value?.trim().toLowerCase() ?? ''

export const mapHandler = http.get(
  apiRouteMatcher(RELATIVE_API_ROUTES.MAP.ROOT),
  ({ request }) => {
    const base = generateMapResponse()
    const url = new URL(request.url)

    const searchTerm = normalize(url.searchParams.get('search'))
    const rawRadius = url.searchParams.get('distanceKm')
    const radiusParam = rawRadius === null ? null : Number(rawRadius)
    const radiusKm =
      radiusParam !== null && Number.isFinite(radiusParam) ? radiusParam : null
    const centerLat = Number(url.searchParams.get('centerLat'))
    const centerLon = Number(url.searchParams.get('centerLon'))
    const center =
      Number.isFinite(centerLat) && Number.isFinite(centerLon)
        ? { latitude: centerLat, longitude: centerLon }
        : null
    const themesParam = url.searchParams.get('themes') ?? ''
    const openNow = url.searchParams.get('openNow') === '1'
    const recentActivity = url.searchParams.get('recentActivity') !== '0'
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
      const matchesRadius =
        radiusKm === null ||
        !center ||
        (publication.lat !== undefined &&
          publication.lon !== undefined &&
          isWithinRadiusKm(
            center,
            {
              latitude: publication.lat,
              longitude: publication.lon,
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
