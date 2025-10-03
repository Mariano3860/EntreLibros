import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { EmptyState } from '@src/pages/map/components/common/EmptyState'
import { ErrorBanner } from '@src/pages/map/components/common/ErrorBanner'
import { HeatLayerLegend } from '@src/pages/map/components/common/HeatLayerLegend'
import { SkeletonList } from '@src/pages/map/components/common/SkeletonList'

import { renderWithProviders } from '../../../../test-utils'

describe('Map common components', () => {
  test('renders empty state with and without CTA', () => {
    const handleAction = vi.fn()
    const { rerender } = renderWithProviders(
      <EmptyState
        title="map.empty.title"
        description="map.empty.description"
        actionLabel="map.empty.cta.createCorner"
        onAction={handleAction}
      />
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'map.empty.cta.createCorner' })
    )
    expect(handleAction).toHaveBeenCalled()

    rerender(
      <EmptyState title="map.empty.title" description="map.empty.description" />
    )
    expect(
      screen.queryByRole('button', { name: 'map.empty.cta.createCorner' })
    ).not.toBeInTheDocument()
  })

  test('renders error banner with dismiss button', () => {
    const handleDismiss = vi.fn()
    renderWithProviders(
      <ErrorBanner
        message="map.status.error"
        tone="warning"
        onDismiss={handleDismiss}
      />
    )

    fireEvent.click(screen.getByRole('button'))
    expect(handleDismiss).toHaveBeenCalled()
  })

  test('renders skeleton list with custom count', () => {
    const { container } = renderWithProviders(
      <SkeletonList count={4} className="custom" />
    )

    const skeleton = container.querySelector('.custom') as HTMLElement
    expect(skeleton.children).toHaveLength(4)
  })

  test('renders heat layer legend', () => {
    renderWithProviders(<HeatLayerLegend label="map.activity.legend" />)

    expect(screen.getByText('map.activity.legend')).toBeInTheDocument()
  })
})
