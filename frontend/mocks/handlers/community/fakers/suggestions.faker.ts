import type { SuggestionItem } from '@src/api/community/suggestions.types'
import { prototypeCatalog } from '@src/features/prototype/catalog'

export const generateSuggestionItems = (seed = 456): SuggestionItem[] => {
  void seed
  return prototypeCatalog.stats.contributors.map((person) => ({
    id: `suggestion-${person.name.toLowerCase()}`,
    user: person.name,
    avatar: '',
  }))
}
