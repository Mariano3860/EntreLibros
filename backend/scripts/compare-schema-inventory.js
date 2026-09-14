import pg from 'pg';

const { Client } = pg;

const INVENTORY_QUERIES = {
  extensions: `
    SELECT extname AS value
    FROM pg_extension
    WHERE extname <> 'plpgsql'
    ORDER BY value
  `,
  types: `
    SELECT format('%s:%s', type_name, enum_values) AS value
    FROM (
      SELECT type_info.typname AS type_name,
        string_agg(enum_info.enumlabel, ',' ORDER BY enum_info.enumsortorder) AS enum_values
      FROM information_schema.columns column_info
      JOIN pg_type type_info ON type_info.typname = column_info.udt_name
      JOIN pg_enum enum_info ON enum_info.enumtypid = type_info.oid
      WHERE column_info.table_schema = 'public'
      GROUP BY type_name
    ) enums
    ORDER BY value
  `,
  tables: `
    SELECT table_name AS value
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name <> 'migrations'
    ORDER BY value
  `,
  columns: `
    SELECT format(
      '%s.%s:%s:%s:%s',
      table_name,
      column_name,
      data_type,
      is_nullable,
      COALESCE(column_default, '')
    ) AS value
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name <> 'migrations'
    ORDER BY value
  `,
  constraints: `
    SELECT format('%s:%s', constraint_name, pg_get_constraintdef(constraint_oid)) AS value
    FROM (
      SELECT constraint_info.conname AS constraint_name, constraint_info.oid AS constraint_oid
      FROM pg_constraint constraint_info
      JOIN pg_class table_info ON table_info.oid = constraint_info.conrelid
      JOIN pg_namespace namespace_info ON namespace_info.oid = table_info.relnamespace
      WHERE namespace_info.nspname = 'public'
        AND table_info.relname <> 'migrations'
    ) constraints
    ORDER BY value
  `,
  indexes: `
    SELECT pg_get_indexdef(index_info.indexrelid) AS value
    FROM pg_index index_info
    JOIN pg_class table_info ON table_info.oid = index_info.indrelid
    JOIN pg_namespace namespace_info ON namespace_info.oid = table_info.relnamespace
    WHERE namespace_info.nspname = 'public'
      AND table_info.relname <> 'migrations'
    ORDER BY value
  `,
  functions: `
    SELECT format(
      '%s(%s):%s',
      procedure_info.proname,
      pg_get_function_identity_arguments(procedure_info.oid),
      pg_get_functiondef(procedure_info.oid)
    ) AS value
    FROM pg_proc procedure_info
    JOIN pg_namespace namespace_info ON namespace_info.oid = procedure_info.pronamespace
    WHERE namespace_info.nspname = 'public'
      AND procedure_info.prokind = 'f'
      AND NOT EXISTS (
        SELECT 1
        FROM pg_depend dependency
        JOIN pg_extension extension_info
          ON extension_info.oid = dependency.refobjid
        WHERE dependency.classid = 'pg_proc'::regclass
          AND dependency.objid = procedure_info.oid
          AND dependency.deptype = 'e'
      )
    ORDER BY value
  `,
};

export async function readSchemaInventory(connectionString) {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const entries = await Promise.all(
      Object.entries(INVENTORY_QUERIES).map(async ([name, query]) => {
        const result = await client.query(query);
        return [name, result.rows.map((row) => row.value)];
      })
    );
    return Object.fromEntries(entries);
  } finally {
    await client.end();
  }
}

export function compareInventories(reference, candidate) {
  return Object.fromEntries(
    Object.keys(INVENTORY_QUERIES).map((name) => {
      const referenceValues = new Set(reference[name]);
      const candidateValues = new Set(candidate[name]);
      return [
        name,
        {
          missing: [...referenceValues]
            .filter((value) => !candidateValues.has(value))
            .sort(),
          unexpected: [...candidateValues]
            .filter((value) => !referenceValues.has(value))
            .sort(),
        },
      ];
    })
  );
}

async function main() {
  const referenceUrl = process.env.SCHEMA_REFERENCE_DATABASE_URL;
  const candidateUrl = process.env.SCHEMA_CANDIDATE_DATABASE_URL;

  if (!referenceUrl || !candidateUrl) {
    throw new Error(
      'SCHEMA_REFERENCE_DATABASE_URL and SCHEMA_CANDIDATE_DATABASE_URL are required.'
    );
  }

  const [reference, candidate] = await Promise.all([
    readSchemaInventory(referenceUrl),
    readSchemaInventory(candidateUrl),
  ]);
  const differences = compareInventories(reference, candidate);
  const hasDifferences = Object.values(differences).some(
    ({ missing, unexpected }) => missing.length > 0 || unexpected.length > 0
  );

  if (hasDifferences) {
    console.error(JSON.stringify(differences, null, 2));
    process.exitCode = 1;
    return;
  }

  console.log('Schema inventories match (excluding the migration ledger).');
}

if (
  process.argv[1] &&
  process.argv[1].endsWith('compare-schema-inventory.js')
) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
