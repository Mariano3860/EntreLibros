export const isPublicFlagEnabled = (value: string | undefined): boolean => {
  const normalized = value?.trim().toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'yes'
}

export const isApiMockMode = (): boolean =>
  isPublicFlagEnabled(import.meta.env?.PUBLIC_API_USE_MOCKS) ||
  import.meta.env?.MODE === 'test'
