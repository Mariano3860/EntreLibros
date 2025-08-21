import { faker } from '@faker-js/faker'

import { SuggestionItem } from '@src/api/community/suggestions.types'

export const generateSuggestionItems = (): SuggestionItem[] => {
  faker.seed(456)
  return Array.from({ length: 5 }).map(() => ({
    id: faker.string.uuid(),
    user: faker.person.firstName(),
    avatar: faker.image.avatar(),
  }))
}
