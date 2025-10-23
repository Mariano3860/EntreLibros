import request from 'supertest';
import { beforeEach, afterEach, describe, expect, test } from 'vitest';
import type { PoolClient } from 'pg';

import app from '../../src/app.js';
import { pool, setTestClient } from '../../src/db.js';
import {
  createCorner,
  type CreateCommunityCornerInput,
} from '../../src/repositories/communityCornerRepository.js';

let client: PoolClient;

const BASE_CORNER_INPUT: CreateCommunityCornerInput = {
  id: '11111111-2222-3333-4444-555555555555',
  name: 'Rincón Test',
  scope: 'public',
  hostAlias: 'Anfitrión Test',
  internalContact: 'contacto@example.com',
  rules: 'Intercambia libros con respeto.',
  schedule: 'Lunes a viernes',
  status: 'active',
  draft: false,
  consent: true,
  visibilityPreference: 'exact',
  address: {
    street: 'Libertad',
    number: '123',
    unit: null,
    postalCode: '1000',
  },
  coordinates: {
    latitude: -34.6037,
    longitude: -58.3816,
  },
  photo: {
    id: 'photo-1',
    url: 'https://example.com/corner.jpg',
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
});

describe('community corners API', () => {
  test('creates a corner and returns publish response', async () => {
    const payload = {
      name: 'Rincón Nueva Dirección',
      scope: 'public',
      hostAlias: 'Anfitriona',
      internalContact: 'contacto@entrelibros.org',
      rules: 'Reglas básicas',
      schedule: 'Siempre abierto',
      location: {
        address: {
          street: 'Libertad',
          number: '987',
          postalCode: '1001',
        },
        coordinates: { latitude: -34.6037, longitude: -58.3816 },
        visibilityPreference: 'exact',
      },
      consent: true,
      photo: { id: 'photo-2', url: 'https://example.com/photo.jpg' },
      status: 'active',
      draft: false,
    } satisfies Record<string, unknown>;

    const response = await request(app)
      .post('/api/community/corners')
      .send(payload)
      .expect(201);

    expect(response.body).toMatchObject({
      name: 'Rincón Nueva Dirección',
      status: 'active',
      locationSummary: 'Libertad 987',
    });
    expect(typeof response.body.id).toBe('string');
    expect(response.body.imageUrl).toBe('https://example.com/photo.jpg');

    const saved = await client.query(
      'SELECT name, address_street, address_number FROM community_corners WHERE id = $1',
      [response.body.id]
    );
    expect(saved.rows[0]).toEqual({
      name: 'Rincón Nueva Dirección',
      address_street: 'Libertad',
      address_number: '987',
    });
  });

  test('returns validation errors when payload is incomplete', async () => {
    const response = await request(app)
      .post('/api/community/corners')
      .send({
        scope: 'public',
        hostAlias: '',
        internalContact: '',
        consent: false,
        photo: { id: '', url: '' },
        status: 'active',
        draft: false,
      })
      .expect(422);

    expect(response.body.errors).toMatchObject({
      name: 'community.corners.errors.name_required',
      hostAlias: 'community.corners.errors.host_alias_required',
      internalContact: 'community.corners.errors.internal_contact_required',
      street: 'community.corners.errors.street_required',
      number: 'community.corners.errors.number_required',
      latitude: 'community.corners.errors.latitude_required',
      longitude: 'community.corners.errors.longitude_required',
      consent: 'community.corners.errors.consent_required',
      photo: 'community.corners.errors.photo_required',
    });
  });

  test('lists nearby corners with computed distance and activity', async () => {
    const created = await createCorner(BASE_CORNER_INPUT);
    await client.query(
      'UPDATE community_corner_metrics SET weekly_exchanges = 3 WHERE corner_id = $1',
      [created.id]
    );

    const response = await request(app)
      .get('/api/community/corners/nearby')
      .query({ lat: -34.6037, lon: -58.3816, radiusKm: 10 })
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      id: created.id,
      name: created.name,
      imageUrl: BASE_CORNER_INPUT.photo.url,
      activityLabel: '3 intercambios esta semana',
    });
    expect(response.body[0].distanceKm).toBeCloseTo(0, 1);
  });

  test('returns map pins projected to percentages', async () => {
    const created = await createCorner({
      ...BASE_CORNER_INPUT,
      id: '99999999-aaaa-bbbb-cccc-dddddddddddd',
      coordinates: {
        latitude: -34.61,
        longitude: -58.42,
      },
    });

    const response = await request(app)
      .get('/api/community/corners/map')
      .expect(200);

    expect(Array.isArray(response.body.pins)).toBe(true);
    const pin = response.body.pins.find(
      (item: { id: string }) => item.id === created.id
    );
    expect(pin).toBeTruthy();
    expect(pin).toMatchObject({
      name: created.name,
      status: 'active',
    });
    expect(pin.x).toBeGreaterThanOrEqual(0);
    expect(pin.x).toBeLessThanOrEqual(100);
    expect(pin.y).toBeGreaterThanOrEqual(0);
    expect(pin.y).toBeLessThanOrEqual(100);
  });
});
