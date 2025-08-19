import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi, beforeEach } from 'vitest'

const mockMutate = vi.fn()

vi.mock('../../../src/hooks/api/useRegister', () => ({
  useRegister: () => ({ mutate: mockMutate, isPending: false }),
}))

vi.mock('../../../src/components/ui/toaster/Toaster', () => ({
  showToast: vi.fn(),
}))

import { RegisterForm } from '../../../src/components/register/RegisterForm'
import { showToast } from '../../../src/components/ui/toaster/Toaster'
import { renderWithProviders } from '../../test-utils'

describe('RegisterForm', () => {
  beforeEach(() => {
    mockMutate.mockReset()
    showToast.mockReset()
  })

  test('shows validation errors for required fields', async () => {
    renderWithProviders(<RegisterForm />)
    fireEvent.click(screen.getByRole('button', { name: 'register' }))
    expect(await screen.findAllByText('form.errors.required')).toHaveLength(4)
  })

  test('shows password mismatch error', async () => {
    renderWithProviders(<RegisterForm />)
    fireEvent.change(screen.getByPlaceholderText('name'), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByPlaceholderText('email'), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('password'), {
      target: { value: '123456' },
    })
    fireEvent.change(screen.getByPlaceholderText('confirm_password'), {
      target: { value: '123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'register' }))
    expect(
      await screen.findByText('form.errors.password_mismatch')
    ).toBeVisible()
  })

  test('submits form and calls onSubmit on success', async () => {
    mockMutate.mockImplementation((_data, { onSuccess }) => {
      onSuccess?.({})
    })
    const onSubmit = vi.fn()

    renderWithProviders(<RegisterForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByPlaceholderText('name'), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByPlaceholderText('email'), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('password'), {
      target: { value: '123456' },
    })
    fireEvent.change(screen.getByPlaceholderText('confirm_password'), {
      target: { value: '123456' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'register' }))

    await screen.findByRole('button', { name: 'register' })
    expect(mockMutate).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalled()
    expect(showToast).toHaveBeenCalledWith('auth.success.register', 'success')
  })

  test('shows server error message on failure', async () => {
    mockMutate.mockImplementation((_data, { onError }) => {
      onError?.({})
    })

    renderWithProviders(<RegisterForm />)

    fireEvent.change(screen.getByPlaceholderText('name'), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByPlaceholderText('email'), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('password'), {
      target: { value: '123456' },
    })
    fireEvent.change(screen.getByPlaceholderText('confirm_password'), {
      target: { value: '123456' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'register' }))

    await screen.findByRole('button', { name: 'register' })
    expect(showToast).toHaveBeenCalledWith('auth.errors.unknown', 'error')
  })
})
