import { screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { UserActivityItem } from '@src/components/user/UserActivityItem'

import { renderWithProviders } from '../../test-utils'

// Mock date-fns to have consistent timestamps
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns')
  return {
    ...actual,
    formatDistanceToNow: () => '2 hours ago',
  }
})

describe('UserActivityItem', () => {
  test('renders activity item with added action', () => {
    renderWithProviders(
      <UserActivityItem
        bookTitle="1984"
        action="added"
        coverUrl="https://example.com/cover.jpg"
        timestamp="2025-01-01T00:00:00Z"
      />
    )

    expect(screen.getByText('activity.added')).toBeInTheDocument()
    expect(screen.getByText('1984')).toBeInTheDocument()
    expect(screen.getByText('2 hours ago')).toBeInTheDocument()
    expect(screen.getByAltText('activity.cover_alt')).toBeInTheDocument()
  })

  test('renders activity item with exchanged action', () => {
    renderWithProviders(
      <UserActivityItem
        bookTitle="The Great Gatsby"
        action="exchanged"
        coverUrl="https://example.com/gatsby.jpg"
        timestamp="2025-01-01T00:00:00Z"
      />
    )

    expect(screen.getByText('activity.exchanged')).toBeInTheDocument()
    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument()
    expect(screen.getByText('2 hours ago')).toBeInTheDocument()
  })
})
