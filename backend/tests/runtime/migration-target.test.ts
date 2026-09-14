import fs from 'node:fs/promises';

import { describe, expect, test, vi } from 'vitest';

import {
  assertApprovedMigrationTarget,
  assertNoRetiredMigrationLedger,
  findRetiredMigrationNames,
  getApprovedMigrationDatabaseNames,
} from '../../scripts/migration-target.js';
import {
  getOrderedMigrationFiles,
  normalizeMigrationSource,
} from '../../scripts/migrate.js';

describe('migration baseline target guard', () => {
  test('accepts only explicitly approved baseline lifecycle databases', () => {
    expect(
      assertApprovedMigrationTarget(
        'postgres://postgres:postgres@localhost:5432/entrelibros_baseline'
      )
    ).toBe('entrelibros_baseline');

    expect(() =>
      assertApprovedMigrationTarget(
        'postgres://postgres:postgres@localhost:5432/entrelibros'
      )
    ).toThrow('Refusing to migrate database "entrelibros"');
  });

  test('allows an operator to explicitly approve a separate local target', () => {
    const environment = {
      ENTRELIBROS_MIGRATION_DATABASE_NAMES:
        'entrelibros_defense, entrelibros_test',
    };

    expect(getApprovedMigrationDatabaseNames(environment)).toEqual([
      'entrelibros_defense',
      'entrelibros_test',
    ]);
    expect(
      assertApprovedMigrationTarget(
        'postgres://postgres:postgres@localhost:5432/entrelibros_defense',
        environment
      )
    ).toBe('entrelibros_defense');
  });

  test('recognizes the historical ledger without rejecting the new baseline', () => {
    expect(
      findRetiredMigrationNames([
        'initial_schema',
        'create_users',
        'create_reports',
      ])
    ).toEqual(['create_users', 'create_reports']);
  });

  test('stops before migration DDL when a retired ledger is present', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ exists: true }] })
      .mockResolvedValueOnce({ rows: [{ name: 'create_users' }] });

    await expect(assertNoRetiredMigrationLedger({ query })).rejects.toThrow(
      'Do not upgrade it in place'
    );
    expect(query).toHaveBeenCalledTimes(2);
  });

  test('normalizes CRLF migration sources deterministically', () => {
    expect(normalizeMigrationSource('CREATE TABLE example ();\r\n')).toBe(
      'CREATE TABLE example ();\n'
    );
  });

  test('exposes the grouped baseline in dependency order', async () => {
    await expect(getOrderedMigrationFiles()).resolves.toEqual([
      '001_schema_objects.sql',
      '002_defaults_and_constraints.sql',
      '003_indexes.sql',
      '004_foreign_keys.sql',
    ]);
  });

  test('keeps every baseline stage free of product data writes', async () => {
    const files = await getOrderedMigrationFiles();
    const migrationDirectory = new URL('../../migrations/', import.meta.url);
    const source = await Promise.all(
      files.map((file) =>
        fs.readFile(new URL(file, migrationDirectory), 'utf8')
      )
    );

    expect(source.join('\n')).not.toMatch(/^\s*(INSERT|UPDATE|DELETE)\b/im);
  });
});
