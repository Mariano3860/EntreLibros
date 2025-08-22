import { useQuery } from '@tanstack/react-query'

import { fetchMessages } from '@src/api/messages/messages.service'

export const useMessages = () => {
  return useQuery({ queryKey: ['messages'], queryFn: fetchMessages })
}
