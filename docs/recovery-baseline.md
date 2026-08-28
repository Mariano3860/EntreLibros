# EntreLibros recovery baseline

Captured on 2026-08-28 at 13:14 CEST for the OpenSpec change
`complete-entrelibros-recovery`. Commands are written for PowerShell from the
repository root unless noted otherwise.

## Git baseline

| Item | Captured value |
| --- | --- |
| Current branch | `main` |
| Local `HEAD` | `f87df5d1f97f122878ceeb105bb973681536457a` |
| Locally cached `origin/main` | `f87df5d1f97f122878ceeb105bb973681536457a` |
| Current remote `main` | `c06a37ea45f2aa1b19c98f88d43a79bb3a6eea34` |
| PR #138 head | `5dc3bf397ff51e9c4280b6fbf3667f7d04d53944` |
| PR #138 base snapshot | `f87df5d1f97f122878ceeb105bb973681536457a` |

The local branch is behind the remote. No fetch, merge, rebase, checkout or
branch creation was performed while capturing this baseline.

```powershell
git log -1 --format='local_head=%H%nlocal_subject=%s%nlocal_date=%cI'
git branch -avv
git ls-remote origin refs/heads/main refs/pull/138/head
```

The worktree contains the staged OpenSpec change and its installed local skill
files. Seven backend paths initially appeared as unstaged modifications even
though `git diff` was empty. This was a stale line-ending/stat entry in the
index: the index recorded older CRLF-sized worktree files while the current LF
files were byte-for-byte equal to `HEAD`.

For every affected path, `HEAD`, index, raw worktree and Git-filtered worktree
resolved to the same blob. The paths were added explicitly after this check,
which refreshed only their index metadata. Both the staged and unstaged diffs
for those paths remain empty, and `git status --short` now lists only the
intentional recovery/OpenSpec additions. No backend file was rewritten.

Affected paths:

- `backend/openapi.json`
- `backend/src/repositories/bookListingRepository.ts`
- `backend/src/routes/books.ts`
- `backend/src/routes/contact.ts`
- `backend/src/services/bookListings.ts`
- `backend/tests/routes/books.api.test.ts`
- `backend/tests/routes/contact.api.test.ts`

```powershell
$paths = @(
  'backend/openapi.json',
  'backend/src/repositories/bookListingRepository.ts',
  'backend/src/routes/books.ts',
  'backend/src/routes/contact.ts',
  'backend/src/services/bookListings.ts',
  'backend/tests/routes/books.api.test.ts',
  'backend/tests/routes/contact.api.test.ts'
)
foreach ($path in $paths) {
  git rev-parse "HEAD:$path"
  git rev-parse ":$path"
  git hash-object --no-filters -- $path
  git hash-object --path=$path -- $path
}
git diff --exit-code -- $paths
git diff --cached --exit-code -- $paths
git status --short
```

## PR #138 and CI

[PR #138, "Implement agreement version workflow"](https://github.com/Mariano3860/EntreLibros/pull/138)
is open and not a draft. GitHub reports it as mergeable but blocked. It targets
`main` from `feature/expand-messages.types.ts-for-agreementversion`, has one
commit and has no approving review decision.

Six review threads remain unresolved:

| Path | Finding | Thread |
| --- | --- | --- |
| `frontend/src/components/messages/useAgreementStore.ts` | Unused cancellation `reason` | [discussion](https://github.com/Mariano3860/EntreLibros/pull/138#discussion_r2491522113) |
| `frontend/src/components/messages/useAgreementStore.ts` | `confirmVersion` reads stale closure state | [discussion](https://github.com/Mariano3860/EntreLibros/pull/138#discussion_r2491522157) |
| `frontend/src/components/messages/useAgreementStore.ts` | `cancelVersion` reads stale closure state | [discussion](https://github.com/Mariano3860/EntreLibros/pull/138#discussion_r2491522188) |
| `frontend/src/components/messages/useAgreementStore.ts` | Redundant `useMemo` | [discussion](https://github.com/Mariano3860/EntreLibros/pull/138#discussion_r2491522210) |
| `frontend/src/components/messages/Messages.tsx` | Duplicate agreement lookup | [discussion](https://github.com/Mariano3860/EntreLibros/pull/138#discussion_r2491522221) |
| `frontend/src/components/messages/useAgreementStore.ts` | P1 concurrent updates must derive from `prev` | [discussion](https://github.com/Mariano3860/EntreLibros/pull/138#discussion_r2491534939) |

### PR #138 recovery inventory (2026-08-28)

The current PR diff is limited to the agreement workflow in the frontend:
version types, the local agreement store, proposal/confirmation/cancellation
bubbles and modals, message rendering, the mocked book-availability check and
Spanish/English labels. The review fixes are mapped as follows:

| Review finding | Code change | Regression evidence |
| --- | --- | --- |
| Confirmation/cancellation used a stale closure | Functional state updaters derive from `prev[conversationId]` | `frontend/tests/hooks/useAgreementStore.test.ts`: queued confirmations and cancellations |
| Unused cancellation reason | Removed the unused store parameter; the rendered message remains responsible for its display reason | Frontend typecheck plus existing cancellation rendering path |
| Redundant memoization | Return `agreements` directly from the hook | Frontend typecheck |
| Duplicate agreement lookup | The action path keeps one lookup for the selected conversation/version before appending the event | Frontend typecheck and PR diff review |

The PR still does not contain persistent conversations, messages or agreements,
backend routes/migrations, environment changes, general dependency upgrades or
production deployment work. Those are explicitly deferred to the subsequent
sections of `complete-entrelibros-recovery` and must not be added to #138.

The scope inventory for the reviewed paths is:

| Area | Current PR state | Follow-up boundary |
| --- | --- | --- |
| Conversation initialization | `Messages.tsx` initializes the current mock conversation list locally | Server conversation listing belongs to section 6 |
| Agreement versions | `useAgreementStore` keeps proposal history and active version in client state | Immutable persisted versions belong to section 5 |
| Confirm and cancel | Client-only transitions now use atomic functional updates; cancellation text stays in the message model | Authenticated commands and concurrency belong to section 5 |
| Reconnect | Existing Socket.IO chat path remains a transport/mock concern; no agreement recovery cursor exists | Persisted replay belongs to sections 4 and 6 |
| Errors | Current UI maps local store errors to i18n keys; no backend error contract is present | REST/OpenAPI error contracts belong to sections 4–6 |

The latest [CI Frontend run](https://github.com/Mariano3860/EntreLibros/actions/runs/19077745239)
completed with failure in the `quality` job. The Dependabot auto-merge check was
skipped. GitHub no longer retains the failed job log: requesting it on
2026-08-28 returned HTTP 410, so the precise historical failing assertion must
be reproduced on the PR branch rather than inferred.

```powershell
gh pr view 138 --repo Mariano3860/EntreLibros --json number,title,state,url,isDraft,baseRefName,baseRefOid,headRefName,headRefOid,author,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup,updatedAt,commits,reviews
gh api graphql -F owner=Mariano3860 -F name=EntreLibros -F number=138 -f query='query($owner:String!,$name:String!,$number:Int!){repository(owner:$owner,name:$name){pullRequest(number:$number){reviewThreads(first:100){totalCount nodes{id isResolved isOutdated path line comments(first:20){nodes{id url author{login} body createdAt}}}}}}}'
gh run view 19077745239 --repo Mariano3860/EntreLibros --json databaseId,name,displayTitle,status,conclusion,url,createdAt,updatedAt,event,headBranch,headSha,jobs
gh run view 19077745239 --repo Mariano3860/EntreLibros --log-failed
```

## Database schema and restore verification

The source container `entrelibros-db-1` uses volume `entrelibros_db_data` and
publishes PostgreSQL on host port 5432. It reports PostgreSQL 16.4 and PostGIS
3.4.3. Database `entrelibros` contains migrations `001` through `009`; the
`migrations` table has ten records including row `0`, which creates the
migration table itself.

A custom-format backup was exported to the temporary directory configured by
PowerShell:

`$env:TEMP\EntreLibros-Recovery\entrelibros-20260828.dump`

SHA-256:
`4CD59F56722D4CA052DC1CE7B63F5A1FE7EE46A9E57C9C2BE97AF30D419D93E4`.

The dump was restored with `pg_restore --exit-on-error` into database
`entrelibros_restore_verify` in container
`entrelibros-recovery-verify-20260828`. That container uses the distinct volume
`entrelibros_recovery_verify_20260828`, network mode `none`, and publishes no
ports. The source container and volume were not stopped, recreated or deleted.

Exact source and restored row counts match:

| Table | Rows |
| --- | ---: |
| `book_listing_images` | 4 |
| `book_listings` | 4 |
| `books` | 4 |
| `community_corner_metrics` | 2 |
| `community_corner_photos` | 2 |
| `community_corners` | 2 |
| `contact_messages` | 3 |
| `migrations` | 10 |
| `spatial_ref_sys` | 8500 |
| `users` | 4 |

All ten migration IDs, names and hashes match, and both databases report
PostGIS 3.4.3.

```powershell
docker exec entrelibros-db-1 pg_dump -U postgres -d entrelibros -Fc -f /tmp/entrelibros-20260828.dump
docker exec entrelibros-db-1 sha256sum /tmp/entrelibros-20260828.dump
$dumpDir = Join-Path $env:TEMP 'EntreLibros-Recovery'
$dumpPath = Join-Path $dumpDir 'entrelibros-20260828.dump'
New-Item -ItemType Directory -Force -Path $dumpDir | Out-Null
docker cp entrelibros-db-1:/tmp/entrelibros-20260828.dump $dumpPath
docker volume create entrelibros_recovery_verify_20260828
docker run -d --name entrelibros-recovery-verify-20260828 --network none -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_DB=entrelibros_restore_verify -v entrelibros_recovery_verify_20260828:/var/lib/postgresql/data postgis/postgis:16-3.4
docker cp $dumpPath entrelibros-recovery-verify-20260828:/tmp/entrelibros-20260828.dump
docker exec entrelibros-recovery-verify-20260828 pg_restore -U postgres -d entrelibros_restore_verify --no-owner --no-privileges --exit-on-error /tmp/entrelibros-20260828.dump
docker inspect entrelibros-db-1 --format 'source ports={{json .NetworkSettings.Ports}} mounts={{range .Mounts}}{{.Name}}:{{.Destination}} {{end}}'
docker inspect entrelibros-recovery-verify-20260828 --format 'restore network={{.HostConfig.NetworkMode}} ports={{json .NetworkSettings.Ports}} mounts={{range .Mounts}}{{.Name}}:{{.Destination}} {{end}}'
$rowSql = "SELECT 'book_listing_images',count(*) FROM book_listing_images UNION ALL SELECT 'book_listings',count(*) FROM book_listings UNION ALL SELECT 'books',count(*) FROM books UNION ALL SELECT 'community_corner_metrics',count(*) FROM community_corner_metrics UNION ALL SELECT 'community_corner_photos',count(*) FROM community_corner_photos UNION ALL SELECT 'community_corners',count(*) FROM community_corners UNION ALL SELECT 'contact_messages',count(*) FROM contact_messages UNION ALL SELECT 'migrations',count(*) FROM migrations UNION ALL SELECT 'spatial_ref_sys',count(*) FROM spatial_ref_sys UNION ALL SELECT 'users',count(*) FROM users ORDER BY 1"
docker exec entrelibros-db-1 psql -U postgres -d entrelibros -AtF '=' -c $rowSql
docker exec entrelibros-recovery-verify-20260828 psql -U postgres -d entrelibros_restore_verify -AtF '=' -c $rowSql
docker exec entrelibros-db-1 psql -U postgres -d entrelibros -c 'TABLE migrations;'
docker exec entrelibros-recovery-verify-20260828 psql -U postgres -d entrelibros_restore_verify -c 'TABLE migrations;'
docker exec entrelibros-db-1 psql -U postgres -d entrelibros -Atc "SELECT extversion FROM pg_extension WHERE extname='postgis'"
docker exec entrelibros-recovery-verify-20260828 psql -U postgres -d entrelibros_restore_verify -Atc "SELECT extversion FROM pg_extension WHERE extname='postgis'"
Get-FileHash -Algorithm SHA256 -LiteralPath $dumpPath
```

## Production dependency audit

`npm audit --omit=dev --json`, run from the root lockfile with Node 22.19.0 on
2026-08-28, reports 21 production vulnerabilities: 15 high, 6 moderate, 0 low
and 0 critical. All currently report a fix as available.

Direct affected packages are `axios` (high), `express` (high), `lodash`
(high), `morgan` (moderate), `react-router-dom` (high) and `validator` (high).
Transitive affected packages are `body-parser`, `brace-expansion`, `engine.io`,
`engine.io-client`, `follow-redirects`, `form-data`, `js-yaml`, `jws`,
`minimatch`, `path-to-regexp`, `qs`, `react-router`, `socket.io-adapter`,
`socket.io-parser` and `ws`. This is an inventory, not a reachability analysis;
task 8.1 must triage runtime applicability before upgrades or exceptions.

```powershell
docker run --rm -v 'C:\REPOS\EntreLibros:/workspace:ro' -w /workspace node:22.19.0-bookworm-slim npm audit --omit=dev --json
```

## PR #138 migration and quality evidence

On 2026-08-28, migration execution was verified twice against the preserved
`entrelibros_test` schema and against the isolated
`entrelibros_recovery_verify_20260828` database. Both runs completed with
13 migration records, including migrations 010 through 013, and PostGIS 3.4.3.
The earlier anonymized backup restore above remains the preserved-schema
baseline; the new migrations are append-only and were then applied to the
current test schema without changing existing rows.

The local backend suite passed with 24 files and 96 tests. The frontend suite
passed with coverage enabled. Remote PR checks for head `902a083` passed for
both backend and frontend, and the final diff review found only messaging,
agreements, their tests, documentation and the explicitly related coverage
threshold change.

No runtime dependency was changed by the PR #138 recovery commits. The audit
reported 21 pre-existing production findings (15 high, 6 moderate, 0 critical)
with fixes available; they are recorded as an explicit follow-up for task 8.1,
not silently accepted as resolved by this PR.

## Delivery checkpoints

| Checkpoint | Entry criteria | Exit evidence | Merge authority |
| --- | --- | --- | --- |
| Runtime foundation | Baseline and restore are verified; work remains isolated from PR #138 | Node/configuration/proxy/PostGIS/migration tasks and repository checks pass; agent prepares the PR and reports rollback evidence | The user alone performs the merge; the agent waits for confirmation |
| PR #138 recovery | The user confirms runtime foundation is merged and the existing PR branch is current | Review threads are mapped and resolved, messaging/agreement persistence passes migrations, concurrency, reconnect, E2E and CI; agent updates the existing PR | The user alone performs the merge; the agent waits for confirmation |
| Product and security | The user confirms PR #138 is merged | Capability-oriented PRs pass authorization, dependency, contract, migration and full repository gates; agent prepares each PR separately | The user alone performs every merge; the agent waits at each dependent boundary |
| Production and operations | Product/security data models and providers are stable | Images, routing, secrets, migration job, health, backup/restore, rollback, observability and production E2E pass; agent prepares deployment evidence | The user alone approves and performs merge/deployment; the agent performs neither automatically |

These checkpoints are controlling delivery gates. A green local check does not
authorize the agent to merge a pull request or deploy a release.
