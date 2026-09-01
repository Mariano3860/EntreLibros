export type BookDetailModalPreview = {
  title: string
  author: string
  coverUrl?: string
  isSeeking?: boolean
}

export type BookDetailModalProps = {
  isOpen: boolean
  bookId: string | undefined
  onClose: () => void
  bookPreview?: BookDetailModalPreview
}
