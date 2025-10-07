import { query } from '../db.js';

interface BookCornerRow {
  id: number;
  name: string;
  description: string | null;
  area: string | null;
  image_url: string | null;
  created_by: number;
  approved: boolean;
  recent_exchange_count: number;
  last_activity_at: Date | null;
  created_at: Date;
  updated_at: Date;
  longitude: number | null;
  latitude: number | null;
  distance_meters?: number | string | null;
}

export interface BookCorner {
  id: number;
  name: string;
  description: string | null;
  area: string | null;
  imageUrl: string | null;
  createdBy: number;
  approved: boolean;
  recentExchangeCount: number;
  lastActivityAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  location: { latitude: number; longitude: number } | null;
  activityStatus: 'active' | 'quiet';
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
    imageUrl: row.image_url,
    createdBy: row.created_by,
    approved: row.approved,
    recentExchangeCount: row.recent_exchange_count,
    lastActivityAt: row.last_activity_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    location: toLocation(row),
    activityStatus: computeActivityStatus(row),
  };
}

export interface CreateBookCornerInput {
  name: string;
  description?: string | null;
  area?: string | null;
  imageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdBy: number;
}

export async function createBookCorner(
  input: CreateBookCornerInput
): Promise<BookCorner> {
  const { rows } = await query<BookCornerRow>(
    `INSERT INTO book_corners (
      name,
      description,
      area,
      image_url,
      location,
      created_by
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      CASE
        WHEN $5::DOUBLE PRECISION IS NOT NULL AND $6::DOUBLE PRECISION IS NOT NULL THEN
          ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography
        ELSE NULL
      END,
      $7
    )
    RETURNING *,
      ST_X(location::geometry) AS longitude,
      ST_Y(location::geometry) AS latitude`,
    [
      input.name,
      input.description ?? null,
      input.area ?? null,
      input.imageUrl ?? null,
      input.longitude ?? null,
      input.latitude ?? null,
      input.createdBy,
    ]
  );

  return rowToBookCorner(rows[0]);
}

export interface ListNearbyCornersParams {
  latitude: number;
  longitude: number;
  radiusKm: number;
  limit?: number;
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

export async function listApprovedBookCornersForMap(): Promise<BookCorner[]> {
  const { rows } = await query<BookCornerRow>(
    `SELECT
      bc.*,
      ST_X(bc.location::geometry) AS longitude,
      ST_Y(bc.location::geometry) AS latitude
    FROM book_corners bc
    WHERE bc.approved = true
    ORDER BY bc.updated_at DESC, bc.id ASC`
  );

  return rows.map((row) => rowToBookCorner(row));
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
