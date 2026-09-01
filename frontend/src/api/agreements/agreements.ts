import { apiClient } from '../axios'
import { RELATIVE_API_ROUTES } from '../routes'

export type AgreementDetails = {
  meetingPoint: string
  area: string
  date: string
  time: string
  bookTitle: string
}

export type AgreementSnapshot = {
  id: number
  conversationId: number
  proposerId: number
  participantId: number
  state:
    | 'proposed'
    | 'partially_confirmed'
    | 'confirmed'
    | 'cancelled'
    | 'rejected'
    | 'completed'
  currentVersion: number
  details: AgreementDetails
  acceptances: number[]
  listingIds: number[]
}

export type AgreementHistoryEntry = {
  agreementId: number
  version: number
  actorId: number
  state: AgreementSnapshot['state']
  details: AgreementDetails
  createdAt: string
}

export const agreementQueryKeys = {
  all: ['agreements'] as const,
  detail: (agreementId: number) =>
    [...agreementQueryKeys.all, agreementId] as const,
}

export async function createAgreement(input: {
  conversationId: number
  participantId: number
  details: AgreementDetails
  listingIds?: number[]
}): Promise<AgreementSnapshot> {
  const response = await apiClient.post<{ agreement: AgreementSnapshot }>(
    RELATIVE_API_ROUTES.AGREEMENTS.CREATE,
    input
  )
  return response.data.agreement
}

export async function fetchAgreement(
  agreementId: number
): Promise<AgreementSnapshot> {
  const response = await apiClient.get<{ agreement: AgreementSnapshot }>(
    RELATIVE_API_ROUTES.AGREEMENTS.GET(agreementId)
  )
  return response.data.agreement
}

export async function fetchAgreementHistory(
  agreementId: number
): Promise<AgreementHistoryEntry[]> {
  const response = await apiClient.get<{ history: AgreementHistoryEntry[] }>(
    RELATIVE_API_ROUTES.AGREEMENTS.HISTORY(agreementId)
  )
  return response.data.history
}

export async function commandAgreement(input: {
  agreementId: number
  command: 'confirm' | 'cancel' | 'reject' | 'complete'
  expectedVersion: number
  reason?: string
}): Promise<AgreementSnapshot> {
  const response = await apiClient.post<{ agreement: AgreementSnapshot }>(
    RELATIVE_API_ROUTES.AGREEMENTS.COMMAND(input.agreementId),
    input
  )
  return response.data.agreement
}

export async function counterProposeAgreement(input: {
  agreementId: number
  expectedVersion: number
  details: AgreementDetails
}): Promise<AgreementSnapshot> {
  const response = await apiClient.post<{ agreement: AgreementSnapshot }>(
    RELATIVE_API_ROUTES.AGREEMENTS.VERSION(input.agreementId),
    input
  )
  return response.data.agreement
}
