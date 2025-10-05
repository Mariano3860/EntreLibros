import { faker } from '@faker-js/faker'

import {
  CommunityCornerMap,
  CommunityCornerSummary,
} from '@src/api/community/corners.types'

let cachedCorners: CommunityCornerSummary[] | null = null

const ensureCorners = () => {
  if (cachedCorners) {
    return cachedCorners
  }

  faker.seed(2024)

  cachedCorners = Array.from({ length: 8 }).map(() => {
    const suffix = faker.helpers.arrayElement([
      'Readers',
      'Books',
      'Corner',
      'Club',
    ])
    const name = `${faker.person.firstName()} ${suffix}`
    const seed = faker.string.alphanumeric(10)

    return {
      id: faker.string.uuid(),
      name,
      imageUrl: `https://picsum.photos/seed/${seed}/160/160`,
      distanceKm: Number(
        faker.number.float({ min: 0.4, max: 6, fractionDigits: 1 }).toFixed(1)
      ),
      activityLabel: faker.helpers.arrayElement([
        faker.helpers.maybe(
          () =>
            `${faker.number.int({ min: 1, max: 6 })} intercambios esta semana`,
          { probability: 0.6 }
        ),
        'Activo',
        undefined,
      ]),
    }
  })

  return cachedCorners
}

export const generateCornerSummaries = (): CommunityCornerSummary[] => {
  return ensureCorners()
}

export const generateCornersMap = (): CommunityCornerMap => {
  const corners = ensureCorners()
  faker.seed(3024)

  return {
    description: 'Explora los Rincones activos en tu zona.',
    pins: corners.map((corner) => ({
      id: corner.id,
      name: corner.name,
      x: faker.number.float({ min: 10, max: 90, fractionDigits: 1 }),
      y: faker.number.float({ min: 15, max: 85, fractionDigits: 1 }),
      status: faker.helpers.arrayElement(['active', 'quiet']) as
        | 'active'
        | 'quiet',
    })),
  }
}

export const registerCorner = (corner: CommunityCornerSummary) => {
  const corners = ensureCorners()
  cachedCorners = [corner, ...corners.filter((item) => item.id !== corner.id)]
}
