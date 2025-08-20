export const track = (event: string, data?: Record<string, unknown>) => {
  // no-op analytics stub
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.log('track', event, data)
  }
}
