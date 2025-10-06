/**
 * Representa un libro tal como se recibe desde la API.
 * TODO: extender con más metadatos del libro.
 */
export type ApiBook = {
  id?: string
  title: string
  author: string
  coverUrl: string
}
