import { query } from '../db.js';

export type CommunityPostType = 'listing' | 'story';

export type CommunityComment = {
  id: string;
  author: string;
  avatar: string;
  body: string;
  createdAt: string;
};

type CommentRow = {
  id: string;
  author: string;
  avatar: string | null;
  body: string;
  created_at: Date;
};

type LikeCountRow = { count: number | string };

const AVATAR_FALLBACK = '/logo.svg';

export function parseCommunityPostId(
  postType: string | undefined,
  rawId: string | undefined
): { type: CommunityPostType; id: number } | null {
  if (postType !== 'listing' && postType !== 'story') return null;
  if (!rawId) return null;
  const normalizedId =
    postType === 'story' ? rawId.replace(/^story-/, '') : rawId;
  if (!/^\d+$/.test(normalizedId)) return null;
  const id = Number(normalizedId);
  return Number.isSafeInteger(id) && id > 0 ? { type: postType, id } : null;
}

export async function isVisibleCommunityPost(
  post: { type: CommunityPostType; id: number },
  viewerId?: number
): Promise<boolean> {
  const blockClause = viewerId
    ? `AND NOT EXISTS (
         SELECT 1
         FROM user_blocks blocked
         WHERE (blocked.blocker_id = $2 AND blocked.blocked_id = owner.id)
            OR (blocked.blocker_id = owner.id AND blocked.blocked_id = $2)
       )`
    : '';
  const params = viewerId ? [post.id, viewerId] : [post.id];

  const result =
    post.type === 'listing'
      ? await query<{ id: number }>(
          `SELECT listing.id
           FROM book_listings listing
           JOIN users owner ON owner.id = listing.user_id
           WHERE listing.id = $1
             AND listing.availability = 'public'
             AND listing.is_draft = false
             AND listing.status = 'available'
             AND listing.editorial_status = 'approved'
             AND (listing.expires_at IS NULL OR listing.expires_at > NOW())
             AND owner.role = 'user'
             AND owner.profile_visibility = 'public'
             ${blockClause}`,
          params
        )
      : await query<{ id: number }>(
          `SELECT story.id
           FROM community_stories story
           JOIN users owner ON owner.id = story.user_id
           WHERE story.id = $1
             AND owner.role = 'user'
             AND owner.profile_visibility = 'public'
             ${blockClause}`,
          params
        );

  return Boolean(result.rows[0]);
}

export async function toggleCommunityPostLike(
  post: { type: CommunityPostType; id: number },
  userId: number
): Promise<{ liked: boolean; likes: number }> {
  const table =
    post.type === 'listing'
      ? 'community_listing_likes'
      : 'community_story_likes';
  const column = post.type === 'listing' ? 'listing_id' : 'story_id';
  const inserted = await query<{ user_id: number }>(
    `INSERT INTO ${table} (${column}, user_id)
     VALUES ($1, $2)
     ON CONFLICT (${column}, user_id) DO NOTHING
     RETURNING user_id`,
    [post.id, userId]
  );

  let liked = inserted.rows.length > 0;
  if (!liked) {
    await query(
      `DELETE FROM ${table}
       WHERE ${column} = $1 AND user_id = $2`,
      [post.id, userId]
    );
    liked = false;
  }

  const { rows } = await query<LikeCountRow>(
    `SELECT COUNT(*)::int AS count FROM ${table} WHERE ${column} = $1`,
    [post.id]
  );
  return { liked, likes: Number(rows[0]?.count ?? 0) };
}

export async function listCommunityComments(
  post: { type: CommunityPostType; id: number },
  viewerId?: number
): Promise<CommunityComment[]> {
  const targetColumn = post.type === 'listing' ? 'listing_id' : 'story_id';
  const blockClause = viewerId
    ? `AND NOT EXISTS (
         SELECT 1
         FROM user_blocks blocked
         WHERE (blocked.blocker_id = $2 AND blocked.blocked_id = author.id)
            OR (blocked.blocker_id = author.id AND blocked.blocked_id = $2)
       )`
    : '';
  const params = viewerId ? [post.id, viewerId] : [post.id];
  const { rows } = await query<CommentRow>(
    `SELECT comment.id::text,
            COALESCE(author.alias, author.name) AS author,
            author.profile_photo_url AS avatar,
            comment.body,
            comment.created_at
     FROM community_comments comment
     JOIN users author ON author.id = comment.user_id
     WHERE comment.${targetColumn} = $1
       AND author.role = 'user'
       AND author.profile_visibility = 'public'
       ${blockClause}
     ORDER BY comment.created_at ASC, comment.id ASC
     LIMIT 100`,
    params
  );
  return rows.map((row) => ({
    id: row.id,
    author: row.author,
    avatar: row.avatar ?? AVATAR_FALLBACK,
    body: row.body,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

export async function createCommunityComment(input: {
  post: { type: CommunityPostType; id: number };
  userId: number;
  body: string;
}): Promise<CommunityComment> {
  const body = input.body.trim();
  if (!body || body.length > 1000) {
    throw new Error('community.social.comment_invalid');
  }

  const column = input.post.type === 'listing' ? 'listing_id' : 'story_id';
  const { rows } = await query<CommentRow>(
    `WITH inserted AS (
       INSERT INTO community_comments (${column}, user_id, body)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, body, created_at
     )
     SELECT inserted.id::text,
            COALESCE(author.alias, author.name) AS author,
            author.profile_photo_url AS avatar,
            inserted.body,
            inserted.created_at
     FROM inserted
     JOIN users author ON author.id = inserted.user_id`,
    [input.post.id, input.userId, body]
  );
  if (!rows[0]) throw new Error('community.social.comment_failed');
  const row = rows[0];
  return {
    id: row.id,
    author: row.author,
    avatar: row.avatar ?? AVATAR_FALLBACK,
    body: row.body,
    createdAt: new Date(row.created_at).toISOString(),
  };
}
