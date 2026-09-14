import { describe, expect, test } from 'vitest';

import { compareInventories } from '../../scripts/compare-schema-inventory.js';

describe('schema inventory comparison', () => {
  test('ignores equal schema objects and reports only structural differences', () => {
    const reference = {
      extensions: ['postgis'],
      types: [],
      tables: ['users'],
      columns: ['users.id:integer:NO:'],
      constraints: [],
      indexes: [],
      functions: [],
    };
    const candidate = {
      ...reference,
      tables: ['users', 'unexpected_table'],
      columns: [],
    };

    expect(compareInventories(reference, candidate)).toMatchObject({
      tables: { missing: [], unexpected: ['unexpected_table'] },
      columns: { missing: ['users.id:integer:NO:'], unexpected: [] },
    });
  });
});
