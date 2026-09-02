import { query } from '../db.js';

const AVATAR_FALLBACK = '/logo.svg';

type StoryAuthorRow = {
  user_id: number;
  user_name: string;
  story_id: number;
  body: string;
  image_url: string | null;
  created_at: Date;
  is_following: boolean;
};

type SuggestionRow = {
  user_id: number;
  user_name: string;
  distance_km: number | string | null;
  same_city: boolean;
  common_interests: string[];
  is_following: boolean;
};

type RecommendationRow = {
  listing_id: number;
  title: string;
  author: string | null;
  cover_url: string | null;
  owner_id: number;
  owner_name: string;
  condition: string | null;
  common_interests: string[];
  is_following: boolean;
};

export type CommunityStoryPreview = {
  id: string;
  storyId: string;
  user: string;
  avatar: string;
  body: string;
  image?: string;
  time: string;
  isFollowing: boolean;
};

export type CommunitySuggestion = {
  id: string;
  user: string;
  avatar: string;
  reason: 'nearby' | 'similar_interests' | 'active_reader';
  distanceKm?: number;
  commonInterests: string[];
  isFollowing: boolean;
};

export type CommunityBookRecommendation = {
  id: string;
  title: string;
  author: string;
  cover: string;
  condition?: string;
  owner: { id: string; user: string };
  commonInterests: string[];
  isFollowing: boolean;
};

export type CommunityDiscovery = {
  stories: CommunityStoryPreview[];
  suggestions: CommunitySuggestion[];
  recommendedBooks: CommunityBookRecommendation[];
};

function relativeTime(date: Date): string {
  const minutes = Math.max(
    1,
    Math.floor((Date.now() - date.getTime()) / 60000)
  );
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} d`;
}

export async function getCommunityDiscovery(
  viewerId: number
): Promise<CommunityDiscovery> {
  const [storiesResult, suggestionsResult, booksResult] = await Promise.all([
    query<StoryAuthorRow>(
      `
        WITH viewer AS (
          SELECT id, interests, city, location, location_visibility, search_radius
          FROM users
          WHERE id = $1
        ), story_candidates AS (
          SELECT
            u.id AS user_id,
            COALESCE(u.alias, u.name) AS user_name,
            s.id AS story_id,
            s.body,
            s.image_url,
            s.created_at,
            EXISTS (
              SELECT 1
              FROM user_follows f
              WHERE f.follower_id = v.id AND f.followed_id = u.id
            ) AS is_following,
            ARRAY(
              SELECT interest
              FROM unnest(COALESCE(u.interests, ARRAY[]::TEXT[])) AS interest
              WHERE interest = ANY(COALESCE(v.interests, ARRAY[]::TEXT[]))
            ) AS common_interests,
            u.location_visibility IN ('city', 'neighborhood')
              AND v.location_visibility IN ('city', 'neighborhood')
              AND v.city IS NOT NULL
              AND u.city = v.city AS same_city,
            CASE
              WHEN u.location_visibility IN ('city', 'neighborhood')
                AND v.location_visibility IN ('city', 'neighborhood')
                AND u.location IS NOT NULL
                AND v.location IS NOT NULL
              THEN ST_Distance(u.location, v.location) / 1000
              ELSE NULL
            END AS distance_km
          FROM community_stories s
          JOIN users u ON u.id = s.user_id
          CROSS JOIN viewer v
          WHERE u.id <> v.id
            AND u.profile_visibility = 'public'
            AND u.role = 'user'
            AND NOT EXISTS (
              SELECT 1
              FROM user_blocks b
              WHERE (b.blocker_id = v.id AND b.blocked_id = u.id)
                 OR (b.blocker_id = u.id AND b.blocked_id = v.id)
            )
        ), latest_stories AS (
          SELECT DISTINCT ON (candidate.user_id)
            candidate.user_id,
            candidate.user_name,
            candidate.story_id,
            candidate.body,
            candidate.image_url,
            candidate.created_at,
            candidate.is_following
          FROM story_candidates candidate
          WHERE candidate.is_following
             OR cardinality(candidate.common_interests) > 0
             OR candidate.same_city
             OR candidate.distance_km <= COALESCE(
                  (SELECT search_radius FROM viewer),
                  25
                )
          ORDER BY candidate.user_id, candidate.created_at DESC,
                   candidate.story_id DESC
        )
        SELECT *
        FROM latest_stories
        ORDER BY created_at DESC, story_id DESC
        LIMIT 12
      `,
      [viewerId]
    ),
    query<SuggestionRow>(
      `
        WITH viewer AS (
          SELECT id, interests, city, location, location_visibility, search_radius
          FROM users
          WHERE id = $1
        ),
        candidate_base AS (
          SELECT
            u.id AS user_id,
            COALESCE(u.alias, u.name) AS user_name,
            ARRAY(
              SELECT interest
              FROM unnest(COALESCE(u.interests, ARRAY[]::TEXT[])) AS interest
              WHERE interest = ANY(COALESCE(v.interests, ARRAY[]::TEXT[]))
            ) AS common_interests,
            CASE
              WHEN u.location_visibility IN ('city', 'neighborhood')
                AND v.location_visibility IN ('city', 'neighborhood')
                AND u.location IS NOT NULL
                AND v.location IS NOT NULL
              THEN ST_Distance(u.location, v.location) / 1000
              ELSE NULL
            END AS distance_km,
            u.location_visibility IN ('city', 'neighborhood')
              AND v.location_visibility IN ('city', 'neighborhood')
              AND v.city IS NOT NULL
              AND u.city = v.city AS same_city,
            EXISTS (
              SELECT 1
              FROM user_follows f
              WHERE f.follower_id = v.id AND f.followed_id = u.id
            ) AS is_following,
            EXISTS (
              SELECT 1
              FROM community_stories s
              WHERE s.user_id = u.id
            ) OR EXISTS (
              SELECT 1
              FROM book_listings p
              WHERE p.user_id = u.id
                AND p.availability = 'public'
                AND p.is_draft = false
                AND p.status = 'available'
                AND (p.expires_at IS NULL OR p.expires_at > NOW())
            ) AS has_activity
          FROM users u
          CROSS JOIN viewer v
          WHERE u.id <> v.id
            AND u.role = 'user'
            AND u.profile_visibility = 'public'
            AND NOT EXISTS (
              SELECT 1
              FROM user_blocks b
              WHERE (b.blocker_id = v.id AND b.blocked_id = u.id)
                 OR (b.blocker_id = u.id AND b.blocked_id = v.id)
            )
        )
        SELECT user_id, user_name, distance_km, same_city, common_interests, is_following
        FROM candidate_base
        WHERE has_activity
          AND (
            cardinality(common_interests) > 0
            OR distance_km <= COALESCE(
              (SELECT search_radius FROM viewer),
              25
            )
            OR same_city
          )
        ORDER BY cardinality(common_interests) DESC,
                 distance_km ASC NULLS LAST,
                 user_id DESC
        LIMIT 6
      `,
      [viewerId]
    ),
    query<RecommendationRow>(
      `
        WITH viewer AS (
          SELECT id, interests
          FROM users
          WHERE id = $1
        ),
        candidate_books AS (
          SELECT
            p.id AS listing_id,
            b.title,
            b.author,
            COALESCE(img.url, b.cover_url) AS cover_url,
            owner.id AS owner_id,
            COALESCE(owner.alias, owner.name) AS owner_name,
            p.condition,
            ARRAY(
              SELECT interest
              FROM unnest(COALESCE(owner.interests, ARRAY[]::TEXT[])) AS interest
              WHERE interest = ANY(COALESCE(v.interests, ARRAY[]::TEXT[]))
            ) AS common_interests,
            EXISTS (
              SELECT 1
              FROM user_follows f
              WHERE f.follower_id = v.id AND f.followed_id = owner.id
            ) AS is_following
          FROM book_listings p
          JOIN books b ON b.id = p.book_id
          JOIN users owner ON owner.id = p.user_id
          CROSS JOIN viewer v
          LEFT JOIN LATERAL (
            SELECT url
            FROM book_listing_images
            WHERE book_listing_id = p.id
            ORDER BY is_primary DESC, id ASC
            LIMIT 1
          ) img ON true
          WHERE p.type = 'offer'
            AND p.availability = 'public'
            AND p.is_draft = false
            AND p.status = 'available'
            AND (p.expires_at IS NULL OR p.expires_at > NOW())
            AND owner.id <> v.id
            AND owner.profile_visibility = 'public'
            AND NOT EXISTS (
              SELECT 1
              FROM user_blocks blocked
              WHERE (blocked.blocker_id = v.id AND blocked.blocked_id = owner.id)
                 OR (blocked.blocker_id = owner.id AND blocked.blocked_id = v.id)
            )
        )
        SELECT listing_id, title, author, cover_url, owner_id, owner_name,
               condition, common_interests, is_following
        FROM candidate_books
        WHERE cardinality(common_interests) > 0
        ORDER BY is_following DESC,
                 cardinality(common_interests) DESC,
                 listing_id DESC
        LIMIT 6
      `,
      [viewerId]
    ),
  ]);

  const stories = storiesResult.rows.map((row) => ({
    id: String(row.user_id),
    storyId: String(row.story_id),
    user: row.user_name,
    avatar: AVATAR_FALLBACK,
    body: row.body,
    ...(row.image_url ? { image: row.image_url } : {}),
    time: relativeTime(new Date(row.created_at)),
    isFollowing: row.is_following,
  }));

  const suggestions = suggestionsResult.rows.map((row) => {
    const distanceKm =
      row.distance_km === null ? undefined : Number(row.distance_km);
    const isNearby =
      row.same_city || (distanceKm !== undefined && distanceKm <= 25);
    return {
      id: String(row.user_id),
      user: row.user_name,
      avatar: AVATAR_FALLBACK,
      reason: isNearby
        ? ('nearby' as const)
        : row.common_interests.length > 0
          ? ('similar_interests' as const)
          : ('active_reader' as const),
      ...(distanceKm !== undefined
        ? { distanceKm: Number(distanceKm.toFixed(1)) }
        : {}),
      commonInterests: row.common_interests,
      isFollowing: row.is_following,
    };
  });

  const recommendedBooks = booksResult.rows.map((row) => ({
    id: String(row.listing_id),
    title: row.title,
    author: row.author ?? '',
    cover: row.cover_url ?? '',
    ...(row.condition ? { condition: row.condition } : {}),
    owner: { id: String(row.owner_id), user: row.owner_name },
    commonInterests: row.common_interests,
    isFollowing: row.is_following,
  }));

  return { stories, suggestions, recommendedBooks };
}
