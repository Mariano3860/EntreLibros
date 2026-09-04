export type BookDetailModalPreview = {
  title: string
  author: string
  coverUrl?: string
  isSeeking?: boolean
  ownerName?: string | null
}

export type BookDetailModalProps = {
  isOpen: boolean
  bookId: string | undefined
  onClose: () => void
  bookPreview?: BookDetailModalPreview
  onStartConversation?: (ownerId: string) => void
  isStartingConversation?: boolean
  contactError?: string
}
