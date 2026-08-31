import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { CreateCornerFab } from '@src/components/map/CreateCornerFab/CreateCornerFab'

import { renderWithProviders } from '../../test-utils'

describe('CreateCornerFab', () => {
  test('renders the create action and calls its handler', () => {
    const onClick = vi.fn()
    renderWithProviders(<CreateCornerFab onClick={onClick} />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })
})
