import { query } from '../db.js';
import { getCornersMap } from './communityCorners.js';
import { listCommunityStories } from '../repositories/communityStoryRepository.js';

type FeedCategory = 'book' | 'sale' | 'seeking';

export type PersistedFeedItem = {
  id: string;
  user: string;
  avatar: string;
  time: string;
  likes: number;
  corner?: { id: string; name: string };
  type: FeedCategory | 'story';
  title: string;
  author?: string;
  cover?: string;
  price?: number;
  condition?: string;
  body?: string;
  image?: string;
  book?: { id: string; title: string; author: string; cover: string };
  createdAt?: Date;
};

export type PersistedActivityItem = {
  id: string;
  user: string;
  avatar: string;
};

export type PersistedSuggestionItem = PersistedActivityItem;

export type PersistedCommunityStats = {
  kpis: {
    exchanges: number;
    activeHouses: number;
    activeUsers: number;
    booksPublished: number;
  };
  trendExchanges: number[];
  trendNewBooks: number[];
  topContributors: Array<{
    username: string;
    metric: 'exchanges' | 'books';
    value: number;
  }>;
  hotSearches: Array<{ term: string; count: number }>;
  activeHousesMap: Array<{ top: string; left: string }>;
};

type FeedRow = {
  id: number;
  user_name: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  price_amount: string | number | null;
  condition: string | null;
  category: FeedCategory;
  corner_id: string | null;
  corner_name: string | null;
  created_at: Date;
};

type ActivityRow = {
  id: number;
  user_name: string;
};

type ContributorRow = {
  username: string;
  metric: 'exchanges' | 'books';
  value: number | string;
};

const AVATAR_FALLBACK = '/logo.svg';

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

function publicListingWhere(alias: string): string {
  return `${alias}.availability = 'public'
    AND ${alias}.is_draft = false
    AND ${alias}.status = 'available'
    AND (${alias}.expires_at IS NULL OR ${alias}.expires_at > NOW())`;
}

export async function getPersistedCommunityFeed(
  page: number,
  size: number
): Promise<PersistedFeedItem[]> {
  const safeSize = Math.min(Math.max(Math.trunc(size), 1), 20);
  const safePage = Math.max(Math.trunc(page), 0);
  const { rows } = await query<FeedRow>(
    `
      SELECT
        p.id,
        COALESCE(u.alias, u.name) AS user_name,
        b.title,
        b.author,
        COALESCE(img.url, b.cover_url) AS cover_url,
        p.price_amount,
        p.condition,
        CASE WHEN p.type = 'want' THEN 'seeking'
             WHEN p.sale THEN 'sale'
             ELSE 'book' END AS category,
        p.corner_id,
        c.name AS corner_name,
        p.created_at
      FROM book_listings p
      JOIN books b ON b.id = p.book_id
      JOIN users u ON u.id = p.user_id
      LEFT JOIN community_corners c ON c.id::text = p.corner_id
      LEFT JOIN LATERAL (
        SELECT url
        FROM book_listing_images
        WHERE book_listing_id = p.id
        ORDER BY is_primary DESC, id ASC
        LIMIT 1
      ) img ON true
      WHERE ${publicListingWhere('p')}
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT $1 OFFSET $2
    `,
    [safeSize, safePage * safeSize]
  );
  const stories = await listCommunityStories(safeSize, safePage * safeSize);
  const listingItems = rows.map((row) => {
    const base = {
      id: String(row.id),
      user: row.user_name,
      avatar: AVATAR_FALLBACK,
      time: relativeTime(new Date(row.created_at)),
      likes: 0,
      ...(row.corner_id && row.corner_name
        ? { corner: { id: row.corner_id, name: row.corner_name } }
        : {}),
      createdAt: new Date(row.created_at),
    };

    if (row.category === 'sale') {
      return {
        ...base,
        type: 'sale' as const,
        title: row.title,
        price: Number(row.price_amount ?? 0),
        condition: row.condition ?? '',
        cover: row.cover_url ?? '',
      };
    }

    if (row.category === 'seeking') {
      return { ...base, type: 'seeking' as const, title: row.title };
    }

    return {
      ...base,
      type: 'book' as const,
      title: row.title,
      author: row.author ?? '',
      cover: row.cover_url ?? '',
    };
  });
  const storyItems = stories.map((story) => ({
    id: story.id,
    user: story.user,
    avatar: story.avatar,
    time: story.time,
    likes: story.likes,
    type: 'story' as const,
    title: story.body,
    body: story.body,
    ...(story.image ? { image: story.image } : {}),
    ...(story.book ? { book: story.book } : {}),
    createdAt: story.createdAt,
  }));
  return [...listingItems, ...storyItems]
    .map((item) => ({
      item,
      createdAt: item.createdAt ?? new Date(0),
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, safeSize)
    .map(({ item }) => {
      const { createdAt: _createdAt, ...publicItem } = item;
      return publicItem;
    });
}

export async function getPersistedCommunityActivity(): Promise<
  PersistedActivityItem[]
> {
  const { rows } = await query<ActivityRow>(
    `
      SELECT DISTINCT ON (u.id) u.id, COALESCE(u.alias, u.name) AS user_name
      FROM users u
      JOIN book_listings p ON p.user_id = u.id
      WHERE ${publicListingWhere('p')}
      ORDER BY u.id, p.created_at DESC
      LIMIT 6
    `
  );

  return rows.map((row) => ({
    id: String(row.id),
    user: row.user_name,
    avatar: AVATAR_FALLBACK,
  }));
}

export async function getPersistedCommunitySuggestions(): Promise<
  PersistedSuggestionItem[]
> {
  const { rows } = await query<ActivityRow>(
    `
      SELECT u.id, COALESCE(u.alias, u.name) AS user_name
      FROM users u
      WHERE EXISTS (
        SELECT 1 FROM book_listings p
        WHERE p.user_id = u.id AND ${publicListingWhere('p')}
      )
      ORDER BY u.id DESC
      LIMIT 5
    `
  );

  return rows.map((row) => ({
    id: String(row.id),
    user: row.user_name,
    avatar: AVATAR_FALLBACK,
  }));
}

export async function getPersistedCommunityStats(): Promise<PersistedCommunityStats> {
  const [
    kpiResult,
    trendBooksResult,
    trendExchangesResult,
    contributorResult,
    map,
  ] = await Promise.all([
    query<{
      exchanges: number | string;
      active_houses: number | string;
      active_users: number | string;
      books_published: number | string;
    }>(
      `
          SELECT
            (SELECT COUNT(*) FROM exchange_agreements WHERE state = 'completed') AS exchanges,
            (SELECT COUNT(*) FROM community_corners WHERE status = 'active' AND draft = false) AS active_houses,
            (SELECT COUNT(DISTINCT user_id) FROM book_listings WHERE ${publicListingWhere('book_listings')}) AS active_users,
            (SELECT COUNT(*) FROM book_listings WHERE ${publicListingWhere('book_listings')}) AS books_published
        `
    ),
    query<{ value: number | string }>(
      `
          SELECT COUNT(*) AS value
          FROM book_listings p
          WHERE ${publicListingWhere('p')}
          GROUP BY DATE_TRUNC('week', p.created_at)
          ORDER BY DATE_TRUNC('week', p.created_at) DESC
          LIMIT 7
        `
    ),
    query<{ value: number | string }>(
      `
          SELECT COUNT(*) AS value
          FROM exchange_agreements
          WHERE state = 'completed'
          GROUP BY DATE_TRUNC('week', updated_at)
          ORDER BY DATE_TRUNC('week', updated_at) DESC
          LIMIT 7
        `
    ),
    query<ContributorRow>(
      `
          SELECT username, metric, value
          FROM (
            SELECT COALESCE(u.alias, u.name) AS username,
                   'books'::text AS metric,
                   COUNT(*)::int AS value
            FROM users u
            JOIN book_listings p ON p.user_id = u.id
            WHERE ${publicListingWhere('p')}
            GROUP BY u.id, u.alias, u.name
            ORDER BY COUNT(*) DESC, username
            LIMIT 5
          ) contributors
        `
    ),
    getCornersMap(),
  ]);

  const kpis = kpiResult.rows[0];
  return {
    kpis: {
      exchanges: Number(kpis?.exchanges ?? 0),
      activeHouses: Number(kpis?.active_houses ?? 0),
      activeUsers: Number(kpis?.active_users ?? 0),
      booksPublished: Number(kpis?.books_published ?? 0),
    },
    trendExchanges: trendExchangesResult.rows
      .map((row) => Number(row.value))
      .reverse(),
    trendNewBooks: trendBooksResult.rows
      .map((row) => Number(row.value))
      .reverse(),
    topContributors: contributorResult.rows.map((row) => ({
      username: row.username,
      metric: row.metric,
      value: Number(row.value),
    })),
    hotSearches: [],
    activeHousesMap: map.pins.map((pin) => ({
      top: `${pin.y}%`,
      left: `${pin.x}%`,
    })),
  };
}
