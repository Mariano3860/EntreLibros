# Schema baseline cutover

## Decision

The live migration chain was consolidated at the final schema into four ordered
files: `001_schema_objects.sql`, `002_defaults_and_constraints.sql`,
`003_indexes.sql` and `004_foreign_keys.sql`. Together they are schema-only and
immutable after they have been applied. Future changes use new append-only
migrations starting after `004`.

## Cutoff and compatibility

The former `001`–`037` files are retired from the live migration directory;
Git history preserves them. Their ledger is not compatible with the baseline.
The runner detects it and refuses an in-place upgrade before DDL.

## Data and rollback

The system bot is bootstrap data and the defense walkthrough is local/E2E seed
data. Neither is part of the schema baseline. Keep the old database as a
rollback reference while validating the new database. Rollback means returning
the application to the previous `DATABASE_URL` and backend version; it never
means dropping or rewriting the old database.
