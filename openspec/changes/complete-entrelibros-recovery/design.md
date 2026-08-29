## Context

See `proposal.md` for motivation and `specs/*/spec.md` for behavioral contracts. The current repository is a TypeScript modular monolith with React/Rsbuild, Express/Socket.IO and PostgreSQL/PostGIS. Static checks, builds and both test suites pass when Node 22 reaches the correct PostGIS instance, but local configuration can route Node to a different PostgreSQL service and the development frontend resolves `/api` without a proxy. Production Compose references missing environment files and remote images, exposes nginx on the wrong container port, and cannot inject frontend variables after build.

The database covers users, books, listings, images, community corners and contact messages. It has no persistent model for conversations, messages, agreements, notifications, reports or moderation. Community aggregates and messaging still use mocks, while the open PR #138 adds an agreement workflow mainly in client state and has unresolved review feedback. Repository instructions require work on the current branch, complete verification, backlog updates and no automatic branch creation. The user additionally requires that an agent never merge a PR.

## Goals / Non-Goals

**Goals:**

- Convert the repository into a production-ready MVP through reviewable deliveries with explicit dependency and human-merge gates.
- Preserve the current modular-monolith architecture while making PostgreSQL the source of truth for product state.
- Finish PR #138 as a coherent vertical slice for private messaging and versioned exchange agreements rather than leaving a polished mock.
- Make local, CI and production execution use the same contracts for versions, routing, migrations, security and health.
- Keep migrations incremental, protect existing local data and make rollback possible through tested restoration.

### Scope guardrail from the TFG

The functional MVP is bounded by the local final TFG. Its minimum demonstrable flow is: account/profile and location privacy; community book corners on a map; offered/wanted book listings with normalized minimum metadata; search by filters and proximity; private 1:1 messaging; an exchange agreement with place, time, confirmation and in-app reminder; and basic in-app notifications. Technical work is included only when it enables, protects, tests or deploys that flow.

Pending work is classified as follows:

| Classification | Rule | Examples |
| --- | --- | --- |
| MVP | Required to demonstrate a TFG capability; implement next when dependencies allow. | Profile/privacy, corners/map, listings/search, messaging, agreements, basic notifications. |
| MVP support | Not a user feature, but required to run or explain the MVP safely. | Migrations, auth policy, same-origin routing, tests, CI, minimal production configuration, backup verification and documentation. |
| Post-MVP | Valuable expansion removed from this change; it requires its own approved OpenSpec. | Ratings/reputation, reports/moderation workflow, advanced metrics, retention/export, provider selection, advanced observability and growth features. |

The task list is the execution gate. This change contains no executable `POST-MVP` tasks. The deferred capabilities remain in the roadmap/backlog only; a future OpenSpec must document their purpose, user value, TFG relationship, acceptance evidence and bounded delivery before implementation.

### Deferred capabilities

The following capabilities are intentionally outside this change: advanced rate limiting, password recovery, ratings/reputation, moderator workflows and reports, community aggregates/suggestions, provider selection and malware scanning, advanced observability, retention/export/anonymization, growth initiatives, and post-exchange dispute workflows. They are not missing MVP work.

**Non-Goals:**

- Splitting the system into microservices or adopting event streaming infrastructure.
- Recovering plaintext passwords or shipping default production credentials.
- Automatically merging PR #138 or any later PR.
- Putting unrelated environment, dependency and deployment work into PR #138.
- Treating alliances, donations, native mobile applications or growth experiments as blockers for the production MVP.

## Decisions

### 1. Deliver in gated slices and preserve PR #138

The OpenSpec change is a master program, but implementation will be split into independently reviewable deliveries:

1. **Runtime foundation:** normalize Node 22, configuration, dev proxy, PostGIS preflight and deterministic migrations on the current main delivery. The user merges it manually.
2. **PR #138 rescue:** update the existing PR branch from the newly merged main, resolve every review thread, and complete private messaging plus agreement persistence as one vertical slice. Push updates to the same PR so its review history is preserved. The user performs the merge only after all gates pass.
3. **MVP completion first:** deliver identity/profile, catalog, map/community essentials, private messaging, agreements and basic notifications in small capability-oriented PRs. Keep trust expansions and other post-MVP work explicitly deferred.
4. **Production and operations:** land deployment, backup/restore, observability, E2E and runbooks after the product data model is stable.

At every PR boundary the agent stops after verification, reports remaining review/CI state and tells the user when manual merge is the next action. Work resumes only after the user has made the intended target branch current or the existing PR branch is available; the agent does not create speculative branches.

Alternative considered: cherry-pick the #138 commit onto a new branch. Rejected because it would discard the existing PR conversation and make the six unresolved review threads harder to audit. Alternative considered: add every recovery fix to #138. Rejected because it would make review and rollback unsafe.

### 2. Keep a modular monolith with explicit domain boundaries

Backend modules will remain in one deployable process but will separate route validation, application services, repositories and authorization policies for identity, catalog, community, messaging, agreements and trust/safety. PostgreSQL remains the transactional source of truth; Socket.IO is transport, not storage.

Alternative considered: microservices for chat and notifications. Rejected because current scale and team context do not justify distributed transactions, additional deployment surfaces or eventual-consistency complexity.

### 3. Use same-origin browser routing in every environment

Browser clients will use relative `/api` and `/socket.io` paths by default. Rsbuild will proxy these paths to the local backend in development, while nginx will proxy them to the backend service in production. `PUBLIC_API_BASE_URL` remains only as a documented opt-in for explicitly cross-origin environments and is validated at build time. Socket configuration derives from the same origin unless overridden intentionally.

This removes the conflict between `.env`, `.env.local`, `.env.development.local` and `.env.production`, and avoids pretending that runtime environment variables can change an already-built static bundle.

Alternative considered: embed an absolute backend URL into every build. Rejected because it creates one bundle per environment and leaves Socket.IO, cookies and CORS easier to misconfigure.

### 4. Standardize toolchain and containers on Node 22

Node 22 is the single version for `.nvmrc`, package engines, CI and both Dockerfiles. Docker Compose builds versioned images from the checked-out commit by default; registry image overrides are allowed for deployment. The nginx container exposes port 80 internally, mapped to the configured public port. PostgreSQL is not published publicly in production.

Alternative considered: move everything immediately to Node 24. Rejected because the repository currently declares `<24`, all verified tests ran on 22 and the migration adds no product value. A later upgrade can be isolated.

### 5. Add an explicit preflight and migration job

The local start workflow will verify the server address, database name, migration count and PostGIS availability before running migrations. It must identify port conflicts rather than silently writing to another `localhost` database. Development and test databases remain separate.

Production uses a one-shot migration job guarded by an advisory lock. Backend readiness depends on successful database connectivity and expected schema version. Migration files are append-only after merge; corrections use a new migration.

Alternative considered: run migrations in every backend replica at startup. Rejected because it complicates concurrency and makes application readiness ambiguous.

### 6. Persist messaging and agreements transactionally

The #138 vertical slice introduces these logical records:

- `conversations` and `conversation_participants` for membership and lifecycle.
- `messages` with a client idempotency key, stable sequence and read metadata; attachments reference a storage abstraction.
- `exchange_agreements` for current state and optimistic version.
- `exchange_agreement_versions` plus version items/conditions for immutable proposals.
- `agreement_events` for actor, transition, timestamp and reason.

Agreement acceptance locks the current agreement and relevant listings in one transaction, validates the expected version, records both-party acceptance and reserves listings atomically. Cancellation releases reservations when allowed. API conflicts return the current representation so the client replaces stale state instead of confirming or cancelling an outdated closure. Frontend stores contain server snapshots and transient UI only; `mockConversations` cannot initialize production state.

Alternative considered: keep agreements in local state and persist only the final result. Rejected because concurrent clients, reconnects and disputes require the complete version history.

### 7. Persist first, publish realtime second

REST endpoints handle history and commands. After a successful transaction, Socket.IO emits an event carrying resource id and version to a room whose membership is authorized server-side. Clients invalidate/refetch authoritative queries. Failed persistence emits no success event. Reconnection uses paginated history and sequence cursors.

Alternative considered: retain `io.emit` and filter in clients. Rejected because it leaks metadata and cannot enforce conversation privacy.

### 8. Derive community views from bounded queries

Community stats, feed, activity and suggestions will be derived from persistent tables or refreshable aggregates. Map and nearby endpoints require bounds/radius, enforce maximum page sizes, select only required fields and expose privacy-rounded locations. Large payload and slow-query metrics become release checks. Static mocks remain available only to isolated frontend tests or an explicitly enabled demo mode.

### 9. Centralize identity, authorization and trust policies

Authentication middleware establishes identity; domain policies decide ownership, participant or moderator access. Mutable community and verification routes become protected. Production cookies, CORS and CSRF follow same-origin defaults. Rate limits distinguish anonymous, authenticated and expensive operations. Password recovery uses expiring one-time hashes and neutral public responses.

Reports, moderation actions, notifications, ratings and block relationships are persistent. A block policy prevents new direct interactions while retaining evidence required for existing reports. User-facing backend errors are i18n keys as required by repository instructions.

### 10. Abstract external delivery and file services

Email delivery and attachment storage use narrow provider interfaces. Tests use deterministic in-memory/fake providers; local development may use a filesystem or capture service; production configuration chooses a managed provider. The database stores metadata and references, not base64 payloads.

Alternative considered: commit to a cloud vendor now. Rejected because the deployment target is not selected and provider choice does not change the behavioral specs.

### 11. Make quality and documentation part of each delivery

Every delivery updates migrations, OpenAPI, backend/frontend tests, relevant E2E coverage and `docs/backlog.md` together. CI runs typecheck, lint, formatting checks, backend/frontend tests, strict OpenSpec validation, migration tests from empty and previous schemas, dependency audit and production image smoke tests. React warnings in existing tests are treated as defects, not ignored output.

Operational endpoints expose liveness separately from readiness. Structured logs use correlation ids and redact sensitive fields. Metrics track error rate, latency and response size by normalized route. Retention and restore drills are documented before production readiness is declared.

## Risks / Trade-offs

- **[Master change is large]** → Execute capability slices with explicit PR gates; never mark the overall change complete because one slice passed.
- **[PR #138 expands from client workflow to a vertical slice]** → Keep its scope limited to messaging/agreement prerequisites, document the added migrations and resolve every existing thread before requesting rereview.
- **[Migrations can affect preserved ten-month-old data]** → Test from empty, current and anonymized snapshot schemas; take a backup and verify restore before production rollout.
- **[Dependency upgrades can introduce behavioral regressions]** → Update direct dependencies in small groups, preserve lockfile determinism and run contract/E2E tests after each group.
- **[Same-origin routing differs from current absolute URL examples]** → Provide a compatibility override, update every example at once and add startup/build validation for contradictory settings.
- **[Realtime delivery can race with transactions]** → Emit only after commit, include versions and require clients to refetch authoritative state.
- **[Moderation and retention rules depend on policy decisions]** → Ship conservative defaults, retain audit records separately and document values as configuration rather than hard-coded assumptions.
- **[External providers are undecided]** → Use provider interfaces and block production readiness until the chosen providers pass smoke and failure-path tests.
- **[Old Git line-ending metadata obscures a clean tree]** → Normalize repository attributes in an isolated reviewed change and verify blob equality before touching reported files.

## Migration Plan

1. Capture baseline: remote/local commits, PR #138 threads, schema version, dependency audit, tests, images and a database backup/restore check.
2. Land runtime foundation and documentation through a separate PR; stop and notify the user to merge it.
3. After the user merges, update the existing #138 branch from main without discarding its history. Add messaging/agreement migrations, backend contracts, frontend integration and review fixes.
4. Verify #138 from empty/current databases, two concurrent clients, reconnects and stale-version conflicts. Push, request rereview and stop when human merge is the only remaining action.
5. After the user merges #138, deliver security and remaining product capabilities in dependency order, using additive migrations and compatibility responses where needed.
6. Build production Compose/nginx, one-shot migrations, healthchecks, secrets, backup/restore and observability. Run a staging smoke and rollback drill.
7. Reconcile OpenAPI, backlog and OpenSpec; archive only when all capability requirements and tasks are verified.

Rollback uses the prior immutable application images plus a verified database restore point when a migration is not backward compatible. Forward-fix migrations are preferred after data has been accepted in production; destructive down-migrations are not run automatically.

## Open Questions

- Which hosting platform and secrets manager will be used for the first production environment?
- Which email provider will send recovery and notification messages?
- Which object-storage provider and malware-scanning service will hold message/listing attachments?
- What retention periods and moderator roles are required by the initial operating jurisdiction?

These choices are isolated behind configuration or provider interfaces and can be selected before the production-delivery slice without changing the domain contracts or preceding task order.
