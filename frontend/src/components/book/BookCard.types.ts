/**
 * Propiedades para el componente BookCard.
 * TODO: unificar los estados en un enum reutilizable.
 */
export type BookCardProps = {
  id?: string
  title: string
  author: string
  coverUrl: string
  condition?: string
  status?:
    | 'available'
    | 'reserved'
    | 'sold'
    | 'exchanged'
    | 'completed'
    | 'draft'
  isForSale?: boolean
  price?: number | null
  isForTrade?: boolean
  tradePreferences?: string[]
  isSeeking?: boolean
}
