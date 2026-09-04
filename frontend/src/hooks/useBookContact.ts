import {
  createConversation,
  saveMessageDraft,
  type ApiConversation,
} from '@api/messages/messages'
import { useMutation } from '@tanstack/react-query'
import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export type BookContactDetails = {
  id: string
  title: string
  author: string
  coverUrl?: string
  condition?: string
}

type BookContactInput = {
  ownerId: string
  book: BookContactDetails
}

type UseBookContactOptions = {
  onSuccess?: (conversation: ApiConversation) => void
}

export const startBookConversation = async ({
  ownerId,
  book,
  firstContactMessage,
}: BookContactInput & {
  firstContactMessage: string
}): Promise<ApiConversation> => {
  if (!/^\d+$/.test(ownerId)) throw new Error('invalid_owner')

  const conversation = await createConversation(Number(ownerId), {
    silent: true,
  })
  await saveMessageDraft({
    conversationId: conversation.id,
    body: firstContactMessage,
    attachmentMetadata: {
      key: `book:${book.id}`,
      contentType: 'application/x-entrelibros-book',
      size: 1,
      kind: 'book',
      bookId: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.coverUrl ?? '',
      ...(book.condition ? { condition: book.condition } : {}),
    },
  })

  return conversation
}

export const useBookContact = (options?: UseBookContactOptions) => {
  const { t } = useTranslation()
  const inFlightRef = useRef(false)

  const mutation = useMutation({
    mutationFn: ({ ownerId, book }: BookContactInput) =>
      startBookConversation({
        ownerId,
        book,
        firstContactMessage: t('bookDetail.firstContactMessage', {
          title: book.title,
        }),
      }),
    onSuccess: options?.onSuccess,
  })

  const mutate = useCallback(
    (input: BookContactInput) => {
      if (inFlightRef.current) return
      inFlightRef.current = true
      mutation.mutate(input, {
        onSettled: () => {
          inFlightRef.current = false
        },
      })
    },
    [mutation]
  )

  return { ...mutation, mutate }
}
