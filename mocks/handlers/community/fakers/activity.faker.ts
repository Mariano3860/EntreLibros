import { faker } from '@faker-js/faker'

import { ActivityItem } from '@src/api/community/activity.types'

export const generateActivityItems = (): ActivityItem[] => {
  faker.seed(123)
  return Array.from({ length: 10 }).map(() => ({
    id: faker.string.uuid(),
    user: faker.person.firstName(),
    avatar: faker.image.avatar(),
  }))
}
