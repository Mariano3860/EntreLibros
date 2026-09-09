import type { SuggestionItem } from '@src/api/community/suggestions.types'
import { mockExperienceFixtures } from '@src/mocks/fixtures/experience'

export const generateSuggestionItems = (seed = 456): SuggestionItem[] => {
  void seed
  return mockExperienceFixtures.stats.contributors.map((person) => ({
    id: `suggestion-${person.name.toLowerCase()}`,
    user: person.name,
    avatar: '',
  }))
}
