import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

export type MvpMetrics = {
  period: { days: number; from: string; to: string }
  zone: string
  status: 'data' | 'no_data'
  activeCorners: number
  activeListings: number
  confirmedAgreements: number
  discoveryTimeMinutes: number | null
  funnel: {
    publications: number
    contacts: number
    agreements: number
    confirmations: number
  }
  lastUpdatedAt: string | null
}

export async function fetchMvpMetrics(input: {
  days: 7 | 30 | 90
  zone?: string
}): Promise<MvpMetrics> {
  const response = await apiClient.get<MvpMetrics>(
    RELATIVE_API_ROUTES.COMMUNITY.METRICS,
    { params: input }
  )
  return response.data
}
