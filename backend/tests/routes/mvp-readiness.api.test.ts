import request from 'supertest';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import type { PoolClient } from 'pg';

import app from '../../src/app.js';
import { pool, setTestClient } from '../../src/db.js';

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

async function registerAndLogin(name: string) {
  const email = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}@example.com`;
  const password = 'Str0ng!Pass1';
  const register = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password })
    .expect(201);
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);
  return {
    id: register.body.user.id as number,
    cookie: login.headers['set-cookie'][0] as string,
  };
}

describe('MVP readiness API', () => {
  test('accepts and deduplicates authenticated reports without exposing reporter data', async () => {
    const reporter = await registerAndLogin('reporter');

    await request(app)
      .post('/api/reports')
      .send({
        targetType: 'content',
        targetId: 'listing-1',
        reason: 'Contenido duplicado',
      })
      .expect(401);

    const first = await request(app)
      .post('/api/reports')
      .set('Cookie', reporter.cookie)
      .send({
        targetType: 'content',
        targetId: 'listing-1',
        reason: 'Contenido duplicado',
      })
      .expect(201);
    expect(first.body.report).toEqual(
      expect.objectContaining({
        targetType: 'content',
        targetId: 'listing-1',
        status: 'received',
        channel: 'support',
      })
    );
    expect(first.body.report).not.toHaveProperty('reporterId');

    const duplicate = await request(app)
      .post('/api/reports')
      .set('Cookie', reporter.cookie)
      .send({
        targetType: 'content',
        targetId: 'listing-1',
        reason: 'Sigue duplicado',
      })
      .expect(201);
    expect(duplicate.body.report.id).toBe(first.body.report.id);
    expect(duplicate.body.report.reason).toBe('Sigue duplicado');

    await request(app)
      .post('/api/reports')
      .set('Cookie', reporter.cookie)
      .send({ targetType: 'unknown', targetId: 'x', reason: 'No válido' })
      .expect(422)
      .expect(({ body }) =>
        expect(body.message).toBe('reports.errors.invalid')
      );
  });

  test('returns metric status and validates supported periods', async () => {
    await request(app)
      .get('/api/community/metrics?days=14')
      .expect(422)
      .expect(({ body }) =>
        expect(body.message).toBe('community.metrics.invalid_filters')
      );

    await request(app)
      .get('/api/community/metrics?days=7&zone=Zona%20inexistente')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            period: expect.objectContaining({ days: 7 }),
            zone: 'Zona inexistente',
            status: expect.any(String),
            funnel: expect.objectContaining({
              publications: expect.any(Number),
              contacts: expect.any(Number),
              agreements: expect.any(Number),
              confirmations: expect.any(Number),
            }),
          })
        );
        expect(['data', 'no_data']).toContain(body.status);
      });
  });
});
