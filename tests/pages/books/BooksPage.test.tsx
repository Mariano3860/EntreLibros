import { describe, expect, test, vi } from 'vitest'

vi.mock('../../../src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

import { BooksPage } from '../../../src/pages/books/BooksPage'
import { renderWithProviders } from '../../test-utils'

describe('BooksPage', () => {
  test('renders sidebar navigation', () => {
    const { getByRole } = renderWithProviders(<BooksPage />)
    expect(getByRole('navigation')).toBeInTheDocument()
  })
})
