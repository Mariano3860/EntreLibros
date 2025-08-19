import { screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

import { ContactPage } from '@src/pages/contact/ContactPage'
import { renderWithProviders } from '../../test-utils'

describe('ContactPage', () => {
  test('renders contact form title', () => {
    renderWithProviders(<ContactPage />)
    expect(screen.getByText('contact.title')).toBeVisible()
  })
})
