export interface MapBoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapCornerPin {
  id: string;
  name: string;
  barrio: string;
  city: string;
  lat: number;
  lon: number;
  lastSignalAt: string | null;
  photos: string[];
  rules?: string;
  referencePointLabel?: string;
  themes: string[];
  isOpenNow?: boolean;
}

export type PublicationType = 'offer' | 'want' | 'donation' | 'sale';

export interface MapPublicationPin {
  id: string;
  title: string;
  authors: string[];
  type: PublicationType;
  photo?: string;
  distanceKm: number;
  cornerId: string;
  lat?: number;
  lon?: number;
}

export interface MapActivityPoint {
  id: string;
  lat: number;
  lon: number;
  intensity: number;
}

export interface MapFilters {
  distanceKm: number;
  themes: string[];
  openNow: boolean;
  recentActivity: boolean;
}

export interface MapQuery {
  bbox: MapBoundingBox;
  search: string;
  filters: MapFilters;
  layers: Set<'corners' | 'publications' | 'activity'>;
}

export interface MapResponseMeta {
  bbox: MapBoundingBox;
  generatedAt: string;
}

export interface MapResponse {
  corners: MapCornerPin[];
  publications: MapPublicationPin[];
  activity: MapActivityPoint[];
  meta: MapResponseMeta;
}

interface MapDataset {
  corners: MapCornerPin[];
  publications: MapPublicationPin[];
  activity: MapActivityPoint[];
  meta: MapResponseMeta;
}

const BASE_BOUNDS: MapBoundingBox = {
  north: -34.54,
  south: -34.72,
  east: -58.36,
  west: -58.55,
};

const DATASET: MapDataset = {
  corners: [
    {
      id: 'corner-1',
      name: 'Rincón Plaza Malabia',
      barrio: 'Palermo',
      city: 'Buenos Aires',
      lat: -34.58802,
      lon: -58.43044,
      lastSignalAt: '2025-10-25T12:04:00.000Z',
      photos: ['https://images.entrelibros.org/corners/palermo-01.jpg'],
      rules: 'Traé un libro y llevate otro, dejá una nota para la comunidad.',
      referencePointLabel: 'Junto al mástil central de la plaza',
      themes: ['Infancias', 'Narrativa contemporánea'],
      isOpenNow: true,
    },
    {
      id: 'corner-2',
      name: 'Bibliorincón Parque Patricios',
      barrio: 'Parque Patricios',
      city: 'Buenos Aires',
      lat: -34.63421,
      lon: -58.40438,
      lastSignalAt: '2025-10-24T18:36:00.000Z',
      photos: [
        'https://images.entrelibros.org/corners/parque-patricios-01.jpg',
      ],
      referencePointLabel: 'Ingreso principal del Distrito Tecnológico',
      themes: ['Historia', 'Ensayo'],
      isOpenNow: false,
    },
    {
      id: 'corner-3',
      name: 'Club de Lectura Chacarita',
      barrio: 'Chacarita',
      city: 'Buenos Aires',
      lat: -34.59561,
      lon: -58.45673,
      lastSignalAt: '2025-10-23T09:12:00.000Z',
      photos: ['https://images.entrelibros.org/corners/chacarita-01.jpg'],
      referencePointLabel: 'Dentro del centro cultural comunal',
      themes: ['Poesía', 'Ciencia ficción'],
      isOpenNow: true,
    },
    {
      id: 'corner-4',
      name: 'Rincón Barracas Sur',
      barrio: 'Barracas',
      city: 'Buenos Aires',
      lat: -34.65628,
      lon: -58.36792,
      lastSignalAt: '2025-10-20T15:20:00.000Z',
      photos: ['https://images.entrelibros.org/corners/barracas-01.jpg'],
      themes: ['Infancias', 'Historia'],
      isOpenNow: false,
    },
    {
      id: 'corner-5',
      name: 'Punto de Lectura Villa Crespo',
      barrio: 'Villa Crespo',
      city: 'Buenos Aires',
      lat: -34.59983,
      lon: -58.44126,
      lastSignalAt: '2025-10-26T08:50:00.000Z',
      photos: ['https://images.entrelibros.org/corners/villa-crespo-01.jpg'],
      referencePointLabel: 'Terraza del centro barrial',
      themes: ['Narrativa contemporánea', 'Poesía'],
      isOpenNow: true,
    },
  ],
  publications: [
    {
      id: 'pub-1',
      title: 'Los años felices',
      authors: ['Claudia Piñeiro'],
      type: 'offer',
      photo: 'https://images.entrelibros.org/publications/anios-felices.jpg',
      distanceKm: 1.2,
      cornerId: 'corner-1',
      lat: -34.58901,
      lon: -58.42812,
    },
    {
      id: 'pub-2',
      title: 'Rayuela',
      authors: ['Julio Cortázar'],
      type: 'donation',
      photo: 'https://images.entrelibros.org/publications/rayuela.jpg',
      distanceKm: 2.4,
      cornerId: 'corner-3',
    },
    {
      id: 'pub-3',
      title: 'La invención de Morel',
      authors: ['Adolfo Bioy Casares'],
      type: 'sale',
      photo: 'https://images.entrelibros.org/publications/invencion-morel.jpg',
      distanceKm: 3.2,
      cornerId: 'corner-2',
      lat: -34.63311,
      lon: -58.40157,
    },
    {
      id: 'pub-4',
      title: 'El Eternauta',
      authors: ['Héctor Germán Oesterheld'],
      type: 'want',
      distanceKm: 4.8,
      cornerId: 'corner-5',
    },
    {
      id: 'pub-5',
      title: 'Breve historia argentina',
      authors: ['Felipe Pigna'],
      type: 'offer',
      distanceKm: 5.1,
      cornerId: 'corner-4',
    },
    {
      id: 'pub-6',
      title: 'Mujer en tránsito',
      authors: ['Gabriela Cabezón Cámara'],
      type: 'donation',
      photo: 'https://images.entrelibros.org/publications/mujer-transito.jpg',
      distanceKm: 1.8,
      cornerId: 'corner-5',
    },
  ],
  activity: [
    { id: 'activity-1', lat: -34.58621, lon: -58.43351, intensity: 4 },
    { id: 'activity-2', lat: -34.63218, lon: -58.40711, intensity: 3 },
    { id: 'activity-3', lat: -34.59774, lon: -58.44892, intensity: 5 },
    { id: 'activity-4', lat: -34.66092, lon: -58.37385, intensity: 2 },
    { id: 'activity-5', lat: -34.60481, lon: -58.43965, intensity: 4 },
    { id: 'activity-6', lat: -34.61203, lon: -58.42112, intensity: 3 },
  ],
  meta: {
    bbox: BASE_BOUNDS,
    generatedAt: new Date().toISOString(),
  },
};

const normalize = (value: string) => value.toLowerCase();

const matchesSearch = (value: string, term: string) =>
  normalize(value).includes(normalize(term));

const matchesCornerSearch = (corner: MapCornerPin, term: string) =>
  matchesSearch(corner.name, term) ||
  matchesSearch(corner.barrio, term) ||
  matchesSearch(corner.city, term);

const matchesPublicationSearch = (
  publication: MapPublicationPin,
  term: string
) =>
  matchesSearch(publication.title, term) ||
  publication.authors.some((author) => matchesSearch(author, term));

const hasThemeOverlap = (themes: string[], filters: string[]) => {
  if (filters.length === 0) {
    return true;
  }

  const normalizedThemes = themes.map((theme) => normalize(theme));
  return filters.some((filter) => normalizedThemes.includes(normalize(filter)));
};

const withinBounds = (corner: MapCornerPin, bbox: MapBoundingBox) =>
  corner.lat <= bbox.north &&
  corner.lat >= bbox.south &&
  corner.lon <= bbox.east &&
  corner.lon >= bbox.west;

export const getMapData = (query: MapQuery): MapResponse => {
  const searchTerm = query.search.trim().toLowerCase();
  const themeFilters = query.filters.themes
    .map((theme) => theme.trim())
    .filter(Boolean);

  const corners = DATASET.corners.filter((corner) => {
    if (!withinBounds(corner, query.bbox)) {
      return false;
    }

    const matchesTerm =
      searchTerm.length === 0 || matchesCornerSearch(corner, searchTerm);
    const matchesTheme = hasThemeOverlap(corner.themes, themeFilters);
    const matchesOpen = !query.filters.openNow || Boolean(corner.isOpenNow);

    return matchesTerm && matchesTheme && matchesOpen;
  });

  const cornerLookup = new Map(corners.map((corner) => [corner.id, corner]));

  const publications = DATASET.publications.filter((publication) => {
    const corner = cornerLookup.get(publication.cornerId);
    if (!corner) {
      return false;
    }

    const matchesTerm =
      searchTerm.length === 0 ||
      matchesPublicationSearch(publication, searchTerm);
    const matchesTheme = hasThemeOverlap(corner.themes, themeFilters);
    const matchesDistance =
      Number.isFinite(query.filters.distanceKm) && query.filters.distanceKm > 0
        ? publication.distanceKm <= query.filters.distanceKm
        : true;

    return matchesTerm && matchesTheme && matchesDistance;
  });

  const activity = query.filters.recentActivity ? DATASET.activity : [];

  return {
    corners: query.layers.has('corners') ? corners : [],
    publications: query.layers.has('publications') ? publications : [],
    activity: query.layers.has('activity') ? activity : [],
    meta: {
      bbox: query.bbox,
      generatedAt: new Date().toISOString(),
    },
  };
};
