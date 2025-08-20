import { useQuery } from '@tanstack/react-query'

import { fetchEvents } from '@src/api/events/events.service'

export const useEvents = () =>
  useQuery({ queryKey: ['events'], queryFn: fetchEvents })
