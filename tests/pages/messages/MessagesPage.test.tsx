import { describe, expect, test } from 'vitest'

import { MessagesPage } from '@src/pages/messages/MessagesPage'

import { renderWithProviders } from '../../test-utils'

describe('MessagesPage', () => {
  test('shows messages placeholder', () => {
    const { getByText } = renderWithProviders(<MessagesPage />)
    expect(getByText('community.messages.placeholder')).toBeInTheDocument()
  })
})
