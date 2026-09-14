import 'dotenv/config';

import pg from 'pg';

const { Client } = pg;

export async function ensureSystemAccounts(
  connectionString = process.env.DATABASE_URL
) {
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to seed system data.');
  }

  const client = new Client({ connectionString });
  await client.connect();
  try {
    // The bot is an operational account. It is deliberately seeded outside
    // schema migrations and outside the removable local demonstration dataset.
    await client.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Bot de EntreLibros', 'bot@entrelibros.local', 'disabled-bot-account', 'bot')
      ON CONFLICT (email) DO UPDATE
      SET name = EXCLUDED.name,
          role = EXCLUDED.role
    `);
  } finally {
    await client.end();
  }
}

async function main() {
  await ensureSystemAccounts();
  console.log('System accounts are ready.');
}

if (process.argv[1] && process.argv[1].endsWith('seed-system-data.js')) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
