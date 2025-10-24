import { useQuery } from '@tanstack/react-query'

import { getBookById } from '@src/api/books/publication.service'

/**
 * Hook to fetch book details by ID
 */
export const useBookDetails = (id: string | undefined) => {
  return useQuery({
    queryKey: ['book', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Book ID is required')
      }
      return getBookById(id)
    },
    enabled: !!id,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
