import { describe, expect, test, vi, beforeEach } from 'vitest'

import { fetchBooks, publishBook } from '@api/books/books.service'
import { searchBooks } from '@api/books/searchBooks.service'
import { PublishBookPayload } from '@api/books/publishBook.types'

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
}))

vi.mock('@src/api/axios', () => ({
  apiClient: {
    get: getMock,
    post: postMock,
  },
}))

describe('books service', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
  })

  test('fetchBooks returns list when response is array', async () => {
    const sample = [
      { id: '1', title: '1984', author: 'George Orwell', coverUrl: '' },
    ]
    getMock.mockResolvedValueOnce({ data: sample })

    await expect(fetchBooks()).resolves.toEqual(sample)
    expect(getMock).toHaveBeenCalled()
  })

  test('fetchBooks throws when response is not array', async () => {
    getMock.mockResolvedValueOnce({ data: { title: 'invalid' } })

    await expect(fetchBooks()).rejects.toThrow('Invalid books response')
  })

  test('publishBook returns created book when response contains id', async () => {
    const payload: PublishBookPayload = {
      metadata: {
        title: 'Nuevo libro',
        author: 'Autora',
      },
      images: [],
      offer: {
        sale: false,
        donation: true,
        trade: false,
        price: null,
        condition: 'good',
        tradePreferences: [],
        availability: 'public',
        delivery: {
          nearBookCorner: true,
          inPerson: true,
          shipping: false,
        },
      },
      draft: false,
    }

    postMock.mockResolvedValueOnce({
      data: {
        id: 'new-book',
        title: 'Nuevo libro',
        author: 'Autora',
        coverUrl: '',
      },
    })

    await expect(publishBook(payload)).resolves.toMatchObject({
      id: 'new-book',
      title: 'Nuevo libro',
    })
  })

  test('publishBook throws when response lacks id', async () => {
    postMock.mockResolvedValueOnce({ data: { title: 'No id' } })

    await expect(
      publishBook({
        metadata: { title: 'X', author: 'Y' },
        images: [],
        offer: {
          sale: false,
          donation: true,
          trade: false,
          price: null,
          condition: 'good',
          tradePreferences: [],
          availability: 'public',
          delivery: {
            nearBookCorner: true,
            inPerson: true,
            shipping: false,
          },
        },
      })
    ).rejects.toThrow('Invalid publish response')
  })

  test('searchBooks validates array payload', async () => {
    const results = [
      { id: '1', title: 'Sapiens', author: 'Yuval', coverUrl: '' },
    ]
    getMock.mockResolvedValueOnce({ data: results })

    await expect(searchBooks('sap')).resolves.toEqual(results)
  })

  test('searchBooks throws when payload is invalid', async () => {
    getMock.mockResolvedValueOnce({ data: { id: '1' } })

    await expect(searchBooks('sap')).rejects.toThrow(
      'Invalid book search response'
    )
  })
})
