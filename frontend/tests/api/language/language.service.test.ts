import { beforeEach, describe, expect, test, vi } from 'vitest'

import { updateLanguage } from '@src/api/language/language.service'
import { RELATIVE_API_ROUTES } from '@src/api/routes'

const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn<(url: string, body: unknown) => Promise<unknown>>(),
}))

vi.mock('@src/api/axios', () => ({
  apiClient: {
    post: postMock,
  },
}))

describe('language service', () => {
  beforeEach(() => {
    postMock.mockReset()
  })

  test('sends the selected language to the API', async () => {
    postMock.mockResolvedValueOnce(undefined)

    await updateLanguage('en')

    expect(postMock).toHaveBeenCalledWith(RELATIVE_API_ROUTES.LANGUAGE.UPDATE, {
      language: 'en',
    })
  })

  test('propagates API errors', async () => {
    const error = new Error('network error')
    postMock.mockRejectedValueOnce(error)

    await expect(updateLanguage('es')).rejects.toBe(error)
  })
})
