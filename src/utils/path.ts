export const buildFullPath = (basePath: string, subPath?: string) => {
  const normalizedBase = basePath.endsWith('/')
    ? basePath.slice(0, -1)
    : basePath
  if (!subPath) return normalizedBase
  const normalizedSub = subPath.startsWith('/') ? subPath.slice(1) : subPath
  return `${normalizedBase}/${normalizedSub}`
}

export const getPathSegment = (pathname: string, basePath: string) => {
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}`
  const withoutBase = pathname.startsWith(normalizedBase)
    ? pathname.slice(normalizedBase.length)
    : pathname
  return withoutBase.replace(/^\/+/, '').replace(/\/+$/, '')
}
