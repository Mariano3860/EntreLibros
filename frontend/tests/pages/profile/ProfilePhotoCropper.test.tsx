import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { ProfilePhotoCropper } from '@src/pages/profile/ProfilePhotoCropper'

import { renderWithProviders } from '../../test-utils'

const labels = {
  title: 'Ajustá el encuadre',
  hint: 'Arrastrá la imagen o usá los controles para centrarla.',
  horizontal: 'Horizontal',
  vertical: 'Vertical',
  focus: 'Foco del recorte',
  reset: 'Restablecer encuadre',
  cancel: 'Descartar foto nueva',
}

describe('ProfilePhotoCropper', () => {
  test('keeps the visual preview aligned with the square crop and exposes keyboard controls', () => {
    const onFocusChange = vi.fn()

    const { container } = renderWithProviders(
      <ProfilePhotoCropper
        source="data:image/png;base64,source"
        focus={{ x: 0.5, y: 0.25 }}
        onFocusChange={onFocusChange}
        onReset={vi.fn()}
        onCancel={vi.fn()}
        labels={labels}
      />
    )

    const image = container.querySelector('img')
    if (!image) throw new Error('Expected crop image')
    Object.defineProperty(image, 'naturalWidth', {
      configurable: true,
      value: 1000,
    })
    Object.defineProperty(image, 'naturalHeight', {
      configurable: true,
      value: 1600,
    })
    fireEvent.load(image)

    expect(image).toHaveStyle({ objectPosition: '50% 0%' })
    expect(screen.getByRole('group', { name: labels.focus })).toBeVisible()

    fireEvent.change(screen.getByRole('slider', { name: labels.vertical }), {
      target: { value: '75' },
    })
    expect(onFocusChange).toHaveBeenCalledWith({ x: 0.5, y: 0.75 })
  })

  test('supports pointer focus adjustment and reset/cancel actions', () => {
    const onFocusChange = vi.fn()
    const onReset = vi.fn()
    const onCancel = vi.fn()

    renderWithProviders(
      <ProfilePhotoCropper
        source="data:image/png;base64,source"
        focus={{ x: 0.5, y: 0.5 }}
        onFocusChange={onFocusChange}
        onReset={onReset}
        onCancel={onCancel}
        labels={labels}
      />
    )

    const preview = screen.getByRole('img', { name: labels.title })
    vi.spyOn(preview, 'getBoundingClientRect').mockReturnValue({
      bottom: 200,
      height: 200,
      left: 0,
      right: 200,
      top: 0,
      width: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
    fireEvent(
      preview,
      new MouseEvent('pointerdown', {
        bubbles: true,
        clientX: 200,
        clientY: 0,
      })
    )
    expect(onFocusChange).toHaveBeenCalledWith({ x: 1, y: 0 })

    fireEvent.click(screen.getByRole('button', { name: labels.reset }))
    fireEvent.click(screen.getByRole('button', { name: labels.cancel }))
    expect(onReset).toHaveBeenCalledOnce()
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
