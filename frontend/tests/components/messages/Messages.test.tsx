import { Messages } from '@components/messages/Messages'
import { fireEvent } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { renderWithProviders } from '../../test-utils'

vi.mock('@hooks/socket/useChatSocket', () => ({
  useChatSocket: () => ({
    messages: [],
    sendMessage: vi.fn(),
    currentUser: { id: 1, name: 'Me' },
    isConnected: false,
    error: 'fail',
  }),
}))

describe('Messages component', () => {
  test('shows offline state and disables input', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <Messages />
    )
    expect(
      getByText('community.messages.chat.offlineWithError')
    ).toBeInTheDocument()
    expect(
      getByPlaceholderText('community.messages.chat.inputPlaceholder')
    ).toBeDisabled()
  })

  test('renders agreement flow with proposal, reminders and post-check', () => {
    const { getByText, getAllByText } = renderWithProviders(<Messages />)

    expect(
      getByText('community.messages.chat.labels.proposal')
    ).toBeInTheDocument()
    expect(getAllByText('Rincón Parque Central')[0]).toBeInTheDocument()
    expect(getByText('¿Se concretó el intercambio?')).toBeInTheDocument()
    expect(
      getAllByText('community.messages.chat.actions.confirm')[0]
    ).toBeInTheDocument()
  })

  test('opens template menu from shortcut button', () => {
    const { getByRole, getByText } = renderWithProviders(<Messages />)
    const button = getByRole('button', {
      name: 'community.messages.chat.templateButton',
    })
    fireEvent.click(button)

    expect(
      getByText('community.messages.chat.templates.interest.label')
    ).toBeInTheDocument()
    expect(
      getByText('community.messages.chat.templates.interest.text')
    ).toBeInTheDocument()
  })
})
