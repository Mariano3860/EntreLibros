import { query } from '../db.js';

interface BookCornerRow {
  id: number;
  name: string;
  description: string | null;
  area: string | null;
  neighborhood: string | null;
  city: string | null;
  street: string | null;
  street_number: string | null;
  unit: string | null;
  postal_code: string | null;
  image_url: string | null;
  created_by: number;
  approved: boolean;
  recent_exchange_count: number;
  last_activity_at: Date | null;
  created_at: Date;
  updated_at: Date;
  longitude: number | null;
  latitude: number | null;
  reference_point_label: string | null;
  schedule: string | null;
  rules: string | null;
  is_open_now: boolean | null;
  themes: string[] | null;
  scope: string | null;
  host_alias: string | null;
  internal_contact: string | null;
  visibility_preference: string | null;
  consent: boolean | null;
  status: string | null;
  distance_meters?: number | string | null;
}

interface BookCornerWithPhotosRow extends BookCornerRow {
  photos: string[] | null;
}

export interface BookCorner {
  id: number;
  name: string;
  description: string | null;
  area: string | null;
  neighborhood: string | null;
  city: string | null;
  street: string | null;
  streetNumber: string | null;
  unit: string | null;
  postalCode: string | null;
  imageUrl: string | null;
  createdBy: number;
  approved: boolean;
  recentExchangeCount: number;
  lastActivityAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  location: { latitude: number; longitude: number } | null;
  activityStatus: 'active' | 'quiet';
  referencePointLabel: string | null;
  schedule: string | null;
  rules: string | null;
  isOpenNow: boolean | null;
  themes: string[];
  scope: string | null;
  hostAlias: string | null;
  internalContact: string | null;
  visibilityPreference: string | null;
  consent: boolean | null;
  status: string | null;
}

export interface BookCornerWithPhotos extends BookCorner {
  photos: string[];
}

export interface BookCornerNearby extends BookCorner {
  distanceMeters: number | null;
}

function toLocation(row: BookCornerRow): BookCorner['location'] {
  if (row.longitude === null || row.latitude === null) {
    return null;
  }
  return { latitude: row.latitude, longitude: row.longitude };
}

function computeActivityStatus(row: BookCornerRow): 'active' | 'quiet' {
  if (row.recent_exchange_count > 0) {
    return 'active';
  }
  if (!row.last_activity_at) {
    return 'quiet';
  }
  const now = Date.now();
  const lastActivity = row.last_activity_at.getTime();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  return now - lastActivity <= THIRTY_DAYS_MS ? 'active' : 'quiet';
}

function rowToBookCorner(row: BookCornerRow): BookCorner {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    area: row.area,
    neighborhood: row.neighborhood ?? row.area,
    city: row.city,
    street: row.street,
    streetNumber: row.street_number,
    unit: row.unit,
    postalCode: row.postal_code,
    imageUrl: row.image_url,
    createdBy: row.created_by,
    approved: row.approved,
    recentExchangeCount: row.recent_exchange_count,
    lastActivityAt: row.last_activity_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    location: toLocation(row),
    activityStatus: computeActivityStatus(row),
    referencePointLabel: row.reference_point_label,
    schedule: row.schedule,
    rules: row.rules ?? row.description,
    isOpenNow: row.is_open_now,
    themes: row.themes ?? [],
    scope: row.scope,
    hostAlias: row.host_alias,
    internalContact: row.internal_contact,
    visibilityPreference: row.visibility_preference,
    consent: row.consent,
    status: row.status,
  };
}

function rowWithPhotosToBookCorner(
  row: BookCornerWithPhotosRow
): BookCornerWithPhotos {
  const base = rowToBookCorner(row);
  const rawPhotos = Array.isArray(row.photos) ? row.photos : [];
  const sanitizedPhotos = rawPhotos.filter(
    (url): url is string => typeof url === 'string' && url.trim().length > 0
  );
  const uniquePhotos = Array.from(new Set(sanitizedPhotos));

  if (base.imageUrl && base.imageUrl.trim().length > 0) {
    if (!uniquePhotos.includes(base.imageUrl)) {
      uniquePhotos.unshift(base.imageUrl);
    }
  }

  return {
    ...base,
    photos: uniquePhotos,
  };
}

export interface CreateBookCornerInput {
  name: string;
  description?: string | null;
  area?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  street?: string | null;
  streetNumber?: string | null;
  unit?: string | null;
  postalCode?: string | null;
  referencePointLabel?: string | null;
  schedule?: string | null;
  rules?: string | null;
  isOpenNow?: boolean | null;
  themes?: string[] | null;
  scope?: string | null;
  hostAlias?: string | null;
  internalContact?: string | null;
  visibilityPreference?: string | null;
  consent?: boolean | null;
  status?: string | null;
  imageUrl?: string | null;
  photoUrls?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
  createdBy: number;
}

export async function createBookCorner(
  input: CreateBookCornerInput
): Promise<BookCorner> {
  const normalizedThemes = Array.isArray(input.themes)
    ? input.themes
        .map((theme) => theme?.trim())
        .filter((theme): theme is string => Boolean(theme && theme.length > 0))
    : [];
  const uniquePhotoUrls = Array.isArray(input.photoUrls)
    ? Array.from(
        new Set(
          input.photoUrls.filter(
            (url): url is string => typeof url === 'string'
          )
        )
      )
    : [];
  const primaryImageUrl = input.imageUrl ?? uniquePhotoUrls[0] ?? null;

  const { rows } = await query<BookCornerRow>(
    `INSERT INTO book_corners (
      name,
      description,
      area,
      neighborhood,
      city,
      street,
      street_number,
      unit,
      postal_code,
      reference_point_label,
      schedule,
      rules,
      is_open_now,
      themes,
      scope,
      host_alias,
      internal_contact,
      visibility_preference,
      consent,
      status,
      image_url,
      location,
      created_by
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10,
      $11,
      $12,
      $13,
      $14,
      $15,
      $16,
      $17,
      $18,
      $19,
      $20,
      $21,
      CASE
        WHEN $22::DOUBLE PRECISION IS NOT NULL AND $23::DOUBLE PRECISION IS NOT NULL THEN
          ST_SetSRID(ST_MakePoint($22, $23), 4326)::geography
        ELSE NULL
      END,
      $24
    )
    RETURNING *,
      ST_X(location::geometry) AS longitude,
      ST_Y(location::geometry) AS latitude`,
    [
      input.name,
      input.description ?? null,
      input.area ?? input.neighborhood ?? null,
      input.neighborhood ?? input.area ?? null,
      input.city ?? null,
      input.street ?? null,
      input.streetNumber ?? null,
      input.unit ?? null,
      input.postalCode ?? null,
      input.referencePointLabel ?? null,
      input.schedule ?? null,
      input.rules ?? input.description ?? null,
      input.isOpenNow ?? null,
      normalizedThemes,
      input.scope ?? null,
      input.hostAlias ?? null,
      input.internalContact ?? null,
      input.visibilityPreference ?? null,
      input.consent ?? null,
      input.status ?? null,
      primaryImageUrl,
      input.longitude ?? null,
      input.latitude ?? null,
      input.createdBy,
    ]
  );

  const corner = rowToBookCorner(rows[0]);

  if (uniquePhotoUrls.length > 0) {
    const values: Array<string | number | boolean> = [];
    const placeholders: string[] = [];
    uniquePhotoUrls.forEach((url, index) => {
      const baseIndex = index * 3;
      const isPrimary = primaryImageUrl !== null && primaryImageUrl === url;
      placeholders.push(
        `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`
      );
      values.push(corner.id, url, isPrimary);
    });

    await query(
      `INSERT INTO book_corner_photos (corner_id, url, is_primary)
       VALUES ${placeholders.join(', ')}
       ON CONFLICT DO NOTHING`,
      values
    );
  }

  return corner;
}

export interface ListNearbyCornersParams {
  latitude: number;
  longitude: number;
  radiusKm: number;
  limit?: number;
}

export interface CornerGeocodingSuggestion {
  id: number;
  label: string;
  secondaryLabel: string | null;
  street: string;
  streetNumber: string;
  postalCode: string | null;
  latitude: number;
  longitude: number;
}

export async function listApprovedBookCornersNearby(
  params: ListNearbyCornersParams
): Promise<BookCornerNearby[]> {
  const radiusMeters = params.radiusKm * 1000;
  const limit = params.limit ?? 12;

  const { rows } = await query<BookCornerRow>(
    `SELECT
      bc.*,
      ST_X(bc.location::geometry) AS longitude,
      ST_Y(bc.location::geometry) AS latitude,
      ST_Distance(
        bc.location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
      ) AS distance_meters
    FROM book_corners bc
    WHERE
      bc.approved = true
      AND bc.location IS NOT NULL
      AND ST_DWithin(
        bc.location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3
      )
    ORDER BY distance_meters ASC, bc.created_at DESC
    LIMIT $4`,
    [params.longitude, params.latitude, radiusMeters, limit]
  );

  return rows.map((row) => {
    const rawDistance = row.distance_meters;
    let distanceMeters: number | null;
    if (typeof rawDistance === 'number') {
      distanceMeters = rawDistance;
    } else if (typeof rawDistance === 'string') {
      const parsed = Number(rawDistance);
      distanceMeters = Number.isNaN(parsed) ? null : parsed;
    } else {
      distanceMeters = null;
    }

    return {
      ...rowToBookCorner(row),
      distanceMeters,
    };
  });
}

export interface CornerGeocodingSearchParams {
  query: string;
  limit?: number;
}

export async function searchCornerGeocodingSuggestions(
  params: CornerGeocodingSearchParams
): Promise<CornerGeocodingSuggestion[]> {
  const trimmed = params.query.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const limit = params.limit ?? 8;

  const { rows } = await query<{
    id: number;
    street: string;
    street_number: string;
    postal_code: string | null;
    label: string;
    secondary_label: string | null;
    latitude: number;
    longitude: number;
  }>(
    `SELECT
      bc.id,
      bc.street,
      bc.street_number,
      bc.postal_code,
      CONCAT(TRIM(bc.street), ' ', TRIM(bc.street_number)) AS label,
      NULLIF(TRIM(CONCAT_WS(', ', bc.neighborhood, bc.city)), '') AS secondary_label,
      ST_Y(bc.location::geometry) AS latitude,
      ST_X(bc.location::geometry) AS longitude
    FROM book_corners bc
    WHERE
      bc.approved = true
      AND bc.location IS NOT NULL
      AND bc.street IS NOT NULL
      AND bc.street_number IS NOT NULL
      AND (
        bc.street ILIKE $1 OR
        bc.street_number ILIKE $1 OR
        bc.area ILIKE $1 OR
        bc.neighborhood ILIKE $1 OR
        bc.city ILIKE $1
      )
    ORDER BY bc.last_activity_at DESC NULLS LAST, bc.updated_at DESC, bc.id ASC
    LIMIT $2`,
    [`%${trimmed}%`, limit]
  );

  return rows
    .filter((row) =>
      Boolean(
        row.street &&
          row.street_number &&
          Number.isFinite(row.latitude) &&
          Number.isFinite(row.longitude)
      )
    )
    .map((row) => ({
      id: row.id,
      label: row.label,
      secondaryLabel: row.secondary_label,
      street: row.street,
      streetNumber: row.street_number,
      postalCode: row.postal_code,
      latitude: row.latitude,
      longitude: row.longitude,
    }));
}

export async function listApprovedBookCornersForMap(): Promise<
  BookCornerWithPhotos[]
> {
  const { rows } = await query<BookCornerWithPhotosRow>(
    `SELECT
      bc.*,
      ST_X(bc.location::geometry) AS longitude,
      ST_Y(bc.location::geometry) AS latitude,
      COALESCE(
        ARRAY_REMOVE(ARRAY_AGG(bcp.url) FILTER (WHERE bcp.url IS NOT NULL), NULL),
        ARRAY[]::TEXT[]
      ) AS photos
    FROM book_corners bc
    LEFT JOIN book_corner_photos bcp ON bcp.corner_id = bc.id
    WHERE bc.approved = true
    GROUP BY bc.id
    ORDER BY bc.updated_at DESC, bc.id ASC`
  );

  return rows.map((row) => rowWithPhotosToBookCorner(row));
}

export async function approveBookCorner(
  id: number
): Promise<BookCorner | null> {
  const { rows } = await query<BookCornerRow>(
    `UPDATE book_corners
      SET approved = true,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *,
        ST_X(location::geometry) AS longitude,
        ST_Y(location::geometry) AS latitude`,
    [id]
  );

  if (!rows[0]) {
    return null;
  }
  return rowToBookCorner(rows[0]);
}

export interface MapCornersQueryParams {
  west: number;
  south: number;
  east: number;
  north: number;
  centerLongitude: number;
  centerLatitude: number;
  distanceMeters?: number | null;
  search?: string | null;
  themes?: string[] | null;
  openNow?: boolean | null;
}

export async function listApprovedBookCornersWithinBounds(
  params: MapCornersQueryParams
): Promise<BookCornerWithPhotos[]> {
  const searchTerm = params.search?.trim();
  const searchPattern =
    searchTerm && searchTerm.length > 0 ? `%${searchTerm}%` : null;
  const themes = Array.isArray(params.themes)
    ? params.themes.filter((theme) => theme.trim().length > 0)
    : [];

  const { rows } = await query<BookCornerWithPhotosRow>(
    `SELECT
      bc.*,
      ST_X(bc.location::geometry) AS longitude,
      ST_Y(bc.location::geometry) AS latitude,
      COALESCE(
        ARRAY_REMOVE(ARRAY_AGG(bcp.url) FILTER (WHERE bcp.url IS NOT NULL), NULL),
        ARRAY[]::TEXT[]
      ) AS photos
    FROM book_corners bc
    LEFT JOIN book_corner_photos bcp ON bcp.corner_id = bc.id
    WHERE
      bc.approved = true
      AND bc.location IS NOT NULL
      AND ST_Within(
        bc.location::geometry,
        ST_MakeEnvelope($1, $2, $3, $4, 4326)
      )
      AND ($5::TEXT IS NULL OR bc.name ILIKE $5 OR bc.area ILIKE $5 OR bc.neighborhood ILIKE $5 OR bc.city ILIKE $5 OR bc.street ILIKE $5)
      AND ($6::BOOLEAN IS NULL OR bc.is_open_now = $6)
      AND (cardinality($7::TEXT[]) = 0 OR bc.themes && $7::TEXT[])
      AND ($8::DOUBLE PRECISION IS NULL OR ST_DWithin(
        bc.location,
        ST_SetSRID(ST_MakePoint($9, $10), 4326)::geography,
        $8
      ))
    GROUP BY bc.id
    ORDER BY
      bc.last_activity_at DESC NULLS LAST,
      bc.recent_exchange_count DESC,
      bc.updated_at DESC,
      bc.id ASC`,
    [
      params.west,
      params.south,
      params.east,
      params.north,
      searchPattern,
      params.openNow ?? null,
      themes,
      params.distanceMeters ?? null,
      params.centerLongitude,
      params.centerLatitude,
    ]
  );

  return rows.map((row) => rowWithPhotosToBookCorner(row));
}

export interface CornerActivityPoint {
  id: number;
  latitude: number;
  longitude: number;
  intensity: number;
}

export async function listCornerActivitySignals(
  params: MapCornersQueryParams
): Promise<CornerActivityPoint[]> {
  const { rows } = await query<{
    id: number;
    latitude: number;
    longitude: number;
    intensity: number;
  }>(
    `SELECT
      bc.id,
      ST_Y(bc.location::geometry) AS latitude,
      ST_X(bc.location::geometry) AS longitude,
      LEAST(
        5,
        GREATEST(
          1,
          COALESCE(bc.recent_exchange_count, 0) +
            CASE
              WHEN bc.last_activity_at IS NOT NULL AND bc.last_activity_at >= NOW() - INTERVAL '14 days'
                THEN 1
              ELSE 0
            END
        )
      ) AS intensity
    FROM book_corners bc
    WHERE
      bc.approved = true
      AND bc.location IS NOT NULL
      AND ST_Within(
        bc.location::geometry,
        ST_MakeEnvelope($1, $2, $3, $4, 4326)
      )
      AND ($5::DOUBLE PRECISION IS NULL OR ST_DWithin(
        bc.location,
        ST_SetSRID(ST_MakePoint($6, $7), 4326)::geography,
        $5
      ))
    ORDER BY bc.last_activity_at DESC NULLS LAST, bc.recent_exchange_count DESC, bc.id ASC`,
    [
      params.west,
      params.south,
      params.east,
      params.north,
      params.distanceMeters ?? null,
      params.centerLongitude,
      params.centerLatitude,
    ]
  );

  return rows.filter(
    (row) => Number.isFinite(row.latitude) && Number.isFinite(row.longitude)
  );
}
