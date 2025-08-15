import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import NotFound from '../src/pages/not_found/NotFound'

describe('NotFound page', () => {
  test('shows 404 message', () => {
    render(<NotFound />)
    expect(screen.getByText('404 - Page Not Found')).toBeVisible()
  })
})
