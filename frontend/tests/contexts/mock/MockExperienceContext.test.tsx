import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/utils/runtimeEnv', () => ({
  isApiMockMode: () => false,
}))

import {
  MockExperienceProvider,
  useMockExperience,
} from '@src/contexts/mock/MockExperienceContext'

const RealModeConsumer = () => {
  const { chatMessages, publishStory, sendMessage, socialPosts } =
    useMockExperience()

  return (
    <>
      <output data-testid="messages">{chatMessages.length}</output>
      <output data-testid="stories">{socialPosts.length}</output>
      <button onClick={() => publishStory('Historia de prueba')}>
        Publicar
      </button>
      <button onClick={() => sendMessage('Mensaje de prueba')}>Enviar</button>
    </>
  )
}

describe('MockExperienceProvider in real API mode', () => {
  test('does not initialize or mutate mock-only state', () => {
    render(
      <MockExperienceProvider>
        <RealModeConsumer />
      </MockExperienceProvider>
    )

    expect(screen.getByTestId('messages')).toHaveTextContent('0')
    expect(screen.getByTestId('stories')).toHaveTextContent('0')

    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(screen.getByTestId('messages')).toHaveTextContent('0')
    expect(screen.getByTestId('stories')).toHaveTextContent('0')
  })
})
