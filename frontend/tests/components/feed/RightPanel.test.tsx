import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { RightPanel } from '@src/components/feed/RightPanel'
import styles from '@src/components/feed/RightPanel.module.scss'

import { renderWithProviders } from '../../test-utils'

const useSuggestionsMock = vi.hoisted(() => vi.fn())
const cornersMiniMapMock = vi.hoisted(() =>
  vi.fn(() => <div data-testid="mini-map" />)
)

vi.mock('@components/community/corners/CornersMiniMap', () => ({
  CornersMiniMap: cornersMiniMapMock,
}))

vi.mock('@src/hooks/api/useSuggestions', () => ({
  useSuggestions: useSuggestionsMock,
}))

describe('RightPanel', () => {
  beforeEach(() => {
    useSuggestionsMock.mockReset()
    cornersMiniMapMock.mockClear()
  })

  test('renders the suggestions heading and the mini map', () => {
    useSuggestionsMock.mockReturnValue({ data: undefined })

    const { container } = renderWithProviders(<RightPanel />)

    expect(screen.getByTestId('mini-map')).toBeInTheDocument()

    const heading = screen.getByRole('heading', {
      name: 'community.feed.suggestions',
      level: 2,
    })
    expect(heading).toBeInTheDocument()

    const panel = container.querySelector(`.${styles.panel}`)
    expect(panel).toBeInTheDocument()
  })

  test('lists user suggestions when data is available', () => {
    useSuggestionsMock.mockReturnValue({
      data: [
        {
          id: 'suggestion-1',
          user: 'Clara',
          avatar: 'https://example.com/clara.png',
        },
        {
          id: 'suggestion-2',
          user: 'Miguel',
          avatar: 'https://example.com/miguel.png',
        },
      ],
    })

    renderWithProviders(<RightPanel />)

    expect(screen.getByText('Clara')).toBeInTheDocument()
    expect(screen.getByAltText('Miguel')).toHaveAttribute(
      'src',
      'https://example.com/miguel.png'
    )
  })
})
