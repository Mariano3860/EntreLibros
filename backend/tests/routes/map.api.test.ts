import request from 'supertest';
import { beforeEach, afterEach, describe, expect, test } from 'vitest';
import type { PoolClient } from 'pg';
import app from '../../src/app.js';
import { pool, setTestClient } from '../../src/db.js';
import {
  approveBookCorner,
  createBookCorner,
} from '../../src/repositories/bookCornerRepository.js';
import { createBookListing } from '../../src/repositories/bookListingRepository.js';

let client: PoolClient;

beforeEach(async () => {
  client = await pool.connect();
  await client.query('BEGIN');
  setTestClient(client);
});

afterEach(async () => {
  await client.query('ROLLBACK');
  client.release();
  setTestClient(null);
});

async function createUser(email: string) {
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Map Tester',
      email,
      password: 'Str0ng!Pass1',
    })
    .expect(201);

  const { rows } = await client.query<{ id: number }>(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  return rows[0].id;
}

describe('GET /api/map/geocode', () => {
  test('returns suggestions for approved corners with addresses', async () => {
    const userId = await createUser('geo@example.com');

    const corner = await createBookCorner({
      name: 'Geocode Corner',
      description: 'Un punto de referencia',
      area: 'Microcentro',
      neighborhood: 'Microcentro',
      street: 'Av. Corrientes',
      streetNumber: '1500',
      postalCode: 'C1042',
      imageUrl: 'https://example.com/geocode.jpg',
      latitude: -34.604,
      longitude: -58.384,
      createdBy: userId,
      themes: ['Poesía'],
      photoUrls: ['https://example.com/geocode.jpg'],
    });
    await approveBookCorner(corner.id);

    const res = await request(app)
      .get('/api/map/geocode')
      .query({ q: 'Corrientes 15' })
      .expect(200);

    expect(res.body).toEqual([
      {
        id: `corner-${corner.id}`,
        label: 'Av. Corrientes 1500',
        secondaryLabel: 'Microcentro',
        street: 'Av. Corrientes',
        number: '1500',
        postalCode: 'C1042',
        coordinates: {
          latitude: -34.604,
          longitude: -58.384,
        },
      },
    ]);
  });

  test('rejects empty queries', async () => {
    const res = await request(app)
      .get('/api/map/geocode')
      .query({ q: '   ' })
      .expect(400);

    expect(res.body).toEqual({
      error: 'InvalidQuery',
      message: 'map.geocode.errors.query_required',
    });
  });
});

describe('GET /api/map', () => {
  test('returns corners, publications and activity within bounds', async () => {
    const userId = await createUser('mapdata@example.com');

    const corner = await createBookCorner({
      name: 'Mapa Palermo',
      description: 'En la plaza Serrano',
      area: 'Palermo',
      neighborhood: 'Palermo',
      city: 'Buenos Aires',
      street: 'Jorge Luis Borges',
      streetNumber: '2000',
      postalCode: '1414',
      imageUrl: 'https://example.com/palermo.jpg',
      themes: ['Infancias', 'Club lector'],
      photoUrls: ['https://example.com/palermo.jpg'],
      latitude: -34.588,
      longitude: -58.4305,
      createdBy: userId,
    });
    await approveBookCorner(corner.id);
    await client.query(
      'UPDATE book_corners SET recent_exchange_count = $1, last_activity_at = NOW() WHERE id = $2',
      [4, corner.id]
    );

    await createBookListing({
      userId,
      book: {
        title: 'Cuentos Completos',
        author: 'Jorge Luis Borges',
      },
      type: 'offer',
      condition: null,
      notes: 'Disponible para intercambio',
      sale: false,
      donation: true,
      trade: false,
      priceAmount: null,
      priceCurrency: null,
      tradePreferences: [],
      availability: 'public',
      isDraft: false,
      cornerId: String(corner.id),
      delivery: {
        nearBookCorner: true,
        inPerson: true,
        shipping: false,
        shippingPayer: null,
      },
      images: [
        {
          url: 'https://example.com/book.jpg',
          isPrimary: true,
        },
      ],
    });

    const res = await request(app)
      .get('/api/map')
      .query({
        north: -34.55,
        south: -34.7,
        east: -58.35,
        west: -58.55,
        distanceKm: 5,
        layers: 'corners,publications,activity',
        recentActivity: true,
      })
      .expect(200);

    expect(res.body.meta).toMatchObject({
      bbox: {
        north: -34.55,
        south: -34.7,
        east: -58.35,
        west: -58.55,
      },
    });

    expect(res.body.corners).toEqual([
      expect.objectContaining({
        id: `corner-${corner.id}`,
        name: 'Mapa Palermo',
        barrio: 'Palermo',
        city: 'Buenos Aires',
        photos: ['https://example.com/palermo.jpg'],
        themes: ['Infancias', 'Club lector'],
      }),
    ]);

    expect(res.body.publications).toEqual([
      expect.objectContaining({
        cornerId: `corner-${corner.id}`,
        title: 'Cuentos Completos',
        type: 'donation',
        photo: 'https://example.com/book.jpg',
      }),
    ]);

    expect(res.body.activity).toEqual([
      expect.objectContaining({
        id: expect.stringContaining('activity-'),
        intensity: expect.any(Number),
      }),
    ]);
  });
});
