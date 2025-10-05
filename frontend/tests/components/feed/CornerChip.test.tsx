import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { CornerChip } from '@src/components/feed/CornerChip'

import { renderWithProviders } from '../../test-utils'

describe('CornerChip', () => {
  const corner = { id: 'corner-1', name: 'Rincón Centro' }

  test('renders the corner name with the default class name', () => {
    renderWithProviders(<CornerChip corner={corner} />)

    const button = screen.getByRole('button', {
      name: 'community.feed.cornerChip.ariaLabel',
    })

    expect(button).toHaveTextContent('Rincón Centro')
  })

  test('merges custom class names and triggers click handler', () => {
    const onClick = vi.fn()

    renderWithProviders(
      <CornerChip corner={corner} className="highlight" onClick={onClick} />
    )

    const button = screen.getByRole('button', {
      name: 'community.feed.cornerChip.ariaLabel',
    })

    expect(button).toHaveClass('highlight')

    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
