/**
 * Representa un libro dentro de la aplicación.
 * TODO: mover los estados y condiciones a tipos compartidos.
 */
export type Book = {
  id: string
  title: string
  author: string
  coverUrl: string
  condition?: string
  status?: 'available' | 'reserved' | 'sold' | 'exchanged'
  isForSale?: boolean
  price?: number | null
  isForTrade?: boolean
  tradePreferences?: string[]
  isSeeking?: boolean
}
