import { faker } from '@faker-js/faker'

import { SuggestionItem } from '@src/api/community/suggestions.types'

export const generateSuggestionItems = (seed = 456): SuggestionItem[] => {
  faker.locale = faker.helpers.arrayElement(['es', 'en', 'fr'])
  faker.seed(seed)
  return Array.from({ length: 5 }).map(() => ({
    id: faker.string.uuid(),
    user: faker.person.firstName(),
    avatar: faker.image.avatar(),
  }))
}
