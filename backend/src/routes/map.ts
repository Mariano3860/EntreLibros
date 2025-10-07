import { Router } from 'express';

import { fetchGeocodingSuggestions } from '../services/geocoding.js';
import {
  getMapData,
  type MapBoundingBox,
  type MapQuery,
} from '../services/map.js';

const router = Router();

const parseNumberParam = (value: unknown): number | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
};

const parseBooleanParam = (value: unknown, defaultValue: boolean): boolean => {
  if (typeof value === 'undefined') {
    return defaultValue;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true';
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return defaultValue;
};

const parseListParam = (value: unknown): string[] => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return [];
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};

router.get('/geocode', async (req, res) => {
  const rawQuery = req.query.q;
  const query = Array.isArray(rawQuery) ? rawQuery[0] : rawQuery;
  const trimmedQuery = (query ?? '').toString().trim();

  if (trimmedQuery.length === 0) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'map.errors.query_required',
    });
  }

  const rawLocale = req.query.locale;
  const locale = Array.isArray(rawLocale) ? rawLocale[0] : rawLocale;

  try {
    const suggestions = await fetchGeocodingSuggestions(
      trimmedQuery,
      typeof locale === 'string' ? locale : undefined
    );
    return res.json(suggestions);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error('Geocoding request failed', message);
    return res.status(502).json({
      error: 'GeocodingUnavailable',
      message: 'map.errors.geocoding_unavailable',
    });
  }
});

router.get('/', (req, res) => {
  const north = parseNumberParam(req.query.north);
  const south = parseNumberParam(req.query.south);
  const east = parseNumberParam(req.query.east);
  const west = parseNumberParam(req.query.west);

  if (north === null || south === null || east === null || west === null) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'map.errors.bbox_required',
    });
  }

  const bbox: MapBoundingBox = { north, south, east, west };

  const searchRaw = req.query.search;
  const search = Array.isArray(searchRaw)
    ? (searchRaw[0]?.toString() ?? '')
    : (searchRaw ?? '').toString();

  const layersRaw = req.query.layers;
  const layerList = parseListParam(layersRaw);
  const allowedLayers = ['corners', 'publications', 'activity'] as const;
  const normalizedLayers = (
    layerList.length > 0 ? layerList : allowedLayers
  ).filter((layer): layer is (typeof allowedLayers)[number] =>
    allowedLayers.includes(layer as (typeof allowedLayers)[number])
  );

  const themes = parseListParam(req.query.themes);
  const distanceParam = parseNumberParam(req.query.distanceKm);
  const distanceKm = distanceParam ?? 0;
  const openNow = parseBooleanParam(req.query.openNow, false);
  const recentActivity = parseBooleanParam(req.query.recentActivity, true);

  const mapQuery: MapQuery = {
    bbox,
    search,
    layers: new Set(normalizedLayers),
    filters: {
      distanceKm,
      themes,
      openNow,
      recentActivity,
    },
  };

  if (mapQuery.layers.size === 0) {
    mapQuery.layers = new Set(['corners', 'publications', 'activity']);
  }

  try {
    const payload = getMapData(mapQuery);
    return res.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error('Map data generation failed', message);
    return res.status(500).json({
      error: 'MapGenerationFailed',
      message: 'map.errors.map_unavailable',
    });
  }
});

export default router;
