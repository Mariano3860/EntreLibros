import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi, beforeEach } from 'vitest'

const mockMutate = vi.fn()
const navigate = vi.fn()

vi.mock('@src/hooks/api/useLogin', () => ({
  useLogin: () => ({ mutate: mockMutate, isPending: false }),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

vi.mock('@src/components/ui/toaster/Toaster', () => ({
  showToast: vi.fn(),
}))

import { LoginForm } from '@src/components/login/LoginForm'
import { showToast } from '@src/components/ui/toaster/Toaster'

import { renderWithProviders } from '../../test-utils'

const showToastMock = vi.mocked(showToast)

describe('LoginForm', () => {
  beforeEach(() => {
    mockMutate.mockReset()
    navigate.mockReset()
    showToastMock.mockReset()
  })

  test('submits login form successfully', () => {
    mockMutate.mockImplementation((_data, { onSuccess }) => {
      onSuccess?.({})
    })
    const onSubmit = vi.fn()

    renderWithProviders(<LoginForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByPlaceholderText('email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('password'), {
      target: { value: 'secret' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'login' }))

    expect(mockMutate).toHaveBeenCalledWith(
      { email: 'test@example.com', password: 'secret' },
      expect.any(Object)
    )
    expect(onSubmit).toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith('/home')
    expect(showToastMock).toHaveBeenCalledWith('auth.success.login', 'success')
  })

  test('shows error toast on failure', () => {
    mockMutate.mockImplementation((_data, { onError }) => {
      onError?.(new Error('invalid_credentials'))
    })

    renderWithProviders(
      <LoginForm
        onSubmit={function (): void {
          throw new Error('Function not implemented.')
        }}
      />
    )

    fireEvent.change(screen.getByPlaceholderText('email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('password'), {
      target: { value: 'secret' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'login' }))

    expect(showToastMock).toHaveBeenCalledWith('auth.errors.unknown', 'error')
    expect(navigate).not.toHaveBeenCalled()
  })

  test('handles error with translation key in error message', () => {
    mockMutate.mockImplementation((_data, { onError }) => {
      onError?.(new Error('auth.errors.invalid_credentials'))
    })

    renderWithProviders(<LoginForm onSubmit={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('password'), {
      target: { value: 'secret' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'login' }))

    expect(showToastMock).toHaveBeenCalled()
  })

  test('handles error with custom message', () => {
    mockMutate.mockImplementation((_data, { onError }) => {
      onError?.(new Error('Custom error message'))
    })

    renderWithProviders(<LoginForm onSubmit={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('password'), {
      target: { value: 'secret' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'login' }))

    expect(showToastMock).toHaveBeenCalledWith('Custom error message', 'error')
  })
})
