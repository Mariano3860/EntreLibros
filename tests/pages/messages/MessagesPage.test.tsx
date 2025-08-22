import { fireEvent } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { MessagesPage } from '@src/pages/messages/MessagesPage'

import { renderWithProviders } from '../../test-utils'

describe('MessagesPage', () => {
  test('loads and displays messages', async () => {
    const { findByText } = renderWithProviders(<MessagesPage />)
    expect(await findByText('Hola!')).toBeInTheDocument()
  })

  test('allows sending a message', async () => {
    const { getByRole, findByText } = renderWithProviders(<MessagesPage />)
    const input = getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Nuevo mensaje' } })
    fireEvent.click(getByRole('button', { name: 'community.messages.send' }))
    expect(await findByText('Nuevo mensaje')).toBeInTheDocument()
  })
})
