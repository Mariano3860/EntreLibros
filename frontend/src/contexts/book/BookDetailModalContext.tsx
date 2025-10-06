import { EditBookModal } from '@components/book/EditBookModal'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

type BookDetailModalContextValue = {
  open: (bookId: string) => void
  close: () => void
  bookId: string | null
}

export const BookDetailModalContext =
  createContext<BookDetailModalContextValue | null>(null)

export const BookDetailModalProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [bookId, setBookId] = useState<string | null>(null)

  const open = useCallback((id: string) => {
    setBookId(id)
  }, [])

  const close = useCallback(() => {
    setBookId(null)
  }, [])

  const value = useMemo(
    () => ({
      open,
      close,
      bookId,
    }),
    [bookId, close, open]
  )

  return (
    <BookDetailModalContext.Provider value={value}>
      {children}
      <EditBookModal bookId={bookId} isOpen={bookId !== null} onClose={close} />
    </BookDetailModalContext.Provider>
  )
}

export const useBookDetailModal = () => {
  const context = useContext(BookDetailModalContext)
  if (!context) {
    throw new Error(
      'useBookDetailModal must be used within BookDetailModalProvider'
    )
  }
  return context
}
