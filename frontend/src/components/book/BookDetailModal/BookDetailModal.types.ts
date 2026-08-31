export type BookDetailModalPreview = {
  title: string
  author: string
  coverUrl?: string
}

export type BookDetailModalProps = {
  isOpen: boolean
  bookId: string | undefined
  onClose: () => void
  bookPreview?: BookDetailModalPreview
}
