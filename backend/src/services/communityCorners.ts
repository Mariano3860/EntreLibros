import { randomUUID } from 'crypto';

import {
  createCorner,
  listCornersNear,
  listCornersWithinBoundingBox,
  type BoundingBox,
  type CommunityCornerMetricsRecord,
  type CommunityCornerRecord,
  type CommunityCornerScope,
  type CommunityCornerStatus,
  type CommunityCornerVisibility,
} from '../repositories/communityCornerRepository.js';
import { haversineDistanceKm } from '../utils/math.js';

const DEFAULT_NEARBY_COORDINATES = {
  latitude: -34.63,
  longitude: -58.47,
};

const DEFAULT_NEARBY_RADIUS_KM = 6;
const DEFAULT_NEARBY_LIMIT = 12;
const FALLBACK_CORNER_IMAGE =
  'https://picsum.photos/seed/corner-fallback/160/160';

const MINI_MAP_BOUNDS: BoundingBox = {
  north: -34.54,
  south: -34.72,
  east: -58.36,
  west: -58.55,
};

export type PublishCornerScope = CommunityCornerScope;
export type PublishCornerVisibility = CommunityCornerVisibility;
export type PublishCornerStatus = CommunityCornerStatus;

export interface PublishCornerPhoto {
  id: string;
  url: string;
}

export interface PublishCornerAddress {
  street: string;
  number: string;
  unit?: string;
  postalCode?: string;
}

export interface PublishCornerCoordinates {
  latitude: number;
  longitude: number;
}

export interface PublishCornerLocationPayload {
  address: PublishCornerAddress;
  coordinates: PublishCornerCoordinates;
  visibilityPreference: PublishCornerVisibility;
}

export interface PublishCornerPayload {
  name: string;
  scope: PublishCornerScope;
  hostAlias: string;
  internalContact: string;
  rules?: string;
  schedule?: string;
  location: PublishCornerLocationPayload;
  consent: boolean;
  photo: PublishCornerPhoto;
  status: PublishCornerStatus;
  draft: boolean;
}

export interface PublishCornerResponse {
  id: string;
  name: string;
  imageUrl: string;
  status: PublishCornerStatus;
  locationSummary: string;
}

export interface CommunityCornerSummary {
  id: string;
  name: string;
  imageUrl: string;
  distanceKm: number;
  activityLabel?: string;
}

export interface CommunityCornerMapPin {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'active' | 'quiet';
}

export interface CommunityCornerMapResponse {
  pins: CommunityCornerMapPin[];
  description?: string;
}

interface PublishCornerValidationError {
  errors: Record<string, string>;
}

export class CommunityCornerValidationError
  extends Error
  implements PublishCornerValidationError
{
  public readonly errors: Record<string, string>;

  constructor(errors: Record<string, string>) {
    super('Community corner validation failed');
    this.errors = errors;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const optionalString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const requiredString = (
  value: unknown,
  field: string,
  errors: Record<string, string>,
  message: string
): string | null => {
  const normalized = optionalString(value);
  if (!normalized) {
    errors[field] = message;
    return null;
  }
  return normalized;
};

const normalizeScope = (
  value: unknown,
  errors: Record<string, string>
): PublishCornerScope | null => {
  if (value === 'public' || value === 'semiprivate') {
    return value;
  }
  errors.scope = 'community.corners.validation.scope_invalid';
  return null;
};

const normalizeStatus = (
  value: unknown,
  errors: Record<string, string>
): PublishCornerStatus | null => {
  if (value === 'active' || value === 'paused') {
    return value;
  }
  errors.status = 'community.corners.validation.status_invalid';
  return null;
};

const normalizeVisibility = (
  value: unknown,
  errors: Record<string, string>
): PublishCornerVisibility | null => {
  if (value === 'exact' || value === 'approximate') {
    return value;
  }
  errors.visibilityPreference =
    'community.corners.validation.visibility_invalid';
  return null;
};

const extractCoordinates = (
  value: unknown,
  errors: Record<string, string>
): PublishCornerCoordinates | null => {
  if (!isRecord(value)) {
    errors.coordinates = 'community.corners.validation.coordinates_required';
    return null;
  }

  const { latitude, longitude } = value;
  if (typeof latitude !== 'number' || Number.isNaN(latitude)) {
    errors.coordinates = 'community.corners.validation.latitude_invalid';
    return null;
  }
  if (typeof longitude !== 'number' || Number.isNaN(longitude)) {
    errors.coordinates = 'community.corners.validation.longitude_invalid';
    return null;
  }
  return { latitude, longitude };
};

const extractAddress = (
  value: unknown,
  errors: Record<string, string>
): PublishCornerAddress | null => {
  if (!isRecord(value)) {
    errors.address = 'community.corners.validation.address_required';
    return null;
  }
  const street = requiredString(
    value.street,
    'street',
    errors,
    'community.corners.validation.street_required'
  );
  const number = requiredString(
    value.number,
    'number',
    errors,
    'community.corners.validation.number_required'
  );
  const unit = optionalString(value.unit);
  const postalCode = optionalString(value.postalCode);

  if (!street || !number) {
    return null;
  }

  return { street, number, unit, postalCode };
};

const extractLocation = (
  value: unknown,
  errors: Record<string, string>
): PublishCornerLocationPayload | null => {
  if (!isRecord(value)) {
    errors.location = 'community.corners.validation.location_required';
    return null;
  }

  const visibility = normalizeVisibility(value.visibilityPreference, errors);
  const address = extractAddress(value.address, errors);
  const coordinates = extractCoordinates(value.coordinates, errors);

  if (!visibility || !address || !coordinates) {
    return null;
  }

  return { address, coordinates, visibilityPreference: visibility };
};

const extractPhoto = (
  value: unknown,
  errors: Record<string, string>
): PublishCornerPhoto | null => {
  if (!isRecord(value)) {
    errors.photo = 'community.corners.validation.photo_required';
    return null;
  }
  const id = requiredString(
    value.id,
    'photoId',
    errors,
    'community.corners.validation.photo_id_required'
  );
  const url = requiredString(
    value.url,
    'photoUrl',
    errors,
    'community.corners.validation.photo_url_required'
  );
  if (!id || !url) {
    return null;
  }
  return { id, url };
};

const buildLocationSummaryFromCorner = (
  corner: CommunityCornerRecord
): string => {
  const { address, visibilityPreference } = corner;
  if (visibilityPreference === 'approximate') {
    if (address.postalCode) {
      return `${address.street} · CP ${address.postalCode}`;
    }
    return `${address.street} · Zona aproximada`;
  }
  return `${address.street} ${address.number}`;
};

const computeActivityLabel = (
  metrics: CommunityCornerMetricsRecord | null | undefined
): string | undefined => {
  if (!metrics) {
    return undefined;
  }

  if (metrics.interactionsLastWeek > 1) {
    return `${metrics.interactionsLastWeek} intercambios esta semana`;
  }
  if (metrics.interactionsLastWeek === 1) {
    return '1 intercambio esta semana';
  }
  if (metrics.activeListings > 0) {
    return 'Activo';
  }
  if (metrics.totalVisits > 15) {
    return 'Muy visitado';
  }
  return undefined;
};

const determineMapStatus = (
  corner: CommunityCornerRecord
): 'active' | 'quiet' => {
  if (corner.status === 'paused' || corner.draft) {
    return 'quiet';
  }
  const interactions = corner.metrics?.interactionsLastWeek ?? 0;
  if (interactions > 0) {
    return 'active';
  }
  const lastActivity =
    corner.metrics?.lastActivityAt ?? corner.metrics?.lastSignalAt;
  if (lastActivity) {
    const lastActivityDate = new Date(lastActivity).getTime();
    if (!Number.isNaN(lastActivityDate)) {
      const daysSince = (Date.now() - lastActivityDate) / (1000 * 60 * 60 * 24);
      if (daysSince <= 30) {
        return 'active';
      }
    }
  }
  if ((corner.metrics?.activeListings ?? 0) > 0) {
    return 'active';
  }
  return 'quiet';
};

const determineIsOpenNow = (corner: CommunityCornerRecord): boolean => {
  if (corner.status !== 'active') {
    return false;
  }
  if (!corner.schedule) {
    return true;
  }
  const normalized = corner.schedule.toLowerCase();
  return (
    normalized.includes('24') ||
    normalized.includes('siempre') ||
    normalized.includes('abierto')
  );
};

const projectToMiniMap = (
  latitude: number,
  longitude: number
): { x: number; y: number } => {
  const xRatio =
    (longitude - MINI_MAP_BOUNDS.west) /
    (MINI_MAP_BOUNDS.east - MINI_MAP_BOUNDS.west);
  const yRatio =
    (MINI_MAP_BOUNDS.north - latitude) /
    (MINI_MAP_BOUNDS.north - MINI_MAP_BOUNDS.south);

  const clamp = (value: number): number => Math.max(0, Math.min(100, value));

  return {
    x: clamp(xRatio * 100),
    y: clamp(yRatio * 100),
  };
};

const normalize = (value: string) => value.toLowerCase();

const matchesSearch = (value: string | null | undefined, term: string) => {
  if (!value) {
    return false;
  }
  return normalize(value).includes(normalize(term));
};

const matchesCornerSearch = (
  corner: CommunityCornerRecord,
  term: string
): boolean => {
  if (matchesSearch(corner.name, term)) return true;
  if (matchesSearch(corner.address.barrio, term)) return true;
  if (matchesSearch(corner.address.city, term)) return true;
  return false;
};

const hasThemeOverlap = (themes: string[], filters: string[]) => {
  if (filters.length === 0) {
    return true;
  }
  const normalizedThemes = themes.map((theme) => normalize(theme));
  return filters.some((filter) => normalizedThemes.includes(normalize(filter)));
};

const parsePayload = (payload: unknown): PublishCornerPayload => {
  if (!isRecord(payload)) {
    throw new CommunityCornerValidationError({
      general: 'community.corners.validation.invalid_payload',
    });
  }

  const errors: Record<string, string> = {};

  const name = requiredString(
    payload.name,
    'name',
    errors,
    'community.corners.validation.name_required'
  );
  const scope = normalizeScope(payload.scope, errors);
  const hostAlias = requiredString(
    payload.hostAlias,
    'hostAlias',
    errors,
    'community.corners.validation.host_alias_required'
  );
  const internalContact = requiredString(
    payload.internalContact,
    'internalContact',
    errors,
    'community.corners.validation.internal_contact_required'
  );
  const rules = optionalString(payload.rules);
  const schedule = optionalString(payload.schedule);
  const location = extractLocation(payload.location, errors);
  const consent = Boolean(payload.consent);
  const photo = extractPhoto(payload.photo, errors);
  const status = normalizeStatus(payload.status, errors);
  const draft = Boolean(payload.draft);

  if (!draft && payload.consent !== true) {
    errors.consent = 'community.corners.validation.consent_required';
  }

  if (
    Object.keys(errors).length > 0 ||
    !name ||
    !scope ||
    !location ||
    !photo ||
    !status ||
    !hostAlias ||
    !internalContact
  ) {
    throw new CommunityCornerValidationError(errors);
  }

  return {
    name,
    scope,
    hostAlias,
    internalContact,
    rules: rules ?? undefined,
    schedule: schedule ?? undefined,
    location,
    consent,
    photo,
    status,
    draft,
  };
};

export interface NearbyCornersParams {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

export const getNearbyCorners = async (
  params: NearbyCornersParams = {}
): Promise<CommunityCornerSummary[]> => {
  const latitude =
    typeof params.latitude === 'number'
      ? params.latitude
      : DEFAULT_NEARBY_COORDINATES.latitude;
  const longitude =
    typeof params.longitude === 'number'
      ? params.longitude
      : DEFAULT_NEARBY_COORDINATES.longitude;
  const radiusKm =
    typeof params.radiusKm === 'number' && params.radiusKm > 0
      ? params.radiusKm
      : DEFAULT_NEARBY_RADIUS_KM;

  const corners = await listCornersNear({
    latitude,
    longitude,
    radiusKm,
    limit: DEFAULT_NEARBY_LIMIT,
  });

  return corners.map((corner) => ({
    id: corner.id,
    name: corner.name,
    imageUrl: corner.photo?.url ?? FALLBACK_CORNER_IMAGE,
    distanceKm: Number(corner.distanceKm.toFixed(1)),
    activityLabel: computeActivityLabel(corner.metrics),
  }));
};

export const publishCorner = async (
  payload: unknown
): Promise<PublishCornerResponse> => {
  const parsed = parsePayload(payload);
  const id = randomUUID();
  const record = await createCorner({
    id,
    name: parsed.name,
    scope: parsed.scope,
    hostAlias: parsed.hostAlias,
    internalContact: parsed.internalContact,
    rules: parsed.rules ?? null,
    schedule: parsed.schedule ?? null,
    visibilityPreference: parsed.location.visibilityPreference,
    address: {
      street: parsed.location.address.street,
      number: parsed.location.address.number,
      unit: parsed.location.address.unit ?? null,
      postalCode: parsed.location.address.postalCode ?? null,
    },
    consent: parsed.consent,
    status: parsed.status,
    draft: parsed.draft,
    coordinates: parsed.location.coordinates,
    themes: [],
    photo: parsed.photo,
  });

  return {
    id: record.id,
    name: record.name,
    imageUrl: record.photo?.url ?? FALLBACK_CORNER_IMAGE,
    status: record.status,
    locationSummary: buildLocationSummaryFromCorner(record),
  };
};

export const getCornersMap = async (): Promise<CommunityCornerMapResponse> => {
  const corners = await listCornersWithinBoundingBox(MINI_MAP_BOUNDS);

  const pins = corners.map((corner) => {
    const { x, y } = projectToMiniMap(
      corner.coordinates.latitude,
      corner.coordinates.longitude
    );
    return {
      id: corner.id,
      name: corner.name,
      x,
      y,
      status: determineMapStatus(corner),
    } satisfies CommunityCornerMapPin;
  });

  return {
    pins,
    description: 'Explora los Rincones activos en tu zona.',
  };
};

export interface MapCornerDto {
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
  isOpenNow: boolean;
}

export const toMapCornerDto = (corner: CommunityCornerRecord): MapCornerDto => {
  const barrio = corner.address.barrio ?? corner.address.street ?? 'Zona';
  const city = corner.address.city ?? 'Ciudad Autónoma de Buenos Aires';
  return {
    id: corner.id,
    name: corner.name,
    barrio,
    city,
    lat: corner.coordinates.latitude,
    lon: corner.coordinates.longitude,
    lastSignalAt:
      corner.metrics?.lastSignalAt ?? corner.metrics?.lastActivityAt ?? null,
    photos: corner.photo ? [corner.photo.url] : [],
    rules: corner.rules ?? undefined,
    referencePointLabel: buildLocationSummaryFromCorner(corner),
    themes: corner.themes,
    isOpenNow: determineIsOpenNow(corner),
  };
};

export const filterCornersForMap = (
  corners: CommunityCornerRecord[],
  searchTerm: string,
  themeFilters: string[],
  openNow: boolean
): CommunityCornerRecord[] => {
  return corners.filter((corner) => {
    if (searchTerm.length > 0 && !matchesCornerSearch(corner, searchTerm)) {
      return false;
    }
    if (!hasThemeOverlap(corner.themes, themeFilters)) {
      return false;
    }
    if (openNow && !determineIsOpenNow(corner)) {
      return false;
    }
    return true;
  });
};

export const computeDistanceFromCenter = (
  corner: CommunityCornerRecord,
  bbox: BoundingBox
): number => {
  const centerLat = (bbox.north + bbox.south) / 2;
  const centerLon = (bbox.east + bbox.west) / 2;
  return haversineDistanceKm(
    centerLat,
    centerLon,
    corner.coordinates.latitude,
    corner.coordinates.longitude
  );
};

export const summarizeCornerForList = (
  corner: CommunityCornerRecord,
  bbox: BoundingBox
): CommunityCornerSummary => ({
  id: corner.id,
  name: corner.name,
  imageUrl: corner.photo?.url ?? FALLBACK_CORNER_IMAGE,
  distanceKm: Number(computeDistanceFromCenter(corner, bbox).toFixed(1)),
  activityLabel: computeActivityLabel(corner.metrics),
});
