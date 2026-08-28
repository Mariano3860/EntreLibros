import pg from 'pg';

export async function verifyPostgresPreflight(connectionString) {
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is required for database operations.'
    );
  }

  let url;
  try {
    url = new URL(connectionString);
  } catch (err) {
    throw new Error(`Invalid DATABASE_URL format: ${err.message}`);
  }

  const client = new pg.Client({ connectionString });

  try {
    await client.connect();
  } catch (err) {
    throw new Error(
      `Failed to connect to PostgreSQL at ${url.hostname}:${url.port || 5432}.\n` +
        `Ensure PostgreSQL is running and port ${url.port || 5432} is not blocked or occupied by another service.\n` +
        `Original error: ${err.message}`
    );
  }

  try {
    // Check if PostGIS extension is available or installed
    const res = await client.query(`
      SELECT installed_version 
      FROM pg_available_extensions 
      WHERE name = 'postgis';
    `);

    if (res.rows.length === 0 || !res.rows[0].installed_version) {
      throw new Error(
        `PostgreSQL instance at ${url.hostname}:${url.port || 5432} (database: ${url.pathname.slice(1)}) does not have PostGIS extension available.\n` +
          `Please ensure you are using a PostGIS-enabled container (e.g. postgis/postgis:16-3.4).`
      );
    }

    // Ensure extension postgis is enabled for current database
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
  } catch (err) {
    await client.end().catch(() => {});
    throw err;
  }

  await client.end();
  return true;
}

// Run directly if called as a script
if (process.argv[1] && process.argv[1].endsWith('preflight.js')) {
  const connectionString = process.env.DATABASE_URL;
  verifyPostgresPreflight(connectionString)
    .then(() => {
      console.log(
        'PostgreSQL and PostGIS preflight checks passed successfully.'
      );
      process.exit(0);
    })
    .catch((err) => {
      console.error('PREFLIGHT CHECK FAILED:', err.message);
      process.exit(1);
    });
}
