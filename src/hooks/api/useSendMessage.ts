import { useMutation, useQueryClient } from '@tanstack/react-query'

import { sendMessage } from '@src/api/messages/messages.service'
import { Message } from '@src/api/messages/messages.types'

export const useSendMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (message: Message) => {
      queryClient.setQueryData<Message[]>(['messages'], (old) =>
        old ? [...old, message] : [message]
      )
    },
  })
}
