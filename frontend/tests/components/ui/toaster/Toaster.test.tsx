import { screen } from '@testing-library/react'
import { toast } from 'react-toastify'
import type { Mock } from 'vitest'
import { describe, expect, test, vi } from 'vitest'

import { Toaster, showToast } from '@src/components/ui/toaster/Toaster'

import { renderWithProviders } from '../../../test-utils'

type ToastMock = Mock & {
  success: Mock
  error: Mock
  info: Mock
}

vi.mock('react-toastify', () => {
  const toastFn = vi.fn() as ToastMock
  toastFn.success = vi.fn()
  toastFn.error = vi.fn()
  toastFn.info = vi.fn()
  return {
    toast: toastFn,
    Flip: {},
    ToastContainer: ({ className }: { className?: string }) => (
      <div data-testid="toast" className={className} />
    ),
  }
})

describe('Toaster', () => {
  test('renders toast container', () => {
    renderWithProviders(<Toaster />)
    expect(screen.getByTestId('toast')).toBeInTheDocument()
  })

  test('showToast uses proper toast variant', () => {
    const t = toast as unknown as ToastMock
    showToast('hi', 'success')
    expect(t.success).toHaveBeenCalledWith('hi')
    showToast('oops', 'error')
    expect(t.error).toHaveBeenCalledWith('oops')
    showToast('info', 'info')
    expect(t.info).toHaveBeenCalledWith('info')
    showToast('hey', 'other' as unknown as 'success')
    expect(t).toHaveBeenCalledWith('hey')
  })
})
