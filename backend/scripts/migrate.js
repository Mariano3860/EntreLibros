import 'dotenv/config';
import { migrate } from 'postgres-migrations';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import crypto from 'crypto';
import pg from 'pg';
import { verifyPostgresPreflight } from './preflight.js';
import {
  assertApprovedMigrationTarget,
  assertNoRetiredMigrationLedger,
} from './migration-target.js';

const migrationsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'migrations'
);

const hashMigration = (fileName, source) =>
  crypto
    .createHash('sha1')
    .update(fileName + source, 'utf8')
    .digest('hex');

const migrationName = (fileName) =>
  fileName.replace(/^\d+_/, '').replace(/\.sql$/, '');

export const normalizeMigrationSource = (source) =>
  source.replaceAll(String.fromCharCode(13, 10), String.fromCharCode(10));

export async function assertMigrationTargetIsSafe(connectionString, client) {
  assertApprovedMigrationTarget(connectionString);
  await assertNoRetiredMigrationLedger(client);
}

export async function runMigrations(
  connectionString = process.env.DATABASE_URL
) {
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const url = new URL(connectionString);
  assertApprovedMigrationTarget(connectionString);
  // Checking the retired ledger happens before PostGIS setup or migration DDL.
  // The old database remains a rollback reference and must never be upgraded.
  // postgres-migrations hashes raw file contents. Normalizing CRLF here keeps
  // the recorded hashes stable when a Windows checkout reads LF migrations.
  const normalizedDir = await fs.mkdtemp(
    path.join(os.tmpdir(), 'entrelibros-migrations-')
  );
  const client = new pg.Client({
    database: url.pathname.slice(1),
    user: url.username,
    password: url.password,
    host: url.hostname,
    port: Number(url.port) || 5432,
  });
  try {
    const appliedHashes = new Map();
    try {
      await client.connect();
      await assertNoRetiredMigrationLedger(client);
      const result = await client.query('SELECT name, hash FROM migrations');
      for (const row of result.rows) appliedHashes.set(row.name, row.hash);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('retired migration ledger')
      ) {
        throw error;
      }
      if (error?.code !== '42P01') throw error;
      // A fresh database has no migrations table yet; the migrator creates it.
    } finally {
      await client.end().catch(() => undefined);
    }
    const files = await fs.readdir(migrationsDir);
    await Promise.all(
      files.map(async (file) => {
        const source = await fs.readFile(
          path.join(migrationsDir, file),
          'utf8'
        );
        const lineFeedSource = normalizeMigrationSource(source);
        const appliedHash = appliedHashes.get(migrationName(file));
        const sourceForMigration =
          appliedHash === hashMigration(file, source) ? source : lineFeedSource;
        await fs.writeFile(
          path.join(normalizedDir, file),
          sourceForMigration,
          'utf8'
        );
      })
    );
    await verifyPostgresPreflight(connectionString, {
      ensurePostgisExtension: false,
    });
    await migrate(
      {
        database: url.pathname.slice(1),
        user: url.username,
        password: url.password,
        host: url.hostname,
        port: Number(url.port) || 5432,
        ensureDatabaseExists: true,
      },
      normalizedDir
    );
    console.log('Migrations completed successfully.');
  } finally {
    await fs.rm(normalizedDir, { recursive: true, force: true });
  }
}

if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  runMigrations().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
}
