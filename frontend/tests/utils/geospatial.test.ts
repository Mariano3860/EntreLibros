import { describe, expect, it } from 'vitest'

import {
  boundingBoxFromCenter,
  haversineDistanceKm,
} from '@src/utils/geospatial'

describe('haversineDistanceKm', () => {
  it('returns zero distance for identical coordinates', () => {
    expect(haversineDistanceKm(0, 0, 0, 0)).toBe(0)
  })

  it('computes realistic distances between two points', () => {
    const distance = haversineDistanceKm(0, 0, 0, 1)
    expect(distance).toBeGreaterThan(110)
    expect(distance).toBeLessThan(112)
  })
})

describe('boundingBoxFromCenter', () => {
  it('generates a bounding box using geodesic calculations', () => {
    const latitude = 40.4168
    const longitude = -3.7038
    const radiusKm = 10

    const bbox = boundingBoxFromCenter(latitude, longitude, radiusKm)

    expect(
      haversineDistanceKm(latitude, longitude, bbox.north, longitude)
    ).toBeCloseTo(radiusKm, 2)
    expect(
      haversineDistanceKm(latitude, longitude, bbox.south, longitude)
    ).toBeCloseTo(radiusKm, 2)
    expect(
      haversineDistanceKm(latitude, longitude, latitude, bbox.east)
    ).toBeCloseTo(radiusKm, 2)
    expect(
      haversineDistanceKm(latitude, longitude, latitude, bbox.west)
    ).toBeCloseTo(radiusKm, 2)
  })

  it('respects the minimum distance option', () => {
    const latitude = -34.6037
    const longitude = -58.3816
    const bbox = boundingBoxFromCenter(latitude, longitude, 1, {
      minDistanceKm: 5,
    })

    const northDistance = haversineDistanceKm(
      latitude,
      longitude,
      bbox.north,
      longitude
    )
    expect(northDistance).toBeGreaterThanOrEqual(5)
  })

  it('returns the same coordinates when the effective distance is zero', () => {
    const latitude = 12.34
    const longitude = 56.78

    const bbox = boundingBoxFromCenter(latitude, longitude, 0)

    expect(bbox.north).toBeCloseTo(latitude, 6)
    expect(bbox.south).toBeCloseTo(latitude, 6)
    expect(bbox.east).toBeCloseTo(longitude, 6)
    expect(bbox.west).toBeCloseTo(longitude, 6)
  })

  it('normalizes longitudes that cross the antimeridian', () => {
    const latitude = 10
    const longitude = 179.5
    const radiusKm = 50

    const bbox = boundingBoxFromCenter(latitude, longitude, radiusKm)

    expect(bbox.east).toBeLessThanOrEqual(180)
    expect(bbox.west).toBeGreaterThanOrEqual(-180)
    expect(
      haversineDistanceKm(latitude, longitude, latitude, bbox.east)
    ).toBeGreaterThan(0)
    expect(
      haversineDistanceKm(latitude, longitude, latitude, bbox.west)
    ).toBeGreaterThan(0)
  })

  it('handles very large radius that reaches maximum delta', () => {
    const latitude = 0
    const longitude = 0
    const radiusKm = 10000 // Very large radius to test the maxDelta boundary

    const bbox = boundingBoxFromCenter(latitude, longitude, radiusKm)

    // The bounding box should still be valid
    expect(bbox.north).toBeGreaterThan(latitude)
    expect(bbox.south).toBeLessThan(latitude)
    expect(bbox.east).toBeGreaterThan(longitude)
    expect(bbox.west).toBeLessThan(longitude)
  })
})
