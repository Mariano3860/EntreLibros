import request from 'supertest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import app from '../../src/app.js';
import { truncateCommunityCornerTables } from '../utils/communityCorners.js';

describe('map geocoding endpoint', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

describe('map data endpoint', () => {
  beforeEach(async () => {
    await truncateCommunityCornerTables();
  });

  test('requires bounding box parameters', async () => {
    const response = await request(app).get('/api/map').expect(400);

    expect(response.body).toEqual({
      error: 'BadRequest',
      message: 'map.errors.bbox_required',
    });
  });

  test('returns filtered data respecting layers', async () => {
    const payload = {
      name: 'Rincón Prueba',
      scope: 'public',
      hostAlias: 'Anfitrión',
      internalContact: 'contacto@entrelibros.org',
      location: {
        address: { street: 'Pringles', number: '100', postalCode: '1183' },
        coordinates: { latitude: -34.62, longitude: -58.43 },
        visibilityPreference: 'exact',
      },
      consent: true,
      photo: { id: 'test-photo', url: 'https://example.com/corner.jpg' },
      status: 'active',
      draft: false,
    };

    await request(app).post('/api/community/corners').send(payload).expect(201);

    const response = await request(app)
      .get('/api/map')
      .query({
        north: -34.58,
        south: -34.68,
        east: -58.36,
        west: -58.53,
        search: 'Rincón',
        distanceKm: 3,
        themes: '',
        openNow: 'true',
        recentActivity: 'false',
        layers: 'corners,publications',
      })
      .expect(200);

    expect(response.body.activity).toEqual([]);
    expect(Array.isArray(response.body.corners)).toBe(true);
    expect(response.body.corners.length).toBeGreaterThan(0);
    expect(
      response.body.corners.every((corner: { name: string }) =>
        corner.name.includes('Rincón')
      )
    ).toBe(true);
    expect(
      response.body.publications.every(
        (publication: { distanceKm: number }) => publication.distanceKm <= 3
      )
    ).toBe(true);
    expect(response.body.meta).toMatchObject({
      bbox: {
        north: -34.58,
        south: -34.68,
        east: -58.36,
        west: -58.53,
      },
    });
    expect(typeof response.body.meta.generatedAt).toBe('string');
  });
});
