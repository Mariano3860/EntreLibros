import { describe, expect, test } from 'vitest'

import { CommunityFeedPage } from '@src/pages/community/CommunityFeedPage'

import { renderWithProviders } from '../../test-utils'

describe('CommunityFeedPage', () => {
  test('renders feed header and filters', () => {
    const { getByText, getByLabelText } = renderWithProviders(
      <CommunityFeedPage />
    )
    expect(getByText('community.title')).toBeInTheDocument()
    expect(getByLabelText('community.feed.search')).toBeInTheDocument()
    expect(getByText('community.feed.tabs.all')).toBeInTheDocument()
  })
})
