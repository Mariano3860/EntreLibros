import { resolveApiErrorKey } from './apiError'

describe('resolveApiErrorKey', () => {
  it('uses a public key returned by the API', () => {
    const error = {
      isAxiosError: true,
      response: { data: { message: 'books.errors.search_unavailable' } },
    }

    expect(resolveApiErrorKey(error, 'auth.errors.unknown')).toBe(
      'books.errors.search_unavailable'
    )
  })

  it('maps stable aliases without exposing arbitrary messages', () => {
    expect(
      resolveApiErrorKey(
        new Error('invalid_credentials'),
        'auth.errors.unknown'
      )
    ).toBe('auth.errors.invalid_credentials')
    expect(
      resolveApiErrorKey(
        new Error('SQL password leaked'),
        'auth.errors.unknown'
      )
    ).toBe('auth.errors.unknown')
  })
})
