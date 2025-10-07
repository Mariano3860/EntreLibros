import { URL } from 'node:url';

export interface GeocodingSuggestion {
  id: string;
  label: string;
  secondaryLabel?: string;
  street: string;
  number: string;
  postalCode?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface NominatimAddress {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  region?: string;
  postcode?: string;
  country?: string;
}

interface NominatimResult {
  place_id: number;
  osm_id?: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
}

const GEOCODING_BASE_URL =
  process.env.GEOCODING_BASE_URL ??
  'https://nominatim.openstreetmap.org/search';

const DEFAULT_USER_AGENT = 'EntreLibros/1.0 (geocoding@entrelibros)';

const pickStreet = (address: NominatimAddress | undefined, label: string) => {
  if (!address) {
    return label;
  }

  const candidate =
    address.road ??
    address.pedestrian ??
    address.neighbourhood ??
    address.suburb ??
    '';

  if (candidate) {
    return candidate;
  }

  return label.split(',')[0] ?? label;
};

const pickNumber = (address: NominatimAddress | undefined) => {
  const number = address?.house_number?.trim();
  return number && number.length > 0 ? number : 's/n';
};

const buildSecondaryLabel = (address: NominatimAddress | undefined) => {
  if (!address) {
    return undefined;
  }

  const locality =
    address.city ?? address.town ?? address.village ?? address.suburb ?? '';
  const region = address.state ?? address.region ?? '';
  const country = address.country ?? '';

  const parts = [locality, region, country]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  if (parts.length === 0) {
    return undefined;
  }

  return parts.join(', ');
};

export const fetchGeocodingSuggestions = async (
  query: string,
  locale?: string
): Promise<GeocodingSuggestion[]> => {
  const url = new URL(GEOCODING_BASE_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '5');

  if (locale && locale.trim().length > 0) {
    url.searchParams.set('accept-language', locale.trim());
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': process.env.GEOCODING_USER_AGENT ?? DEFAULT_USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  if (!Array.isArray(payload)) {
    throw new Error('Geocoding response was not an array');
  }

  const results: GeocodingSuggestion[] = payload
    .filter((item): item is NominatimResult => {
      if (!item || typeof item !== 'object') {
        return false;
      }

      const candidate = item as Record<string, unknown>;
      return (
        typeof candidate.place_id === 'number' &&
        typeof candidate.display_name === 'string' &&
        typeof candidate.lat === 'string' &&
        typeof candidate.lon === 'string'
      );
    })
    .map((item) => {
      const latitude = Number(item.lat);
      const longitude = Number(item.lon);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error('Invalid coordinates returned by geocoding provider');
      }

      const street = pickStreet(item.address, item.display_name);
      const number = pickNumber(item.address);

      return {
        id: `nominatim-${item.place_id}`,
        label: `${street} ${number}`.trim(),
        secondaryLabel: buildSecondaryLabel(item.address),
        street,
        number,
        postalCode: item.address?.postcode,
        coordinates: {
          latitude,
          longitude,
        },
      } satisfies GeocodingSuggestion;
    });

  return results;
};
