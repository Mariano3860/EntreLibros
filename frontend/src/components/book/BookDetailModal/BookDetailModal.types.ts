export type BookDetailModalProps = {
  isOpen: boolean
  bookId: string | undefined
  currentUserId?: string
  onClose: () => void
}
