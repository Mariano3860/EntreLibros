import { Router } from 'express';
import {
  listApprovedBookCornersWithinBounds,
  listCornerActivitySignals,
  searchCornerGeocodingSuggestions,
  type BookCornerWithPhotos,
} from '../repositories/bookCornerRepository.js';
import {
  listAvailableListingsForMap,
  type MapListing,
} from '../repositories/bookListingRepository.js';

const router = Router();

function parseNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function parseBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }
  return null;
}

router.get('/geocode', async (req, res) => {
  const rawQuery = typeof req.query.q === 'string' ? req.query.q : '';
  const query = rawQuery.trim();

  if (query.length === 0) {
    return res.status(400).json({
      error: 'InvalidQuery',
      message: 'map.geocode.errors.query_required',
    });
  }

  const limitNumber = parseNumber(req.query.limit);
  const suggestions = await searchCornerGeocodingSuggestions({
    query,
    limit:
      limitNumber !== null && limitNumber > 0 ? Math.min(limitNumber, 15) : 8,
  });

  return res.json(
    suggestions.map((suggestion) => ({
      id: `corner-${suggestion.id}`,
      label: suggestion.label,
      secondaryLabel: suggestion.secondaryLabel ?? undefined,
      street: suggestion.street,
      number: suggestion.streetNumber,
      postalCode: suggestion.postalCode ?? undefined,
      coordinates: {
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
      },
    }))
  );
});

function mapCornerToPin(corner: BookCornerWithPhotos) {
  if (!corner.location) {
    throw new Error('Corner missing location');
  }

  return {
    id: `corner-${corner.id}`,
    name: corner.name,
    barrio: corner.neighborhood ?? corner.area ?? '',
    city: corner.city ?? '',
    lat: corner.location.latitude,
    lon: corner.location.longitude,
    lastSignalAt: corner.lastActivityAt
      ? corner.lastActivityAt.toISOString()
      : null,
    photos: corner.photos,
    rules: corner.rules ?? undefined,
    referencePointLabel: corner.referencePointLabel ?? undefined,
    themes: corner.themes,
    isOpenNow: corner.isOpenNow ?? undefined,
  };
}

function mapListingToPin(listing: MapListing) {
  return {
    id: `listing-${listing.id}`,
    title: listing.title,
    authors: listing.authors,
    type: listing.type,
    photo: listing.photo ?? undefined,
    distanceKm: listing.distanceKm ?? 0,
    cornerId: listing.cornerId !== null ? `corner-${listing.cornerId}` : '',
    lat:
      typeof listing.latitude === 'number' && Number.isFinite(listing.latitude)
        ? listing.latitude
        : undefined,
    lon:
      typeof listing.longitude === 'number' &&
      Number.isFinite(listing.longitude)
        ? listing.longitude
        : undefined,
  };
}

router.get('/', async (req, res) => {
  const north = parseNumber(req.query.north);
  const south = parseNumber(req.query.south);
  const east = parseNumber(req.query.east);
  const west = parseNumber(req.query.west);

  if (
    north === null ||
    south === null ||
    east === null ||
    west === null ||
    north < south ||
    east < west
  ) {
    return res.status(400).json({
      error: 'InvalidBounds',
      message: 'map.errors.invalid_bounds',
    });
  }

  const distanceKm = parseNumber(req.query.distanceKm);
  const themes =
    typeof req.query.themes === 'string' && req.query.themes.length > 0
      ? req.query.themes
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      : [];
  const search =
    typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const openNow = parseBoolean(req.query.openNow);
  const recentActivity = parseBoolean(req.query.recentActivity);
  const layersRaw =
    typeof req.query.layers === 'string' ? req.query.layers : '';
  const activeLayers = layersRaw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const includeCorners =
    activeLayers.length === 0 || activeLayers.includes('corners');
  const includePublications =
    activeLayers.length === 0 || activeLayers.includes('publications');
  const includeActivity =
    activeLayers.length === 0 || activeLayers.includes('activity');

  const centerLatitude = (north + south) / 2;
  const centerLongitude = (east + west) / 2;
  const distanceMeters =
    distanceKm !== null && distanceKm > 0 ? distanceKm * 1000 : null;

  const cornerParams = {
    west,
    south,
    east,
    north,
    centerLongitude,
    centerLatitude,
    distanceMeters,
    search: search.length > 0 ? search : null,
    themes,
    openNow,
  };

  const [corners, publications, activity] = await Promise.all([
    includeCorners
      ? listApprovedBookCornersWithinBounds(cornerParams).then((items) =>
          items.map((corner) => mapCornerToPin(corner))
        )
      : Promise.resolve([]),
    includePublications
      ? listAvailableListingsForMap({
          ...cornerParams,
        }).then((items) => items.map((listing) => mapListingToPin(listing)))
      : Promise.resolve([]),
    includeActivity && (recentActivity === null || recentActivity)
      ? listCornerActivitySignals(cornerParams).then((items) =>
          items.map((item) => ({
            id: `activity-${item.id}`,
            lat: item.latitude,
            lon: item.longitude,
            intensity: item.intensity,
          }))
        )
      : Promise.resolve([]),
  ]);

  return res.json({
    corners,
    publications,
    activity,
    meta: {
      bbox: { north, south, east, west },
      generatedAt: new Date().toISOString(),
    },
  });
});

export default router;
