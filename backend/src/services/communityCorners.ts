import {
  createCorner,
  listCornersForMap,
  listCornersNear,
  type CommunityCornerEntity,
  type CommunityCornerStatus,
  type CommunityCornerVisibilityPreference,
  type MapBounds,
} from '../repositories/communityCornerRepository.js';

export type PublishCornerScope = 'public' | 'semiprivate';
export type PublishCornerVisibilityPreference = 'exact' | 'approximate';
export type PublishCornerStatus = 'active' | 'paused';

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
  visibilityPreference: PublishCornerVisibilityPreference;
}

export interface PublishCornerPhoto {
  id: string;
  url: string;
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

export interface CommunityCornerSummaryDto {
  id: string;
  name: string;
  imageUrl: string;
  distanceKm: number;
  activityLabel?: string;
}

export interface CommunityCornerMapPinDto {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'active' | 'quiet';
}

export interface CommunityCornerMapDto {
  pins: CommunityCornerMapPinDto[];
  description?: string;
}

export interface NearbyCornersOptions {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  limit?: number;
}

export class CornerValidationError extends Error {
  public readonly errors: Record<string, string>;

  constructor(errors: Record<string, string>) {
    super('Corner validation failed');
    this.errors = errors;
  }
}

const MINI_MAP_BOUNDS: MapBounds = {
  north: -34.54,
  south: -34.72,
  east: -58.36,
  west: -58.55,
};

const DEFAULT_NEARBY_POINT = { latitude: -34.6037, longitude: -58.3816 };
const DEFAULT_NEARBY_RADIUS_KM = 5;
const DEFAULT_DESCRIPTION =
  'Explora los Rincones activos en tu zona.';

const ERROR_MESSAGES = {
  name: 'community.corners.errors.name_required',
  scope: 'community.corners.errors.scope_required',
  hostAlias: 'community.corners.errors.host_alias_required',
  internalContact: 'community.corners.errors.internal_contact_required',
  street: 'community.corners.errors.street_required',
  number: 'community.corners.errors.number_required',
  latitude: 'community.corners.errors.latitude_required',
  longitude: 'community.corners.errors.longitude_required',
  visibility: 'community.corners.errors.visibility_required',
  consent: 'community.corners.errors.consent_required',
  photo: 'community.corners.errors.photo_required',
  status: 'community.corners.errors.status_invalid',
};

const allowedScopes: PublishCornerScope[] = ['public', 'semiprivate'];
const allowedVisibilities: PublishCornerVisibilityPreference[] = [
  'exact',
  'approximate',
];
const allowedStatuses: PublishCornerStatus[] = ['active', 'paused'];

interface ValidatedPublishCornerPayload {
  name: string;
  scope: PublishCornerScope;
  hostAlias: string;
  internalContact: string;
  rules: string | null;
  schedule: string | null;
  location: {
    address: {
      street: string;
      number: string;
      unit: string | null;
      postalCode: string | null;
    };
    coordinates: PublishCornerCoordinates;
    visibilityPreference: PublishCornerVisibilityPreference;
  };
  consent: true;
  photo: PublishCornerPhoto;
  status: PublishCornerStatus;
  draft: boolean;
}

const clamp = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
};

const normalizeString = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

const parseNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const validatePayload = (
  payload: PublishCornerPayload
): ValidatedPublishCornerPayload => {
  const errors: Record<string, string> = {};

  const name = normalizeString(payload.name);
  if (!name) {
    errors.name = ERROR_MESSAGES.name;
  }

  const scope = allowedScopes.includes(payload.scope)
    ? payload.scope
    : null;
  if (!scope) {
    errors.scope = ERROR_MESSAGES.scope;
  }

  const hostAlias = normalizeString(payload.hostAlias);
  if (!hostAlias) {
    errors.hostAlias = ERROR_MESSAGES.hostAlias;
  }

  const internalContact = normalizeString(payload.internalContact);
  if (!internalContact) {
    errors.internalContact = ERROR_MESSAGES.internalContact;
  }

  const rawAddress = payload.location?.address ?? {};
  const rawCoordinates = payload.location?.coordinates ?? {};

  const street = normalizeString((rawAddress as PublishCornerAddress).street);
  if (!street) {
    errors.street = ERROR_MESSAGES.street;
  }

  const number = normalizeString((rawAddress as PublishCornerAddress).number);
  if (!number) {
    errors.number = ERROR_MESSAGES.number;
  }

  const latitude = parseNumber((rawCoordinates as PublishCornerCoordinates).latitude);
  if (latitude === null || latitude < -90 || latitude > 90) {
    errors.latitude = ERROR_MESSAGES.latitude;
  }

  const longitude = parseNumber((rawCoordinates as PublishCornerCoordinates).longitude);
  if (longitude === null || longitude < -180 || longitude > 180) {
    errors.longitude = ERROR_MESSAGES.longitude;
  }

  const visibilityPreference = allowedVisibilities.includes(
    (payload.location?.visibilityPreference ?? 'exact')
  )
    ? payload.location.visibilityPreference
    : null;
  if (!visibilityPreference) {
    errors.visibility = ERROR_MESSAGES.visibility;
  }

  if (!payload.consent) {
    errors.consent = ERROR_MESSAGES.consent;
  }

  const photoId = normalizeString(payload.photo?.id);
  const photoUrl = normalizeString(payload.photo?.url);
  if (!photoId || !photoUrl) {
    errors.photo = ERROR_MESSAGES.photo;
  }

  const status = allowedStatuses.includes(payload.status) ? payload.status : null;
  if (!status) {
    errors.status = ERROR_MESSAGES.status;
  }

  if (Object.keys(errors).length > 0) {
    throw new CornerValidationError(errors);
  }

  return {
    name,
    scope: scope!,
    hostAlias,
    internalContact,
    rules: normalizeString(payload.rules) || null,
    schedule: normalizeString(payload.schedule) || null,
    location: {
      address: {
        street,
        number,
        unit: normalizeString((rawAddress as PublishCornerAddress).unit) || null,
        postalCode:
          normalizeString((rawAddress as PublishCornerAddress).postalCode) || null,
      },
      coordinates: {
        latitude: latitude!,
        longitude: longitude!,
      },
      visibilityPreference: visibilityPreference!,
    },
    consent: true,
    photo: { id: photoId, url: photoUrl },
    status: status!,
    draft: Boolean(payload.draft),
  };
};

const ensureImageUrl = (corner: CommunityCornerEntity): string => {
  if (corner.photo?.url) {
    return corner.photo.url;
  }
  return '';
};

const derivePinStatus = (
  corner: CommunityCornerEntity
): 'active' | 'quiet' => {
  if (corner.status === 'active' && corner.metrics.weeklyExchanges > 0) {
    return 'active';
  }
  if (
    corner.status === 'active' &&
    corner.metrics.lastActivityAt !== null &&
    !corner.draft
  ) {
    return 'active';
  }
  return 'quiet';
};

const projectToBounds = (point: PublishCornerCoordinates, bounds: MapBounds) => {
  const xRange = bounds.east - bounds.west || 0.000001;
  const yRange = bounds.north - bounds.south || 0.000001;

  const xPercent = ((point.longitude - bounds.west) / xRange) * 100;
  const normalizedY = (point.latitude - bounds.south) / yRange;
  const yPercent = (1 - normalizedY) * 100;

  return {
    x: clamp(xPercent, 0, 100),
    y: clamp(yPercent, 0, 100),
  };
};

export const listNearbyCorners = async (
  options: NearbyCornersOptions = {}
): Promise<CommunityCornerSummaryDto[]> => {
  const latitude = options.latitude ?? DEFAULT_NEARBY_POINT.latitude;
  const longitude = options.longitude ?? DEFAULT_NEARBY_POINT.longitude;
  const radiusKm = options.radiusKm ?? DEFAULT_NEARBY_RADIUS_KM;
  const limit = options.limit;

  const corners = await listCornersNear({
    latitude,
    longitude,
    radiusKm,
    limit,
  });

  return corners.map((corner) => ({
    id: corner.id,
    name: corner.name,
    imageUrl: ensureImageUrl(corner),
    distanceKm: corner.distanceKm ?? 0,
    activityLabel: corner.activityLabel ?? undefined,
  }));
};

export const getCornersMap = async (): Promise<CommunityCornerMapDto> => {
  const corners = await listCornersForMap(MINI_MAP_BOUNDS);

  const pins = corners
    .map((corner) => {
      const { x, y } = projectToBounds(corner.coordinates, MINI_MAP_BOUNDS);
      return {
        id: corner.id,
        name: corner.name,
        x,
        y,
        status: derivePinStatus(corner),
      } satisfies CommunityCornerMapPinDto;
    })
    .filter((pin) => Number.isFinite(pin.x) && Number.isFinite(pin.y));

  return { pins, description: DEFAULT_DESCRIPTION };
};

export const publishCorner = async (
  payload: PublishCornerPayload
): Promise<PublishCornerResponse> => {
  const validated = validatePayload(payload);

  const created = await createCorner({
    name: validated.name,
    scope: validated.scope,
    hostAlias: validated.hostAlias,
    internalContact: validated.internalContact,
    rules: validated.rules,
    schedule: validated.schedule,
    status: validated.status as CommunityCornerStatus,
    draft: validated.draft,
    consent: validated.consent,
    visibilityPreference:
      validated.location.visibilityPreference as CommunityCornerVisibilityPreference,
    address: validated.location.address,
    coordinates: validated.location.coordinates,
    photo: validated.photo,
  });

  return {
    id: created.id,
    name: created.name,
    imageUrl: ensureImageUrl(created),
    status: created.status,
    locationSummary: created.locationSummary,
  };
};
