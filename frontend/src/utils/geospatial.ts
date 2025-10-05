const EARTH_RADIUS_KM = 6371

const toRadians = (value: number): number => (value * Math.PI) / 180

const clampLatitude = (latitude: number): number =>
  Math.max(-90, Math.min(90, latitude))

const normalizeLongitude = (longitude: number): number =>
  ((((longitude + 180) % 360) + 360) % 360) - 180

const findDeltaForDistance = (
  lat: number,
  lon: number,
  targetDistanceKm: number,
  axis: 'lat' | 'lon'
): number => {
  if (targetDistanceKm <= 0) return 0

  const distanceForDelta = (delta: number) =>
    axis === 'lat'
      ? haversineDistanceKm(lat, lon, lat + delta, lon)
      : haversineDistanceKm(lat, lon, lat, lon + delta)

  let low = 0
  let high = 1
  const maxDelta = axis === 'lat' ? 90 : 180

  while (distanceForDelta(high) < targetDistanceKm && high < maxDelta) {
    low = high
    high = Math.min(high * 2, maxDelta)
    if (high === maxDelta) break
  }

  for (let i = 0; i < 25; i += 1) {
    const mid = (low + high) / 2
    const distance = distanceForDelta(mid)
    if (distance < targetDistanceKm) {
      low = mid
    } else {
      high = mid
    }
  }

  return (low + high) / 2
}

// Accurate geospatial distance calculation using the Haversine formula
// For more precise calculations, consider using a geospatial library such as 'geolib'.
/**
 * Calculates the distance in kilometers between two latitude/longitude points using the Haversine formula.
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export const haversineDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const startLatRad = toRadians(lat1)
  const endLatRad = toRadians(lat2)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(startLatRad) *
      Math.cos(endLatRad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_KM * c
}

export type BoundingBox = {
  north: number
  south: number
  east: number
  west: number
}

export const boundingBoxFromCenter = (
  latitude: number,
  longitude: number,
  distanceKm: number,
  { minDistanceKm = 0 }: { minDistanceKm?: number } = {}
): BoundingBox => {
  const effectiveDistance = Math.max(distanceKm, minDistanceKm, 0)

  if (effectiveDistance === 0) {
    return {
      north: clampLatitude(latitude),
      south: clampLatitude(latitude),
      east: normalizeLongitude(longitude),
      west: normalizeLongitude(longitude),
    }
  }

  const latitudeDelta = findDeltaForDistance(
    latitude,
    longitude,
    effectiveDistance,
    'lat'
  )
  const longitudeDelta = findDeltaForDistance(
    latitude,
    longitude,
    effectiveDistance,
    'lon'
  )

  return {
    north: clampLatitude(latitude + latitudeDelta),
    south: clampLatitude(latitude - latitudeDelta),
    east: normalizeLongitude(longitude + longitudeDelta),
    west: normalizeLongitude(longitude - longitudeDelta),
  }
}

export const EARTH_RADIUS_KILOMETERS = EARTH_RADIUS_KM
