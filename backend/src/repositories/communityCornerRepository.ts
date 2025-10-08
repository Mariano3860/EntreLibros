import { query, withTransaction, type DbClient } from '../db.js';

export type CommunityCornerScope = 'public' | 'semiprivate';
export type CommunityCornerStatus = 'active' | 'paused';
export type CommunityCornerVisibility = 'exact' | 'approximate';

export interface CommunityCornerAddress {
  street: string;
  number: string;
  unit?: string | null;
  postalCode?: string | null;
  barrio?: string | null;
  city?: string | null;
}

export interface CommunityCornerCoordinates {
  latitude: number;
  longitude: number;
}

export interface CommunityCornerPhotoRecord {
  id: string;
  externalId: string;
  url: string;
  isPrimary: boolean;
}

export interface CommunityCornerMetricsRecord {
  totalVisits: number;
  interactionsLastWeek: number;
  activeListings: number;
  lastActivityAt: string | null;
  lastSignalAt: string | null;
}

export interface CommunityCornerRecord {
  id: string;
  name: string;
  scope: CommunityCornerScope;
  hostAlias: string;
  internalContact: string;
  rules: string | null;
  schedule: string | null;
  visibilityPreference: CommunityCornerVisibility;
  address: CommunityCornerAddress;
  consent: boolean;
  status: CommunityCornerStatus;
  draft: boolean;
  coordinates: CommunityCornerCoordinates;
  themes: string[];
  photo: CommunityCornerPhotoRecord | null;
  metrics: CommunityCornerMetricsRecord | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommunityCornerInput {
  id: string;
  name: string;
  scope: CommunityCornerScope;
  hostAlias: string;
  internalContact: string;
  rules?: string | null;
  schedule?: string | null;
  visibilityPreference: CommunityCornerVisibility;
  address: CommunityCornerAddress;
  consent: boolean;
  status: CommunityCornerStatus;
  draft: boolean;
  coordinates: CommunityCornerCoordinates;
  themes?: string[];
  photo: { id: string; url: string } | null;
}

export interface ListCornersNearParams {
  latitude: number;
  longitude: number;
  radiusKm: number;
  limit?: number;
  includeDrafts?: boolean;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

const buildCornerSelect = (extraSelect: string = ''): string => `
  SELECT
    c.id,
    c.name,
    c.scope,
    c.host_alias,
    c.internal_contact,
    c.rules,
    c.schedule,
    c.visibility_preference,
    c.address_street,
    c.address_number,
    c.address_unit,
    c.address_postal_code,
    c.barrio,
    c.city,
    c.consent,
    c.status,
    c.draft,
    c.themes,
    c.created_at,
    c.updated_at,
    ST_Y(c.location::geometry) AS latitude,
    ST_X(c.location::geometry) AS longitude,
    photo.id AS photo_id,
    photo.external_id AS photo_external_id,
    photo.url AS photo_url,
    photo.is_primary AS photo_is_primary,
    metrics.total_visits,
    metrics.interactions_last_week,
    metrics.active_listings,
    metrics.last_activity_at,
    metrics.last_signal_at${extraSelect}
  FROM community_corners c
  LEFT JOIN LATERAL (
    SELECT
      p.id,
      p.external_id,
      p.url,
      p.is_primary
    FROM community_corner_photos p
    WHERE p.corner_id = c.id
    ORDER BY p.is_primary DESC, p.position ASC, p.created_at ASC
    LIMIT 1
  ) AS photo ON TRUE
  LEFT JOIN community_corner_metrics metrics ON metrics.corner_id = c.id
`;

interface CornerRow {
  id: string;
  name: string;
  scope: CommunityCornerScope;
  host_alias: string;
  internal_contact: string;
  rules: string | null;
  schedule: string | null;
  visibility_preference: CommunityCornerVisibility;
  address_street: string;
  address_number: string;
  address_unit: string | null;
  address_postal_code: string | null;
  barrio: string | null;
  city: string | null;
  consent: boolean;
  status: CommunityCornerStatus;
  draft: boolean;
  themes: string[] | null;
  created_at: string;
  updated_at: string;
  latitude: number;
  longitude: number;
  photo_id: string | null;
  photo_external_id: string | null;
  photo_url: string | null;
  photo_is_primary: boolean | null;
  total_visits: number | null;
  interactions_last_week: number | null;
  active_listings: number | null;
  last_activity_at: string | null;
  last_signal_at: string | null;
  distance_m?: number;
}

const mapRowToCorner = (row: CornerRow): CommunityCornerRecord => {
  const photo =
    row.photo_id && row.photo_url
      ? {
          id: row.photo_id,
          externalId: row.photo_external_id ?? row.photo_id,
          url: row.photo_url,
          isPrimary: row.photo_is_primary ?? false,
        }
      : null;

  const metrics =
    row.total_visits !== null ||
    row.interactions_last_week !== null ||
    row.active_listings !== null ||
    row.last_activity_at !== null ||
    row.last_signal_at !== null
      ? {
          totalVisits: row.total_visits ?? 0,
          interactionsLastWeek: row.interactions_last_week ?? 0,
          activeListings: row.active_listings ?? 0,
          lastActivityAt: row.last_activity_at,
          lastSignalAt: row.last_signal_at,
        }
      : null;

  return {
    id: row.id,
    name: row.name,
    scope: row.scope,
    hostAlias: row.host_alias,
    internalContact: row.internal_contact,
    rules: row.rules,
    schedule: row.schedule,
    visibilityPreference: row.visibility_preference,
    address: {
      street: row.address_street,
      number: row.address_number,
      unit: row.address_unit,
      postalCode: row.address_postal_code,
      barrio: row.barrio,
      city: row.city,
    },
    consent: row.consent,
    status: row.status,
    draft: row.draft,
    coordinates: {
      latitude: row.latitude,
      longitude: row.longitude,
    },
    themes: row.themes ?? [],
    photo,
    metrics,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const fetchCornerByIdWithClient = async (
  client: DbClient,
  id: string
): Promise<CommunityCornerRecord | null> => {
  const result = await client.query<CornerRow>(
    `${buildCornerSelect()} WHERE c.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToCorner(result.rows[0]);
};

export const createCorner = async (
  input: CreateCommunityCornerInput
): Promise<CommunityCornerRecord> => {
  return withTransaction(async (client) => {
    const {
      id,
      name,
      scope,
      hostAlias,
      internalContact,
      rules,
      schedule,
      visibilityPreference,
      address,
      consent,
      status,
      draft,
      coordinates,
      themes,
      photo,
    } = input;

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
        barrio,
        city,
        consent,
        status,
        draft,
        location,
        themes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17,
        ST_SetSRID(ST_MakePoint($18, $19), 4326)::geography,
        $20
      )`,
      [
        id,
        name,
        scope,
        hostAlias,
        internalContact,
        rules ?? null,
        schedule ?? null,
        visibilityPreference,
        address.street,
        address.number,
        address.unit ?? null,
        address.postalCode ?? null,
        address.barrio ?? null,
        address.city ?? null,
        consent,
        status,
        draft,
        coordinates.longitude,
        coordinates.latitude,
        themes ?? [],
      ]
    );

    if (photo) {
      await client.query(
        `INSERT INTO community_corner_photos (
          corner_id,
          external_id,
          url,
          is_primary,
          position
        ) VALUES ($1, $2, $3, true, 0)`,
        [id, photo.id, photo.url]
      );
    }

    await client.query(
      `INSERT INTO community_corner_metrics (corner_id)
       VALUES ($1)
       ON CONFLICT (corner_id) DO NOTHING`,
      [id]
    );

    const created = await fetchCornerByIdWithClient(client, id);
    if (!created) {
      throw new Error('Failed to create community corner');
    }

    return created;
  });
};

export const listCornersNear = async (
  params: ListCornersNearParams
): Promise<(CommunityCornerRecord & { distanceKm: number })[]> => {
  const {
    latitude,
    longitude,
    radiusKm,
    limit,
    includeDrafts = false,
  } = params;
  const distanceMeters = Math.max(radiusKm, 0) * 1000;

  const result = await query<CornerRow & { distance_m: number }>(
    `${buildCornerSelect(`,
      ST_Distance(
        c.location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
      ) AS distance_m
    `)}
    WHERE ($5 OR c.draft = false)
      AND (c.status <> 'paused' OR c.status IS NULL)
      AND ($4 = 0 OR ST_DWithin(
        c.location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $4
      ))
    ORDER BY distance_m ASC
    LIMIT $3`,
    [longitude, latitude, limit ?? 20, distanceMeters, includeDrafts]
  );

  return result.rows.map((row) => ({
    ...mapRowToCorner(row),
    distanceKm: row.distance_m / 1000,
  }));
};

export const listCornersWithinBoundingBox = async (
  bbox: BoundingBox,
  { includeDrafts = false }: { includeDrafts?: boolean } = {}
): Promise<CommunityCornerRecord[]> => {
  const result = await query<CornerRow>(
    `${buildCornerSelect()}
    WHERE ($5 OR c.draft = false)
      AND (c.status <> 'paused' OR c.status IS NULL)
      AND ST_Y(c.location::geometry) BETWEEN $1 AND $2
      AND ST_X(c.location::geometry) BETWEEN $3 AND $4
    ORDER BY c.created_at DESC`,
    [
      Math.min(bbox.south, bbox.north),
      Math.max(bbox.south, bbox.north),
      Math.min(bbox.west, bbox.east),
      Math.max(bbox.west, bbox.east),
      includeDrafts,
    ]
  );

  return result.rows.map(mapRowToCorner);
};

export const listAllCorners = async (): Promise<CommunityCornerRecord[]> => {
  const result = await query<CornerRow>(
    `${buildCornerSelect()}
    WHERE c.draft = false
    ORDER BY c.created_at DESC`
  );

  return result.rows.map(mapRowToCorner);
};
