import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

import { CommunityPage } from '@src/pages/community/CommunityPage'
import { renderWithProviders } from '../../test-utils'

describe('CommunityPage', () => {
  test('renders sidebar navigation', () => {
    const { getByRole } = renderWithProviders(<CommunityPage />)
    expect(getByRole('navigation')).toBeInTheDocument()
  })
})
