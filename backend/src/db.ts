import { Pool, PoolClient, type QueryResultRow } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

export const pool = new Pool({ connectionString });

let testClient: PoolClient | null = null;

export function setTestClient(client: PoolClient | null) {
  testClient = client;
}

export function getClient(): Pool | PoolClient {
  return testClient ?? pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<{ rows: T[] }> {
  const client = getClient();
  // Both Pool and PoolClient expose a compatible query method
  return client.query<T>(sql, params);
}

export type DbClient = PoolClient;

export async function withTransaction<T>(
  work: (client: DbClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // ignore rollback errors
    }
    throw err;
  } finally {
    client.release();
  }
}
