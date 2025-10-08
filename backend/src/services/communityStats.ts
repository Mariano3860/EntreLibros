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

export const COMMUNITY_REFERENCE_DATE = new Date('2025-11-01T12:00:00.000Z');

const USERS: readonly CommunityUserProfile[] = [
  {
    id: 'user-1',
    username: '@sofi',
    displayName: 'Sofía M.',
    avatar: 'https://images.entrelibros.org/avatars/sofia-m.png',
    languages: ['es', 'en'],
    city: 'Buenos Aires',
    barrio: 'Palermo',
    lastActiveAt: '2025-10-30T18:45:00.000Z',
    exchangesCompleted: 18,
    booksPublished: 12,
  },
  {
    id: 'user-2',
    username: '@marcos',
    displayName: 'Marcos R.',
    avatar: 'https://images.entrelibros.org/avatars/marcos-r.png',
    languages: ['es'],
    city: 'Buenos Aires',
    barrio: 'Chacarita',
    lastActiveAt: '2025-10-30T16:12:00.000Z',
    exchangesCompleted: 21,
    booksPublished: 9,
  },
  {
    id: 'user-3',
    username: '@lucia',
    displayName: 'Lucía F.',
    avatar: 'https://images.entrelibros.org/avatars/lucia-f.png',
    languages: ['es', 'fr'],
    city: 'Buenos Aires',
    barrio: 'Villa Crespo',
    lastActiveAt: '2025-10-28T22:05:00.000Z',
    exchangesCompleted: 9,
    booksPublished: 14,
  },
  {
    id: 'user-4',
    username: '@aylen',
    displayName: 'Aylén P.',
    avatar: 'https://images.entrelibros.org/avatars/aylen-p.png',
    languages: ['es', 'pt'],
    city: 'Buenos Aires',
    barrio: 'Caballito',
    lastActiveAt: '2025-10-26T11:40:00.000Z',
    exchangesCompleted: 15,
    booksPublished: 6,
  },
  {
    id: 'user-5',
    username: '@diego',
    displayName: 'Diego L.',
    avatar: 'https://images.entrelibros.org/avatars/diego-l.png',
    languages: ['es', 'en'],
    city: 'Buenos Aires',
    barrio: 'Almagro',
    lastActiveAt: '2025-10-15T08:10:00.000Z',
    exchangesCompleted: 6,
    booksPublished: 4,
  },
  {
    id: 'user-6',
    username: '@valen',
    displayName: 'Valen C.',
    avatar: 'https://images.entrelibros.org/avatars/valen-c.png',
    languages: ['es', 'en'],
    city: 'La Plata',
    barrio: 'Tolosa',
    lastActiveAt: '2025-09-29T19:33:00.000Z',
    exchangesCompleted: 4,
    booksPublished: 5,
  },
] as const;

const CORNERS: readonly CommunityCorner[] = [
  {
    id: 'corner-1',
    name: 'Rincón Plaza Malabia',
    barrio: 'Palermo',
    city: 'Buenos Aires',
    active: true,
    map: { top: 42, left: 58 },
  },
  {
    id: 'corner-2',
    name: 'Bibliorincón Parque Patricios',
    barrio: 'Parque Patricios',
    city: 'Buenos Aires',
    active: true,
    map: { top: 68, left: 35 },
  },
  {
    id: 'corner-3',
    name: 'Club de Lectura Chacarita',
    barrio: 'Chacarita',
    city: 'Buenos Aires',
    active: true,
    map: { top: 51, left: 46 },
  },
  {
    id: 'corner-4',
    name: 'Rincón Barracas Sur',
    barrio: 'Barracas',
    city: 'Buenos Aires',
    active: false,
    map: { top: 79, left: 62 },
  },
  {
    id: 'corner-5',
    name: 'Punto de Lectura Villa Crespo',
    barrio: 'Villa Crespo',
    city: 'Buenos Aires',
    active: true,
    map: { top: 47, left: 41 },
  },
  {
    id: 'corner-6',
    name: 'Rincón Colegiales',
    barrio: 'Colegiales',
    city: 'Buenos Aires',
    active: true,
    map: { top: 44, left: 53 },
  },
] as const;

const LISTINGS: readonly CommunityListing[] = [
  {
    id: 'listing-1',
    userId: 'user-1',
    cornerId: 'corner-1',
    title: 'Los años felices',
    author: 'Claudia Piñeiro',
    cover: 'https://images.entrelibros.org/books/anios-felices.jpg',
    category: 'book',
    likes: 42,
    createdAt: '2025-10-30T17:20:00.000Z',
    searchTags: ['fantasia juvenil', 'club de lectura', 'thriller'],
  },
  {
    id: 'listing-2',
    userId: 'user-2',
    cornerId: 'corner-2',
    title: 'La invención de la naturaleza',
    author: 'Andrea Wulf',
    cover: 'https://images.entrelibros.org/books/invencion-naturaleza.jpg',
    price: 12000,
    condition: 'como nuevo',
    category: 'sale',
    likes: 35,
    createdAt: '2025-10-30T15:00:00.000Z',
    searchTags: ['ensayo feminista', 'naturaleza', 'biografia'],
  },
  {
    id: 'listing-3',
    userId: 'user-3',
    cornerId: 'corner-5',
    title: 'Busco: Antología Poesía Mapuche',
    category: 'seeking',
    likes: 21,
    createdAt: '2025-10-29T20:10:00.000Z',
    searchTags: ['poesia contemporanea', 'traduccion', 'lenguas originarias'],
  },
  {
    id: 'listing-4',
    userId: 'user-4',
    cornerId: 'corner-3',
    title: 'El jardín secreto',
    author: 'Frances Hodgson Burnett',
    cover: 'https://images.entrelibros.org/books/jardin-secreto.jpg',
    category: 'book',
    likes: 29,
    createdAt: '2025-10-28T13:45:00.000Z',
    searchTags: ['infancias', 'aventura', 'clásicos'],
  },
  {
    id: 'listing-5',
    userId: 'user-1',
    cornerId: 'corner-1',
    title: 'Astroguía del Cono Sur',
    author: 'María Pía López',
    cover: 'https://images.entrelibros.org/books/astroguia-conosur.jpg',
    price: 6800,
    condition: 'usado',
    category: 'sale',
    likes: 18,
    createdAt: '2025-10-27T10:05:00.000Z',
    searchTags: ['astro', 'ensayo feminista', 'club de lectura'],
  },
  {
    id: 'listing-6',
    userId: 'user-2',
    cornerId: 'corner-6',
    title: 'Invasión 2040',
    author: 'Liliana Bodoc',
    cover: 'https://images.entrelibros.org/books/invasion-2040.jpg',
    category: 'book',
    likes: 24,
    createdAt: '2025-10-26T18:30:00.000Z',
    searchTags: [
      'ciencia ficcion argentina',
      'distopia latina',
      'fantasia juvenil',
    ],
  },
  {
    id: 'listing-7',
    userId: 'user-5',
    cornerId: null,
    title: 'Busco: Historias mínimas del AMBA',
    category: 'seeking',
    likes: 11,
    createdAt: '2025-10-25T09:15:00.000Z',
    searchTags: [
      'cronica urbana',
      'historia local',
      'ciencia ficcion argentina',
    ],
  },
  {
    id: 'listing-8',
    userId: 'user-3',
    cornerId: 'corner-5',
    title: 'Economías para el bien común',
    author: 'Christian Felber',
    cover: 'https://images.entrelibros.org/books/economias-bien-comun.jpg',
    price: 5400,
    condition: 'como nuevo',
    category: 'sale',
    likes: 16,
    createdAt: '2025-10-24T16:00:00.000Z',
    searchTags: ['economia solidaria', 'ensayo feminista', 'naturaleza'],
  },
  {
    id: 'listing-9',
    userId: 'user-4',
    cornerId: 'corner-3',
    title: 'La trama celeste',
    author: 'Adolfo Bioy Casares',
    cover: 'https://images.entrelibros.org/books/trama-celeste.jpg',
    category: 'book',
    likes: 14,
    createdAt: '2025-10-23T11:30:00.000Z',
    searchTags: ['ciencia ficcion argentina', 'clásicos', 'fantasia juvenil'],
  },
  {
    id: 'listing-10',
    userId: 'user-6',
    cornerId: 'corner-4',
    title: 'Crónicas del Río de la Plata',
    author: 'Eduardo Belgrano Rawson',
    cover: 'https://images.entrelibros.org/books/cronicas-rio-plata.jpg',
    category: 'book',
    likes: 9,
    createdAt: '2025-10-22T18:20:00.000Z',
    searchTags: ['historia local', 'cronica urbana'],
  },
] as const;

const POPULAR_SEARCH_SEED: ReadonlyArray<{ term: string; weight: number }> = [
  { term: 'ensayo feminista', weight: 2 },
  { term: 'fantasia juvenil', weight: 1 },
  { term: 'ciencia ficcion argentina', weight: 0 },
  { term: 'club de lectura', weight: 1 },
  { term: 'historia local', weight: 0 },
];

const TREND_EXCHANGES = [36, 42, 45, 51, 58, 64, 72];
const TREND_NEW_BOOKS = [18, 21, 24, 22, 27, 29, 33];

let cachedStats: CommunityStats | null = null;
let cachedActivity: ActivityItem[] | null = null;
let cachedSuggestions: SuggestionItem[] | null = null;

export const COMMUNITY_USERS: readonly CommunityUserProfile[] = USERS;
export const COMMUNITY_CORNERS: readonly CommunityCorner[] = CORNERS;
export const COMMUNITY_LISTINGS: readonly CommunityListing[] = LISTINGS;

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
  const exchanges = USERS.reduce(
    (total, profile) => total + profile.exchangesCompleted,
    0
  );

  const activeCutoff = new Date(COMMUNITY_REFERENCE_DATE.getTime());
  activeCutoff.setUTCDate(activeCutoff.getUTCDate() - 30);

  const activeUsers = USERS.filter(
    (profile) =>
      new Date(profile.lastActiveAt).getTime() >= activeCutoff.getTime()
  ).length;

  const activeHouses = CORNERS.filter((corner) => corner.active).length;

  const booksPublished = LISTINGS.filter(
    (listing) => listing.category === 'book' || listing.category === 'sale'
  ).length;

  const hotSearches = computeHotSearches();
  const topContributors = computeTopContributors();
  const activeHousesMap = CORNERS.filter((corner) => corner.active)
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

  for (const listing of LISTINGS) {
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
  const byExchanges = USERS.slice().sort((a, b) => {
    if (b.exchangesCompleted !== a.exchangesCompleted) {
      return b.exchangesCompleted - a.exchangesCompleted;
    }
    return a.username.localeCompare(b.username, 'es');
  });

  const byBooks = USERS.slice().sort((a, b) => {
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
  return USERS.slice()
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

  const scored = USERS.map((profile) => {
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
