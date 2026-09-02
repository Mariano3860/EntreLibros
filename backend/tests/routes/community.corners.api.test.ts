import request from 'supertest';
import { beforeEach, afterEach, describe, expect, test } from 'vitest';
import type { PoolClient } from 'pg';
import jwt, { type Algorithm } from 'jsonwebtoken';

import app from '../../src/app.js';
import { pool, setTestClient } from '../../src/db.js';
import {
  createCorner,
  type CreateCommunityCornerInput,
} from '../../src/repositories/communityCornerRepository.js';

let client: PoolClient;

const insertUser = async (): Promise<number> => {
  const { rows } = await client.query(
    "INSERT INTO users (name, email, password, role) VALUES ('Corner User', $1, 'hash', 'user') RETURNING id",
    [`corner-${Math.random().toString(36).slice(2)}@example.com`]
  );
  return rows[0].id as number;
};

const buildAuthCookie = (userId: number): string => {
  const algorithm = (process.env.JWT_ALGORITHM || 'HS256') as Algorithm;
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'testsecret',
    {
      algorithm,
    }
  );
  return `sessionToken=${token}`;
};

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
  test('rejects anonymous corner creation without changing data', async () => {
    const before = await client.query(
      'SELECT COUNT(*)::int AS count FROM community_corners'
    );

    const response = await request(app)
      .post('/api/community/corners')
      .send({})
      .expect(401);

    expect(response.body).toEqual({
      error: 'Unauthorized',
      message: 'auth.errors.unauthorized',
    });
    const after = await client.query(
      'SELECT COUNT(*)::int AS count FROM community_corners'
    );
    expect(after.rows[0].count).toBe(before.rows[0].count);
  });

  test('creates a corner and returns publish response', async () => {
    const userId = await insertUser();
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
      .set('Cookie', buildAuthCookie(userId))
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

  test('keeps non-approved corners private and supports the admin correction flow', async () => {
    const ownerId = await insertUser();
    const adminId = await insertUser();
    const payload = {
      name: 'Rincón editorial',
      scope: 'public',
      hostAlias: 'Anfitriona',
      internalContact: 'contacto@entrelibros.org',
      rules: 'Reglas básicas',
      schedule: 'Siempre abierto',
      location: {
        address: { street: 'Libertad', number: '987' },
        coordinates: { latitude: -34.6037, longitude: -58.3816 },
        visibilityPreference: 'approximate',
      },
      consent: true,
      photo: { id: 'photo-editorial', url: 'https://example.com/photo.jpg' },
      status: 'active',
      draft: false,
    };

    const created = await request(app)
      .post('/api/community/corners')
      .set('Cookie', buildAuthCookie(ownerId))
      .send(payload)
      .expect(201);
    const cornerId = created.body.id as string;

    await request(app)
      .patch(`/api/community/corners/${cornerId}/editorial`)
      .set('Cookie', buildAuthCookie(ownerId))
      .send({ status: 'needs_correction', reason: 'Revisar las normas.' })
      .expect(403);

    await client.query("UPDATE users SET role = 'admin' WHERE id = $1", [
      adminId,
    ]);
    const needsCorrection = await request(app)
      .patch(`/api/community/corners/${cornerId}/editorial`)
      .set('Cookie', buildAuthCookie(adminId))
      .send({ status: 'needs_correction', reason: 'Revisar las normas.' })
      .expect(200);
    expect(needsCorrection.body).toMatchObject({
      id: cornerId,
      editorialStatus: 'needs_correction',
      editorialReason: 'Revisar las normas.',
    });

    await request(app).get(`/api/community/corners/${cornerId}`).expect(404);

    const corrected = await request(app)
      .patch(`/api/community/corners/${cornerId}`)
      .set('Cookie', buildAuthCookie(ownerId))
      .send({ rules: 'Normas actualizadas.' })
      .expect(200);
    expect(corrected.body).toMatchObject({
      id: cornerId,
      rules: 'Normas actualizadas.',
      isOwner: true,
    });
    expect(corrected.body).not.toHaveProperty('internalContact');
    expect(corrected.body).not.toHaveProperty('address');
    const correctedState = await client.query(
      'SELECT editorial_status, editorial_reason FROM community_corners WHERE id = $1',
      [cornerId]
    );
    expect(correctedState.rows[0]).toEqual({
      editorial_status: 'pending',
      editorial_reason: null,
    });

    await request(app)
      .patch(`/api/community/corners/${cornerId}/editorial`)
      .set('Cookie', buildAuthCookie(adminId))
      .send({ status: 'rejected' })
      .expect(422);
    await request(app)
      .patch(`/api/community/corners/${cornerId}/editorial`)
      .set('Cookie', buildAuthCookie(adminId))
      .send({ status: 'approved' })
      .expect(200);

    await request(app).get(`/api/community/corners/${cornerId}`).expect(200);
  });

  test('returns validation errors when payload is incomplete', async () => {
    const userId = await insertUser();
    const response = await request(app)
      .post('/api/community/corners')
      .set('Cookie', buildAuthCookie(userId))
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

  test('rejects an unsafe corner image without persisting the corner', async () => {
    const userId = await insertUser();
    const before = await client.query(
      'SELECT COUNT(*)::int AS count FROM community_corners WHERE owner_id = $1',
      [userId]
    );

    const response = await request(app)
      .post('/api/community/corners')
      .set('Cookie', buildAuthCookie(userId))
      .send({
        name: 'Rincón inválido',
        scope: 'public',
        hostAlias: 'Anfitriona',
        internalContact: 'contacto@entrelibros.org',
        location: {
          address: { street: 'Libertad', number: '987' },
          coordinates: { latitude: -34.6037, longitude: -58.3816 },
          visibilityPreference: 'approximate',
        },
        consent: true,
        photo: { id: 'photo-unsafe', url: 'data:text/plain;base64,SGk=' },
        status: 'active',
        draft: false,
      })
      .expect(422);

    expect(response.body.errors).toEqual({
      photo: 'community.corners.errors.photo_required',
    });
    const after = await client.query(
      'SELECT COUNT(*)::int AS count FROM community_corners WHERE owner_id = $1',
      [userId]
    );
    expect(after.rows[0].count).toBe(before.rows[0].count);
  });

  test('rejects unsafe corner text without persisting the corner', async () => {
    const userId = await insertUser();
    const before = await client.query(
      'SELECT COUNT(*)::int AS count FROM community_corners WHERE owner_id = $1',
      [userId]
    );

    const response = await request(app)
      .post('/api/community/corners')
      .set('Cookie', buildAuthCookie(userId))
      .send({
        name: 'Rincón inválido',
        scope: 'public',
        hostAlias: 'Anfitriona',
        internalContact: 'contacto@entrelibros.org',
        rules: '<script>alert(1)</script>',
        location: {
          address: { street: 'Libertad', number: '987' },
          coordinates: { latitude: -34.6037, longitude: -58.3816 },
          visibilityPreference: 'approximate',
        },
        consent: true,
        photo: { id: 'photo-safe', url: 'https://example.com/photo.jpg' },
        status: 'active',
        draft: false,
      })
      .expect(422);

    expect(response.body.errors).toEqual({
      content: 'community.corners.errors.content_not_allowed',
    });
    const after = await client.query(
      'SELECT COUNT(*)::int AS count FROM community_corners WHERE owner_id = $1',
      [userId]
    );
    expect(after.rows[0].count).toBe(before.rows[0].count);
  });

  test('rejects a corner location outside geographic bounds', async () => {
    const userId = await insertUser();
    const response = await request(app)
      .post('/api/community/corners')
      .set('Cookie', buildAuthCookie(userId))
      .send({
        ...BASE_CORNER_INPUT,
        id: undefined,
        location: {
          address: BASE_CORNER_INPUT.address,
          coordinates: { latitude: 91, longitude: -58.3816 },
          visibilityPreference: 'approximate',
        },
      })
      .expect(422);

    expect(response.body.errors).toMatchObject({
      latitude: 'community.corners.errors.latitude_required',
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
        latitude: -34.612345,
        longitude: -58.423456,
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

    const exactX = ((-58.423456 - -58.55) / 0.19) * 100;
    const exactY = (1 - (-34.612345 - -34.72) / 0.18) * 100;
    expect(pin.x).not.toBeCloseTo(exactX, 4);
    expect(pin.y).not.toBeCloseTo(exactY, 4);
  });

  test('updates corner status for the owner and supports reactivation', async () => {
    const ownerId = await insertUser();
    const otherUserId = await insertUser();
    const created = await createCorner({
      ...BASE_CORNER_INPUT,
      id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      ownerId,
    });

    await request(app)
      .patch(`/api/community/corners/${created.id}`)
      .set('Cookie', buildAuthCookie(otherUserId))
      .send({ status: 'paused' })
      .expect(404);

    await request(app)
      .patch(`/api/community/corners/${created.id}`)
      .set('Cookie', buildAuthCookie(ownerId))
      .send({ status: 'paused' })
      .expect(200);

    const paused = await client.query(
      'SELECT status FROM community_corners WHERE id = $1',
      [created.id]
    );
    expect(paused.rows[0].status).toBe('paused');

    await request(app)
      .patch(`/api/community/corners/${created.id}`)
      .set('Cookie', buildAuthCookie(ownerId))
      .send({ status: 'active' })
      .expect(200);

    const reactivated = await client.query(
      'SELECT status FROM community_corners WHERE id = $1',
      [created.id]
    );
    expect(reactivated.rows[0].status).toBe('active');
  });

  test('public corner detail never exposes exact address or coordinates', async () => {
    const created = await createCorner({
      ...BASE_CORNER_INPUT,
      id: 'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff',
      coordinates: {
        latitude: -34.612345,
        longitude: -58.423456,
      },
      visibilityPreference: 'exact',
    });

    const response = await request(app)
      .get(`/api/community/corners/${created.id}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: created.id,
      name: created.name,
      isOwner: false,
      location: {
        city: 'Ciudad Autónoma de Buenos Aires',
        neighborhood: '1000',
        referencePointLabel: 'CP 1000',
        approximate: true,
      },
    });
    expect(response.body.location.latitude).not.toBe(
      BASE_CORNER_INPUT.coordinates.latitude
    );
    expect(response.body.location.longitude).not.toBe(
      BASE_CORNER_INPUT.coordinates.longitude
    );
    expect(response.body).not.toHaveProperty('internalContact');
    expect(response.body).not.toHaveProperty('address');

    const approximateCorner = await createCorner({
      ...BASE_CORNER_INPUT,
      id: 'cccccccc-dddd-4eee-8fff-aaaaaaaaaaaa',
      visibilityPreference: 'approximate',
      coordinates: {
        latitude: -34.612345,
        longitude: -58.423456,
      },
    });
    const approximateResponse = await request(app)
      .get(`/api/community/corners/${approximateCorner.id}`)
      .expect(200);

    expect(approximateResponse.body.location.approximate).toBe(true);
    expect(approximateResponse.body.location.latitude).not.toBe(
      approximateCorner.coordinates.latitude
    );
    expect(approximateResponse.body.location.longitude).not.toBe(
      approximateCorner.coordinates.longitude
    );
  });

  test('marks the detail as owned only for the authenticated owner', async () => {
    const ownerId = await insertUser();
    const otherUserId = await insertUser();
    const created = await createCorner({
      ...BASE_CORNER_INPUT,
      id: 'dddddddd-eeee-4fff-8aaa-bbbbbbbbbbbb',
      ownerId,
    });

    const ownerResponse = await request(app)
      .get(`/api/community/corners/${created.id}`)
      .set('Cookie', buildAuthCookie(ownerId))
      .expect(200);
    expect(ownerResponse.body.isOwner).toBe(true);

    const otherResponse = await request(app)
      .get(`/api/community/corners/${created.id}`)
      .set('Cookie', buildAuthCookie(otherUserId))
      .expect(200);
    expect(otherResponse.body.isOwner).toBe(false);
  });
});
