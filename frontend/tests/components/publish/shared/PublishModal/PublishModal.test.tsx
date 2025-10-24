import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { PublishModal } from '@src/components/publish/shared/PublishModal/PublishModal'

import { renderWithProviders } from '../../../../test-utils'

describe('PublishModal', () => {
  test('does not render when isOpen is false', () => {
    renderWithProviders(
      <PublishModal isOpen={false} title="Test Modal">
        <div>Modal Content</div>
      </PublishModal>
    )

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
  })

  test('renders modal when isOpen is true', () => {
    renderWithProviders(
      <PublishModal isOpen={true} title="Test Modal">
        <div>Modal Content</div>
      </PublishModal>
    )

    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  test('renders subtitle when provided', () => {
    renderWithProviders(
      <PublishModal isOpen={true} title="Test Modal" subtitle="Test Subtitle">
        <div>Modal Content</div>
      </PublishModal>
    )

    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
  })

  test('does not render subtitle when not provided', () => {
    const { container } = renderWithProviders(
      <PublishModal isOpen={true} title="Test Modal">
        <div>Modal Content</div>
      </PublishModal>
    )

    expect(container.querySelector('.subtitle')).not.toBeInTheDocument()
  })

  test('renders close button when onClose is provided', () => {
    const mockOnClose = vi.fn()

    renderWithProviders(
      <PublishModal isOpen={true} title="Test Modal" onClose={mockOnClose}>
        <div>Modal Content</div>
      </PublishModal>
    )

    expect(screen.getByText('Cerrar')).toBeInTheDocument()
  })

  test('does not render close button when onClose is not provided', () => {
    renderWithProviders(
      <PublishModal isOpen={true} title="Test Modal">
        <div>Modal Content</div>
      </PublishModal>
    )

    expect(screen.queryByText('Cerrar')).not.toBeInTheDocument()
  })

  test('calls onClose when close button is clicked', () => {
    const mockOnClose = vi.fn()

    renderWithProviders(
      <PublishModal isOpen={true} title="Test Modal" onClose={mockOnClose}>
        <div>Modal Content</div>
      </PublishModal>
    )

    const closeButton = screen.getByText('Cerrar')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  test('renders custom close label when provided', () => {
    const mockOnClose = vi.fn()

    renderWithProviders(
      <PublishModal
        isOpen={true}
        title="Test Modal"
        onClose={mockOnClose}
        closeLabel="Close"
      >
        <div>Modal Content</div>
      </PublishModal>
    )

    expect(screen.getByText('Close')).toBeInTheDocument()
  })

  test('renders footer when provided', () => {
    renderWithProviders(
      <PublishModal isOpen={true} title="Test Modal" footer={<div>Footer</div>}>
        <div>Modal Content</div>
      </PublishModal>
    )

    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  test('does not render footer when not provided', () => {
    const { container } = renderWithProviders(
      <PublishModal isOpen={true} title="Test Modal">
        <div>Modal Content</div>
      </PublishModal>
    )

    expect(container.querySelector('footer')).not.toBeInTheDocument()
  })

  test('renders header actions when provided', () => {
    renderWithProviders(
      <PublishModal
        isOpen={true}
        title="Test Modal"
        headerActions={<button>Action</button>}
      >
        <div>Modal Content</div>
      </PublishModal>
    )

    expect(screen.getByText('Action')).toBeInTheDocument()
  })
})
