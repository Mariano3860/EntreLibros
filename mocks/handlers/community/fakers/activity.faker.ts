import { faker } from '@faker-js/faker'

import { ActivityItem } from '@src/api/community/activity.types'

export const generateActivityItems = (seed = 123): ActivityItem[] => {
  faker.locale = faker.helpers.arrayElement(['es', 'en', 'fr'])
  faker.seed(seed)
  return Array.from({ length: 10 }).map(() => ({
    id: faker.string.uuid(),
    user: faker.person.firstName(),
    avatar: faker.image.avatar(),
  }))
}
