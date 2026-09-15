import { render, screen } from '@testing-library/react'
import { useTranslation } from 'react-i18next'
import { describe, expect, test } from 'vitest'

import NotFound from '@src/pages/not_found/NotFound'

describe('NotFound page', () => {
  test('shows 404 message', () => {
    render(<NotFound />)
    expect(screen.getByText('404 — Página no encontrada')).toBeVisible()
  })

  test('localizes the not found message', async () => {
    await useTranslation().i18n.changeLanguage('en')
    render(<NotFound />)
    expect(
      screen.getByRole('heading', { name: '404 — Page not found' })
    ).toBeVisible()
  })
})
