import { afterEach, describe, expect, test, vi } from 'vitest'

import {
  calculateSquareCrop,
  clampProfilePhotoFocus,
  cropProfilePhotoToSquare,
  DEFAULT_PROFILE_PHOTO_FOCUS,
  isSupportedProfilePhoto,
  profilePhotoObjectPosition,
} from '@src/pages/profile/profilePhoto'

describe('profile photo helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  test('accepts supported image types up to the server limit', () => {
    expect(
      isSupportedProfilePhoto(
        new File(['photo'], 'photo.png', { type: 'image/png' })
      )
    ).toBe(true)
    expect(
      isSupportedProfilePhoto(
        new File(['photo'], 'photo.gif', { type: 'image/gif' })
      )
    ).toBe(false)
  })

  test('clamps focus and calculates a centered crop for a portrait', () => {
    expect(clampProfilePhotoFocus({ x: -1, y: 2 })).toEqual({ x: 0, y: 1 })
    expect(calculateSquareCrop(1000, 1600)).toEqual({
      size: 1000,
      sourceX: 0,
      sourceY: 300,
    })
    expect(calculateSquareCrop(1000, 1600, { x: 0.5, y: 0 })).toEqual({
      size: 1000,
      sourceX: 0,
      sourceY: 0,
    })
    expect(DEFAULT_PROFILE_PHOTO_FOCUS).toEqual({ x: 0.5, y: 0.5 })
    expect(profilePhotoObjectPosition(1000, 1600, { x: 0.5, y: 0.25 })).toBe(
      '50% 0%'
    )
    expect(profilePhotoObjectPosition(1000, 1600, { x: 0.5, y: 0.75 })).toBe(
      '50% 100%'
    )
  })

  test('exports the selected focus as a square image without distortion', async () => {
    class FakeImage {
      naturalWidth = 1200
      naturalHeight = 1800
      onload: (() => void) | null = null
      onerror: (() => void) | null = null

      set src(_value: string) {
        queueMicrotask(() => this.onload?.())
      }
    }
    const drawImage = vi.fn()
    vi.stubGlobal('Image', FakeImage)
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage,
    } as unknown as CanvasRenderingContext2D)
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/png;base64,cropped'
    )

    await expect(
      cropProfilePhotoToSquare(
        'data:image/png;base64,source',
        { x: 0.5, y: 0.25 },
        512
      )
    ).resolves.toBe('data:image/png;base64,cropped')
    expect(drawImage).toHaveBeenCalledWith(
      expect.any(FakeImage),
      0,
      0,
      1200,
      1200,
      0,
      0,
      512,
      512
    )
  })

  test('rejects an exported image that exceeds the server limit', async () => {
    class FakeImage {
      naturalWidth = 1200
      naturalHeight = 1200
      onload: (() => void) | null = null
      onerror: (() => void) | null = null

      set src(_value: string) {
        queueMicrotask(() => this.onload?.())
      }
    }
    vi.stubGlobal('Image', FakeImage)
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D)
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      `data:image/png;base64,${'A'.repeat(7_000_000)}`
    )

    await expect(
      cropProfilePhotoToSquare('data:image/png;base64,source')
    ).rejects.toThrow('profile.photo.too_large')
  })
})
