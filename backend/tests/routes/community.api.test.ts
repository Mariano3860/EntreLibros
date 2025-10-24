import request from 'supertest';
import { describe, expect, test } from 'vitest';

import app from '../../src/app.js';

describe('community stats endpoint', () => {
  test('returns deterministic community metrics', async () => {
    const response = await request(app).get('/api/community/stats').expect(200);

    expect(response.body).toEqual({
      kpis: {
        exchanges: 73,
        activeHouses: 5,
        activeUsers: 5,
        booksPublished: 8,
      },
      trendExchanges: [36, 42, 45, 51, 58, 64, 72],
      trendNewBooks: [18, 21, 24, 22, 27, 29, 33],
      topContributors: [
        { username: '@marcos', metric: 'exchanges', value: 21 },
        { username: '@sofi', metric: 'exchanges', value: 18 },
        { username: '@aylen', metric: 'exchanges', value: 15 },
        { username: '@lucia', metric: 'books', value: 14 },
        { username: '@valen', metric: 'books', value: 5 },
      ],
      hotSearches: [
        { term: 'ensayo feminista', count: 5 },
        { term: 'fantasia juvenil', count: 4 },
        { term: 'ciencia ficcion argentina', count: 3 },
        { term: 'club de lectura', count: 3 },
        { term: 'clásicos', count: 2 },
        { term: 'cronica urbana', count: 2 },
      ],
      activeHousesMap: [
        { top: '68%', left: '35%' },
        { top: '51%', left: '46%' },
        { top: '47%', left: '41%' },
        { top: '44%', left: '53%' },
        { top: '42%', left: '58%' },
      ],
    });
  });
});

describe('community feed endpoint', () => {
  test('returns the latest feed slice with defaults', async () => {
    const response = await request(app).get('/api/community/feed').expect(200);

    expect(response.body).toHaveLength(8);
    expect(response.body[0]).toEqual({
      id: 'swap-1',
      type: 'swap',
      user: 'Lucía F.',
      avatar: 'https://i.pravatar.cc/150?img=13',
      time: 'hace 1 d',
      likes: 17,
      corner: { id: 'corner-5', name: 'Punto de Lectura Villa Crespo' },
      requester: {
        id: 'user-3',
        displayName: 'Lucía F.',
        username: '@lucia',
        avatar: 'https://i.pravatar.cc/150?img=13',
      },
      offered: {
        id: 'listing-8',
        title: 'Economías para el bien común',
        author: 'Christian Felber',
        cover: 'https://picsum.photos/seed/economias-del-bien-comun/600/400',
        category: 'sale',
        owner: {
          id: 'user-3',
          displayName: 'Lucía F.',
          username: '@lucia',
          avatar: 'https://i.pravatar.cc/150?img=13',
        },
      },
      requested: {
        id: 'listing-1',
        title: 'Los años felices',
        author: 'Claudia Piñeiro',
        cover: 'https://picsum.photos/seed/anios-felices/600/400',
        category: 'book',
        owner: {
          id: 'user-1',
          displayName: 'Sofía M.',
          username: '@sofi',
          avatar: 'https://i.pravatar.cc/150?img=11',
        },
      },
    });
    expect(response.body[1]).toEqual({
      id: 'listing-1',
      type: 'book',
      user: 'Sofía M.',
      avatar: 'https://i.pravatar.cc/150?img=11',
      time: 'hace 1 d',
      likes: 42,
      corner: { id: 'corner-1', name: 'Rincón Plaza Malabia' },
      title: 'Los años felices',
      author: 'Claudia Piñeiro',
      cover: 'https://picsum.photos/seed/anios-felices/600/400',
    });
    expect(response.body[2]).toEqual({
      id: 'listing-2',
      type: 'sale',
      user: 'Marcos R.',
      avatar: 'https://i.pravatar.cc/150?img=12',
      time: 'hace 1 d',
      likes: 35,
      corner: { id: 'corner-2', name: 'Bibliorincón Parque Patricios' },
      title: 'La invención de la naturaleza',
      price: 12000,
      condition: 'como nuevo',
      cover: 'https://picsum.photos/seed/invencion-de-la-naturaleza/600/400',
    });
  });

  test('supports pagination slices', async () => {
    const response = await request(app)
      .get('/api/community/feed')
      .query({ page: 1, size: 3 })
      .expect(200);

    expect(response.body).toEqual([
      {
        id: 'swap-2',
        type: 'swap',
        user: 'Aylén P.',
        avatar: 'https://i.pravatar.cc/150?img=14',
        time: 'hace 2 d',
        likes: 23,
        corner: { id: 'corner-3', name: 'Club de Lectura Chacarita' },
        requester: {
          id: 'user-4',
          displayName: 'Aylén P.',
          username: '@aylen',
          avatar: 'https://i.pravatar.cc/150?img=14',
        },
        offered: {
          id: 'listing-9',
          title: 'La trama celeste',
          author: 'Adolfo Bioy Casares',
          cover: 'https://picsum.photos/seed/trama-celeste/600/400',
          category: 'book',
          owner: {
            id: 'user-4',
            displayName: 'Aylén P.',
            username: '@aylen',
            avatar: 'https://i.pravatar.cc/150?img=14',
          },
        },
        requested: {
          id: 'listing-2',
          title: 'La invención de la naturaleza',
          author: 'Andrea Wulf',
          cover: 'https://picsum.photos/seed/invencion-de-la-naturaleza/600/400',
          category: 'sale',
          owner: {
            id: 'user-2',
            displayName: 'Marcos R.',
            username: '@marcos',
            avatar: 'https://i.pravatar.cc/150?img=12',
          },
        },
      },
      {
        id: 'listing-3',
        type: 'seeking',
        user: 'Lucía F.',
        avatar: 'https://i.pravatar.cc/150?img=13',
        time: 'hace 2 d',
        likes: 21,
        corner: { id: 'corner-5', name: 'Punto de Lectura Villa Crespo' },
        title: 'Busco: Antología Poesía Mapuche',
      },
      {
        id: 'listing-4',
        type: 'book',
        user: 'Aylén P.',
        avatar: 'https://i.pravatar.cc/150?img=14',
        time: 'hace 3 d',
        likes: 29,
        corner: { id: 'corner-3', name: 'Club de Lectura Chacarita' },
        title: 'El jardín secreto',
        author: 'Frances Hodgson Burnett',
        cover: 'https://picsum.photos/seed/jardin-secreto/600/400',
      },
    ]);
  });

  test('validates pagination input', async () => {
    const response = await request(app)
      .get('/api/community/feed')
      .query({ page: -1 })
      .expect(400);

    expect(response.body).toEqual({
      error: 'BadRequest',
      message: 'community.errors.invalid_pagination',
    });

    const invalidSize = await request(app)
      .get('/api/community/feed')
      .query({ size: 0 })
      .expect(400);

    expect(invalidSize.body).toEqual({
      error: 'BadRequest',
      message: 'community.errors.invalid_pagination',
    });
  });
});

describe('community activity endpoint', () => {
  test('returns recent avatars', async () => {
    const response = await request(app)
      .get('/api/community/activity')
      .expect(200);

    expect(response.body).toEqual([
      {
        id: 'user-1',
        user: 'Sofía M.',
        avatar: 'https://i.pravatar.cc/150?img=11',
      },
      {
        id: 'user-2',
        user: 'Marcos R.',
        avatar: 'https://i.pravatar.cc/150?img=12',
      },
      {
        id: 'user-3',
        user: 'Lucía F.',
        avatar: 'https://i.pravatar.cc/150?img=13',
      },
      {
        id: 'user-4',
        user: 'Aylén P.',
        avatar: 'https://i.pravatar.cc/150?img=14',
      },
      {
        id: 'user-5',
        user: 'Diego L.',
        avatar: 'https://i.pravatar.cc/150?img=15',
      },
      {
        id: 'user-6',
        user: 'Valen C.',
        avatar: 'https://i.pravatar.cc/150?img=16',
      },
    ]);
  });
});

describe('community suggestions endpoint', () => {
  test('returns ranked suggestions', async () => {
    const response = await request(app)
      .get('/api/community/suggestions')
      .expect(200);

    expect(response.body).toEqual([
      {
        id: 'user-1',
        user: 'Sofía M. · Palermo',
        avatar: 'https://i.pravatar.cc/150?img=11',
      },
      {
        id: 'user-2',
        user: 'Marcos R. · Chacarita',
        avatar: 'https://i.pravatar.cc/150?img=12',
      },
      {
        id: 'user-4',
        user: 'Aylén P. · Caballito',
        avatar: 'https://i.pravatar.cc/150?img=14',
      },
      {
        id: 'user-5',
        user: 'Diego L. · Almagro',
        avatar: 'https://i.pravatar.cc/150?img=15',
      },
      {
        id: 'user-3',
        user: 'Lucía F. · Villa Crespo',
        avatar: 'https://i.pravatar.cc/150?img=13',
      },
    ]);
  });
});
