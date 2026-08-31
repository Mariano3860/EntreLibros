import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/utils/runtimeEnv', () => ({
  isApiMockMode: () => false,
}))

import {
  PrototypeProvider,
  usePrototype,
} from '@src/features/prototype/PrototypeContext'

const RealModeConsumer = () => {
  const {
    chatMessages,
    publishStory,
    sendMessage,
    socialPosts,
    supportSent,
    sendSupport,
  } = usePrototype()

  return (
    <>
      <output data-testid="messages">{chatMessages.length}</output>
      <output data-testid="stories">{socialPosts.length}</output>
      <output data-testid="support">{String(supportSent)}</output>
      <button onClick={() => publishStory('Historia de prueba')}>
        Publicar
      </button>
      <button onClick={() => sendMessage('Mensaje de prueba')}>Enviar</button>
      <button onClick={sendSupport}>Soporte</button>
    </>
  )
}

describe('PrototypeProvider in real API mode', () => {
  test('does not initialize or mutate prototype-only state', () => {
    render(
      <PrototypeProvider>
        <RealModeConsumer />
      </PrototypeProvider>
    )

    expect(screen.getByTestId('messages')).toHaveTextContent('0')
    expect(screen.getByTestId('stories')).toHaveTextContent('0')
    expect(screen.getByTestId('support')).toHaveTextContent('false')

    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Soporte' }))

    expect(screen.getByTestId('messages')).toHaveTextContent('0')
    expect(screen.getByTestId('stories')).toHaveTextContent('0')
    expect(screen.getByTestId('support')).toHaveTextContent('false')
  })
})
