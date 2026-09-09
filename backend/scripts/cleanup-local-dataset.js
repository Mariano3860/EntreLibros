import 'dotenv/config';

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const cleanupSqlPath = path.join(scriptDirectory, 'cleanup-local-dataset.sql');

function assertSafeLocalDatabase(databaseUrl) {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to clean the local dataset.');
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'The local dataset cleanup is disabled when NODE_ENV=production.'
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
      `Refusing to clean database "${database}". Allowed local names: ${configuredNames.join(', ')}.`
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
    const before = await client.query(
      "SELECT COUNT(*)::INTEGER AS count FROM users WHERE email LIKE 'seed.%@entrelibros.local'"
    );
    await client.query(await readFile(cleanupSqlPath, 'utf8'));
    console.log(
      `Removed ${before.rows[0].count} seeded users from ${database}.`
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
