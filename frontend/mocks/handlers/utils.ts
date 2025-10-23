const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, (match) => `\\${match}`)

const ensureLeadingSlash = (path: string): string =>
  path.startsWith('/') ? path : `/${path}`

export const apiRouteMatcher = (route: string): RegExp => {
  const normalized = ensureLeadingSlash(route)
  const escaped = escapeRegex(normalized)
  return new RegExp(`(?:/api)?${escaped}(?:\\?.*)?$`)
}
