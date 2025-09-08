/**
 * Development stub for analytics tracking.
 *
 * Logs the event name and optional payload to the console when not running
 * under test. Replace this helper with a real analytics integration once the
 * backend is available.
 *
 * @param event - Identifier for the event being tracked.
 * @param data - Additional event properties.
 */
export const track = (event: string, data?: Record<string, unknown>) => {
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.log('track', event, data)
  }
}
