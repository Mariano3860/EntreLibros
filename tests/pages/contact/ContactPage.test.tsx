import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { ContactPage } from '../../../src/pages/contact/ContactPage'

import { renderWithProviders } from '../../test-utils'

describe('ContactPage', () => {
  test('renders contact form title', () => {
    renderWithProviders(<ContactPage />)
    expect(screen.getByText('contact.title')).toBeVisible()
  })
})
