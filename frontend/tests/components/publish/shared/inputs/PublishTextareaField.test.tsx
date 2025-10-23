import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { PublishTextareaField } from '@src/components/publish/shared/inputs/PublishTextareaField'

import { renderWithProviders } from '../../../../test-utils'

describe('PublishTextareaField', () => {
  test('renders textarea field with label', () => {
    renderWithProviders(
      <PublishTextareaField id="test-field" label="Test Label" />
    )

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
  })

  test('renders hint when provided', () => {
    renderWithProviders(
      <PublishTextareaField
        id="test-field"
        label="Test Label"
        hint="This is a hint"
      />
    )

    expect(screen.getByText('This is a hint')).toBeInTheDocument()
  })

  test('renders error message when provided', () => {
    renderWithProviders(
      <PublishTextareaField
        id="test-field"
        label="Test Label"
        error="This is an error"
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('This is an error')
  })
})
