import request from 'supertest';
import { describe, expect, test } from 'vitest';
import app from '../src/app.js';

describe('GET /api/health', () => {
  test('returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
    expect(res.headers['cache-control']).toBe('private, no-store, max-age=0');
    expect(res.headers.vary).toContain('Cookie');
  });
});
