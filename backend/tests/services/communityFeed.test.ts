import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  FeedItem,
  SwapFeedItem,
} from '../../src/services/communityFeed.js';
import {
  COMMUNITY_LISTINGS,
  COMMUNITY_SWAPS,
} from '../../src/services/communityStats.mocks.js';

type CommunityFeedModule = typeof import('../../src/services/communityFeed.js');

const isSwapItem = (item: FeedItem): item is SwapFeedItem =>
  item.type === 'swap';

let getCommunityFeed: CommunityFeedModule['getCommunityFeed'];

beforeEach(async () => {
  vi.resetModules();
  ({ getCommunityFeed } = await import('../../src/services/communityFeed.js'));
});

describe('communityFeed', () => {
  it('includes swap items with required fields', () => {
    const feed = getCommunityFeed({
      page: 0,
      size: COMMUNITY_LISTINGS.length + COMMUNITY_SWAPS.length,
    });

    const swapItems = feed.filter(isSwapItem);
    expect(swapItems).toHaveLength(COMMUNITY_SWAPS.length);

    const swapsById = new Map(COMMUNITY_SWAPS.map((swap) => [swap.id, swap]));

    for (const item of swapItems) {
      const source = swapsById.get(item.id);
      expect(source).toBeDefined();
      if (!source) {
        continue;
      }

      expect(item.requester.id).toBe(source.requesterId);
      expect(item.requester.username).toBeTruthy();
      expect(item.offered.id).toBe(source.offeredListingId);
      expect(item.offered.owner.id).toBe(source.requesterId);
      expect(item.requested.id).toBe(source.requestedListingId);
      expect(item.requested.owner.id).toBe(source.responderId);
    }
  });

  it('maintains pagination order when mixing swaps and listings', () => {
    const firstPage = getCommunityFeed({ page: 0, size: 2 });
    const secondPage = getCommunityFeed({ page: 1, size: 2 });
    const combined = getCommunityFeed({ page: 0, size: 4 });

    expect([...firstPage, ...secondPage]).toEqual(combined);
  });
});
