import { apiClient } from '@src/api/axios'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

export type ReportTargetType = 'content' | 'conduct' | 'corner_missing'

export type ApiReport = {
  id: number
  targetType: ReportTargetType
  targetId: string
  reason: string
  status: 'received' | 'in_review' | 'resolved' | 'dismissed'
  channel: string
  dueAt: string
  createdAt: string
}

export async function createReport(input: {
  targetType: ReportTargetType
  targetId: string
  reason: string
}): Promise<ApiReport> {
  const response = await apiClient.post<{ report: ApiReport }>(
    RELATIVE_API_ROUTES.REPORTS.CREATE,
    input
  )
  return response.data.report
}
