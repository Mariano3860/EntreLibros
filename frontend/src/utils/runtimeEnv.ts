export const isPublicFlagEnabled = (value: string | undefined): boolean => {
  const normalized = value?.trim().toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'yes'
}

// Fixtures are a test harness concern. A public environment variable must not
// silently replace persisted API data in a running application.
export const isApiMockMode = (): boolean => import.meta.env.MODE === 'test'
