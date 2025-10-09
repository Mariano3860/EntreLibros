import request from 'supertest';
import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest';
import type { PoolClient } from 'pg';

import app from '../../src/app.js';
import { pool, setTestClient } from '../../src/db.js';
import {
  createCorner,
  type CreateCommunityCornerInput,
} from '../../src/repositories/communityCornerRepository.js';

let client: PoolClient;

const CORNER_INPUT: CreateCommunityCornerInput = {
  id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  name: 'Rincón Palermo',
  scope: 'public',
  hostAlias: 'Host Palermo',
  internalContact: 'palermo@example.com',
  rules: 'Trae y llevate libros.',
  schedule: '10 a 18',
  status: 'active',
  draft: false,
  consent: true,
  visibilityPreference: 'exact',
  address: {
    street: 'Av. Santa Fe',
    number: '3200',
    unit: null,
    postalCode: '1425',
  },
  coordinates: {
    latitude: -34.5985,
    longitude: -58.4102,
  },
  photo: {
    id: 'corner-photo',
    url: 'https://example.com/corner-palermo.jpg',
  },
};

beforeEach(async () => {
  client = await pool.connect();
  await client.query('BEGIN');
  setTestClient(client);
});

afterEach(async () => {
  await client.query('ROLLBACK');
  client.release();
  setTestClient(null);
  vi.restoreAllMocks();
});

describe('map geocoding endpoint', () => {
  test('requires q parameter', async () => {
    const response = await request(app).get('/api/map/geocode').expect(400);

    expect(response.body).toEqual({
      error: 'BadRequest',
      message: 'map.errors.query_required',
    });
  });

  test('returns mapped suggestions from geocoding provider', async () => {
    const payload = [
      {
        place_id: 123,
        display_name: 'Av. Corrientes 1234, Buenos Aires, Argentina',
        lat: '-34.603722',
        lon: '-58.381592',
        address: {
          road: 'Av. Corrientes',
          house_number: '1234',
          city: 'Buenos Aires',
          state: 'Ciudad Autónoma de Buenos Aires',
          postcode: '1043',
          country: 'Argentina',
        },
      },
    ];

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => payload,
    } as unknown as Response);

    const response = await request(app)
      .get('/api/map/geocode')
      .query({ q: 'Corrientes 1234', locale: 'es' })
      .expect(200);

    expect(response.body).toEqual([
      {
        id: 'nominatim-123',
        label: 'Av. Corrientes 1234',
        secondaryLabel:
          'Buenos Aires, Ciudad Autónoma de Buenos Aires, Argentina',
        street: 'Av. Corrientes',
        number: '1234',
        postalCode: '1043',
        coordinates: {
          latitude: -34.603722,
          longitude: -58.381592,
        },
      },
    ]);
  });

  test('handles upstream failure gracefully', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('network error'));

    const response = await request(app)
      .get('/api/map/geocode')
      .query({ q: 'Corrientes' })
      .expect(502);

    expect(response.body).toEqual({
      error: 'GeocodingUnavailable',
      message: 'map.errors.geocoding_unavailable',
    });
  });
});

const seedPublicationData = async (cornerId: string) => {
  const user = await client.query(
    "INSERT INTO users (name, email, password, role) VALUES ('Test User', 'user@example.com', 'hash', 'user') RETURNING id"
  );
  const userId = user.rows[0].id;

  const book = await client.query(
    'INSERT INTO books (title, author) VALUES ($1, $2) RETURNING id',
    ['Libro en Rincón', 'Autor Test']
  );
  const bookId = book.rows[0].id;

  const listing = await client.query(
    `INSERT INTO book_listings (
      user_id,
      book_id,
      status,
      type,
      sale,
      donation,
      trade,
      availability,
      is_draft,
      delivery_near_book_corner,
      delivery_in_person,
      delivery_shipping,
      corner_id
    ) VALUES (
      $1,
      $2,
      'available',
      'offer',
      false,
      true,
      false,
      'public',
      false,
      true,
      false,
      false,
      $3
    ) RETURNING id`,
    [userId, bookId, cornerId]
  );
  const listingId = listing.rows[0].id;

  await client.query(
    'INSERT INTO book_listing_images (book_listing_id, url, is_primary) VALUES ($1, $2, true)',
    [listingId, 'https://example.com/book.jpg']
  );
};

describe('map data endpoint', () => {
  test('requires bounding box parameters', async () => {
    const response = await request(app).get('/api/map').expect(400);

    expect(response.body).toEqual({
      error: 'BadRequest',
      message: 'map.errors.bbox_required',
    });
  });

  test('returns data from persisted corners and publications', async () => {
    const corner = await createCorner(CORNER_INPUT);
    await client.query(
      'UPDATE community_corner_metrics SET weekly_exchanges = 4, total_exchanges = 9 WHERE corner_id = $1',
      [corner.id]
    );
    await seedPublicationData(corner.id);

    const response = await request(app)
      .get('/api/map')
      .query({
        north: -34.58,
        south: -34.62,
        east: -58.38,
        west: -58.43,
        search: 'Rincón',
        distanceKm: 5,
        themes: 'Comunidad',
        openNow: 'true',
        recentActivity: 'true',
        layers: 'corners,publications,activity',
      })
      .expect(200);

    expect(response.body.meta).toMatchObject({
      bbox: {
        north: -34.58,
        south: -34.62,
        east: -58.38,
        west: -58.43,
      },
    });
    expect(typeof response.body.meta.generatedAt).toBe('string');

    const corners = response.body.corners;
    expect(Array.isArray(corners)).toBe(true);
    expect(corners).toHaveLength(1);
    expect(corners[0]).toMatchObject({
      id: corner.id,
      name: 'Rincón Palermo',
      barrio: '1425',
      city: 'Ciudad Autónoma de Buenos Aires',
      isOpenNow: true,
      photos: ['https://example.com/corner-palermo.jpg'],
    });

    const publications = response.body.publications;
    expect(publications).toHaveLength(1);
    expect(publications[0]).toMatchObject({
      cornerId: corner.id,
      title: 'Libro en Rincón',
      type: 'donation',
      photo: 'https://example.com/book.jpg',
    });
    expect(publications[0].distanceKm).toBeLessThan(1);

    const activity = response.body.activity;
    expect(activity).toHaveLength(1);
    expect(activity[0]).toMatchObject({
      id: `${corner.id}-activity`,
      intensity: 4,
    });
  });
});
