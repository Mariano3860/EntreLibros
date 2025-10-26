import request from 'supertest';
import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest';
import type { PoolClient } from 'pg';

import app from '../../src/app.js';
import { pool, setTestClient } from '../../src/db.js';
import * as contactService from '../../src/services/contact.js';

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
  vi.restoreAllMocks();
});

describe('POST /api/contact/submit', () => {
  test('persists a contact message and returns a confirmation payload', async () => {
    const res = await request(app)
      .post('/api/contact/submit')
      .send({
        name: '  Ana Pérez  ',
        email: 'ANA@example.com',
        message: 'Hola, quisiera saber más sobre los intercambios.',
      })
      .expect(201);

    expect(res.body).toMatchObject({
      message: 'contact.success.submitted',
      contact: {
        id: expect.any(Number),
        name: 'Ana Pérez',
        email: 'ana@example.com',
        message: 'Hola, quisiera saber más sobre los intercambios.',
      },
    });

    expect(typeof res.body.contact.createdAt).toBe('string');
    expect(typeof res.body.contact.updatedAt).toBe('string');

    const { rows } = await client.query(
      'SELECT name, email, message FROM contact_messages WHERE id = $1',
      [res.body.contact.id]
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      name: 'Ana Pérez',
      email: 'ana@example.com',
      message: 'Hola, quisiera saber más sobre los intercambios.',
    });
  });

  test('returns validation errors for missing fields', async () => {
    const res = await request(app)
      .post('/api/contact/submit')
      .send({})
      .expect(400);

    expect(res.body).toEqual({
      errors: {
        name: 'contact.errors.name_required',
        email: 'contact.errors.email_required',
        message: 'contact.errors.message_required',
      },
    });
  });

  test('returns validation error for invalid email', async () => {
    const res = await request(app)
      .post('/api/contact/submit')
      .send({
        name: 'Sofía',
        email: 'not-an-email',
        message: 'Hola equipo!',
      })
      .expect(400);

    expect(res.body).toEqual({
      errors: {
        email: 'contact.errors.email_invalid',
      },
    });
  });

  test('rejects malformed domains in email', async () => {
    const res = await request(app)
      .post('/api/contact/submit')
      .send({
        name: 'María',
        email: 'user@.com',
        message: 'Probando el formulario.',
      })
      .expect(400);

    expect(res.body).toEqual({
      errors: {
        email: 'contact.errors.email_invalid',
      },
    });
  });

  test('rejects unexpected fields with an i18n error', async () => {
    const res = await request(app)
      .post('/api/contact/submit')
      .send({
        name: 'Ana',
        email: 'ana@example.com',
        message: 'Hola',
        extra: 'should not be here',
      })
      .expect(400);

    expect(res.body).toEqual({
      error: 'contact.errors.unexpected_fields',
      fields: ['extra'],
    });
  });

  test('returns 500 when the submission fails unexpectedly', async () => {
    vi.spyOn(contactService, 'submitContactMessage').mockRejectedValueOnce(
      new Error('db down')
    );

    const res = await request(app)
      .post('/api/contact/submit')
      .send({
        name: 'Lucía',
        email: 'lucia@example.com',
        message: '¿Pueden ayudarme con un problema?',
      })
      .expect(500);

    expect(res.body).toEqual({
      error: 'ContactSubmitFailed',
      message: 'contact.errors.submit_failed',
    });
  });
});
