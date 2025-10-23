import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { PublishSegmentedControl } from '@src/components/publish/shared/inputs/PublishSegmentedControl'

import { renderWithProviders } from '../../../../test-utils'

describe('PublishSegmentedControl', () => {
  const mockOnChange = vi.fn()
  const options = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3' },
  ]

  test('renders segmented control with label and options', () => {
    renderWithProviders(
      <PublishSegmentedControl
        id="test-control"
        label="Test Label"
        value="opt1"
        options={options}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
    expect(screen.getByText('Option 3')).toBeInTheDocument()
  })

  test('renders hint when provided', () => {
    renderWithProviders(
      <PublishSegmentedControl
        id="test-control"
        label="Test Label"
        value="opt1"
        options={options}
        onChange={mockOnChange}
        hint="This is a hint"
      />
    )

    expect(screen.getByText('This is a hint')).toBeInTheDocument()
  })

  test('renders error message when provided', () => {
    renderWithProviders(
      <PublishSegmentedControl
        id="test-control"
        label="Test Label"
        value="opt1"
        options={options}
        onChange={mockOnChange}
        error="This is an error"
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('This is an error')
  })

  test('calls onChange when option is clicked', () => {
    renderWithProviders(
      <PublishSegmentedControl
        id="test-control"
        label="Test Label"
        value="opt1"
        options={options}
        onChange={mockOnChange}
      />
    )

    const option2Button = screen.getByText('Option 2')
    fireEvent.click(option2Button)

    expect(mockOnChange).toHaveBeenCalledWith('opt2')
  })

  test('marks selected option with aria-pressed', () => {
    renderWithProviders(
      <PublishSegmentedControl
        id="test-control"
        label="Test Label"
        value="opt2"
        options={options}
        onChange={mockOnChange}
      />
    )

    const option2Button = screen.getByText('Option 2')
    expect(option2Button).toHaveAttribute('aria-pressed', 'true')

    const option1Button = screen.getByText('Option 1')
    expect(option1Button).toHaveAttribute('aria-pressed', 'false')
  })
})
