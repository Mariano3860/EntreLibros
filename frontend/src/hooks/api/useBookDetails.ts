import { getBookById } from '@api/books/books.service'
import { Publication, PublicationApiError } from '@api/books/publication.types'
import { useQuery } from '@tanstack/react-query'

export const BOOK_DETAIL_QUERY_KEY = (id: string) => ['book', id] as const

export const useBookDetails = (id: string | null) =>
  useQuery<Publication, PublicationApiError>({
    queryKey: BOOK_DETAIL_QUERY_KEY(id ?? ''),
    queryFn: () => {
      if (!id) {
        throw new PublicationApiError('Missing publication id', 'unknown')
      }
      return getBookById(id)
    },
    enabled: Boolean(id),
    retry: (failureCount, error) => {
      if (!id) return false
      if (error.type === 'not_found' || error.type === 'forbidden') {
        return false
      }
      return failureCount < 2
    },
    staleTime: 1000 * 30,
  })
