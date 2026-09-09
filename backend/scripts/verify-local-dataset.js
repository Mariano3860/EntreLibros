import 'dotenv/config';

import pg from 'pg';

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;

function assertSafeLocalDatabase() {
  if (!databaseUrl || process.env.NODE_ENV === 'production') {
    throw new Error(
      'Local dataset verification requires a non-production DATABASE_URL.'
    );
  }
  const database = new URL(databaseUrl).pathname
    .replace(/^\//, '')
    .toLowerCase();
  const allowed = (
    process.env.ENTRELIBROS_LOCAL_DATABASE_NAMES ??
    'entrelibros,entrelibros_dev,entrelibros_local'
  )
    .split(',')
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);
  if (
    !allowed.includes(database) ||
    /^(test|e2e|prod|production)([_-]|$)/.test(database)
  ) {
    throw new Error(`Refusing to verify database "${database}".`);
  }
  return database;
}

async function main() {
  const database = assertSafeLocalDatabase();
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    const result = await client.query(`
      WITH seeded_users AS (
        SELECT id FROM users WHERE email LIKE 'seed.%@entrelibros.local'
      ),
      seeded_conversations AS (
        SELECT conversation_id AS id
        FROM conversation_participants
        GROUP BY conversation_id
        HAVING BOOL_AND(user_id IN (SELECT id FROM seeded_users))
      )
      SELECT
        (SELECT COUNT(*) FROM seeded_users) AS users,
        (SELECT COUNT(*) FROM books WHERE isbn IN (
          '9788437604794','9788437604947','9788499890944','9788478887194','9788491050299',
          '9788437604944','9788420633111','9788408172179','9788416517271','9788497592208',
          '9788401337208','9788499926223','9788498382372','9788445000760','9788417347087',
          '9788497592457','9788497594257','9788497592444','9788417860791','9788439722464',
          '9788483468680','9788439722341','9788418015855','9788497595728','9788439724703',
          '9788413621658','9788413140326','9788466347994','9788423360793','9788423354273'
        )) AS books,
        (SELECT COUNT(*) FROM book_listings listing JOIN seeded_users ON seeded_users.id = listing.user_id) AS listings,
        (SELECT COUNT(*) FROM community_corners WHERE id IN (
          '4a089a74-4dfc-4531-a04c-883d3cd2233a','5a089a74-4dfc-4531-a04c-883d3cd2233a',
          '6a089a74-4dfc-4531-a04c-883d3cd2233a','7a089a74-4dfc-4531-a04c-883d3cd2233a',
          '8a089a74-4dfc-4531-a04c-883d3cd2233a','9a089a74-4dfc-4531-a04c-883d3cd2233a',
          'aa089a74-4dfc-4531-a04c-883d3cd2233a','ba089a74-4dfc-4531-a04c-883d3cd2233a'
        )) AS corners,
        (SELECT COUNT(*) FROM seeded_conversations) AS conversations,
        (SELECT COUNT(*) FROM messages WHERE client_key LIKE 'seed-%') AS messages,
        (SELECT COUNT(*) FROM message_drafts draft JOIN seeded_conversations ON seeded_conversations.id = draft.conversation_id) AS drafts,
        (SELECT COUNT(*) FROM exchange_agreements agreement JOIN seeded_conversations ON seeded_conversations.id = agreement.conversation_id) AS agreements,
        (SELECT COUNT(*) FROM notifications WHERE idempotency_key LIKE 'seed-agreement-%') AS notifications,
        (SELECT COUNT(*) FROM analytics_events WHERE idempotency_key LIKE 'seed-analytics-%') AS analytics,
        (SELECT COUNT(*) FROM users WHERE email LIKE 'seed.%@entrelibros.local' AND profile_visibility = 'public' AND location_visibility IN ('city', 'neighborhood')) AS public_profiles,
        (SELECT COUNT(*) FROM book_listings listing JOIN seeded_users ON seeded_users.id = listing.user_id WHERE NOT EXISTS (SELECT 1 FROM book_listing_images image WHERE image.book_listing_id = listing.id AND image.is_primary = true)) AS listings_without_images,
        (SELECT COUNT(*)
         FROM book_listings listing
         JOIN seeded_users ON seeded_users.id = listing.user_id
         LEFT JOIN users owner ON owner.id = listing.user_id
         LEFT JOIN books book ON book.id = listing.book_id
         WHERE owner.id IS NULL OR book.id IS NULL) AS orphan_listings
    `);
    const counts = Object.fromEntries(
      Object.entries(result.rows[0]).map(([key, value]) => [key, Number(value)])
    );
    const minimums = {
      users: 12,
      books: 30,
      listings: 40,
      corners: 8,
      conversations: 8,
      messages: 24,
      drafts: 8,
      agreements: 4,
      notifications: 4,
      analytics: 6,
      public_profiles: 12,
    };
    for (const [key, minimum] of Object.entries(minimums)) {
      if (counts[key] < minimum) {
        throw new Error(
          `${key} expected at least ${minimum}, received ${counts[key]}.`
        );
      }
    }
    if (counts.orphan_listings !== 0) {
      throw new Error(
        `Found ${counts.orphan_listings} orphan seeded listings.`
      );
    }
    if (counts.listings_without_images !== 0) {
      throw new Error(
        `Found ${counts.listings_without_images} seeded listings without a primary image.`
      );
    }
    console.log(`Local dataset verified in ${database}:`, counts);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
