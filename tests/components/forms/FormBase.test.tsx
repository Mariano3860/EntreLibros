import { FormBase } from '@components/forms/base/FormBase'
import type {
  FormBaseRef,
  FormField,
} from '@components/forms/base/FormBase.types'
import { fireEvent, screen, act } from '@testing-library/react'
import React from 'react'
import { describe, expect, test, vi } from 'vitest'

import { renderWithProviders } from '../../test-utils'

const fields: FormField[] = [
  {
    name: 'name',
    label: 'name_label',
    type: 'text',
    required: true,
    minLength: 2,
    placeholder: 'name_placeholder',
  },
  {
    name: 'email',
    label: 'email_label',
    type: 'email',
    required: true,
    placeholder: 'email_placeholder',
  },
  {
    name: 'message',
    label: 'message_label',
    type: 'textarea',
    required: true,
    minLength: 10,
    placeholder: 'message_placeholder',
  },
]

describe('FormBase', () => {
  test('validates fields and submits data', async () => {
    const onSubmit = vi.fn()
    const ref = React.createRef<FormBaseRef>()

    renderWithProviders(
      <FormBase
        ref={ref}
        fields={fields}
        onSubmit={onSubmit}
        submitLabel="send"
      />
    )

    fireEvent.click(screen.getByRole('button'))
    expect(onSubmit).not.toHaveBeenCalled()
    expect((await screen.findAllByText(/form\.errors\./)).length).toBe(3)

    fireEvent.change(screen.getByPlaceholderText('name_placeholder'), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByPlaceholderText('email_placeholder'), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('message_placeholder'), {
      target: { value: 'this is long enough' },
    })
    fireEvent.click(screen.getByRole('button'))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John',
      email: 'john@example.com',
      message: 'this is long enough',
    })
  })

  test('resets form through ref', () => {
    const onSubmit = vi.fn()
    const ref = React.createRef<FormBaseRef>()

    renderWithProviders(
      <FormBase ref={ref} fields={fields} onSubmit={onSubmit} />
    )

    fireEvent.change(screen.getByPlaceholderText('name_placeholder'), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByPlaceholderText('email_placeholder'), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('message_placeholder'), {
      target: { value: 'this is long enough' },
    })

    act(() => {
      ref.current?.resetForm()
    })

    expect(screen.getByPlaceholderText('name_placeholder')).toHaveValue('')
    expect(screen.getByPlaceholderText('email_placeholder')).toHaveValue('')
    expect(screen.getByPlaceholderText('message_placeholder')).toHaveValue('')
  })
})
