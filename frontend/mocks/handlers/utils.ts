const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, (match) => `\\${match}`)

const ensureLeadingSlash = (path: string): string =>
  path.startsWith('/') ? path : `/${path}`

/**
 * Creates a regex pattern for matching API routes with optional /api prefix and query parameters.
 * Supports both relative and absolute MSW handler paths.
 *
 * @param route - The route path to match (e.g., '/users', '/books/:id')
 * @returns A RegExp that matches the route with optional /api prefix and query string
 *
 * @example
 * apiRouteMatcher('/users') // matches '/users', '/api/users', '/users?page=1', etc.
 */
export const apiRouteMatcher = (route: string): RegExp => {
  const normalized = ensureLeadingSlash(route)
  const segments = normalized.split('/')

  const pattern = segments
    .slice(1)
    .map((segment) => {
      if (segment.startsWith(':')) {
        const paramName = segment.slice(1)
        return `(?<${paramName}>[^/]+)`
      }

      return escapeRegex(segment)
    })
    .join('/')
    .replace(/\//g, '\\/')

  // Regex breakdown:
  // ^                       : Start of string
  // (?:https?:\/\/[^/]+)?   : Optional protocol and host (e.g., 'http://localhost:3000')
  // (?:/api)?               : Optional '/api' prefix
  // /${pattern}             : Route pattern (with path params)
  // (?:\?.*)?               : Optional query string
  // $                       : End of string
  return new RegExp(`^(?:https?:\\/\\/[^/]+)?(?:/api)?/${pattern}(?:\\?.*)?$`)
