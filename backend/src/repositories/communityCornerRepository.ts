import { createHash, randomUUID } from 'node:crypto';

import { query, withTransaction, type DbClient } from '../db.js';

export type CommunityCornerScope = 'public' | 'semiprivate';
export type CommunityCornerVisibilityPreference = 'exact' | 'approximate';
export type CommunityCornerStatus = 'active' | 'paused';

export interface CommunityCornerAddress {
  street: string;
  number: string;
  unit: string | null;
  postalCode: string | null;
}

export interface CommunityCornerCoordinates {
  latitude: number;
  longitude: number;
}

export interface CommunityCornerPhoto {
  id: string;
  url: string;
}

export interface CreateCommunityCornerInput {
  id?: string;
  name: string;
  scope: CommunityCornerScope;
  hostAlias: string;
  internalContact: string;
  rules: string | null;
  schedule: string | null;
  status: CommunityCornerStatus;
  draft: boolean;
  consent: boolean;
  visibilityPreference: CommunityCornerVisibilityPreference;
  address: CommunityCornerAddress;
  coordinates: CommunityCornerCoordinates;
  photo: CommunityCornerPhoto;
}

export interface CommunityCornerMetrics {
  totalExchanges: number;
  weeklyExchanges: number;
  lastActivityAt: string | null;
}

export interface CommunityCornerEntity {
  id: string;
  name: string;
  scope: CommunityCornerScope;
  hostAlias: string;
  internalContact: string;
  rules: string | null;
  schedule: string | null;
  status: CommunityCornerStatus;
  draft: boolean;
  visibilityPreference: CommunityCornerVisibilityPreference;
  address: CommunityCornerAddress;
  coordinates: CommunityCornerCoordinates;
  photo: CommunityCornerPhoto | null;
  locationSummary: string;
  activityLabel: string | null;
  metrics: CommunityCornerMetrics;
  distanceKm: number | null;
}

interface CommunityCornerRow {
  id: string;
  name: string;
  scope: CommunityCornerScope;
  host_alias: string;
  internal_contact: string;
  rules: string | null;
  schedule: string | null;
  status: CommunityCornerStatus;
  draft: boolean;
  consent: boolean;
  visibility_preference: CommunityCornerVisibilityPreference;
  address_street: string;
  address_number: string;
  address_unit: string | null;
  address_postal_code: string | null;
  latitude: string | number;
  longitude: string | number;
  photo_external_id: string | null;
  photo_url: string | null;
  total_exchanges: number | null;
  weekly_exchanges: number | null;
  last_activity_at: Date | string | null;
  distance_meters?: string | number | null;
}

const BASE_FIELDS = `
  SELECT
    c.id,
    c.name,
    c.scope,
    c.host_alias,
    c.internal_contact,
    c.rules,
    c.schedule,
    c.status,
    c.draft,
    c.consent,
    c.visibility_preference,
    c.address_street,
    c.address_number,
    c.address_unit,
    c.address_postal_code,
    ST_Y(c.location::geometry) AS latitude,
    ST_X(c.location::geometry) AS longitude,
    photo.external_id AS photo_external_id,
    photo.url AS photo_url,
    metrics.total_exchanges,
    metrics.weekly_exchanges,
    metrics.last_activity_at
`;

const BASE_FROM = `
  FROM community_corners c
  LEFT JOIN community_corner_photos photo
    ON photo.corner_id = c.id AND photo.is_primary = true
  LEFT JOIN community_corner_metrics metrics
    ON metrics.corner_id = c.id
`;

const formatDistanceKm = (
  distanceMeters: number | null | undefined
): number | null => {
  if (!Number.isFinite(distanceMeters)) {
    return null;
  }

  const km = (distanceMeters as number) / 1000;
  return Math.round(km * 10) / 10;
};

const buildLocationSummary = (row: CommunityCornerRow): string => {
  if (row.visibility_preference === 'approximate') {
    if (row.address_postal_code) {
      return `${row.address_street} · CP ${row.address_postal_code}`;
    }
    return `${row.address_street} · Zona aproximada`;
  }

  const unit = row.address_unit ? ` ${row.address_unit}` : '';
  return `${row.address_street} ${row.address_number}${unit}`.trim();
};

const buildActivityLabel = (weekly: number, total: number): string | null => {
  if (weekly > 0) {
    return `${weekly} intercambios esta semana`;
  }

  if (total > 0) {
    return 'Activo';
  }

  return null;
};

const derivePhotoId = (row: CommunityCornerRow): string =>
  createHash('sha256')
    .update(`${row.id}:${row.photo_url ?? ''}`)
    .digest('hex');

const mapRowToEntity = (row: CommunityCornerRow): CommunityCornerEntity => {
  const latitude = Number(row.latitude);
  const longitude = Number(row.longitude);
  const weekly = row.weekly_exchanges ?? 0;
  const total = row.total_exchanges ?? 0;

  return {
    id: row.id,
    name: row.name,
    scope: row.scope,
    hostAlias: row.host_alias,
    internalContact: row.internal_contact,
    rules: row.rules,
    schedule: row.schedule,
    status: row.status,
    draft: row.draft,
    visibilityPreference: row.visibility_preference,
    address: {
      street: row.address_street,
      number: row.address_number,
      unit: row.address_unit,
      postalCode: row.address_postal_code,
    },
    coordinates: { latitude, longitude },
    photo:
      row.photo_url && row.photo_external_id
        ? { id: row.photo_external_id, url: row.photo_url }
        : row.photo_url
          ? { id: derivePhotoId(row), url: row.photo_url }
          : null,
    locationSummary: buildLocationSummary(row),
    activityLabel: buildActivityLabel(weekly, total),
    metrics: {
      totalExchanges: total,
      weeklyExchanges: weekly,
      lastActivityAt: row.last_activity_at
        ? new Date(row.last_activity_at).toISOString()
        : null,
    },
    distanceKm: formatDistanceKm(
      row.distance_meters !== undefined && row.distance_meters !== null
        ? Number(row.distance_meters)
        : null
    ),
  };
};

async function fetchCornerByIdWithClient(
  client: DbClient,
  id: string
): Promise<CommunityCornerEntity | null> {
  const { rows } = await client.query<CommunityCornerRow>(
    `${BASE_FIELDS}
    ${BASE_FROM}
    WHERE c.id = $1`,
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapRowToEntity(rows[0]);
}

export async function findCornerById(
  id: string
): Promise<CommunityCornerEntity | null> {
  const { rows } = await query<CommunityCornerRow>(
    `${BASE_FIELDS}
    ${BASE_FROM}
    WHERE c.id = $1`,
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapRowToEntity(rows[0]);
}

export async function createCorner(
  input: CreateCommunityCornerInput
): Promise<CommunityCornerEntity> {
  const cornerId = input.id ?? randomUUID();
  const photoId = randomUUID();

  return withTransaction(async (client) => {
    await client.query(
      `INSERT INTO community_corners (
        id,
        name,
        scope,
        host_alias,
        internal_contact,
        rules,
        schedule,
        visibility_preference,
        address_street,
        address_number,
        address_unit,
        address_postal_code,
        status,
        draft,
        consent,
        location
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        ST_SetSRID(ST_MakePoint($16, $17), 4326)::geography
      )`,
      [
        cornerId,
        input.name,
        input.scope,
        input.hostAlias,
        input.internalContact,
        input.rules,
        input.schedule,
        input.visibilityPreference,
        input.address.street,
        input.address.number,
        input.address.unit,
        input.address.postalCode,
        input.status,
        input.draft,
        input.consent,
        input.coordinates.longitude,
        input.coordinates.latitude,
      ]
    );

    await client.query(
      `INSERT INTO community_corner_photos (
        id,
        corner_id,
        external_id,
        url,
        is_primary
      ) VALUES ($1, $2, $3, $4, true)`,
      [photoId, cornerId, input.photo.id, input.photo.url]
    );

    await client.query(
      `INSERT INTO community_corner_metrics (corner_id)
       VALUES ($1)
       ON CONFLICT (corner_id) DO NOTHING`,
      [cornerId]
    );

    const created = await fetchCornerByIdWithClient(client, cornerId);
    if (!created) {
      throw new Error('Failed to fetch created corner');
    }

    return created;
  });
}

export interface NearbyCornersQuery {
  latitude: number;
  longitude: number;
  radiusKm: number;
  limit?: number;
}

export async function listCornersNear(
  params: NearbyCornersQuery
): Promise<CommunityCornerEntity[]> {
  const limit = Math.max(1, Math.min(params.limit ?? 12, 50));
  const radiusMeters = params.radiusKm * 1000;

  const values: Array<string | number> = [
    params.longitude,
    params.latitude,
    radiusMeters,
    limit,
  ];

  const { rows } = await query<CommunityCornerRow>(
    `${BASE_FIELDS},
    ST_Distance(
      c.location,
      ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
    ) AS distance_meters
    ${BASE_FROM}
    WHERE c.draft = false
      AND ST_DWithin(
        c.location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3
      )
    ORDER BY distance_meters ASC
    LIMIT $4`,
    values
  );

  return rows.map(mapRowToEntity);
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export async function listCornersForMap(
  bounds?: MapBounds
): Promise<CommunityCornerEntity[]> {
  const params: number[] = [];
  const whereConditions: string[] = ['c.draft = false', 'c.consent = true'];

  if (bounds) {
    const { west, south, east, north } = bounds;

    const latitudeIndex = params.length + 1;
    params.push(south, north);
    whereConditions.push(
      `ST_Y(c.location::geometry) BETWEEN $${latitudeIndex} AND $${latitudeIndex + 1}`
    );

    if (east >= west) {
      const longitudeIndex = params.length + 1;
      params.push(west, east);
      whereConditions.push(
        `ST_X(c.location::geometry) BETWEEN $${longitudeIndex} AND $${longitudeIndex + 1}`
      );
    } else {
      const westIndex = params.length + 1;
      params.push(west);
      const eastIndex = params.length + 1;
      params.push(east);
      whereConditions.push(
        `(ST_X(c.location::geometry) >= $${westIndex} OR ST_X(c.location::geometry) <= $${eastIndex})`
      );
    }
  }

  const whereClause = `WHERE ${whereConditions.join('\n      AND ')}`;

  const { rows } = await query<CommunityCornerRow>(
    `${BASE_FIELDS}
    ${BASE_FROM}
    ${whereClause}
    ORDER BY metrics.weekly_exchanges DESC NULLS LAST, c.created_at DESC
    LIMIT 200`,
    params
  );

  return rows.map(mapRowToEntity);
}
