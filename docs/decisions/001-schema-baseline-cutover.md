# Schema baseline cutover

## Decision

The live migration chain was consolidated at the final schema into
`backend/migrations/001_initial_schema.sql`. The file is schema-only and is
immutable after it has been applied. Future changes use new append-only
migrations.

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
