import {
  COMMUNITY_CORNERS,
  COMMUNITY_LISTINGS,
  COMMUNITY_REFERENCE_DATE,
  COMMUNITY_USERS,
  POPULAR_SEARCH_SEED,
  TREND_EXCHANGES,
  TREND_NEW_BOOKS,
} from './communityStats.mocks.js';

export interface CommunityUserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  languages: string[];
  city: string;
  barrio: string;
  lastActiveAt: string;
  exchangesCompleted: number;
  booksPublished: number;
}

export interface CommunityCorner {
  id: string;
  name: string;
  barrio: string;
  city: string;
  active: boolean;
  map: { top: number; left: number };
}

export type CommunityListingCategory = 'book' | 'sale' | 'seeking';

export interface CommunityListing {
  id: string;
  userId: string;
  cornerId: string | null;
  title: string;
  author?: string;
  cover?: string;
  price?: number;
  condition?: string;
  category: CommunityListingCategory;
  likes: number;
  createdAt: string;
  searchTags: string[];
}

export interface CommunityStatsKpis {
  exchanges: number;
  activeHouses: number;
  activeUsers: number;
  booksPublished: number;
}

export type TopContributorMetric = 'exchanges' | 'books';

export interface TopContributor {
  username: string;
  metric: TopContributorMetric;
  value: number;
}

export interface HotSearch {
  term: string;
  count: number;
}

export interface MapPin {
  top: string;
  left: string;
}

export interface CommunityStats {
  kpis: CommunityStatsKpis;
  trendExchanges: number[];
  trendNewBooks: number[];
  topContributors: TopContributor[];
  hotSearches: HotSearch[];
  activeHousesMap: MapPin[];
}

export interface ActivityItem {
  id: string;
  user: string;
  avatar: string;
}

export interface SuggestionItem {
  id: string;
  user: string;
  avatar: string;
}

let cachedStats: CommunityStats | null = null;
let cachedActivity: ActivityItem[] | null = null;
let cachedSuggestions: SuggestionItem[] | null = null;

export function getCommunityStats(): CommunityStats {
  if (!cachedStats) {
    cachedStats = buildCommunityStats();
  }
  return cloneStats(cachedStats);
}

export function getCommunityActivity(): ActivityItem[] {
  if (!cachedActivity) {
    cachedActivity = buildCommunityActivity();
  }
  return cachedActivity.map((item) => ({ ...item }));
}

export function getCommunitySuggestions(): SuggestionItem[] {
  if (!cachedSuggestions) {
    cachedSuggestions = buildCommunitySuggestions();
  }
  return cachedSuggestions.map((item) => ({ ...item }));
}

function buildCommunityStats(): CommunityStats {
  const exchanges = COMMUNITY_USERS.reduce(
    (total, profile) => total + profile.exchangesCompleted,
    0
  );

  const activeCutoff = new Date(COMMUNITY_REFERENCE_DATE.getTime());
  activeCutoff.setUTCDate(activeCutoff.getUTCDate() - 30);

  const activeUsers = COMMUNITY_USERS.filter(
    (profile) =>
      new Date(profile.lastActiveAt).getTime() >= activeCutoff.getTime()
  ).length;

  const activeHouses = COMMUNITY_CORNERS.filter(
    (corner) => corner.active
  ).length;

  const booksPublished = COMMUNITY_LISTINGS.filter(
    (listing) => listing.category === 'book' || listing.category === 'sale'
  ).length;

  const hotSearches = computeHotSearches();
  const topContributors = computeTopContributors();
  const activeHousesMap = COMMUNITY_CORNERS.filter((corner) => corner.active)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
    .map((corner) => ({
      top: `${corner.map.top}%`,
      left: `${corner.map.left}%`,
    }));

  return {
    kpis: {
      exchanges,
      activeHouses,
      activeUsers,
      booksPublished,
    },
    trendExchanges: TREND_EXCHANGES.slice(),
    trendNewBooks: TREND_NEW_BOOKS.slice(),
    topContributors,
    hotSearches,
    activeHousesMap,
  };
}

function computeHotSearches(): HotSearch[] {
  const counts = new Map<string, number>();

  for (const listing of COMMUNITY_LISTINGS) {
    for (const tag of listing.searchTags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  for (const seed of POPULAR_SEARCH_SEED) {
    if (!counts.has(seed.term)) {
      counts.set(seed.term, seed.weight);
    } else {
      counts.set(seed.term, (counts.get(seed.term) ?? 0) + seed.weight);
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }
      return a[0].localeCompare(b[0], 'es');
    })
    .slice(0, 6)
    .map(([term, count]) => ({ term, count }));
}

function computeTopContributors(): TopContributor[] {
  const byExchanges = COMMUNITY_USERS.slice().sort((a, b) => {
    if (b.exchangesCompleted !== a.exchangesCompleted) {
      return b.exchangesCompleted - a.exchangesCompleted;
    }
    return a.username.localeCompare(b.username, 'es');
  });

  const byBooks = COMMUNITY_USERS.slice().sort((a, b) => {
    if (b.booksPublished !== a.booksPublished) {
      return b.booksPublished - a.booksPublished;
    }
    return a.username.localeCompare(b.username, 'es');
  });

  const results: TopContributor[] = [];
  const seen = new Set<string>();

  for (const profile of byExchanges.slice(0, 3)) {
    results.push({
      username: profile.username,
      metric: 'exchanges',
      value: profile.exchangesCompleted,
    });
    seen.add(profile.id);
  }

  for (const profile of byBooks) {
    if (results.length >= 5) {
      break;
    }
    if (seen.has(profile.id)) {
      continue;
    }
    results.push({
      username: profile.username,
      metric: 'books',
      value: profile.booksPublished,
    });
    seen.add(profile.id);
  }

  return results;
}

function buildCommunityActivity(): ActivityItem[] {
  return COMMUNITY_USERS.slice()
    .sort((a, b) => {
      const diff =
        new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime();
      if (diff !== 0) {
        return diff;
      }
      return a.username.localeCompare(b.username, 'es');
    })
    .slice(0, 6)
    .map((profile) => ({
      id: profile.id,
      user: profile.displayName,
      avatar: profile.avatar,
    }));
}

function buildCommunitySuggestions(): SuggestionItem[] {
  const priorityBarrios = new Set(['Palermo', 'Villa Crespo', 'Chacarita']);

  const scored = COMMUNITY_USERS.map((profile) => {
    let score = 0;
    if (priorityBarrios.has(profile.barrio)) {
      score += 3;
    } else if (profile.city === 'Buenos Aires') {
      score += 1;
    }
    if (profile.languages.includes('en')) {
      score += 2;
    }
    if (profile.languages.includes('pt')) {
      score += 1;
    }
    score += Math.floor(profile.exchangesCompleted / 5);

    return { profile, score };
  });

  return scored
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.profile.username.localeCompare(b.profile.username, 'es');
    })
    .slice(0, 5)
    .map(({ profile }) => ({
      id: profile.id,
      user: `${profile.displayName} · ${profile.barrio}`,
      avatar: profile.avatar,
    }));
}

function cloneStats(stats: CommunityStats): CommunityStats {
  return {
    kpis: { ...stats.kpis },
    trendExchanges: stats.trendExchanges.slice(),
    trendNewBooks: stats.trendNewBooks.slice(),
    topContributors: stats.topContributors.map((item) => ({ ...item })),
    hotSearches: stats.hotSearches.map((item) => ({ ...item })),
    activeHousesMap: stats.activeHousesMap.map((pin) => ({ ...pin })),
  };
}
