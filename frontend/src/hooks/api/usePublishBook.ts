import { publishBook } from '@api/books/books.service'
import { PublishBookPayload, PublishBookResponse } from '@api/books/publishBook.types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const usePublishBook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PublishBookPayload) => publishBook(payload),
    onSuccess: (data: PublishBookResponse) => {
      queryClient.setQueryData(['books'], (prev: unknown) => {
        if (!Array.isArray(prev)) return prev
        return [data, ...prev]
      })

      queryClient.setQueryData(['userBooks'], (prev: unknown) => {
        if (!Array.isArray(prev)) return prev
        return [data, ...prev]
      })
    },
  })
}
