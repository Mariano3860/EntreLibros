import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

import { ApiEvent, ApiEventsMetrics } from './events.types'

export const fetchEvents = async (): Promise<ApiEvent[]> => {
  const { data } = await apiClient.get<ApiEvent[]>(RELATIVE_API_ROUTES.EVENTS.LIST)
  if (!Array.isArray(data)) {
    throw new Error('Invalid events response')
  }
  return data
}

export const fetchEventsMetrics = async (): Promise<ApiEventsMetrics> => {
  const { data } = await apiClient.get<ApiEventsMetrics>(
    RELATIVE_API_ROUTES.EVENTS.METRICS
  )
  return data
}
