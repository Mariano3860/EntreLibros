import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { TabsMenu } from '@src/components/ui/tabs-menu/TabsMenu'

import { renderWithProviders } from '../../../test-utils'

describe('TabsMenu', () => {
  test('builds tab paths, marks the active tab and renders children', () => {
    renderWithProviders(
      <TabsMenu
        basePath="/community/"
        className="custom-tabs"
        items={[
          { path: 'feed', label: 'Feed' },
          { path: '/stats', label: 'Stats' },
        ]}
      >
        <button type="button">Extra</button>
      </TabsMenu>,
      { initialEntries: ['/community/feed'] }
    )

    const feedLink = screen.getByRole('tab', { name: 'Feed' })
    const statsLink = screen.getByRole('tab', { name: 'Stats' })
    expect(feedLink).toHaveAttribute('href', '/community/feed')
    expect(statsLink).toHaveAttribute('href', '/community/stats')
    expect(feedLink).toHaveAttribute('aria-selected', 'true')
    expect(statsLink).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('button', { name: 'Extra' })).toBeInTheDocument()
    expect(screen.getByRole('tablist')).toHaveClass('custom-tabs')
  })
})
