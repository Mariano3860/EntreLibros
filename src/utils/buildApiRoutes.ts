import { BASE_URL } from '@/constants/constants'
import { RELATIVE_API_ROUTES } from '@/api/routes'

const buildApiRoutes = (relativeRoutes: any, baseUrl: string): any => {
  const mapRecursive = (obj: any): any =>
    Object.fromEntries(
      Object.entries(obj).map(([key, value]) =>
        typeof value === 'string'
          ? [key, `${baseUrl}${value}`]
          : [key, mapRecursive(value)]
      )
    )

  return mapRecursive(relativeRoutes)
}

export const API_ROUTES = buildApiRoutes(RELATIVE_API_ROUTES, BASE_URL)
