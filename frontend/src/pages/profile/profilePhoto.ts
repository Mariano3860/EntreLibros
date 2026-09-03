export const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024

export const PROFILE_PHOTO_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export type ProfilePhotoFocus = {
  x: number
  y: number
}

export type SquareCrop = {
  size: number
  sourceX: number
  sourceY: number
}

export const DEFAULT_PROFILE_PHOTO_FOCUS: ProfilePhotoFocus = {
  x: 0.5,
  y: 0.5,
}

export const defaultProfilePhotoFocus = (): ProfilePhotoFocus => ({
  ...DEFAULT_PROFILE_PHOTO_FOCUS,
})

export const isSupportedProfilePhoto = (file: File): boolean =>
  PROFILE_PHOTO_TYPES.includes(
    file.type as (typeof PROFILE_PHOTO_TYPES)[number]
  ) && file.size <= MAX_PROFILE_PHOTO_BYTES

export const clampProfilePhotoFocus = (
  focus: ProfilePhotoFocus
): ProfilePhotoFocus => ({
  x: Math.min(1, Math.max(0, focus.x)),
  y: Math.min(1, Math.max(0, focus.y)),
})

export const calculateSquareCrop = (
  width: number,
  height: number,
  focus: ProfilePhotoFocus = DEFAULT_PROFILE_PHOTO_FOCUS
): SquareCrop => {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    throw new Error('profile.photo.invalid_dimensions')
  }

  const size = Math.min(width, height)
  const normalizedFocus = clampProfilePhotoFocus(focus)
  return {
    size,
    sourceX: Math.min(
      width - size,
      Math.max(0, normalizedFocus.x * width - size / 2)
    ),
    sourceY: Math.min(
      height - size,
      Math.max(0, normalizedFocus.y * height - size / 2)
    ),
  }
}

export const profilePhotoObjectPosition = (
  width: number,
  height: number,
  focus: ProfilePhotoFocus = DEFAULT_PROFILE_PHOTO_FOCUS
): string => {
  const crop = calculateSquareCrop(width, height, focus)
  const horizontalRange = width - crop.size
  const verticalRange = height - crop.size
  const horizontal = horizontalRange > 0 ? crop.sourceX / horizontalRange : 0.5
  const vertical = verticalRange > 0 ? crop.sourceY / verticalRange : 0.5

  return `${horizontal * 100}% ${vertical * 100}%`
}

const imageMimeFromDataUrl = (source: string): string => {
  const match = source.match(/^data:(image\/(?:jpeg|png|webp));/i)
  return match?.[1]?.toLowerCase() ?? 'image/jpeg'
}

export const readProfilePhotoFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string' && reader.result.length > 0) {
        resolve(reader.result)
        return
      }
      reject(new Error('profile.photo.read_failed'))
    }
    reader.onerror = () => reject(new Error('profile.photo.read_failed'))
    reader.readAsDataURL(file)
  })

export const cropProfilePhotoToSquare = (
  source: string,
  focus: ProfilePhotoFocus = DEFAULT_PROFILE_PHOTO_FOCUS,
  outputSize = 512
): Promise<string> =>
  new Promise((resolve, reject) => {
    if (typeof Image === 'undefined' || typeof document === 'undefined') {
      reject(new Error('profile.photo.crop_unavailable'))
      return
    }

    const image = new Image()
    image.onload = () => {
      try {
        const crop = calculateSquareCrop(
          image.naturalWidth || image.width,
          image.naturalHeight || image.height,
          focus
        )
        const canvas = document.createElement('canvas')
        canvas.width = outputSize
        canvas.height = outputSize
        const context = canvas.getContext('2d')
        if (!context) throw new Error('profile.photo.crop_unavailable')
        context.drawImage(
          image,
          crop.sourceX,
          crop.sourceY,
          crop.size,
          crop.size,
          0,
          0,
          outputSize,
          outputSize
        )
        const result = canvas.toDataURL(imageMimeFromDataUrl(source), 0.9)
        const payload = result.split(',', 2)[1] ?? ''
        const byteLength = Math.ceil((payload.length * 3) / 4)
        if (byteLength > MAX_PROFILE_PHOTO_BYTES) {
          throw new Error('profile.photo.too_large')
        }
        resolve(result)
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error('profile.photo.crop_failed')
        )
      }
    }
    image.onerror = () => reject(new Error('profile.photo.read_failed'))
    image.src = source
  })
