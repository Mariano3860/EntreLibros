import { searchBooks } from '@api/books/searchBooks.service'
import { useQuery } from '@tanstack/react-query'

export const useBookSearch = (query: string) => {
  return useQuery({
    queryKey: ['bookSearch', query],
    queryFn: () => searchBooks(query),
    enabled: query.trim().length >= 3,
    staleTime: 60_000,
  })
}
