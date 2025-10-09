const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\$&')

const ensureLeadingSlash = (path: string): string =>
  path.startsWith('/') ? path : `/${path}`

export const apiRouteMatcher = (route: string): RegExp => {
  const normalized = ensureLeadingSlash(route)
  return new RegExp(`${escapeRegex(normalized)}$`)
}
