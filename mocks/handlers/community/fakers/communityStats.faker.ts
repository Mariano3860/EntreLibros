import { faker } from '@faker-js/faker'

import { CommunityStats } from '@src/api/community/communityStats.types'

export const generateCommunityStats = (seed = 301): CommunityStats => {
  faker.locale = faker.helpers.arrayElement(['es', 'en', 'fr'])
  faker.seed(seed)

  const kpis = {
    exchanges: 134,
    activeHouses: 52,
    activeUsers: 318,
    booksPublished: 2140,
  }

  const trendExchanges = Array.from({ length: 7 }).map(() =>
    faker.number.int({ min: 20, max: 100 })
  )
  const trendNewBooks = Array.from({ length: 7 }).map(() =>
    faker.number.int({ min: 10, max: 80 })
  )

  const topContributors = Array.from({ length: 5 }).map(() => ({
    username: `@${faker.internet.username().toLowerCase()}`,
    metric: faker.helpers.arrayElement(['exchanges', 'books']) as
      | 'exchanges'
      | 'books',
    value: faker.number.int({ min: 1, max: 20 }),
  }))

  const hotSearches = Array.from({ length: 6 }).map(() => ({
    term: faker.lorem.words({ min: 1, max: 2 }),
    count: faker.number.int({ min: 5, max: 25 }),
  }))

  const activeHousesMap = Array.from({ length: 4 }).map(() => ({
    top: `${faker.number.int({ min: 0, max: 100 })}%`,
    left: `${faker.number.int({ min: 0, max: 100 })}%`,
  }))

  return {
    kpis,
    trendExchanges,
    trendNewBooks,
    topContributors,
    hotSearches,
    activeHousesMap,
  }
}
