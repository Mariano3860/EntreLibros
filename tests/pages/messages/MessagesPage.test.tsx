import { describe, expect, test } from 'vitest'

import { MessagesPage } from '@src/pages/messages/MessagesPage'

import { renderWithProviders } from '../../test-utils'

describe('MessagesPage', () => {
  test('renders conversations list', () => {
    const { getByText } = renderWithProviders(<MessagesPage />)
    expect(getByText('Laura')).toBeInTheDocument()
  })
})
