import { randomUUID } from 'node:crypto';

import request from 'supertest';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import type { PoolClient } from 'pg';

import app from '../../src/app.js';
import { pool, setTestClient } from '../../src/db.js';
import {
  createCorner,
  type CreateCommunityCornerInput,
} from '../../src/repositories/communityCornerRepository.js';

const BENCHMARK_CORNER_COUNT = 100;
const EXPECTED_CORNER_LIMIT = 50;
const BENCHMARK_CENTER = { latitude: -34.6037, longitude: -58.3816 };

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

const buildBenchmarkCorner = (
  index: number,
  ownerId: number
): CreateCommunityCornerInput => ({
  id: randomUUID(),
  name: `Benchmark corner ${index}`,
  scope: 'public',
  hostAlias: 'Synthetic benchmark',
  internalContact: `benchmark-${index}@example.invalid`,
  rules: null,
  schedule: null,
  status: 'active',
  draft: false,
  consent: true,
  visibilityPreference: 'exact',
  address: {
    street: `Synthetic street ${index}`,
    number: String(index + 1),
    unit: null,
    postalCode: '1000',
  },
  coordinates: {
    latitude: BENCHMARK_CENTER.latitude + ((index % 20) - 10) * 0.004,
    longitude:
      BENCHMARK_CENTER.longitude + (Math.floor(index / 20) - 2) * 0.008,
  },
  photo: {
    id: `benchmark-photo-${index}`,
    url: `https://example.invalid/benchmark-${index}.jpg`,
  },
  ownerId,
});

const percentile = (values: number[], rank: number): number => {
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(
    sorted.length - 1,
    Math.ceil(sorted.length * rank) - 1
  );
  return sorted[index] ?? 0;
};

describe('map performance baseline', () => {
  test('keeps a representative map search below two seconds at p95', async () => {
    const user = await client.query<{ id: number }>(
      "INSERT INTO users (name, email, password, role) VALUES ('Benchmark User', 'map-benchmark@example.invalid', 'hash', 'user') RETURNING id"
    );
    const ownerId = user.rows[0]?.id;
    if (!ownerId) throw new Error('Benchmark user was not created');

    const benchmarkCornerIds: string[] = [];
    for (let index = 0; index < BENCHMARK_CORNER_COUNT; index += 1) {
      const corner = await createCorner(buildBenchmarkCorner(index, ownerId));
      benchmarkCornerIds.push(corner.id);
    }

    for (let index = 0; index < 10; index += 1) {
      const book = await client.query<{ id: number }>(
        'INSERT INTO books (title, author) VALUES ($1, $2) RETURNING id',
        [`Benchmark book ${index}`, 'Synthetic author']
      );
      await client.query(
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
        ) VALUES ($1, $2, 'available', 'offer', false, true, false, 'public', false, true, false, false, $3)`,
        [ownerId, book.rows[0]?.id, benchmarkCornerIds[index]]
      );
    }

    const query = {
      north: -34.54,
      south: -34.72,
      east: -58.36,
      west: -58.55,
      search: 'Benchmark corner',
      distanceKm: 50,
      centerLat: BENCHMARK_CENTER.latitude,
      centerLon: BENCHMARK_CENTER.longitude,
      layers: 'corners,publications,activity',
    };

    await request(app).get('/api/map').query(query).expect(200);

    const durations: number[] = [];
    for (let iteration = 0; iteration < 10; iteration += 1) {
      const startedAt = performance.now();
      const response = await request(app)
        .get('/api/map')
        .query(query)
        .expect(200);
      durations.push(performance.now() - startedAt);
      expect(response.body.corners).toHaveLength(EXPECTED_CORNER_LIMIT);
      expect(response.body.meta).toMatchObject({
        truncated: true,
        limits: { corners: 50, publications: 100, activity: 100 },
      });
    }

    const p50 = percentile(durations, 0.5);
    const p95 = percentile(durations, 0.95);
    const mean =
      durations.reduce((total, duration) => total + duration, 0) /
      durations.length;
    const deviation = Math.sqrt(
      durations.reduce((total, duration) => total + (duration - mean) ** 2, 0) /
        durations.length
    );

    console.info(
      `[map-performance] n=${durations.length} corners=${BENCHMARK_CORNER_COUNT} p50=${p50.toFixed(2)}ms p95=${p95.toFixed(2)}ms mean=${mean.toFixed(2)}ms sd=${deviation.toFixed(2)}ms`
    );
    expect(p95).toBeLessThan(2000);
  });
});
