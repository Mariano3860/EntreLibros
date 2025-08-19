import { screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { Toaster, showToast } from '../../../../src/components/ui/toaster/Toaster'
import { renderWithProviders } from '../../../test-utils'
import { toast } from 'react-toastify'

vi.mock('react-toastify', () => {
  const toastFn: any = vi.fn()
  toastFn.success = vi.fn()
  toastFn.error = vi.fn()
  toastFn.info = vi.fn()
  return {
    toast: toastFn,
    Flip: {},
    ToastContainer: ({ className }: any) => (
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
    const t: any = toast
    showToast('hi', 'success')
    expect(t.success).toHaveBeenCalledWith('hi')
    showToast('oops', 'error')
    expect(t.error).toHaveBeenCalledWith('oops')
    showToast('info', 'info')
    expect(t.info).toHaveBeenCalledWith('info')
    showToast('hey', 'other' as any)
    expect(t).toHaveBeenCalledWith('hey')
  })
})
