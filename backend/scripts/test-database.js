import pg from 'pg';

const TEST_DATABASE_NAME = /(^|[_-])test($|[_-])/i;

export function parseTestDatabaseUrl(connectionString) {
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is required for backend tests.'
    );
  }

  let url;
  try {
    url = new URL(connectionString);
  } catch (error) {
    throw new Error(
      `DATABASE_URL must be a valid PostgreSQL URL: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  if (url.protocol !== 'postgres:' && url.protocol !== 'postgresql:') {
    throw new Error('DATABASE_URL must use the postgres protocol.');
  }

  const databaseName = url.pathname.slice(1);
  if (!TEST_DATABASE_NAME.test(databaseName)) {
    throw new Error(
      'Refusing to reset a non-test database. DATABASE_URL must name a database containing "test" as a separated token.'
    );
  }

  if (!/^[A-Za-z0-9_]+$/.test(databaseName)) {
    throw new Error(
      'Test database names may only contain letters, numbers and underscores.'
    );
  }

  return { url, databaseName };
}

export async function resetTestDatabase(connectionString) {
  const { url, databaseName } = parseTestDatabaseUrl(connectionString);
  const maintenanceUrl = new URL(url);
  maintenanceUrl.pathname = '/postgres';

  const client = new pg.Client({ connectionString: maintenanceUrl.toString() });
  try {
    await client.connect();
    await client.query(
      `SELECT pg_terminate_backend(pid)
       FROM pg_stat_activity
       WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [databaseName]
    );
    await client.query(`DROP DATABASE IF EXISTS "${databaseName}"`);
    await client.query(`CREATE DATABASE "${databaseName}"`);
  } finally {
    await client.end().catch(() => undefined);
  }

  console.log(
    `BACKEND_TEST_DATABASE_RESET database=${databaseName} host=${url.hostname}:${url.port || 5432}`
  );
}
