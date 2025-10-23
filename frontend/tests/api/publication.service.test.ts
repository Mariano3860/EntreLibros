import { beforeEach, describe, expect, test, vi } from 'vitest'

import { getBookById, updateBook } from '@api/books/publication.service'
import { Publication, PublicationUpdate } from '@api/books/publication.types'

const { getMock, putMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  putMock: vi.fn(),
}))

vi.mock('@src/api/axios', () => ({
  apiClient: {
    get: getMock,
    put: putMock,
  },
}))

describe('publication service', () => {
  beforeEach(() => {
    getMock.mockReset()
    putMock.mockReset()
  })

  describe('getBookById', () => {
    test('returns publication when response is valid', async () => {
      const mockPublication: Publication = {
        id: '1',
        title: '1984',
        author: 'George Orwell',
        coverUrl: 'https://example.com/cover.jpg',
        condition: 'good',
        status: 'available',
        notes: 'Great book',
        images: [
          { id: '1', url: 'https://example.com/1.jpg', source: 'cover' },
        ],
        offer: {
          sale: true,
          donation: false,
          trade: false,
          price: { amount: 1500, currency: 'ARS' },
          tradePreferences: [],
          availability: 'public',
          delivery: {
            nearBookCorner: true,
            inPerson: true,
            shipping: false,
          },
        },
        ownerId: 'user-123',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }

      getMock.mockResolvedValueOnce({ data: mockPublication })

      await expect(getBookById('1')).resolves.toEqual(mockPublication)
      expect(getMock).toHaveBeenCalledWith('/books/1')
    })

    test('throws when response lacks id', async () => {
      getMock.mockResolvedValueOnce({ data: { title: 'No ID' } })

      await expect(getBookById('1')).rejects.toThrow('Invalid book response')
    })

    test('throws when response is null', async () => {
      getMock.mockResolvedValueOnce({ data: null })

      await expect(getBookById('1')).rejects.toThrow('Invalid book response')
    })
  })

  describe('updateBook', () => {
    test('returns updated publication when response is valid', async () => {
      const mockUpdate: PublicationUpdate = {
        title: 'Updated Title',
        notes: 'Updated notes',
      }

      const mockResponse: Publication = {
        id: '1',
        title: 'Updated Title',
        author: 'George Orwell',
        coverUrl: 'https://example.com/cover.jpg',
        condition: 'good',
        status: 'available',
        notes: 'Updated notes',
        images: [
          { id: '1', url: 'https://example.com/1.jpg', source: 'cover' },
        ],
        offer: {
          sale: true,
          donation: false,
          trade: false,
          price: { amount: 1500, currency: 'ARS' },
          tradePreferences: [],
          availability: 'public',
          delivery: {
            nearBookCorner: true,
            inPerson: true,
            shipping: false,
          },
        },
        ownerId: 'user-123',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
      }

      putMock.mockResolvedValueOnce({ data: mockResponse })

      await expect(updateBook('1', mockUpdate)).resolves.toEqual(mockResponse)
      expect(putMock).toHaveBeenCalledWith('/books/1', mockUpdate)
    })

    test('throws when response lacks id', async () => {
      putMock.mockResolvedValueOnce({ data: { title: 'No ID' } })

      await expect(updateBook('1', {})).rejects.toThrow(
        'Invalid update response'
      )
    })

    test('handles nested offer updates', async () => {
      const mockUpdate: PublicationUpdate = {
        offer: {
          sale: false,
          delivery: {
            shipping: true,
            shippingPayer: 'owner',
          },
        },
      }

      const mockResponse: Publication = {
        id: '1',
        title: '1984',
        author: 'George Orwell',
        coverUrl: 'https://example.com/cover.jpg',
        condition: 'good',
        status: 'available',
        images: [],
        offer: {
          sale: false,
          donation: false,
          trade: false,
          price: null,
          tradePreferences: [],
          availability: 'public',
          delivery: {
            nearBookCorner: false,
            inPerson: false,
            shipping: true,
            shippingPayer: 'owner',
          },
        },
        ownerId: 'user-123',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
      }

      putMock.mockResolvedValueOnce({ data: mockResponse })

      await expect(updateBook('1', mockUpdate)).resolves.toEqual(mockResponse)
    })
  })
})
