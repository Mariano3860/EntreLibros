import type { ApiUserBook } from '@api/books/userBooks.types'
import { createCommunityStory } from '@api/community/communityStories.service'
import { PublishModal } from '@components/publish/shared'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './CommunityStoryModal.module.scss'

type CommunityStoryModalProps = {
  isOpen: boolean
  books: ApiUserBook[]
  onClose: () => void
  onPublished: () => void
}

export const CommunityStoryModal = ({
  isOpen,
  books,
  onClose,
  onPublished,
}: CommunityStoryModalProps) => {
  const { t } = useTranslation()
  const [body, setBody] = useState('')
  const [bookListingId, setBookListingId] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isSubmitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)

  if (!isOpen) return null

  const handleImage = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageUrl(String(reader.result))
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if ((!body.trim() && !imageUrl && !bookListingId) || isSubmitting) return
    setSubmitting(true)
    setError(false)
    try {
      await createCommunityStory({
        body: body.trim(),
        imageUrl,
        bookListingId: bookListingId || null,
      })
      setBody('')
      setBookListingId('')
      setImageUrl(null)
      onPublished()
    } catch {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PublishModal
      isOpen={isOpen}
      title={t('community.story.title')}
      subtitle={t('community.story.description')}
      onClose={onClose}
      closeLabel={t('community.story.cancel')}
      footer={
        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.secondary}>
            {t('community.story.cancel')}
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            className={styles.primary}
            disabled={
              isSubmitting || (!body.trim() && !imageUrl && !bookListingId)
            }
          >
            {isSubmitting
              ? t('community.story.publishing')
              : t('community.story.publish')}
          </button>
        </div>
      }
    >
      <div className={styles.form}>
        <label htmlFor="community-story-body">
          {t('community.story.bodyLabel')}
        </label>
        <textarea
          id="community-story-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={t('community.story.bodyPlaceholder')}
          rows={5}
        />
        <label htmlFor="community-story-book">
          {t('community.story.bookLabel')}
        </label>
        <select
          id="community-story-book"
          value={bookListingId}
          onChange={(event) => setBookListingId(event.target.value)}
        >
          <option value="">{t('community.story.bookNone')}</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title} · {book.author}
            </option>
          ))}
        </select>
        <label htmlFor="community-story-image">
          {t('community.story.imageLabel')}
        </label>
        <input
          id="community-story-image"
          type="file"
          accept="image/*"
          onChange={(event) => handleImage(event.target.files?.[0])}
        />
        {imageUrl ? (
          <img src={imageUrl} alt="" className={styles.preview} />
        ) : null}
        {error ? <p role="alert">{t('community.story.error')}</p> : null}
      </div>
    </PublishModal>
  )
}
