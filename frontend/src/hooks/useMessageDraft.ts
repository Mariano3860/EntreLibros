import {
  deleteMessageDraft,
  fetchMessageDraft,
  saveMessageDraft,
  sendMessageDraft,
  messageQueryKeys,
  type ApiMessageDraft,
  type ApiMessageDraftAttachment,
} from '@api/messages/messages'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export type MessageDraftValue = {
  body: string
  attachmentMetadata?: ApiMessageDraftAttachment | null
}

export type MessageDraftSendValue = {
  clientKey: string
  revision?: number
}

export const useMessageDraft = (
  conversationId: number | null,
  enabled = true
) => {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: messageQueryKeys.draft(conversationId ?? 0),
    queryFn: () => fetchMessageDraft(conversationId ?? 0),
    enabled: enabled && conversationId !== null,
  })
  const save = useMutation({
    mutationFn: (value: MessageDraftValue) =>
      saveMessageDraft({
        conversationId: conversationId ?? 0,
        ...value,
        ...(query.data?.revision !== undefined
          ? { revision: query.data.revision }
          : {}),
      }),
    onSuccess: (draft) => {
      queryClient.setQueryData<ApiMessageDraft | null>(
        messageQueryKeys.draft(conversationId ?? 0),
        draft
      )
    },
  })
  const discard = useMutation({
    mutationFn: () =>
      deleteMessageDraft(conversationId ?? 0, query.data?.revision),
    onSuccess: () => {
      queryClient.setQueryData<ApiMessageDraft | null>(
        messageQueryKeys.draft(conversationId ?? 0),
        null
      )
    },
  })
  const send = useMutation({
    mutationFn: (value: string | MessageDraftSendValue) => {
      const clientKey = typeof value === 'string' ? value : value.clientKey
      const revision =
        typeof value === 'string'
          ? query.data?.revision
          : (value.revision ?? query.data?.revision)

      return sendMessageDraft({
        conversationId: conversationId ?? 0,
        clientKey,
        ...(revision !== undefined ? { revision } : {}),
      })
    },
    onSuccess: () => {
      queryClient.setQueryData<ApiMessageDraft | null>(
        messageQueryKeys.draft(conversationId ?? 0),
        null
      )
    },
  })
  return { query, save, discard, send }
}
