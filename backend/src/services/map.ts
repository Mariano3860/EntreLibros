import {
  listCornersWithinBoundingBox,
  type CommunityCornerRecord,
} from '../repositories/communityCornerRepository.js';
import { listPublicBookListings } from '../repositories/bookListingRepository.js';
import { haversineDistanceKm } from '../utils/math.js';
import { filterCornersForMap, toMapCornerDto } from './communityCorners.js';

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

const normalize = (value: string) => value.toLowerCase();

const matchesPublicationSearch = (
  publication: MapPublicationPin,
  term: string
) =>
  normalize(publication.title).includes(normalize(term)) ||
  publication.authors.some((author) =>
    normalize(author).includes(normalize(term))
  );

const hasThemeOverlap = (themes: string[], filters: string[]) => {
  if (filters.length === 0) {
    return true;
  }
  const normalizedThemes = themes.map((theme) => normalize(theme));
  return filters.some((filter) => normalizedThemes.includes(normalize(filter)));
};

const buildActivityPoints = (
  corners: CommunityCornerRecord[],
  filters: MapFilters
): MapActivityPoint[] => {
  if (!filters.recentActivity) {
    return [];
  }
  return corners
    .filter((corner) => (corner.metrics?.interactionsLastWeek ?? 0) > 0)
    .map((corner) => ({
      id: `corner-activity-${corner.id}`,
      lat: corner.coordinates.latitude,
      lon: corner.coordinates.longitude,
      intensity: Math.min(
        5,
        Math.max(1, corner.metrics?.interactionsLastWeek ?? 1)
      ),
    }));
};

export const getMapData = async (query: MapQuery): Promise<MapResponse> => {
  const searchTerm = query.search.trim().toLowerCase();
  const themeFilters = query.filters.themes
    .map((theme) => theme.trim())
    .filter((theme) => theme.length > 0);

  const corners = await listCornersWithinBoundingBox(query.bbox);
  const filteredCorners = filterCornersForMap(
    corners,
    searchTerm,
    themeFilters,
    query.filters.openNow
  );

  const cornerDtos = filteredCorners.map(toMapCornerDto);

  const cornerLookup = new Map(
    filteredCorners.map((corner) => [corner.id, corner])
  );

  const centerLat = (query.bbox.north + query.bbox.south) / 2;
  const centerLon = (query.bbox.east + query.bbox.west) / 2;

  const publicationsRaw = await listPublicBookListings();
  const publications = publicationsRaw
    .filter((listing) => listing.cornerId && cornerLookup.has(listing.cornerId))
    .map((listing) => {
      const corner = cornerLookup.get(listing.cornerId!);
      const distance = corner
        ? haversineDistanceKm(
            centerLat,
            centerLon,
            corner.coordinates.latitude,
            corner.coordinates.longitude
          )
        : 0;
      const authors = listing.author ? [listing.author] : [];
      const type: PublicationType = listing.donation
        ? 'donation'
        : listing.sale
          ? 'sale'
          : listing.type;
      return {
        id: String(listing.id),
        title: listing.title,
        authors,
        type,
        photo: listing.coverUrl ?? undefined,
        distanceKm: Number(distance.toFixed(1)),
        cornerId: listing.cornerId!,
        lat: corner?.coordinates.latitude,
        lon: corner?.coordinates.longitude,
      } satisfies MapPublicationPin;
    })
    .filter((publication) => {
      if (
        searchTerm.length > 0 &&
        !matchesPublicationSearch(publication, searchTerm)
      ) {
        return false;
      }
      const corner = cornerLookup.get(publication.cornerId);
      if (corner && !hasThemeOverlap(corner.themes, themeFilters)) {
        return false;
      }
      if (
        Number.isFinite(query.filters.distanceKm) &&
        query.filters.distanceKm > 0 &&
        publication.distanceKm > query.filters.distanceKm
      ) {
        return false;
      }
      return true;
    });

  const cornersLayer = query.layers.has('corners') ? cornerDtos : [];
  const publicationsLayer = query.layers.has('publications')
    ? publications
    : [];
  const activityLayer = query.layers.has('activity')
    ? buildActivityPoints(filteredCorners, query.filters)
    : [];

  return {
    corners: cornersLayer,
    publications: publicationsLayer,
    activity: activityLayer,
    meta: {
      bbox: query.bbox,
      generatedAt: new Date().toISOString(),
    },
  };
};
