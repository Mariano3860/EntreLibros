import {
  createCommunityComment,
  fetchCommunityComments,
  type CommunityComment,
  type CommunityPostType,
  toggleCommunityLike,
} from '@api/community/communitySocial.service'
import { ReactComponent as CommentIcon } from '@assets/icons/comment.svg'
import { ReactComponent as HeartIcon } from '@assets/icons/heart.svg'
import { ReactComponent as ShareIcon } from '@assets/icons/share.svg'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { isApiMockMode } from '@src/utils/runtimeEnv'

import styles from './FeedActions.module.scss'

type CommunityPostReference = {
  type: CommunityPostType
  id: string
}

interface Props {
  initialLikes?: number
  initialLiked?: boolean
  initialCommentsCount?: number
  post?: CommunityPostReference
}

export const FeedActions = ({
  initialLikes = 0,
  initialLiked,
  initialCommentsCount,
  post,
}: Props) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const mockMode = isApiMockMode()
  const enhanced =
    post !== undefined ||
    initialCommentsCount !== undefined ||
    initialLiked !== undefined
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(initialLiked ?? false)
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentBody, setCommentBody] = useState('')
  const [localComments, setLocalComments] = useState<CommunityComment[]>([])
  const [shareStatus, setShareStatus] = useState<{
    kind: 'shared' | 'link'
    url: string
  } | null>(null)

  const commentsQuery = useQuery({
    queryKey: ['community', 'comments', post?.type, post?.id],
    queryFn: () => {
      if (!post) throw new Error('Community post is required')
      return fetchCommunityComments(post.type, post.id)
    },
    enabled: Boolean(post) && commentsOpen && !mockMode,
    retry: false,
  })
  const commentsQueryKey = [
    'community',
    'comments',
    post?.type,
    post?.id,
  ] as const

  const likeMutation = useMutation({
    mutationFn: () => {
      if (!post) throw new Error('Community post is required')
      return toggleCommunityLike(post.type, post.id)
    },
    onSuccess: (result) => {
      setLiked(result.liked)
      setLikes(result.likes)
    },
  })

  const commentMutation = useMutation({
    mutationFn: (body: string) => {
      if (!post) throw new Error('Community post is required')
      return createCommunityComment(post.type, post.id, body)
    },
    onSuccess: (comment) => {
      if (post && !mockMode) {
        queryClient.setQueryData<CommunityComment[]>(
          commentsQueryKey,
          (current) => [...(current ?? []), comment]
        )
      } else {
        setLocalComments((current) => [...current, comment])
      }
      setCommentsCount((current) => (current ?? 0) + 1)
      setCommentBody('')
    },
  })

  const handleLikeClick = () => {
    if (post && !mockMode) {
      if (!likeMutation.isPending) likeMutation.mutate()
      return
    }
    if (liked) {
      setLikes((l) => l - 1)
      setLiked(false)
    } else {
      setLikes((l) => l + 1)
      setLiked(true)
    }
  }

  const handleCommentSubmit = (event: FormEvent) => {
    event.preventDefault()
    const body = commentBody.trim()
    if (!body || commentMutation.isPending) return
    if (post && !mockMode) {
      commentMutation.mutate(body)
      return
    }
    setLocalComments((current) => [
      ...current,
      {
        id: `local-comment-${Date.now()}`,
        author: 'Mariano',
        avatar: '/logo.svg',
        body,
        createdAt: new Date().toISOString(),
      },
    ])
    setCommentsCount((current) => (current ?? 0) + 1)
    setCommentBody('')
  }

  const handleShare = async () => {
    const url = getCanonicalPostUrl(post)
    setShareStatus(null)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: t('community.feed.actions.shareTitle'),
          url,
        })
        setShareStatus({ kind: 'shared', url })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url)
        setShareStatus({ kind: 'shared', url })
        return
      } catch {
        // Expose the URL below when clipboard access is unavailable.
      }
    }
    setShareStatus({ kind: 'link', url })
  }

  const comments =
    post && !mockMode ? (commentsQuery.data ?? []) : localComments

  return (
    <div
      className={
        enhanced
          ? `${styles.actions} ${styles.communityActions}`
          : styles.actions
      }
    >
      {enhanced ? (
        <div className={styles.stats}>
          <span className={styles.likes}>
            {likes} {t('community.feed.actions.likes')}
          </span>
          {commentsCount !== undefined ? (
            <span>
              {commentsCount} {t('community.feed.actions.comments')}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className={styles.buttons}>
        <button
          {...(enhanced ? { type: 'button' } : {})}
          aria-label={t('community.feed.actions.like')}
          onClick={handleLikeClick}
          className={liked ? styles.liked : undefined}
          {...(enhanced ? { 'aria-pressed': liked } : {})}
          {...(enhanced && likeMutation.isPending ? { disabled: true } : {})}
        >
          <HeartIcon />
          {enhanced ? <span>{t('community.feed.actions.like')}</span> : null}
        </button>
        <button
          {...(enhanced ? { type: 'button' } : {})}
          aria-label={t('community.feed.actions.comment')}
          onClick={() => setCommentsOpen((open) => !open)}
          {...(enhanced ? { 'aria-expanded': commentsOpen } : {})}
        >
          <CommentIcon />
          {enhanced ? <span>{t('community.feed.actions.comment')}</span> : null}
        </button>
        <button
          {...(enhanced ? { type: 'button' } : {})}
          aria-label={t('community.feed.actions.share')}
          onClick={() => void handleShare()}
        >
          <ShareIcon />
          {enhanced ? <span>{t('community.feed.actions.share')}</span> : null}
        </button>
      </div>
      {!enhanced ? (
        <span className={styles.likes}>
          {likes} {t('community.feed.actions.likes')}
        </span>
      ) : null}
      {shareStatus ? (
        <p className={styles.status} role="status">
          {shareStatus.kind === 'shared' ? (
            t('community.feed.actions.shareSuccess')
          ) : (
            <>
              {t('community.feed.actions.shareFallback')}{' '}
              <a href={shareStatus.url}>{shareStatus.url}</a>
            </>
          )}
        </p>
      ) : null}
      {commentsOpen ? (
        <section
          className={styles.commentPanel}
          aria-label={t('community.feed.actions.comments')}
        >
          {commentsQuery.isLoading ? (
            <p>{t('community.feed.actions.commentsLoading')}</p>
          ) : null}
          {commentsQuery.isError || commentMutation.isError ? (
            <p role="alert">{t('community.feed.actions.commentsError')}</p>
          ) : null}
          {comments.length ? (
            <ul className={styles.commentList}>
              {comments.map((comment) => (
                <li key={comment.id} className={styles.comment}>
                  <img src={comment.avatar} alt="" />
                  <p>
                    <strong>{comment.author}</strong> {comment.body}{' '}
                    <time dateTime={comment.createdAt}>
                      {formatCommentDate(comment.createdAt)}
                    </time>
                  </p>
                </li>
              ))}
            </ul>
          ) : !commentsQuery.isLoading &&
            !commentsQuery.isError &&
            !commentMutation.isError ? (
            <p>{t('community.feed.actions.commentsEmpty')}</p>
          ) : null}
          <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
            <label
              htmlFor={`comment-${post?.type ?? 'local'}-${post?.id ?? 'post'}`}
            >
              <span className={styles.srOnly}>
                {t('community.feed.actions.commentLabel')}
              </span>
              <input
                id={`comment-${post?.type ?? 'local'}-${post?.id ?? 'post'}`}
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
                placeholder={t('community.feed.actions.commentPlaceholder')}
                maxLength={1000}
              />
            </label>
            <button type="submit" disabled={!commentBody.trim()}>
              {t('community.feed.actions.commentSubmit')}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  )
}

function getCanonicalPostUrl(post?: CommunityPostReference): string {
  if (typeof window === 'undefined') return ''
  const url = new URL('/community', window.location.origin)
  if (post) url.searchParams.set('post', `${post.type}:${post.id}`)
  return url.toString()
}

function formatCommentDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}
