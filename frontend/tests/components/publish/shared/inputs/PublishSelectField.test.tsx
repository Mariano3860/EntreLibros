import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { PublishSelectField } from '@src/components/publish/shared/inputs/PublishSelectField'

import { renderWithProviders } from '../../../../test-utils'

describe('PublishSelectField', () => {
  test('renders select field with label and options', () => {
    renderWithProviders(
      <PublishSelectField id="test-select" label="Test Label">
        <option value="opt1">Option 1</option>
        <option value="opt2">Option 2</option>
      </PublishSelectField>
    )

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  test('renders hint when provided', () => {
    renderWithProviders(
      <PublishSelectField
        id="test-select"
        label="Test Label"
        hint="This is a hint"
      >
        <option value="opt1">Option 1</option>
      </PublishSelectField>
    )

    expect(screen.getByText('This is a hint')).toBeInTheDocument()
  })

  test('renders error message when provided', () => {
    renderWithProviders(
      <PublishSelectField
        id="test-select"
        label="Test Label"
        error="This is an error"
      >
        <option value="opt1">Option 1</option>
      </PublishSelectField>
    )

    expect(screen.getByRole('alert')).toHaveTextContent('This is an error')
  })

  test('sets aria-invalid when error is present', () => {
    renderWithProviders(
      <PublishSelectField
        id="test-select"
        label="Test Label"
        error="This is an error"
      >
        <option value="opt1">Option 1</option>
      </PublishSelectField>
    )

    const select = screen.getByLabelText('Test Label')
    expect(select).toHaveAttribute('aria-invalid', 'true')
  })

  test('does not set aria-invalid when no error', () => {
    renderWithProviders(
      <PublishSelectField id="test-select" label="Test Label">
        <option value="opt1">Option 1</option>
      </PublishSelectField>
    )

    const select = screen.getByLabelText('Test Label')
    expect(select).toHaveAttribute('aria-invalid', 'false')
  })
})
