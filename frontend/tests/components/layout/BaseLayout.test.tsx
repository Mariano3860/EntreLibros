import { screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { BaseLayout } from '@src/components/layout/BaseLayout/BaseLayout'
import styles from '@src/components/layout/BaseLayout/BaseLayout.module.scss'

import { renderWithProviders } from '../../test-utils'

vi.mock('@src/components/sidebar/Sidebar', () => ({
  Sidebar: () => <nav data-testid="sidebar">Sidebar</nav>,
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Mock Outlet</div>,
  }
})

describe('BaseLayout', () => {
  test('renders provided children with container and main attributes', () => {
    renderWithProviders(
      <BaseLayout
        id="main-layout"
        className="custom-container"
        mainClassName="custom-main"
      >
        <p>Child content</p>
      </BaseLayout>
    )

    const child = screen.getByText('Child content')
    const main = screen.getByRole('main')
    expect(child).toBeInTheDocument()
    expect(main).toHaveClass('custom-main')
    expect(main).toHaveClass(styles.mainContent)
    expect(main).toHaveAttribute('id', 'main-layout-content')

    const container = main.parentElement as HTMLElement
    expect(container).not.toBeNull()
    expect(container).toHaveClass('custom-container')
    expect(container).toHaveClass(styles.baseLayout)
    expect(container).toHaveAttribute('id', 'main-layout-container')
  })

  test('renders the outlet when no children are provided', () => {
    renderWithProviders(<BaseLayout />)

    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })
})
