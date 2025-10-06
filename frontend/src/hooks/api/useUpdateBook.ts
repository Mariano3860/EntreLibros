import { updateBook } from '@api/books/books.service'
import {
  Publication,
  PublicationApiError,
  PublicationUpdate,
} from '@api/books/publication.types'
import { applyPublicationUpdate } from '@api/books/publication.utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { BOOK_DETAIL_QUERY_KEY } from './useBookDetails'

export const useUpdateBook = (id: string | null) => {
  const queryClient = useQueryClient()

  return useMutation<
    Publication,
    PublicationApiError,
    PublicationUpdate,
    { previous?: Publication }
  >({
    mutationFn: (input) => {
      if (!id) {
        throw new PublicationApiError('Missing publication id', 'unknown')
      }
      return updateBook(id, input)
    },
    onMutate: async (input) => {
      if (!id) return { previous: undefined }
      const queryKey = BOOK_DETAIL_QUERY_KEY(id)
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Publication>(queryKey)
      if (previous) {
        const optimistic = applyPublicationUpdate(previous, input)
        queryClient.setQueryData(queryKey, optimistic)
      }
      return { previous }
    },
    onError: (_error, _input, context) => {
      if (!id) return
      const queryKey = BOOK_DETAIL_QUERY_KEY(id)
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSuccess: (data) => {
      if (!id) return
      const queryKey = BOOK_DETAIL_QUERY_KEY(id)
      queryClient.setQueryData(queryKey, data)
    },
    onSettled: () => {
      if (!id) return
      const queryKey = BOOK_DETAIL_QUERY_KEY(id)
      queryClient.invalidateQueries({ queryKey })
    },
  })
}
