import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateBook } from '@src/api/books/publication.service'
import {
  Publication,
  PublicationUpdate,
} from '@src/api/books/publication.types'

/**
 * Hook to update a book publication with optimistic updates
 */
export const useUpdateBook = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: PublicationUpdate) => updateBook(id, input),

    onMutate: async (input: PublicationUpdate) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['book', id] })

      // Snapshot the previous value
      const previousBook = queryClient.getQueryData<Publication>(['book', id])

      // Optimistically update to the new value
      if (previousBook) {
        queryClient.setQueryData<Publication>(['book', id], {
          ...previousBook,
          ...input,
          offer: input.offer
            ? {
                ...previousBook.offer,
                ...input.offer,
                delivery: input.offer.delivery
                  ? {
                      ...previousBook.offer.delivery,
                      ...input.offer.delivery,
                    }
                  : previousBook.offer.delivery,
              }
            : previousBook.offer,
          updatedAt: new Date().toISOString(),
        })
      }

      return { previousBook }
    },

    onError: (_err, _input, context) => {
      // Rollback on error
      if (context?.previousBook) {
        queryClient.setQueryData(['book', id], context.previousBook)
      }
    },

    onSuccess: (data) => {
      // Update the cache with the server response
      queryClient.setQueryData(['book', id], data)

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['userBooks'] })
    },
  })
}
