import { describe, expect, it, vi } from 'vitest'

import { apiClient } from '@api/axios'
import { fetchMvpMetrics } from '@api/community/mvpMetrics.service'
import { createReport } from '@api/reports/reports'
import { fetchPublicProfile } from '@api/user/profile.service'

describe('MVP readiness API clients', () => {
  it('loads metrics with period and zone filters', async () => {
    const metrics = {
      status: 'no_data' as const,
      period: {
        days: 7,
        from: '2026-08-27T00:00:00.000Z',
        to: '2026-09-03T00:00:00.000Z',
      },
      zone: 'Palermo',
      activeCorners: 0,
      activeListings: 0,
      confirmedAgreements: 0,
      discoveryTimeMinutes: null,
      funnel: { publications: 0, contacts: 0, agreements: 0, confirmations: 0 },
      lastUpdatedAt: null,
    }
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: metrics })

    await expect(
      fetchMvpMetrics({ days: 7, zone: 'Palermo' })
    ).resolves.toEqual(metrics)
    expect(apiClient.get).toHaveBeenCalledWith('/community/metrics', {
      params: { days: 7, zone: 'Palermo' },
    })
  })

  it('creates reports and fetches public profiles through the shared client', async () => {
    const report = {
      id: 3,
      targetType: 'conduct' as const,
      targetId: '7',
      reason: 'Motivo',
      status: 'received' as const,
      channel: 'support',
      dueAt: '2026-09-06T00:00:00.000Z',
      createdAt: '2026-09-03T00:00:00.000Z',
    }
    const profile = {
      id: 7,
      alias: 'Lectora',
      profileDescription: null,
      profilePhoto: null,
      language: 'es',
      location: null,
      interests: [],
    }
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { report } })
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: profile })

    await expect(
      createReport({ targetType: 'conduct', targetId: '7', reason: 'Motivo' })
    ).resolves.toEqual(report)
    await expect(fetchPublicProfile(7)).resolves.toEqual(profile)
    expect(apiClient.post).toHaveBeenCalledWith('/reports', {
      targetType: 'conduct',
      targetId: '7',
      reason: 'Motivo',
    })
    expect(apiClient.get).toHaveBeenCalledWith('/user/profile/7')
  })
})
