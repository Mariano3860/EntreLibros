import 'dotenv/config';

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const seedSqlPath = path.join(scriptDirectory, 'seed-local-dataset.sql');

function assertSafeLocalDatabase(databaseUrl) {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to seed the local dataset.');
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'The local dataset seed is disabled when NODE_ENV=production.'
    );
  }

  const database = new URL(databaseUrl).pathname
    .replace(/^\//, '')
    .toLowerCase();
  const configuredNames = (
    process.env.ENTRELIBROS_LOCAL_DATABASE_NAMES ??
    'entrelibros,entrelibros_dev,entrelibros_local'
  )
    .split(',')
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);

  if (
    /^(test|e2e|prod|production)([_-]|$)/.test(database) ||
    !configuredNames.includes(database)
  ) {
    throw new Error(
      `Refusing to seed database "${database}". Allowed local names: ${configuredNames.join(', ')}.`
    );
  }

  return database;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const database = assertSafeLocalDatabase(databaseUrl);
  const client = new Client({ connectionString: databaseUrl });

  await client.connect();
  try {
    const currentDatabase = (
      await client.query('SELECT current_database() AS name')
    ).rows[0].name;
    if (currentDatabase !== database) {
      throw new Error(
        `DATABASE_URL resolved to "${currentDatabase}", expected "${database}".`
      );
    }

    const sql = await readFile(seedSqlPath, 'utf8');
    await client.query(sql);

    const counts = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE email LIKE 'seed.%@entrelibros.local') AS users,
        (SELECT COUNT(*) FROM books WHERE isbn IN (
          '9788437604794','9788437604947','9788499890944','9788478887194','9788491050299',
          '9788437604944','9788420633111','9788408172179','9788416517271','9788497592208',
          '9788401337208','9788499926223','9788498382372','9788445000760','9788417347087',
          '9788497592457','9788497594257','9788497592444','9788417860791','9788439722464',
          '9788483468680','9788439722341','9788418015855','9788497595728','9788439724703',
          '9788413621658','9788413140326','9788466347994','9788423360793','9788423354273'
        )) AS books,
        (SELECT COUNT(*) FROM book_listings listing JOIN users seed_user ON seed_user.id = listing.user_id WHERE seed_user.email LIKE 'seed.%@entrelibros.local') AS listings,
        (SELECT COUNT(*) FROM community_corners WHERE id IN ('4a089a74-4dfc-4531-a04c-883d3cd2233a','5a089a74-4dfc-4531-a04c-883d3cd2233a','6a089a74-4dfc-4531-a04c-883d3cd2233a','7a089a74-4dfc-4531-a04c-883d3cd2233a','8a089a74-4dfc-4531-a04c-883d3cd2233a','9a089a74-4dfc-4531-a04c-883d3cd2233a','aa089a74-4dfc-4531-a04c-883d3cd2233a','ba089a74-4dfc-4531-a04c-883d3cd2233a')) AS corners,
        (SELECT COUNT(DISTINCT message.id) FROM messages message JOIN conversation_participants participant ON participant.conversation_id = message.conversation_id JOIN users seed_user ON seed_user.id = participant.user_id WHERE seed_user.email LIKE 'seed.%@entrelibros.local') AS messages,
        (SELECT COUNT(*) FROM analytics_events WHERE idempotency_key LIKE 'seed-analytics-%') AS analytics
    `);

    console.log(`Local dataset seeded in ${database}:`, counts.rows[0]);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
