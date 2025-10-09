import { createHash } from 'node:crypto';

import { query } from '../db.js';
import {
  listCornersForMap,
  type CommunityCornerEntity,
} from '../repositories/communityCornerRepository.js';

export interface MapBoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapCornerPin {
  id: string;
  name: string;
  barrio: string;
  city: string;
  lat: number;
  lon: number;
  lastSignalAt: string | null;
  photos: string[];
  rules?: string;
  referencePointLabel?: string;
  themes: string[];
  isOpenNow?: boolean;
}

export type PublicationType = 'offer' | 'want' | 'donation' | 'sale';

export interface MapPublicationPin {
  id: string;
  title: string;
  authors: string[];
  type: PublicationType;
  photo?: string;
  distanceKm: number;
  cornerId: string;
  lat?: number;
  lon?: number;
}

export interface MapActivityPoint {
  id: string;
  lat: number;
  lon: number;
  intensity: number;
}

export interface MapFilters {
  distanceKm: number;
  themes: string[];
  openNow: boolean;
  recentActivity: boolean;
}

export interface MapQuery {
  bbox: MapBoundingBox;
  search: string;
  filters: MapFilters;
  layers: Set<'corners' | 'publications' | 'activity'>;
}

export interface MapResponseMeta {
  bbox: MapBoundingBox;
  generatedAt: string;
}

export interface MapResponse {
  corners: MapCornerPin[];
  publications: MapPublicationPin[];
  activity: MapActivityPoint[];
  meta: MapResponseMeta;
}

interface MapPublicationRow {
  id: number;
  title: string;
  author: string | null;
  type: 'offer' | 'want';
  sale: boolean;
  donation: boolean;
  corner_id: string | null;
  photo_url: string | null;
}

const DEFAULT_CITY = 'Ciudad Autónoma de Buenos Aires';
const DEFAULT_BARRIO = 'Zona comunitaria';
const DEFAULT_THEMES = ['Comunidad'];

const normalize = (value: string) => value.toLowerCase();

const matchesSearch = (value: string, term: string) =>
  normalize(value).includes(normalize(term));

const matchesCornerSearch = (corner: CommunityCornerEntity, term: string) =>
  matchesSearch(corner.name, term) ||
  matchesSearch(corner.locationSummary, term) ||
  matchesSearch(corner.address.street, term);

const matchesPublicationSearch = (
  publication: MapPublicationRow,
  term: string
) =>
  matchesSearch(publication.title, term) ||
  (publication.author ? matchesSearch(publication.author, term) : false);

const hasThemeOverlap = (themes: string[], filters: string[]) => {
  if (filters.length === 0) {
    return true;
  }

  const normalizedThemes = themes.map((theme) => normalize(theme));
  return filters.some((filter) => normalizedThemes.includes(normalize(filter)));
};

const toRadians = (value: number) => (value * Math.PI) / 180;

const haversineDistanceKm = (
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
) => {
  const R = 6371; // km
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);

  const c = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  const d = 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));

  return Math.round(R * d * 10) / 10;
};

const getCornerThemes = (corner: CommunityCornerEntity): string[] => {
  const themes = [...DEFAULT_THEMES];
  themes.push(
    corner.scope === 'public' ? 'Espacio abierto' : 'Espacio semiprivado'
  );
  themes.push(corner.status === 'active' ? 'Activo' : 'En pausa');
  return themes;
};

const metersToDegreesLat = (meters: number) => meters / 111_320;

const metersToDegreesLon = (meters: number, latitude: number) => {
  const radians = toRadians(latitude);
  const metersPerDegree = Math.max(1, 111_320 * Math.cos(radians));
  return meters / metersPerDegree;
};

const deriveOffsetFromId = (id: string) => {
  const hash = createHash('sha256').update(id).digest();
  const latFactor = hash[0] / 255;
  const lonFactor = hash[1] / 255;
  return {
    latFactor: latFactor * 2 - 1,
    lonFactor: lonFactor * 2 - 1,
  };
};

const APPROXIMATION_OFFSET_METERS = 150;

const getDisplayCoordinates = (
  corner: CommunityCornerEntity
): { lat: number; lon: number; approximate: boolean } => {
  const { latitude, longitude } = corner.coordinates;

  if (corner.visibilityPreference !== 'approximate') {
    return { lat: latitude, lon: longitude, approximate: false };
  }

  const { latFactor, lonFactor } = deriveOffsetFromId(corner.id);
  const latOffset = metersToDegreesLat(latFactor * APPROXIMATION_OFFSET_METERS);
  const lonOffset = metersToDegreesLon(
    lonFactor * APPROXIMATION_OFFSET_METERS,
    latitude
  );

  return {
    lat: latitude + latOffset,
    lon: longitude + lonOffset,
    approximate: true,
  };
};

const buildCornerPin = (corner: CommunityCornerEntity): MapCornerPin => {
  const photos = corner.photo?.url ? [corner.photo.url] : [];
  const barrio = corner.address.postalCode ?? DEFAULT_BARRIO;
  const coordinates = getDisplayCoordinates(corner);
  const basePin: MapCornerPin = {
    id: corner.id,
    name: corner.name,
    barrio,
    city: DEFAULT_CITY,
    lat: coordinates.lat,
    lon: coordinates.lon,
    lastSignalAt: corner.metrics.lastActivityAt,
    photos,
    rules: corner.rules ?? undefined,
    themes: getCornerThemes(corner),
    isOpenNow: corner.status === 'active',
  };

  if (coordinates.approximate) {
    basePin.referencePointLabel = corner.locationSummary;
  }

  return basePin;
};

const buildActivityPoints = (
  corners: CommunityCornerEntity[]
): MapActivityPoint[] =>
  corners
    .map((corner) => {
      const weekly = corner.metrics.weeklyExchanges;
      const total = corner.metrics.totalExchanges;
      const intensitySource = weekly > 0 ? weekly : total;
      if (intensitySource <= 0) {
        return null;
      }

      const intensity = Math.max(1, Math.min(5, intensitySource));
      const coordinates = getDisplayCoordinates(corner);
      return {
        id: `${corner.id}-activity`,
        lat: coordinates.lat,
        lon: coordinates.lon,
        intensity,
      } satisfies MapActivityPoint;
    })
    .filter((point): point is MapActivityPoint => point !== null);

const derivePublicationType = (row: MapPublicationRow): PublicationType => {
  if (row.sale) {
    return 'sale';
  }
  if (row.donation) {
    return 'donation';
  }
  if (row.type === 'want') {
    return 'want';
  }
  return 'offer';
};

const fetchPublications = async (
  cornerLookup: Map<string, CommunityCornerEntity>,
  search: string,
  themeFilters: string[],
  center: { lat: number; lon: number },
  maxDistanceKm: number
): Promise<MapPublicationPin[]> => {
  if (cornerLookup.size === 0) {
    return [];
  }

  const cornerIds = [...cornerLookup.keys()];

  const { rows } = await query<MapPublicationRow>(
    `SELECT
      bl.id,
      b.title,
      b.author,
      bl.type,
      bl.sale,
      bl.donation,
      bl.corner_id,
      img.url AS photo_url
    FROM book_listings bl
    JOIN books b ON bl.book_id = b.id
    LEFT JOIN LATERAL (
      SELECT url
      FROM book_listing_images
      WHERE book_listing_id = bl.id
      ORDER BY is_primary DESC, id ASC
      LIMIT 1
    ) img ON true
    WHERE bl.status = 'available'
      AND bl.availability = 'public'
      AND bl.is_draft = false
      AND bl.corner_id IS NOT NULL
      AND bl.corner_id = ANY($1::uuid[])`,
    [cornerIds]
  );

  const pins: MapPublicationPin[] = [];

  for (const row of rows) {
    const corner = row.corner_id ? cornerLookup.get(row.corner_id) : undefined;
    if (!corner) {
      continue;
    }

    if (
      search.length > 0 &&
      !matchesPublicationSearch(row, search) &&
      !matchesCornerSearch(corner, search)
    ) {
      continue;
    }

    if (!hasThemeOverlap(getCornerThemes(corner), themeFilters)) {
      continue;
    }

    const distanceKm = haversineDistanceKm(
      { lat: corner.coordinates.latitude, lon: corner.coordinates.longitude },
      center
    );

    if (maxDistanceKm > 0 && distanceKm > maxDistanceKm) {
      continue;
    }

    const authors = row.author ? [row.author] : [];
    const photo = row.photo_url ?? corner.photo?.url ?? undefined;
    const coordinates = getDisplayCoordinates(corner);

    pins.push({
      id: `listing-${row.id}`,
      title: row.title,
      authors,
      type: derivePublicationType(row),
      photo,
      distanceKm,
      cornerId: corner.id,
      lat: coordinates.lat,
      lon: coordinates.lon,
    });
  }

  return pins;
};

export async function getMapData(query: MapQuery): Promise<MapResponse> {
  const searchTerm = query.search.trim();
  const normalizedSearch = searchTerm.toLowerCase();
  const themeFilters = query.filters.themes
    .map((theme) => theme.trim())
    .filter((theme) => theme.length > 0)
    .map((theme) => theme.toLowerCase());

  const corners = await listCornersForMap(query.bbox);

  const filteredCorners = corners.filter((corner) => {
    const matchesTerm =
      normalizedSearch.length === 0 ||
      matchesCornerSearch(corner, normalizedSearch);
    const matchesTheme = hasThemeOverlap(getCornerThemes(corner), themeFilters);
    const matchesOpen = !query.filters.openNow || corner.status === 'active';

    return matchesTerm && matchesTheme && matchesOpen && !corner.draft;
  });

  const cornerLookup = new Map(
    filteredCorners.map((corner) => [corner.id, corner])
  );

  const centerPoint = {
    lat: (query.bbox.north + query.bbox.south) / 2,
    lon: (query.bbox.east + query.bbox.west) / 2,
  };

  const publications = query.layers.has('publications')
    ? await fetchPublications(
        cornerLookup,
        normalizedSearch,
        themeFilters,
        centerPoint,
        query.filters.distanceKm
      )
    : [];

  const activity =
    query.layers.has('activity') && query.filters.recentActivity
      ? buildActivityPoints(filteredCorners)
      : [];

  const cornerPins = query.layers.has('corners')
    ? filteredCorners.map((corner) => buildCornerPin(corner))
    : [];

  return {
    corners: cornerPins,
    publications,
    activity,
    meta: {
      bbox: query.bbox,
      generatedAt: new Date().toISOString(),
    },
  };
}
