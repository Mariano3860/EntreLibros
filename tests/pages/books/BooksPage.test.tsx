import { describe, expect, test } from 'vitest'

import { BooksPage } from '../../../src/pages/books/BooksPage'
import { renderWithProviders } from '../../test-utils'

describe('BooksPage', () => {
  test('renders sidebar navigation', () => {
    const { getByRole } = renderWithProviders(<BooksPage />)
    expect(getByRole('navigation')).toBeInTheDocument()
  })
})
