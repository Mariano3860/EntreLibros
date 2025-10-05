import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ActivityBar } from '@src/components/feed/ActivityBar'
import styles from '@src/components/feed/ActivityBar.module.scss'

import { renderWithProviders } from '../../test-utils'

const useActivityMock = vi.hoisted(() => vi.fn())

vi.mock('@src/hooks/api/useActivity', () => ({
  useActivity: useActivityMock,
}))

describe('ActivityBar', () => {
  beforeEach(() => {
    useActivityMock.mockReset()
  })

  test('renders an empty bar when there is no activity', () => {
    useActivityMock.mockReturnValue({ data: undefined })

    const { container } = renderWithProviders(<ActivityBar />)

    const bar = container.querySelector(`.${styles.bar}`)
    expect(bar).toBeInTheDocument()
    expect(bar?.children).toHaveLength(0)
  })

  test('renders user avatars and names from activity data', () => {
    useActivityMock.mockReturnValue({
      data: [
        { id: '1', user: 'Ana', avatar: 'https://example.com/ana.png' },
        { id: '2', user: 'Luis', avatar: 'https://example.com/luis.png' },
      ],
    })

    renderWithProviders(<ActivityBar />)

    expect(screen.getByAltText('Ana')).toHaveAttribute(
      'src',
      'https://example.com/ana.png'
    )
    expect(screen.getByText('Luis')).toBeInTheDocument()
  })
})
