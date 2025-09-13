import { describe, expect, test } from 'vitest'

import { MessagesPage } from '@src/pages/messages/MessagesPage'

import { renderWithProviders } from '../../test-utils'

describe('MessagesPage', () => {
  test('renders message input', () => {
    const { getByPlaceholderText } = renderWithProviders(<MessagesPage />)
    expect(getByPlaceholderText('Message...')).toBeInTheDocument()
  })
})
