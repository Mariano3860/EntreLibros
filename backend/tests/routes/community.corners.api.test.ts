import request from 'supertest';
import { afterAll, beforeEach, describe, expect, test } from 'vitest';

import app from '../../src/app.js';
import { pool } from '../../src/db.js';

const truncateCommunityTables = async () => {
  await pool.query(
    'TRUNCATE community_corner_photos, community_corner_metrics, community_corners RESTART IDENTITY CASCADE'
  );
};

const basePayload = {
  name: 'Rincón Centro',
  scope: 'public',
  hostAlias: 'Anfitriona',
  internalContact: 'contacto@entrelibros.org',
  rules: 'Traé un libro y llevate otro.',
  schedule: 'Siempre abierto',
  location: {
    address: {
      street: 'Libertad',
      number: '123',
      postalCode: '1000',
    },
    coordinates: {
      latitude: -34.6037,
      longitude: -58.3816,
    },
    visibilityPreference: 'exact',
  },
  consent: true,
  photo: { id: 'photo-1', url: 'https://example.com/photo.jpg' },
  status: 'active',
  draft: false,
} as const;

beforeEach(async () => {
  await truncateCommunityTables();
});

afterAll(async () => {
  await truncateCommunityTables();
});

describe('community corners API', () => {
  test('creates a corner and returns publish response', async () => {
    const response = await request(app)
      .post('/api/community/corners')
      .send(basePayload)
      .expect(201);

    expect(response.body).toMatchObject({
      name: basePayload.name,
      status: basePayload.status,
      imageUrl: basePayload.photo.url,
      locationSummary: 'Libertad 123',
    });
    expect(typeof response.body.id).toBe('string');
  });

  test('validates required fields and returns i18n errors', async () => {
    const payload = {
      ...basePayload,
      location: {
        ...basePayload.location,
        address: { ...basePayload.location.address, street: '' },
      },
    };

    const response = await request(app)
      .post('/api/community/corners')
      .send(payload)
      .expect(422);

    expect(response.body).toEqual({
      errors: {
        street: 'community.corners.validation.street_required',
      },
    });
  });

  test('lists nearby corners with distance', async () => {
    await request(app)
      .post('/api/community/corners')
      .send(basePayload)
      .expect(201);

    const response = await request(app)
      .get('/api/community/corners/nearby')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    const corner = response.body[0];
    expect(corner).toMatchObject({
      id: expect.any(String),
      name: basePayload.name,
      imageUrl: basePayload.photo.url,
    });
    expect(typeof corner.distanceKm).toBe('number');
  });

  test('returns map pins projected to mini map bounds', async () => {
    await request(app)
      .post('/api/community/corners')
      .send(basePayload)
      .expect(201);

    const response = await request(app)
      .get('/api/community/corners/map')
      .expect(200);

    expect(Array.isArray(response.body.pins)).toBe(true);
    expect(response.body.pins.length).toBe(1);
    const [pin] = response.body.pins;
    expect(pin).toMatchObject({
      id: expect.any(String),
      name: basePayload.name,
    });
    expect(pin.x).toBeGreaterThanOrEqual(0);
    expect(pin.x).toBeLessThanOrEqual(100);
    expect(pin.y).toBeGreaterThanOrEqual(0);
    expect(pin.y).toBeLessThanOrEqual(100);
  });
});
