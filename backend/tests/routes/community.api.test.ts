import request from 'supertest';
import { beforeEach, afterEach, describe, expect, test } from 'vitest';
import type { PoolClient } from 'pg';
import app from '../../src/app.js';
import { pool, setTestClient } from '../../src/db.js';
import {
  approveBookCorner,
  createBookCorner,
} from '../../src/repositories/bookCornerRepository.js';

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

async function registerAndLogin(email: string, password = 'Str0ng!Pass1') {
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email,
      password,
    })
    .expect(201);

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);

  const cookie = loginRes.headers['set-cookie'][0];
  const { rows } = await client.query<{ id: number }>(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  return { cookie, userId: rows[0].id };
}

describe('POST /api/community/corners', () => {
  test('requires authentication', async () => {
    await request(app)
      .post('/api/community/corners')
      .send({ name: 'Sin auth' })
      .expect(401);
  });

  test('creates a corner pending approval', async () => {
    const { cookie, userId } = await registerAndLogin('corner@example.com');

    const payload = {
      name: 'Rincón Centro',
      scope: 'public',
      hostAlias: 'Centro Cultural',
      internalContact: 'centro@example.com',
      rules: 'Intercambio en el centro cultural',
      schedule: 'Lunes a viernes',
      themes: ['Infancias', 'Club lector'],
      location: {
        address: {
          street: 'Av. Corrientes',
          number: '1234',
          postalCode: 'C1043',
        },
        coordinates: {
          latitude: -34.6037,
          longitude: -58.3816,
        },
        visibilityPreference: 'exact',
      },
      consent: true,
      photo: { id: 'photo-1', url: 'https://example.com/corner.jpg' },
      status: 'active',
      draft: false,
    };

    const res = await request(app)
      .post('/api/community/corners')
      .set('Cookie', cookie)
      .send(payload)
      .expect(201);

    expect(res.body).toMatchObject({
      name: 'Rincón Centro',
      area: null,
      rules: 'Intercambio en el centro cultural',
      imageUrl: 'https://example.com/corner.jpg',
      street: 'Av. Corrientes',
      streetNumber: '1234',
      postalCode: 'C1043',
      status: 'pending',
      approved: false,
      themes: ['Infancias', 'Club lector'],
    });
    expect(res.body.id).toBeGreaterThan(0);
    expect(res.body.location).toEqual({
      latitude: -34.6037,
      longitude: -58.3816,
    });

    const { rows } = await client.query<{
      name: string;
      rules: string | null;
      schedule: string | null;
      area: string | null;
      street: string | null;
      street_number: string | null;
      postal_code: string | null;
      themes: string[];
      image_url: string | null;
      approved: boolean;
      created_by: number;
      longitude: number | null;
      latitude: number | null;
    }>(
      `SELECT
        name,
        rules,
        schedule,
        area,
        street,
        street_number,
        postal_code,
        themes,
        image_url,
        approved,
        created_by,
        ST_X(location::geometry) AS longitude,
        ST_Y(location::geometry) AS latitude
      FROM book_corners
      WHERE id = $1`,
      [res.body.id]
    );

    expect(rows[0]).toMatchObject({
      name: 'Rincón Centro',
      rules: 'Intercambio en el centro cultural',
      schedule: 'Lunes a viernes',
      area: null,
      street: 'Av. Corrientes',
      street_number: '1234',
      postal_code: 'C1043',
      themes: ['Infancias', 'Club lector'],
      image_url: 'https://example.com/corner.jpg',
      approved: false,
      created_by: userId,
      longitude: -58.3816,
      latitude: -34.6037,
    });
  });
});

describe('GET /api/community/corners/nearby', () => {
  test('returns 400 when user has no location configured', async () => {
    const { cookie } = await registerAndLogin('noloc@example.com');

    const res = await request(app)
      .get('/api/community/corners/nearby')
      .set('Cookie', cookie)
      .expect(400);

    expect(res.body).toEqual({
      error: 'LocationRequired',
      message: 'community.corners.errors.location_required',
    });
  });

  test('lists approved corners ordered by distance', async () => {
    const { cookie, userId } = await registerAndLogin('nearby@example.com');

    await client.query(
      `UPDATE users
       SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
           search_radius = $3
       WHERE id = $4`,
      [-58.3816, -34.6037, 15, userId]
    );

    const closeCorner = await createBookCorner({
      name: 'Rincón Obelisco',
      description: 'Intercambio frente al Obelisco',
      area: 'Microcentro',
      imageUrl: 'https://example.com/obelisco.jpg',
      latitude: -34.6037,
      longitude: -58.3816,
      createdBy: userId,
    });
    await approveBookCorner(closeCorner.id);

    const fartherCorner = await createBookCorner({
      name: 'Rincón San Telmo',
      description: 'Biblioteca callejera',
      area: 'San Telmo',
      imageUrl: 'https://example.com/santelmo.jpg',
      latitude: -34.6202,
      longitude: -58.3719,
      createdBy: userId,
    });
    await client.query(
      'UPDATE book_corners SET recent_exchange_count = $1, last_activity_at = NOW() WHERE id = $2',
      [3, fartherCorner.id]
    );
    await approveBookCorner(fartherCorner.id);

    const res = await request(app)
      .get('/api/community/corners/nearby')
      .set('Cookie', cookie)
      .expect(200);

    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({
      id: closeCorner.id,
      name: 'Rincón Obelisco',
      distanceKm: 0,
      activityStatus: 'quiet',
      radiusKm: 15,
    });
    expect(res.body[1]).toMatchObject({
      id: fartherCorner.id,
      name: 'Rincón San Telmo',
      activityStatus: 'active',
      recentExchangeCount: 3,
    });
    expect(res.body[1].distanceKm).toBeGreaterThan(0);
    expect(res.body[1].distanceKm).toBeLessThan(3);
  });
});

describe('GET /api/community/corners/map', () => {
  test('returns empty pins when there are no approved corners', async () => {
    const res = await request(app)
      .get('/api/community/corners/map')
      .expect(200);
    expect(res.body).toEqual({
      introKey: 'community.corners.map.description.default',
      intro: 'Explora los Rincones de Libros activos en el mapa comunitario.',
      pins: [],
    });
  });

  test('returns approved corners ready for the map', async () => {
    const { userId } = await registerAndLogin('map@example.com');

    const first = await createBookCorner({
      name: 'Rincón Palermo',
      description: 'En la plaza principal',
      area: 'Palermo',
      imageUrl: 'https://example.com/palermo.jpg',
      latitude: -34.5886,
      longitude: -58.43,
      createdBy: userId,
    });
    await approveBookCorner(first.id);

    const second = await createBookCorner({
      name: 'Rincón Villa Crespo',
      description: null,
      area: 'Villa Crespo',
      imageUrl: null,
      createdBy: userId,
    });
    await approveBookCorner(second.id);

    const res = await request(app)
      .get('/api/community/corners/map')
      .expect(200);

    expect(res.body.introKey).toBe('community.corners.map.description.default');
    expect(res.body.pins).toHaveLength(2);
    const ids = res.body.pins.map((pin: { id: number }) => pin.id);
    expect(ids).toEqual(expect.arrayContaining([first.id, second.id]));

    const palermoPin = res.body.pins.find(
      (pin: { id: number }) => pin.id === first.id
    );
    expect(palermoPin).toMatchObject({
      name: 'Rincón Palermo',
      area: 'Palermo',
      activityStatus: 'quiet',
    });
    expect(palermoPin.location).toEqual({
      latitude: -34.5886,
      longitude: -58.43,
    });
  });
});
