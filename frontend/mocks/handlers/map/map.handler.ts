import { http, HttpResponse } from 'msw'

import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { apiRouteMatcher } from '../utils'

import { generateMapResponse } from './fakers/map.faker'

const normalize = (value: string | null) => value?.trim().toLowerCase() ?? ''

export const mapHandler = http.get(
  apiRouteMatcher(RELATIVE_API_ROUTES.MAP.ROOT),
  ({ request }) => {
    const base = generateMapResponse()
    const url = new URL(request.url)

    const searchTerm = normalize(url.searchParams.get('search'))
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
      return matchesSearch && matchesTheme && matchesOpen
    })

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
      return matchesSearch && matchesTheme
    })

    const activity = recentActivity ? base.activity : []

    const payload = {
      corners: layers.has('corners') ? corners : [],
      publications: layers.has('publications') ? publications : [],
      activity: layers.has('activity') ? activity : [],
      meta: base.meta,
    }

    return HttpResponse.json(payload)
  }
)
