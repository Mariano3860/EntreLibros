import { describe, expect, it, vi } from 'vitest'

import { apiClient } from '@api/axios'
import {
  agreementQueryKeys,
  commandAgreement,
  counterProposeAgreement,
  createAgreement,
  fetchAgreement,
  fetchAgreementHistory,
  recordAgreementOutcome,
} from '@api/agreements/agreements'

const details = {
  meetingPoint: 'Biblioteca',
  area: 'Centro',
  date: '2026-09-01',
  time: '18:00',
  bookTitle: 'Dune',
}

describe('agreements API client', () => {
  it('serializes proposal and counterproposal payloads', async () => {
    const agreement = { id: 8, currentVersion: 1, details }
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { agreement } })
    await expect(
      createAgreement({ conversationId: 4, participantId: 2, details })
    ).resolves.toEqual(agreement)
    expect(apiClient.post).toHaveBeenCalledWith('/agreements', {
      conversationId: 4,
      participantId: 2,
      details,
    })

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { agreement } })
    await counterProposeAgreement({
      agreementId: 8,
      expectedVersion: 1,
      details,
    })
    expect(apiClient.post).toHaveBeenCalledWith('/agreements/8/versions', {
      agreementId: 8,
      expectedVersion: 1,
      details,
    })
  })

  it('preserves history and command conflict inputs', async () => {
    const history = [{ agreementId: 8, version: 1, actorId: 2, details }]
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: { history } })
    await expect(fetchAgreementHistory(8)).resolves.toEqual(history)

    const agreement = { id: 8, currentVersion: 2, details }
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { agreement } })
    await expect(
      commandAgreement({
        agreementId: 8,
        command: 'confirm',
        expectedVersion: 1,
      })
    ).resolves.toEqual(agreement)
    expect(apiClient.post).toHaveBeenCalledWith('/agreements/8/commands', {
      agreementId: 8,
      command: 'confirm',
      expectedVersion: 1,
    })
    expect(agreementQueryKeys.detail(8)).toEqual(['agreements', 8])
  })

  it('loads an agreement and records a private outcome', async () => {
    const agreement = { id: 8, currentVersion: 2, details }
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: { agreement } })
    await expect(fetchAgreement(8)).resolves.toEqual(agreement)
    expect(apiClient.get).toHaveBeenCalledWith('/agreements/8')

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { agreement } })
    await expect(
      recordAgreementOutcome({
        agreementId: 8,
        outcome: 'completed',
        reason: 'Encuentro realizado',
      })
    ).resolves.toEqual(agreement)
    expect(apiClient.post).toHaveBeenCalledWith('/agreements/8/outcome', {
      agreementId: 8,
      outcome: 'completed',
      reason: 'Encuentro realizado',
    })
  })
})
