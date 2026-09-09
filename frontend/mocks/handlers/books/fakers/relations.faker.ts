import type { ApiBook } from '@src/api/books/books.types'

const relation = (
  id: string,
  title: string,
  options: Pick<ApiBook, 'isForTrade' | 'isForSale' | 'isSeeking' | 'type'>
): ApiBook => ({
  id,
  title,
  author: 'Mariano Demo',
  coverUrl: `/illustrations/book-cover.svg?book=${id}`,
  condition: 'very_good',
  status: 'available',
  ...options,
  price: options.isForSale ? 12500 : null,
  priceCurrency: options.isForSale ? 'ARS' : null,
  tradePreferences: options.isForTrade ? ['fiction'] : [],
  ownerId: '1',
  ownerName: 'Mariano',
})

export const generateBookRelations = (seed?: number): ApiBook[] => {
  void seed
  return [
    relation('own-trade-1', 'El nombre del viento', {
      type: 'offer',
      isForTrade: true,
      isForSale: false,
      isSeeking: false,
    }),
    relation('own-trade-2', 'Dune', {
      type: 'offer',
      isForTrade: true,
      isForSale: false,
      isSeeking: false,
    }),
    relation('own-trade-3', 'La ciudad y los perros', {
      type: 'offer',
      isForTrade: true,
      isForSale: false,
      isSeeking: false,
    }),
    relation('own-sale-1', 'Rayuela', {
      type: 'offer',
      isForTrade: false,
      isForSale: true,
      isSeeking: false,
    }),
    relation('own-sale-2', 'El Aleph', {
      type: 'offer',
      isForTrade: false,
      isForSale: true,
      isSeeking: false,
    }),
    relation('own-seeking-1', 'Fundación', {
      type: 'want',
      isForTrade: false,
      isForSale: false,
      isSeeking: true,
    }),
    relation('own-seeking-2', '1984', {
      type: 'want',
      isForTrade: false,
      isForSale: false,
      isSeeking: true,
    }),
    relation('own-seeking-3', 'El cuento de la criada', {
      type: 'want',
      isForTrade: false,
      isForSale: false,
      isSeeking: true,
    }),
    relation('own-seeking-4', 'La sombra del viento', {
      type: 'want',
      isForTrade: false,
      isForSale: false,
      isSeeking: true,
    }),
  ]
}
