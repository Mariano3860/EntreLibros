import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('@src/api/auth/me.service', () => ({
  fetchMe: vi.fn().mockRejectedValue(new Error('unauthenticated')),
}))

import { StatsPage } from '@src/pages/stats/StatsPage'

import { renderWithProviders } from '../../test-utils'

describe('StatsPage', () => {
  test('renders the prototype metrics and analytic regions', () => {
    renderWithProviders(<StatsPage />)

    for (const metric of ['2.843', '1.327', '5.891', '7.642']) {
      expect(screen.getByText(metric)).toBeVisible()
    }
    expect(
      screen.getByRole('img', { name: 'Intercambios por día' })
    ).toBeVisible()
    expect(screen.getByText('Rincones más activos')).toBeVisible()
    expect(screen.getByText('Contribuyentes destacados')).toBeVisible()
  })

  test('changes the selected period', () => {
    renderWithProviders(<StatsPage />)
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Últimos 30 días' },
    })
    expect(screen.getByRole('combobox')).toHaveValue('Últimos 30 días')
  })
})
