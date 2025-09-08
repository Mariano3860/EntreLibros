import { useQuery } from '@tanstack/react-query'

import { fetchSuggestions } from '@src/api/community/suggestions.service'

export const useSuggestions = () => {
  return useQuery({ queryKey: ['suggestions'], queryFn: fetchSuggestions })
}
