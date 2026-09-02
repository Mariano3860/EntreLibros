import {
  createCorner,
  findCornerById,
  listCornersForMap,
  listCornersNear,
  updateCorner,
  updateCornerEditorial,
  type CommunityCornerEntity,
  type CommunityCornerEditorialStatus,
  type CommunityCornerStatus,
  type CommunityCornerVisibilityPreference,
  type MapBounds,
} from '../repositories/communityCornerRepository.js';
import { getDisplayCoordinates } from './map.js';
import { clamp } from '../utils/math.js';
import { isSafeExternalId, isValidImageReference } from './mediaValidation.js';
import { validateEditorialText } from './editorialValidation.js';

export type PublishCornerScope = 'public' | 'semiprivate';
export type PublishCornerVisibilityPreference = 'exact' | 'approximate';
export type PublishCornerStatus = 'active' | 'paused';
export type PublishCornerEditorialStatus = CommunityCornerEditorialStatus;

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
  editorialStatus: PublishCornerEditorialStatus;
  editorialReason: string | null;
}

export interface UpdateCornerPayload {
  name?: string;
  rules?: string | null;
  schedule?: string | null;
  status?: PublishCornerStatus;
  visibilityPreference?: PublishCornerVisibilityPreference;
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

export interface CommunityCornerPublicDetailDto {
  id: string;
  name: string;
  scope: PublishCornerScope;
  hostAlias: string;
  isOwner: boolean;
  rules: string | null;
  schedule: string | null;
  status: PublishCornerStatus;
  visibilityPreference: PublishCornerVisibilityPreference;
  imageUrl: string | null;
  location: {
    city: string;
    neighborhood: string;
    referencePointLabel: string;
    latitude: number;
    longitude: number;
    approximate: true;
  };
  activity: CommunityCornerMetricsDto;
}

interface CommunityCornerMetricsDto {
  totalExchanges: number;
  weeklyExchanges: number;
  lastActivityAt: string | null;
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
const DEFAULT_DESCRIPTION = 'Explora los Rincones activos en tu zona.';
const DEFAULT_CORNER_IMAGE_URL =
  'https://picsum.photos/seed/corner-fallback/160/160';

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

  const scope = allowedScopes.includes(payload.scope) ? payload.scope : null;
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

  const rawAddress = payload.location?.address;
  const rawCoordinates = payload.location?.coordinates;

  const street = normalizeString(rawAddress?.street);
  if (!street) {
    errors.street = ERROR_MESSAGES.street;
  }

  const number = normalizeString(rawAddress?.number);
  if (!number) {
    errors.number = ERROR_MESSAGES.number;
  }

  const latitude = parseNumber(rawCoordinates?.latitude);
  if (latitude === null || latitude < -90 || latitude > 90) {
    errors.latitude = ERROR_MESSAGES.latitude;
  }

  const longitude = parseNumber(rawCoordinates?.longitude);
  if (longitude === null || longitude < -180 || longitude > 180) {
    errors.longitude = ERROR_MESSAGES.longitude;
  }

  const visibilityPreference =
    allowedVisibilities.find(
      (value) => value === payload.location?.visibilityPreference
    ) ?? null;
  if (!visibilityPreference) {
    errors.visibility = ERROR_MESSAGES.visibility;
  }

  if (!payload.consent) {
    errors.consent = ERROR_MESSAGES.consent;
  }

  const photoId = normalizeString(payload.photo?.id);
  const photoUrl = normalizeString(payload.photo?.url);
  if (!photoId || !photoUrl || !isSafeExternalId(photoId)) {
    errors.photo = ERROR_MESSAGES.photo;
  } else if (!isValidImageReference(photoUrl)) {
    errors.photo = ERROR_MESSAGES.photo;
  }

  const status = allowedStatuses.includes(payload.status)
    ? payload.status
    : null;
  if (!status) {
    errors.status = ERROR_MESSAGES.status;
  }

  if (Object.keys(errors).length > 0) {
    throw new CornerValidationError(errors);
  }

  const validScope = scope as PublishCornerScope;
  const validLatitude = latitude as number;
  const validLongitude = longitude as number;
  const validVisibility =
    visibilityPreference as PublishCornerVisibilityPreference;
  const validStatus = status as PublishCornerStatus;
  const rules = normalizeString(payload.rules) || null;
  const schedule = normalizeString(payload.schedule) || null;

  const editorialError = validateEditorialText(
    [name, hostAlias, rules ?? '', schedule ?? ''],
    'community'
  );
  if (editorialError) {
    throw new CornerValidationError({ content: editorialError });
  }

  return {
    name,
    scope: validScope,
    hostAlias,
    internalContact,
    rules,
    schedule,
    location: {
      address: {
        street,
        number,
        unit: normalizeString(rawAddress?.unit) || null,
        postalCode: normalizeString(rawAddress?.postalCode) || null,
      },
      coordinates: {
        latitude: validLatitude,
        longitude: validLongitude,
      },
      visibilityPreference: validVisibility,
    },
    consent: true,
    photo: { id: photoId, url: photoUrl },
    status: validStatus,
    draft: Boolean(payload.draft),
  };
};

const ensureImageUrl = (corner: CommunityCornerEntity): string => {
  if (corner.photo?.url) {
    return corner.photo.url;
  }
  return DEFAULT_CORNER_IMAGE_URL;
};

// Maps corner status to pin status for display on the map.
// 'active' status maps to 'active', while 'paused' status maps to 'quiet'.
const derivePinStatus = (corner: CommunityCornerEntity): 'active' | 'quiet' => {
  if (corner.status === 'active') {
    return 'active';
  }
  // 'paused' status falls through to 'quiet'
  return 'quiet';
};

const projectToBounds = (
  point: PublishCornerCoordinates,
  bounds: MapBounds
) => {
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
      const displayCoordinates = getDisplayCoordinates(corner);
      const { x, y } = projectToBounds(
        {
          latitude: displayCoordinates.lat,
          longitude: displayCoordinates.lon,
        },
        MINI_MAP_BOUNDS
      );
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

export const getPublicCornerDetail = async (
  id: string,
  viewerId?: number
): Promise<CommunityCornerPublicDetailDto | null> => {
  const corner = await findCornerById(id);
  const isOwner = viewerId !== undefined && corner?.ownerId === viewerId;
  if (
    !corner ||
    corner.draft ||
    !corner.consent ||
    (!isOwner && corner.editorialStatus !== 'approved')
  ) {
    return null;
  }

  const displayCoordinates = getDisplayCoordinates(corner);
  const neighborhood = corner.address.postalCode ?? 'Zona comunitaria';

  return {
    id: corner.id,
    name: corner.name,
    scope: corner.scope,
    hostAlias: corner.hostAlias,
    isOwner,
    rules: corner.rules,
    schedule: corner.schedule,
    status: corner.status,
    visibilityPreference: corner.visibilityPreference,
    imageUrl: corner.photo?.url ?? null,
    location: {
      city: 'Ciudad Autónoma de Buenos Aires',
      neighborhood,
      referencePointLabel: corner.address.postalCode
        ? `CP ${corner.address.postalCode}`
        : 'Zona aproximada',
      latitude: displayCoordinates.lat,
      longitude: displayCoordinates.lon,
      approximate: true,
    },
    activity: {
      totalExchanges: corner.metrics.totalExchanges,
      weeklyExchanges: corner.metrics.weeklyExchanges,
      lastActivityAt: corner.metrics.lastActivityAt,
    },
  };
};

export const publishCorner = async (
  payload: PublishCornerPayload,
  ownerId: number
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
    visibilityPreference: validated.location
      .visibilityPreference as CommunityCornerVisibilityPreference,
    address: validated.location.address,
    coordinates: validated.location.coordinates,
    photo: validated.photo,
    ownerId,
  });

  return {
    id: created.id,
    name: created.name,
    imageUrl: ensureImageUrl(created),
    status: created.status,
    locationSummary: created.locationSummary,
    editorialStatus: created.editorialStatus,
    editorialReason: created.editorialReason,
  };
};

export const editCorner = async (
  id: string,
  ownerId: number,
  payload: UpdateCornerPayload
): Promise<CommunityCornerEntity | null> => {
  if (
    payload.status !== undefined &&
    !allowedStatuses.includes(payload.status)
  ) {
    throw new CornerValidationError({ status: ERROR_MESSAGES.status });
  }
  if (
    payload.visibilityPreference !== undefined &&
    !allowedVisibilities.includes(payload.visibilityPreference)
  ) {
    throw new CornerValidationError({ visibility: ERROR_MESSAGES.visibility });
  }
  const name =
    payload.name === undefined ? undefined : normalizeString(payload.name);
  if (name === '')
    throw new CornerValidationError({ name: ERROR_MESSAGES.name });
  const current = await findCornerById(id);
  if (!current || current.ownerId !== ownerId) return null;
  const rules =
    payload.rules === undefined
      ? undefined
      : normalizeString(payload.rules) || null;
  const schedule =
    payload.schedule === undefined
      ? undefined
      : normalizeString(payload.schedule) || null;
  const editorialError = validateEditorialText(
    [
      name ?? current.name,
      current.hostAlias,
      rules ?? current.rules ?? '',
      schedule ?? current.schedule ?? '',
    ],
    'community'
  );
  if (editorialError) {
    throw new CornerValidationError({ content: editorialError });
  }

  const hasEditorialContentChange =
    name !== undefined || rules !== undefined || schedule !== undefined;
  return updateCorner(id, ownerId, {
    name,
    rules,
    schedule,
    status: payload.status,
    visibilityPreference: payload.visibilityPreference,
    ...(hasEditorialContentChange
      ? { editorialStatus: 'pending', editorialReason: null }
      : {}),
  });
};

export const updateCornerEditorialStatus = async (
  id: string,
  status: PublishCornerEditorialStatus,
  reason: string | null
): Promise<CommunityCornerEntity | null> =>
  updateCornerEditorial(id, status, reason);
