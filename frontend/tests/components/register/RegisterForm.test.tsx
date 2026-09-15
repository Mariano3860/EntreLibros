import { fireEvent, screen } from '@testing-library/react'
import { useTranslation } from 'react-i18next'
import { describe, expect, test, vi, beforeEach } from 'vitest'

const mockMutate = vi.fn()

vi.mock('@src/hooks/api/useRegister', () => ({
  useRegister: () => ({ mutate: mockMutate, isPending: false }),
}))

vi.mock('@src/components/ui/toaster/Toaster', () => ({
  showToast: vi.fn(),
}))

import { RegisterForm } from '@src/components/register/RegisterForm'
import { showToast } from '@src/components/ui/toaster/Toaster'

import { renderWithProviders } from '../../test-utils'

const showToastMock = vi.mocked(showToast)

describe('RegisterForm', () => {
  beforeEach(() => {
    mockMutate.mockReset()
    showToastMock.mockReset()
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
      target: { value: 'Str0ng!Pass1' },
    })
    fireEvent.change(screen.getByPlaceholderText('confirm_password'), {
      target: { value: '123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'register' }))
    expect(
      await screen.findByText('form.errors.password_mismatch')
    ).toBeVisible()
  })

  test('renders the registration form and validation copy in English', async () => {
    await useTranslation().i18n.changeLanguage('en')
    renderWithProviders(<RegisterForm />)

    expect(
      screen.getByRole('heading', { name: 'Welcome to EntreLibros' })
    ).toBeVisible()
    expect(screen.getByPlaceholderText('Name')).toBeVisible()
    expect(screen.getByPlaceholderText('Email')).toBeVisible()
    expect(screen.getByPlaceholderText('Password')).toBeVisible()
    expect(screen.getByPlaceholderText('Confirm password')).toBeVisible()
    expect(
      screen.getByText(
        'At least 8 characters, with uppercase, lowercase, a number, and a symbol.'
      )
    ).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }))
    expect(await screen.findAllByText('This field is required')).toHaveLength(4)
  })

  test('rejects a password that does not match the backend policy', async () => {
    renderWithProviders(<RegisterForm />)
    fireEvent.change(screen.getByPlaceholderText('name'), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByPlaceholderText('email'), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('password'), {
      target: { value: 'weakpass1' },
    })
    fireEvent.change(screen.getByPlaceholderText('confirm_password'), {
      target: { value: 'weakpass1' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'register' }))

    expect(await screen.findByText('auth.errors.weak_password')).toBeVisible()
    expect(mockMutate).not.toHaveBeenCalled()
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
      target: { value: 'Str0ng!Pass1' },
    })
    fireEvent.change(screen.getByPlaceholderText('confirm_password'), {
      target: { value: 'Str0ng!Pass1' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'register' }))

    await screen.findByRole('button', { name: 'register' })
    expect(mockMutate).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalled()
    expect(showToastMock).toHaveBeenCalledWith(
      'auth.success.register',
      'success'
    )
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
      target: { value: 'Str0ng!Pass1' },
    })
    fireEvent.change(screen.getByPlaceholderText('confirm_password'), {
      target: { value: 'Str0ng!Pass1' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'register' }))

    await screen.findByRole('button', { name: 'register' })
    expect(showToastMock).toHaveBeenCalledWith('auth.errors.unknown', 'error')
  })

  test('handles error with message property', async () => {
    mockMutate.mockImplementation((_data, { onError }) => {
      onError?.({ message: 'Email already exists' })
    })

    renderWithProviders(<RegisterForm />)

    fireEvent.change(screen.getByPlaceholderText('name'), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByPlaceholderText('email'), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('password'), {
      target: { value: 'Str0ng!Pass1' },
    })
    fireEvent.change(screen.getByPlaceholderText('confirm_password'), {
      target: { value: 'Str0ng!Pass1' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'register' }))

    await screen.findByRole('button', { name: 'register' })
    expect(showToastMock).toHaveBeenCalledWith('auth.errors.unknown', 'error')
  })
})
