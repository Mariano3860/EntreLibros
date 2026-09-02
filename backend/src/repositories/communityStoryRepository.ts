import { query } from '../db.js';

export type CommunityStory = {
  id: string;
  user: string;
  avatar: string;
  time: string;
  likes: number;
  type: 'story';
  body: string;
  image?: string;
  book?: { id: string; title: string; author: string; cover: string };
  commentsCount: number;
  likedByMe: boolean;
  createdAt: Date;
};

export type CreateCommunityStoryInput = {
  userId: number;
  body: string;
  imageUrl?: string | null;
  bookListingId?: string | null;
};

type StoryRow = {
  id: string;
  user_name: string;
  body: string;
  image_url: string | null;
  book_id: string | null;
  book_title: string | null;
  book_author: string | null;
  book_cover: string | null;
  created_at: Date;
  likes: number | string;
  comments_count: number | string;
  liked_by_me: boolean;
};

const AVATAR_FALLBACK = '/logo.svg';

const relativeTime = (date: Date): string => {
  const minutes = Math.max(
    1,
    Math.floor((Date.now() - date.getTime()) / 60000)
  );
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} d`;
};

const toStory = (row: StoryRow): CommunityStory => ({
  id: `story-${row.id}`,
  user: row.user_name,
  avatar: AVATAR_FALLBACK,
  time: relativeTime(new Date(row.created_at)),
  likes: Number(row.likes),
  commentsCount: Number(row.comments_count),
  likedByMe: row.liked_by_me,
  type: 'story',
  body: row.body,
  createdAt: new Date(row.created_at),
  ...(row.image_url ? { image: row.image_url } : {}),
  ...(row.book_id
    ? {
        book: {
          id: row.book_id,
          title: row.book_title ?? '',
          author: row.book_author ?? '',
          cover: row.book_cover ?? '',
        },
      }
    : {}),
});

export async function listCommunityStories(
  limit: number,
  offset: number,
  viewerId?: number
): Promise<CommunityStory[]> {
  const { rows } = await query<StoryRow>(
    `SELECT s.id,
            COALESCE(u.alias, u.name) AS user_name,
            s.body,
            s.image_url,
            b.id::text AS book_id,
            b.title AS book_title,
            b.author AS book_author,
            COALESCE(img.url, b.cover_url) AS book_cover,
            s.created_at,
            (SELECT COUNT(*)::int FROM community_story_likes
             WHERE story_id = s.id) AS likes,
            (SELECT COUNT(*)::int
             FROM community_comments comment
             JOIN users comment_author ON comment_author.id = comment.user_id
             WHERE comment.story_id = s.id
               AND comment_author.role = 'user'
               AND comment_author.profile_visibility = 'public'
               AND ($3::integer IS NULL OR NOT EXISTS (
                 SELECT 1
                 FROM user_blocks comment_block
                 WHERE (comment_block.blocker_id = $3
                        AND comment_block.blocked_id = comment_author.id)
                    OR (comment_block.blocker_id = comment_author.id
                        AND comment_block.blocked_id = $3)
               ))) AS comments_count,
            CASE WHEN $3::integer IS NULL THEN false
                 ELSE EXISTS (
                   SELECT 1 FROM community_story_likes like_row
                   WHERE like_row.story_id = s.id AND like_row.user_id = $3
                 )
            END AS liked_by_me
     FROM community_stories s
     JOIN users u ON u.id = s.user_id
     LEFT JOIN book_listings l ON l.id = s.book_listing_id
       AND l.availability = 'public'
       AND l.is_draft = false
       AND l.status = 'available'
       AND l.editorial_status = 'approved'
       AND (l.expires_at IS NULL OR l.expires_at > NOW())
     LEFT JOIN books b ON b.id = l.book_id
     LEFT JOIN LATERAL (
       SELECT url FROM book_listing_images
       WHERE book_listing_id = l.id
       ORDER BY is_primary DESC, id ASC LIMIT 1
     ) img ON true
     WHERE u.role = 'user'
       AND u.profile_visibility = 'public'
       AND ($3::integer IS NULL OR NOT EXISTS (
         SELECT 1
         FROM user_blocks blocked
         WHERE (blocked.blocker_id = $3 AND blocked.blocked_id = u.id)
            OR (blocked.blocker_id = u.id AND blocked.blocked_id = $3)
       ))
     ORDER BY s.created_at DESC, s.id DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset, viewerId ?? null]
  );
  return rows.map(toStory);
}

export async function createCommunityStory(
  input: CreateCommunityStoryInput
): Promise<CommunityStory> {
  const body = input.body.trim();
  const imageUrl = input.imageUrl?.trim() || null;
  const listingId = input.bookListingId?.trim() || null;
  if (!body && !imageUrl && !listingId) {
    throw new Error('community.story.body_required');
  }
  if (listingId && !/^\d+$/.test(listingId)) {
    throw new Error('community.story.book_invalid');
  }

  const { rows } = await query<StoryRow>(
    `WITH inserted AS (
       INSERT INTO community_stories (user_id, body, image_url, book_listing_id)
       SELECT $1, $2, $3, l.id
       FROM (SELECT $4::bigint AS id) requested
       LEFT JOIN book_listings l ON l.id = requested.id
         AND l.user_id = $1
         AND l.availability = 'public'
         AND l.is_draft = false
         AND l.status = 'available'
         AND l.editorial_status = 'approved'
         AND (l.expires_at IS NULL OR l.expires_at > NOW())
       WHERE $4::bigint IS NULL OR l.id IS NOT NULL
       RETURNING *
     )
     SELECT i.id,
            COALESCE(u.alias, u.name) AS user_name,
            i.body,
            i.image_url,
            b.id::text AS book_id,
            b.title AS book_title,
            b.author AS book_author,
            COALESCE(img.url, b.cover_url) AS book_cover,
            i.created_at,
            0 AS likes,
            0 AS comments_count,
            false AS liked_by_me
     FROM inserted i
     JOIN users u ON u.id = i.user_id
     LEFT JOIN books b ON b.id = (SELECT book_id FROM book_listings WHERE id = i.book_listing_id)
     LEFT JOIN LATERAL (
       SELECT url FROM book_listing_images
       WHERE book_listing_id = i.book_listing_id
       ORDER BY is_primary DESC, id ASC LIMIT 1
     ) img ON true`,
    [input.userId, body, imageUrl, listingId]
  );
  if (!rows[0]) throw new Error('community.story.book_invalid');
  return toStory(rows[0]);
}
