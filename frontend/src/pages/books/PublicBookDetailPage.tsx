import { BookDetailModal } from '@components/book/BookDetailModal/BookDetailModal'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { useNavigate, useParams } from 'react-router-dom'

import { useAuthRequired } from '@src/contexts/auth/AuthRequiredContext'
import { useBookDetails } from '@src/hooks/api/useBookDetails'
import { useBookContact } from '@src/hooks/useBookContact'

export const PublicBookDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { runIfAuthenticated } = useAuthRequired()
  const { data: book } = useBookDetails(id)
  const contactMutation = useBookContact({
    onSuccess: (conversation) => {
      navigate('/messages', { state: { conversationId: conversation.id } })
    },
  })

  return (
    <BaseLayout id="book-detail-page">
      <BookDetailModal
        isOpen
        bookId={id}
        onClose={() => navigate('/community')}
        bookPreview={
          book
            ? {
                title: book.title,
                author: book.author,
                coverUrl: book.coverUrl,
                isSeeking: book.type === 'want',
                ownerName: book.ownerName,
              }
            : undefined
        }
        onStartConversation={(ownerId) =>
          runIfAuthenticated(() =>
            contactMutation.mutate({
              ownerId,
              book: {
                id: id ?? '',
                title: book?.title ?? '',
                author: book?.author ?? '',
                coverUrl: book?.coverUrl,
                condition: book?.condition,
              },
            })
          )
        }
        isStartingConversation={contactMutation.isPending}
      />
    </BaseLayout>
  )
}
