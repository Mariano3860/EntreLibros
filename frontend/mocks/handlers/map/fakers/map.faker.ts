import { faker } from '@faker-js/faker'

import type { MapResponse } from '@src/api/map/map.types'

const DEFAULT_BOUNDS = {
  north: -34.54,
  south: -34.72,
  east: -58.36,
  west: -58.55,
}

let cached: MapResponse | null = null

export const generateMapResponse = (): MapResponse => {
  if (cached) return cached

  faker.seed(2048)

  const corners = Array.from({ length: 5 }).map((_, index) => {
    const lat = faker.number.float({
      min: DEFAULT_BOUNDS.south,
      max: DEFAULT_BOUNDS.north,
      fractionDigits: 5,
    })
    const lon = faker.number.float({
      min: DEFAULT_BOUNDS.west,
      max: DEFAULT_BOUNDS.east,
      fractionDigits: 5,
    })
    return {
      id: `corner-${index + 1}`,
      name: `${faker.location.street()} Readers`,
      barrio: faker.location.city(),
      city: 'Buenos Aires',
      lat,
      lon,
      lastSignalAt: faker.date.recent({ days: 2 }).toISOString(),
      photos: [faker.image.urlPicsumPhotos({ width: 640, height: 360 })],
      rules: faker.helpers.arrayElement([
        'Bring a book to swap and leave a short note.',
        'Keep the corner tidy for the next visitor.',
        undefined,
      ]),
      referencePointLabel: faker.helpers.arrayElement([
        'Near the playground entrance',
        'Inside the cultural center lobby',
        'Corner of the main square',
      ]),
      themes: faker.helpers
        .shuffle(['Infancias', 'Ciencia ficción', 'Poesía', 'Historia'])
        .slice(0, 2),
      isOpenNow: faker.datatype.boolean(),
      status: faker.helpers.arrayElement(['active', 'paused'] as const),
    }
  })

  const publications = corners.flatMap((corner, index) => {
    return Array.from({ length: 2 }).map((_, publicationIndex) => ({
      id: `pub-${index + 1}-${publicationIndex + 1}`,
      title: faker.lorem.words({ min: 2, max: 4 }),
      authors: [faker.person.fullName()],
      type: faker.helpers.arrayElement([
        'offer',
        'donation',
        'sale',
        'want',
      ] as const),
      photo: faker.image.urlPicsumPhotos({ width: 200, height: 200 }),
      distanceKm: Number(
        faker.number.float({ min: 0.4, max: 6, fractionDigits: 1 })
      ),
      cornerId: corner.id,
      lat:
        corner.lat +
        faker.number.float({ min: -0.005, max: 0.005, fractionDigits: 5 }),
      lon:
        corner.lon +
        faker.number.float({ min: -0.005, max: 0.005, fractionDigits: 5 }),
    }))
  })

  const activity = Array.from({ length: 6 }).map((_, index) => ({
    id: `activity-${index + 1}`,
    lat: faker.number.float({
      min: DEFAULT_BOUNDS.south,
      max: DEFAULT_BOUNDS.north,
      fractionDigits: 5,
    }),
    lon: faker.number.float({
      min: DEFAULT_BOUNDS.west,
      max: DEFAULT_BOUNDS.east,
      fractionDigits: 5,
    }),
    intensity: faker.number.int({ min: 1, max: 5 }),
  }))

  cached = {
    corners,
    publications,
    activity,
    meta: {
      bbox: DEFAULT_BOUNDS,
      generatedAt: new Date().toISOString(),
    },
  }

  return cached
}
