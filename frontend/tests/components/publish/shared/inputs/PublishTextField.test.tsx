import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { PublishTextField } from '@src/components/publish/shared/inputs/PublishTextField'

import { renderWithProviders } from '../../../../test-utils'

describe('PublishTextField', () => {
  test('renders text field with label', () => {
    renderWithProviders(
      <PublishTextField id="test-field" label="Test Label" />
    )

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
  })

  test('renders hint when provided', () => {
    renderWithProviders(
      <PublishTextField
        id="test-field"
        label="Test Label"
        hint="This is a hint"
      />
    )

    expect(screen.getByText('This is a hint')).toBeInTheDocument()
  })

  test('renders error message when provided', () => {
    renderWithProviders(
      <PublishTextField
        id="test-field"
        label="Test Label"
        error="This is an error"
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('This is an error')
  })
})
