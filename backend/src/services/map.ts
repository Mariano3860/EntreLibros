import { createHash } from 'node:crypto';

import { DatabaseError } from 'pg';

import { clamp } from '../utils/math.js';
import { listPublicBookListings } from '../repositories/bookListingRepository.js';
import {
  listCornersForMap,
  type CommunityCornerEntity,
  type CommunityCornerStatus,
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
  distanceKm: number | null;
  lastSignalAt: string | null;
  photos: string[];
  rules?: string;
  referencePointLabel?: string;
  themes: string[];
  isOpenNow?: boolean;
  status: CommunityCornerStatus;
}

export type PublicationType = 'offer' | 'want' | 'donation' | 'sale';

export interface MapPublicationPin {
  id: string;
  title: string;
  authors: string[];
  type: PublicationType;
  photo?: string;
  distanceKm: number | null;
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
  distanceKm: 1 | 5 | 30 | 50 | null;
  themes: string[];
  openNow: boolean;
  recentActivity: boolean;
}

export interface MapQuery {
  bbox: MapBoundingBox;
  center?: { latitude: number; longitude: number };
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

const hasThemeOverlap = (themes: string[], filters: string[]) => {
  if (filters.length === 0) {
    return true;
  }

  const normalizedThemes = themes.map((theme) => normalize(theme));
  return filters.some((filter) => normalizedThemes.includes(normalize(filter)));
};

const toRadians = (value: number) => (value * Math.PI) / 180;

const calculateHaversineDistanceKm = (
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

  return R * d;
};

const roundDistanceKm = (distanceKm: number) =>
  Math.round(distanceKm * 10) / 10;

const getCornerThemes = (corner: CommunityCornerEntity): string[] => {
  const themes = [...DEFAULT_THEMES];
  themes.push(
    corner.scope === 'public' ? 'Espacio abierto' : 'Espacio semiprivado'
  );
  themes.push(corner.status === 'active' ? 'Activo' : 'En pausa');
  return themes;
};

// Approximate meters per degree of latitude at the equator
const METERS_PER_DEGREE_LATITUDE = 111_320;

const metersToDegreesLat = (meters: number) =>
  meters / METERS_PER_DEGREE_LATITUDE;

const metersToDegreesLon = (meters: number, latitude: number) => {
  const radians = toRadians(latitude);
  const metersPerDegree = Math.max(
    1,
    METERS_PER_DEGREE_LATITUDE * Math.cos(radians)
  );
  return meters / metersPerDegree;
};

// Generates deterministic coordinate offsets for approximate locations by hashing
// the corner ID and normalizing to [-1, 1] range. This ensures the same corner
// always gets the same offset while appearing random.
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

export const getDisplayCoordinates = (
  corner: CommunityCornerEntity
): { lat: number; lon: number; approximate: boolean } => {
  const { latitude, longitude } = corner.coordinates;

  if (corner.visibilityPreference !== 'approximate') {
    // Public map pins are rounded even when the owner chose exact logistics.
    // The exact address remains available only in the owner-controlled flow.
    return {
      lat: Math.round(latitude * 1000) / 1000,
      lon: Math.round(longitude * 1000) / 1000,
      approximate: true,
    };
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

type DisplayCoordinates = ReturnType<typeof getDisplayCoordinates>;

const buildCornerPin = (
  corner: CommunityCornerEntity,
  coordinates: DisplayCoordinates,
  distanceKm: number | null
): MapCornerPin => {
  const photos = corner.photo?.url ? [corner.photo.url] : [];
  const barrio = corner.address.postalCode ?? DEFAULT_BARRIO;
  const basePin: MapCornerPin = {
    id: corner.id,
    name: corner.name,
    barrio,
    city: DEFAULT_CITY,
    lat: coordinates.lat,
    lon: coordinates.lon,
    distanceKm,
    lastSignalAt: corner.metrics.lastActivityAt,
    photos,
    rules: corner.rules ?? undefined,
    themes: getCornerThemes(corner),
    isOpenNow: corner.status === 'active',
    status: corner.status,
  };

  if (coordinates.approximate) {
    // Never reuse the exact street/number in a public map label.
    basePin.referencePointLabel = corner.address.postalCode
      ? `CP ${corner.address.postalCode}`
      : DEFAULT_BARRIO;
  }

  return basePin;
};

const buildActivityPoints = (
  corners: CommunityCornerEntity[],
  displayCoordinates: Map<string, DisplayCoordinates>
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
      const coordinates =
        displayCoordinates.get(corner.id) ?? getDisplayCoordinates(corner);
      return {
        id: `${corner.id}-activity`,
        lat: coordinates.lat,
        lon: coordinates.lon,
        intensity,
      } satisfies MapActivityPoint;
    })
    .filter((point): point is MapActivityPoint => point !== null);

const fetchPublications = async (
  cornerLookup: Map<string, CommunityCornerEntity>,
  displayCoordinates: Map<string, DisplayCoordinates>,
  search: string,
  themeFilters: string[],
  center: { lat: number; lon: number } | null,
  filteringCenter: { lat: number; lon: number } | null,
  maxDistanceKm: MapFilters['distanceKm']
): Promise<MapPublicationPin[]> => {
  if (cornerLookup.size === 0) {
    return [];
  }

  const cornerIds = [...cornerLookup.keys()];
  if (cornerIds.length === 0) {
    return [];
  }

  const rows = await listPublicBookListings({
    text: search || undefined,
    cornerIds,
    sort: center ? 'nearby' : 'recent',
    limit: 100,
    ...(filteringCenter
      ? {
          latitude: filteringCenter.lat,
          longitude: filteringCenter.lon,
          radiusKm: maxDistanceKm ?? undefined,
        }
      : {}),
  });

  const pins: MapPublicationPin[] = [];

  for (const row of rows) {
    const corner = row.cornerId ? cornerLookup.get(row.cornerId) : undefined;
    if (!corner) {
      continue;
    }

    if (!hasThemeOverlap(getCornerThemes(corner), themeFilters)) {
      continue;
    }

    const preciseDistanceKm = center
      ? calculateHaversineDistanceKm(
          {
            lat: corner.coordinates.latitude,
            lon: corner.coordinates.longitude,
          },
          center
        )
      : null;
    const preciseFilteringDistanceKm = filteringCenter
      ? calculateHaversineDistanceKm(
          {
            lat: corner.coordinates.latitude,
            lon: corner.coordinates.longitude,
          },
          filteringCenter
        )
      : null;

    if (
      maxDistanceKm !== null &&
      (preciseFilteringDistanceKm === null ||
        preciseFilteringDistanceKm > maxDistanceKm)
    ) {
      continue;
    }

    const authors = row.author ? [row.author] : [];
    const photo = row.coverUrl || corner.photo?.url || undefined;
    const coordinates =
      displayCoordinates.get(corner.id) ?? getDisplayCoordinates(corner);

    pins.push({
      id: `listing-${row.id}`,
      title: row.title,
      authors,
      type: row.sale
        ? 'sale'
        : row.donation
          ? 'donation'
          : row.type === 'want'
            ? 'want'
            : 'offer',
      photo,
      distanceKm:
        preciseDistanceKm === null ? null : roundDistanceKm(preciseDistanceKm),
      cornerId: corner.id,
      lat: coordinates.lat,
      lon: coordinates.lon,
    });
  }

  return pins;
};

const MAP_FETCH_PADDING_METERS = 1_500;

const adjustDisplayCoordinates = (
  coordinates: DisplayCoordinates,
  bbox: MapBoundingBox
): DisplayCoordinates => {
  if (!coordinates.approximate) {
    return coordinates;
  }

  if (withinBounds({ lat: coordinates.lat, lon: coordinates.lon }, bbox)) {
    return coordinates;
  }

  const lat = clamp(coordinates.lat, bbox.south, bbox.north);

  if (bbox.east >= bbox.west) {
    const lon = clamp(coordinates.lon, bbox.west, bbox.east);
    return { ...coordinates, lat, lon };
  }

  const wraps = coordinates.lon >= bbox.west || coordinates.lon <= bbox.east;
  if (wraps) {
    return { ...coordinates, lat };
  }

  const distanceToWest = Math.abs(coordinates.lon - bbox.west);
  const distanceToEast = Math.abs(coordinates.lon - bbox.east);
  const lon = distanceToWest <= distanceToEast ? bbox.west : bbox.east;

  return { ...coordinates, lat, lon };
};

const expandBounds = (
  bounds: MapBoundingBox,
  paddingMeters: number
): MapBoundingBox => {
  if (paddingMeters <= 0) {
    return bounds;
  }

  const centerLat = (bounds.north + bounds.south) / 2;
  const latPadding = metersToDegreesLat(paddingMeters);
  const lonPadding = metersToDegreesLon(paddingMeters, centerLat);

  return {
    north: Math.min(90, bounds.north + latPadding),
    south: Math.max(-90, bounds.south - latPadding),
    east: Math.min(180, bounds.east + lonPadding),
    west: Math.max(-180, bounds.west - lonPadding),
  };
};

const withinBounds = (
  coordinates: { lat: number; lon: number },
  bbox: MapBoundingBox
) => {
  const latInRange =
    coordinates.lat <= bbox.north && coordinates.lat >= bbox.south;

  if (!latInRange) {
    return false;
  }

  if (bbox.east >= bbox.west) {
    return coordinates.lon <= bbox.east && coordinates.lon >= bbox.west;
  }

  // Bounding boxes that cross the antimeridian will have east < west.
  return coordinates.lon >= bbox.west || coordinates.lon <= bbox.east;
};

export async function getMapData(query: MapQuery): Promise<MapResponse> {
  const searchTerm = query.search.trim();
  const normalizedSearch = searchTerm.toLowerCase();
  const themeFilters = query.filters.themes
    .map((theme) => theme.trim())
    .filter((theme) => theme.length > 0)
    .map((theme) => theme.toLowerCase());

  const searchBounds = expandBounds(query.bbox, MAP_FETCH_PADDING_METERS);
  const viewportCenter = {
    latitude: (query.bbox.north + query.bbox.south) / 2,
    longitude: (query.bbox.east + query.bbox.west) / 2,
  };
  const filteringCenter =
    query.center ?? (query.filters.distanceKm === null ? null : viewportCenter);
  let corners: CommunityCornerEntity[] = [];
  try {
    corners = await listCornersForMap(searchBounds, query.center);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error ?? 'unknown error');
    console.warn(
      'Falling back to unbounded corner query after bounded lookup failed',
      message
    );

    try {
      corners = await listCornersForMap(undefined, query.center);
    } catch (fallbackError) {
      if (fallbackError instanceof DatabaseError) {
        console.error(
          'Unbounded community corner lookup failed',
          fallbackError.message
        );
      }
      throw fallbackError;
    }
  }

  const displayCoordinates = new Map<string, DisplayCoordinates>();

  const spatialCorners = corners.filter((corner) => {
    const displayCoordinatesForCorner = adjustDisplayCoordinates(
      getDisplayCoordinates(corner),
      query.bbox
    );

    if (!withinBounds(displayCoordinatesForCorner, query.bbox)) {
      return false;
    }

    const matchesTheme = hasThemeOverlap(getCornerThemes(corner), themeFilters);
    const matchesOpen = !query.filters.openNow || corner.status === 'active';
    const distanceKm = filteringCenter
      ? calculateHaversineDistanceKm(
          {
            lat: corner.coordinates.latitude,
            lon: corner.coordinates.longitude,
          },
          {
            lat: filteringCenter.latitude,
            lon: filteringCenter.longitude,
          }
        )
      : null;
    const matchesDistance =
      query.filters.distanceKm === null ||
      (distanceKm !== null && distanceKm <= query.filters.distanceKm);

    const isVisible =
      matchesTheme && matchesOpen && matchesDistance && !corner.draft;

    if (isVisible) {
      displayCoordinates.set(corner.id, displayCoordinatesForCorner);
    }

    return isVisible;
  });

  const orderedCorners = query.center
    ? [...spatialCorners].sort((left, right) => {
        const leftDistance = calculateHaversineDistanceKm(
          {
            lat: left.coordinates.latitude,
            lon: left.coordinates.longitude,
          },
          { lat: query.center!.latitude, lon: query.center!.longitude }
        );
        const rightDistance = calculateHaversineDistanceKm(
          {
            lat: right.coordinates.latitude,
            lon: right.coordinates.longitude,
          },
          { lat: query.center!.latitude, lon: query.center!.longitude }
        );
        return leftDistance - rightDistance;
      })
    : spatialCorners;

  const candidateCornerLookup = new Map(
    orderedCorners.map((corner) => [corner.id, corner])
  );

  let candidatePublications: MapPublicationPin[] = [];
  let publications: MapPublicationPin[] = [];
  if (query.layers.has('publications')) {
    try {
      candidatePublications = await fetchPublications(
        candidateCornerLookup,
        displayCoordinates,
        normalizedSearch,
        themeFilters,
        query.center
          ? {
              lat: query.center.latitude,
              lon: query.center.longitude,
            }
          : null,
        filteringCenter
          ? {
              lat: filteringCenter.latitude,
              lon: filteringCenter.longitude,
            }
          : null,
        query.filters.distanceKm
      );
    } catch (error) {
      if (error instanceof DatabaseError) {
        console.warn('Failed to load publications for map view', error.message);
        candidatePublications = [];
      } else {
        throw error;
      }
    }
  }

  const matchingPublicationCornerIds = new Set(
    candidatePublications.map((publication) => publication.cornerId)
  );
  const filteredCorners = orderedCorners.filter(
    (corner) =>
      normalizedSearch.length === 0 ||
      matchesCornerSearch(corner, normalizedSearch) ||
      matchingPublicationCornerIds.has(corner.id)
  );
  const filteredCornerIds = new Set(filteredCorners.map((corner) => corner.id));
  publications = candidatePublications.filter((publication) =>
    filteredCornerIds.has(publication.cornerId)
  );

  const activity =
    query.layers.has('activity') && query.filters.recentActivity
      ? buildActivityPoints(filteredCorners, displayCoordinates)
      : [];

  const cornerPins = query.layers.has('corners')
    ? filteredCorners.map((corner) =>
        buildCornerPin(
          corner,
          displayCoordinates.get(corner.id) ?? getDisplayCoordinates(corner),
          query.center
            ? roundDistanceKm(
                calculateHaversineDistanceKm(
                  {
                    lat: corner.coordinates.latitude,
                    lon: corner.coordinates.longitude,
                  },
                  {
                    lat: query.center.latitude,
                    lon: query.center.longitude,
                  }
                )
              )
            : null
        )
      )
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
