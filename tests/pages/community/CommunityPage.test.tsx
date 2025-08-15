import { describe, expect, test } from 'vitest'

import { CommunityPage } from '../../../src/pages/community/CommunityPage'
import { renderWithProviders } from '../../test-utils'

describe('CommunityPage', () => {
  test('renders sidebar navigation', () => {
    const { getByRole } = renderWithProviders(<CommunityPage />)
    expect(getByRole('navigation')).toBeInTheDocument()
  })
})
