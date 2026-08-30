import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test } from 'vitest'

import { FixtureState } from '@src/features/prototype/PrototypeUI'

describe('FixtureState', () => {
  beforeEach(() => window.history.replaceState({}, '', '/'))

  test('isolates an error to its region and recovers without removing the shell', () => {
    window.history.replaceState({}, '', '/?fixture=feed:error')

    render(
      <>
        <div>Shell visible</div>
        <FixtureState region="feed">
          <div>Feed content</div>
        </FixtureState>
        <FixtureState region="activity">
          <div>Activity content</div>
        </FixtureState>
      </>
    )

    expect(screen.getByRole('alert')).toBeVisible()
    expect(screen.getByText('Shell visible')).toBeVisible()
    expect(screen.getByText('Activity content')).toBeVisible()
    expect(screen.queryByText('Feed content')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(screen.getByText('Feed content')).toBeVisible()
    expect(window.location.search).toBe('')
  })

  test('renders explicit global empty and regional loading states', () => {
    window.history.replaceState({}, '', '/?fixture=empty')
    const { rerender } = render(
      <FixtureState region="books">
        <div>Books content</div>
      </FixtureState>
    )

    expect(screen.getByText('Todavía no hay contenido')).toBeVisible()
    expect(screen.queryByText('Books content')).not.toBeInTheDocument()

    window.history.replaceState({}, '', '/?fixture=books:loading')
    rerender(
      <FixtureState key="loading" region="books">
        <div>Books content</div>
      </FixtureState>
    )

    expect(screen.getByText('Cargando books…')).toBeVisible()
  })
})
