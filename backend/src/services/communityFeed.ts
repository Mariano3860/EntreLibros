import type { CommunityListing } from './communityStats.js';
import {
  COMMUNITY_CORNERS,
  COMMUNITY_LISTINGS,
  COMMUNITY_REFERENCE_DATE,
  COMMUNITY_USERS,
} from './communityStats.mocks.js';

export type FeedItem = BookFeedItem | SaleFeedItem | SeekingFeedItem;

export interface FeedBase {
  id: string;
  user: string;
  avatar: string;
  time: string;
  likes: number;
  corner?: FeedCorner;
}

export interface FeedCorner {
  id: string;
  name: string;
}

export interface BookFeedItem extends FeedBase {
  type: 'book';
  title: string;
  author: string;
  cover: string;
}

export interface SaleFeedItem extends FeedBase {
  type: 'sale';
  title: string;
  price: number;
  condition: string;
  cover: string;
}

export interface SeekingFeedItem extends FeedBase {
  type: 'seeking';
  title: string;
}

export interface CommunityFeedOptions {
  page: number;
  size: number;
}

const cornersById = new Map(
  COMMUNITY_CORNERS.map((corner) => [corner.id, corner] as const)
);

const usersById = new Map(
  COMMUNITY_USERS.map((user) => [user.id, user] as const)
);

let cachedFeed: FeedItem[] | null = null;

export function getCommunityFeed(options: CommunityFeedOptions): FeedItem[] {
  if (!cachedFeed) {
    cachedFeed = buildFeed();
  }

  const { page, size } = options;
  const start = page * size;
  if (start >= cachedFeed.length) {
    return [];
  }

  return cachedFeed
    .slice(start, start + size)
    .map((item) => cloneFeedItem(item));
}

function buildFeed(): FeedItem[] {
  return COMMUNITY_LISTINGS.slice()
    .sort((a, b) => {
      const diff =
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (diff !== 0) {
        return diff;
      }
      return a.id.localeCompare(b.id, 'es');
    })
    .map((listing) => toFeedItem(listing))
    .filter((item): item is FeedItem => item !== null);
}

function toFeedItem(listing: CommunityListing): FeedItem | null {
  const user = usersById.get(listing.userId);
  if (!user) {
    return null;
  }

  const base: FeedBase = {
    id: listing.id,
    user: user.displayName,
    avatar: user.avatar,
    time: relativeTimeFromReference(listing.createdAt),
    likes: listing.likes,
    corner: listing.cornerId ? toFeedCorner(listing.cornerId) : undefined,
  };

  if (listing.category === 'book' && listing.author && listing.cover) {
    return {
      ...base,
      type: 'book',
      title: listing.title,
      author: listing.author,
      cover: listing.cover,
    };
  }

  if (
    listing.category === 'sale' &&
    listing.cover &&
    listing.author &&
    typeof listing.price === 'number' &&
    typeof listing.condition === 'string'
  ) {
    return {
      ...base,
      type: 'sale',
      title: listing.title,
      price: listing.price,
      condition: listing.condition,
      cover: listing.cover,
    };
  }

  if (listing.category === 'seeking') {
    return {
      ...base,
      type: 'seeking',
      title: listing.title,
    };
  }

  return null;
}

function toFeedCorner(cornerId: string): FeedCorner | undefined {
  const corner = cornersById.get(cornerId);
  if (!corner) {
    return undefined;
  }
  return { id: corner.id, name: corner.name };
}

function relativeTimeFromReference(createdAt: string): string {
  const created = new Date(createdAt).getTime();
  const reference = COMMUNITY_REFERENCE_DATE.getTime();
  const diffMinutes = Math.max(
    1,
    Math.floor((reference - created) / (60 * 1000))
  );

  if (diffMinutes < 60) {
    return `hace ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `hace ${diffHours} h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `hace ${diffDays} d`;
}

function cloneFeedItem(item: FeedItem): FeedItem {
  const base = cloneFeedBase(item);
  switch (item.type) {
    case 'book':
      return {
        ...base,
        type: 'book',
        title: item.title,
        author: item.author,
        cover: item.cover,
      };
    case 'sale':
      return {
        ...base,
        type: 'sale',
        title: item.title,
        price: item.price,
        condition: item.condition,
        cover: item.cover,
      };
    case 'seeking':
      return {
        ...base,
        type: 'seeking',
        title: item.title,
      };
  }

  const _exhaustiveCheck: never = item;
  return _exhaustiveCheck;
}

function cloneFeedBase(item: FeedBase): FeedBase {
  return {
    id: item.id,
    user: item.user,
    avatar: item.avatar,
    time: item.time,
    likes: item.likes,
    corner: item.corner ? { ...item.corner } : undefined,
  };
}
