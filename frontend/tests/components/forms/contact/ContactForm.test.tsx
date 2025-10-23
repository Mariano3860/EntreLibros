import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { ContactForm } from '@src/components/forms/contact/ContactForm'

import { renderWithProviders } from '../../../test-utils'

const mockMutate = vi.fn()
const mockUseContactForm = vi.fn(() => ({
  mutate: mockMutate,
  isPending: false,
}))

vi.mock('@hooks/api/useContactForm', () => ({
  useContactForm: (onSuccess: () => void) => mockUseContactForm(onSuccess),
}))

describe('ContactForm', () => {
  test('renders contact form with all fields', () => {
    renderWithProviders(<ContactForm />)

    expect(screen.getByText('contact.title')).toBeInTheDocument()
    expect(screen.getByLabelText('contact.name_label')).toBeInTheDocument()
    expect(screen.getByLabelText('contact.email_label')).toBeInTheDocument()
    expect(screen.getByLabelText('contact.message_label')).toBeInTheDocument()
    expect(screen.getByText('contact.submit_button')).toBeInTheDocument()
  })

  test('submits form with valid data', async () => {
    renderWithProviders(<ContactForm />)

    fireEvent.change(screen.getByLabelText('contact.name_label'), {
      target: { value: 'John Doe' },
    })
    fireEvent.change(screen.getByLabelText('contact.email_label'), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByLabelText('contact.message_label'), {
      target: { value: 'This is a test message with more than 10 characters' },
    })

    const submitButton = screen.getByText('contact.submit_button')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message with more than 10 characters',
      })
    })
  })
})
