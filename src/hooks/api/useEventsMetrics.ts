import { useQuery } from '@tanstack/react-query'

import { fetchEventsMetrics } from '@src/api/events/events.service'

export const useEventsMetrics = () =>
  useQuery({ queryKey: ['eventsMetrics'], queryFn: fetchEventsMetrics })
