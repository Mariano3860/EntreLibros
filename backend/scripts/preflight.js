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

  let client = new pg.Client({ connectionString });
  let targetDatabaseConnected = true;

  try {
    await client.connect();
  } catch (err) {
    // postgres-migrations can create the target database when it does not
    // exist yet. Check the server through the maintenance database first so a
    // clean PostGIS volume can pass preflight and reach that migration step.
    if (err.code === '3D000') {
      targetDatabaseConnected = false;
      await client.end().catch(() => {});
      const maintenanceUrl = new URL(connectionString);
      maintenanceUrl.pathname = '/postgres';
      client = new pg.Client({ connectionString: maintenanceUrl.toString() });

      try {
        await client.connect();
      } catch (maintenanceErr) {
        await client.end().catch(() => {});
        throw new Error(
          `Failed to connect to PostgreSQL at ${url.hostname}:${url.port || 5432}.\n` +
            `Ensure PostgreSQL is running and port ${url.port || 5432} is not blocked or occupied by another service.\n` +
            `Original error: ${maintenanceErr.message}`
        );
      }
    } else {
      throw new Error(
        `Failed to connect to PostgreSQL at ${url.hostname}:${url.port || 5432}.\n` +
          `Ensure PostgreSQL is running and port ${url.port || 5432} is not blocked or occupied by another service.\n` +
          `Original error: ${err.message}`
      );
    }
  }

  try {
    // `default_version` is populated when the PostGIS package is available;
    // `installed_version` is NULL until the extension exists in this database.
    const res = await client.query(`
      SELECT default_version, installed_version
      FROM pg_available_extensions 
      WHERE name = 'postgis';
    `);

    if (res.rows.length === 0 || !res.rows[0].default_version) {
      throw new Error(
        `PostgreSQL instance at ${url.hostname}:${url.port || 5432} (database: ${url.pathname.slice(1)}) does not have PostGIS extension available.\n` +
          `Please ensure you are using a PostGIS-enabled container (e.g. postgis/postgis:16-3.4).`
      );
    }

    // Only enable PostGIS in the target database. For a fresh database this
    // connection is to `postgres`; the migration owns extension creation.
    if (targetDatabaseConnected) {
      await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    }
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
