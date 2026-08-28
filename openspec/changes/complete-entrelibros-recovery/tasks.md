## 1. Baseline and delivery controls

- [x] 1.1 Capture the current local/remote commits, working-tree anomalies, open PR #138 metadata, unresolved review threads, CI state, schema versions and production dependency audit in a recovery note; verify every finding has a command or link that can be rerun.
- [x] 1.2 Export a local database backup and restore it into an isolated verification database; verify row counts, migration history and PostGIS availability match the source without deleting the original volume.
- [x] 1.3 Add explicit delivery checkpoints for runtime foundation, PR #138, product/security and production work; verify each checkpoint states that the agent prepares the PR and the user alone performs the merge.
- [x] 1.4 Normalize the pre-existing line-ending/index anomaly in an isolated reviewed change or document why no file rewrite is needed; verify `git diff`, blob hashes and `git status --short` are unambiguous before feature edits.

## 2. Runtime foundation delivery

- [x] 2.1 Align `.nvmrc`, package engines, CI and both Dockerfiles on Node 22; verify local and container builds report an admitted engine with no `EBADENGINE` warning.
- [x] 2.2 Consolidate frontend/backend environment examples and remove contradictory development/production variable names; verify every documented API URL either uses same-origin `/api` or includes the `/api` prefix.
- [x] 2.3 Configure Rsbuild to proxy `/api` and `/socket.io` to the local backend while keeping mocks opt-in; verify the default development bundle reaches backend health and a deliberate mock run stays isolated.
- [x] 2.4 Derive frontend REST and Socket.IO origins from the same configuration contract; verify local same-origin mode and an explicit cross-origin test both connect correctly.
- [x] 2.5 Implement a non-destructive PostgreSQL/PostGIS preflight that reports host address, database, port, extension and conflicting listener; verify it rejects the previously reproduced Windows PostgreSQL conflict before migrations run.
- [x] 2.6 Make development and test database preparation idempotent and document preserved-volume behavior; verify migrations succeed twice against both `entrelibros` and `entrelibros_test` without reapplying history.
- [x] 2.7 Update README/runbooks with clean-clone setup, Docker/PostGIS lifecycle, registration, local infrastructure credentials and the distinction between JWT secrets and user passwords; verify a clean-shell walkthrough reaches frontend, backend, Swagger and registration.
- [x] 2.8 Add runtime-foundation regression tests and run backend/frontend typecheck, lint, stylelint, format checks, tests and builds; verify all repository-required commands pass.
- [x] 2.9 Push the runtime-foundation delivery and prepare its PR with evidence, migration impact and rollback notes; verify CI and review are green, notify the user that manual merge is required, and do not merge it.
- [x] 2.10 After the user confirms the runtime PR merge, update the local current branch from remote main and rerun the clean-clone smoke; verify the merged commit contains no PR #138 feature work.

## 3. PR #138 recovery and scope control

- [x] 3.1 Fetch the latest PR #138 head, base, checks, reviews and all unresolved threads; verify each review thread is mapped to a code change and regression test or an explicit documented response.
- [x] 3.2 Make the existing PR #138 branch current without creating a speculative branch and integrate the latest remote main while preserving PR history; verify the PR remains open against main and contains no accidental unrelated files.
- [x] 3.3 Reproduce the stale agreement confirm/cancel state reported in review and add a failing frontend regression test; verify the test fails on the current PR head for the reviewed reason.
- [x] 3.4 Inventory every mock, local-only store transition and missing backend contract in the PR diff; verify the inventory covers conversation initialization, agreement versions, confirm, cancel, reconnect and errors.
- [x] 3.5 Publish the final PR #138 scope in its description as private messaging prerequisites plus versioned agreements; verify environment, general dependency and production changes remain outside the PR.

## 4. Persistent private messaging for PR #138

- [x] 4.1 Add incremental migrations for conversations, participants, messages, idempotency/sequence fields, read state and attachment metadata; verify migration from empty and current schemas plus all required foreign keys and indexes.
- [x] 4.2 Implement typed repositories and services for conversation membership, paginated history, message persistence and read state without `any`; verify repository tests cover unauthorized access, ordering and duplicate client keys.
- [x] 4.3 Add authenticated REST contracts for listing conversations, reading history, sending messages and marking reads; verify API tests cover success, validation, 401, 403, pagination and i18n error keys.
- [x] 4.4 Replace Socket.IO global broadcasts with authorized conversation rooms and persist-before-emit behavior; verify two-conversation socket tests prove that third parties receive no message or metadata.
- [x] 4.5 Add reconnect/cursor handling so clients can recover missed persisted messages; verify an integration test disconnects, writes messages and receives the exact missing ordered set after reconnect.
- [x] 4.6 Introduce an attachment-storage interface with deterministic test implementation and validation of type, size and membership; verify invalid uploads are rejected and stored metadata never contains base64 payloads.
- [x] 4.7 Update OpenAPI and backend-facing i18n keys for messaging routes and events; verify contract checks match runtime responses.

## 5. Versioned agreements backend for PR #138

- [x] 5.1 Add incremental migrations for agreements, immutable versions/items, participant acceptances and agreement events; verify constraints prevent invalid participants, duplicate version numbers and orphaned listing references.
- [x] 5.2 Implement the agreement state machine and authorization policy independently of HTTP handlers; verify unit tests cover every allowed and forbidden transition.
- [x] 5.3 Implement optimistic concurrency using expected version checks; verify simultaneous confirm/cancel requests produce one committed transition and one conflict carrying the current state.
- [x] 5.4 Implement proposal and counterproposal services that create complete immutable versions; verify history tests reconstruct each version and actor without mutation of prior rows.
- [x] 5.5 Implement atomic bilateral acceptance and listing reservation; verify transaction tests prevent double reservation and roll back all changes on any validation failure.
- [x] 5.6 Implement cancellation, rejection and completion with reservation release and immutable audit events; verify each transition records actor, time, version and required reason.
- [x] 5.7 Add authenticated REST endpoints for agreement creation, history and commands linked to conversation membership; verify API tests cover participants, blocked users, stale versions and unavailable listings.
- [x] 5.8 Emit versioned agreement events to authorized conversation rooms only after commit; verify socket integration tests receive one event per committed transition and none for rolled-back work.
- [x] 5.9 Update OpenAPI and i18n error contracts for agreements; verify generated/static documentation exposes states, conflict responses and required expected-version inputs.

## 6. PR #138 frontend completion

- [x] 6.1 Add typed messaging/agreement API clients and TanStack Query keys around server resources; verify client tests cover serialization, pagination and conflict parsing without `any`.
- [x] 6.2 Replace `mockConversations` initialization with authenticated server queries while retaining fixtures only in tests/demo mode; verify a production build contains no automatic mock conversation bootstrap.
- [x] 6.3 Integrate Socket.IO events as query invalidations/refetch triggers rather than a second source of truth; verify reconnect and duplicate-event tests preserve one ordered message/agreement state.
- [x] 6.4 Refactor the agreement store so confirm/cancel handlers read the current server version at execution time; verify the previously failing stale-closure regression test passes.
- [ ] 6.5 Render proposal history, pending bilateral acceptance, conflicts, cancellation reasons and completed state from server data; verify component tests cover both participants and all terminal states.
- [ ] 6.6 Add loading, empty, retry, authorization and conflict-recovery UI with translated messages; verify Spanish and configured alternate locale tests render keys without raw backend text.
- [ ] 6.7 Validate keyboard navigation, focus restoration and accessible labels for message composer and agreement dialogs; verify automated accessibility checks and keyboard interaction tests pass.
- [ ] 6.8 Add a two-user E2E flow for conversation, message, counterproposal, stale conflict, bilateral acceptance, cancellation alternative and reconnect; verify it passes against real PostGIS with mocks disabled.

## 7. PR #138 quality and manual merge gate

- [x] 7.1 Run PR #138 migrations from an empty database, the preserved current schema and an anonymized backup; verify identical final schema version and no lost existing rows.
- [ ] 7.2 Run backend/frontend typecheck, lint, stylelint, format checks, unit/integration tests, E2E and production builds; verify all checks pass without React `act`, empty-image or deprecated Faker warnings in touched flows. CI and production builds pass; full browser E2E remains unavailable in this repository and is documented as deferred.
- [x] 7.3 Re-run production dependency audit for packages touched by #138 and document any applicable exception; verify no unapproved critical/high runtime vulnerability is introduced.
- [x] 7.4 Review the final diff against the published #138 scope and remove unrelated changes; verify every added migration, endpoint, UI path and dependency maps to messaging or agreements.
- [x] 7.5 Resolve or answer every PR review thread with its test evidence, update the PR description and request rereview; verify zero unresolved actionable threads remain.
- [x] 7.6 Push the completed #138 branch and monitor CI to a terminal green state; verify the PR is mergeable and then notify the user that manual merge is required without invoking any merge command.
- [ ] 7.7 After the user confirms merge, update local main and run the messaging/agreement smoke again; verify the merge commit is present remotely before beginning dependent deliveries.

## 8. Platform security and dependency remediation

- [ ] 8.1 Triage all production audit findings by reachable runtime path and upgrade direct dependencies in small compatible groups; verify each group passes full tests and leaves no unapproved critical/high applicable finding.
- [ ] 8.2 Protect community-corner creation, book verification and every mutable route with authentication plus owner/role policies; verify anonymous and unauthorized API tests return i18n 401/403 errors with no data changes.
- [ ] 8.3 Add production cookie, CORS and CSRF configuration with fail-closed validation; verify same-origin requests work and cross-origin/invalid-token mutations are rejected.
- [ ] 8.4 Add differentiated rate limits and payload/query complexity limits to auth, contact, corners, search, map and attachments; verify threshold and reset behavior with deterministic tests.
- [ ] 8.5 Add security headers, request correlation and centralized secret/PII redaction; verify logs from forced failures contain correlation but no passwords, tokens, cookies or exact private location.
- [ ] 8.6 Implement one-time expiring password recovery with neutral account-enumeration responses and a fake email provider; verify replay, expiration and unknown-address tests.
- [ ] 8.7 Update OpenAPI, threat notes and security runbook, then run all repository checks; verify the security delivery is ready for review.
- [ ] 8.8 Prepare the security PR and wait for green CI/review; notify the user when manual merge is required and do not merge it.

## 9. Identity, profile, reputation and catalog completion

- [ ] 9.1 Add profile/privacy fields and migration defaults that do not expose existing precise locations; verify public/private profile API tests for legacy and new users.
- [ ] 9.2 Implement authenticated profile and preference endpoints plus frontend forms for alias, description, language and location granularity; verify persistence and locale switching end to end.
- [ ] 9.3 Add block relationships and enforce them in new conversations, agreements and direct notifications; verify both block directions and privacy-preserving errors.
- [ ] 9.4 Add ratings linked uniquely to completed agreements and derive explainable reputation; verify duplicate, premature and disputed rating tests.
- [ ] 9.5 Complete listing states, valid transitions, expiry/renewal and atomic reservation integration; verify scheduled expiry and agreement interaction tests.
- [ ] 9.6 Add paginated catalog filters for text, author, ISBN, language, status, distance and exchange type; verify query plans/indexes and combined-filter API/frontend tests.
- [ ] 9.7 Restrict book verification to authorized roles with verifier audit metadata; verify role and OpenAPI contract tests.
- [ ] 9.8 Enforce image count/type/size and privacy-rounded public locations; verify invalid media and exact-coordinate leakage tests.
- [ ] 9.9 Update frontend flows, OpenAPI and backlog for identity/catalog scope and run full checks; verify the delivery has no raw backend errors or stale mock paths.
- [ ] 9.10 Prepare capability-oriented PRs with green CI and review; at each boundary notify the user to merge manually and wait for confirmation before dependent work.

## 10. Community and map completion

- [ ] 10.1 Add owner, lifecycle status and moderation metadata to community corners with safe legacy defaults; verify migration and visibility tests.
- [ ] 10.2 Require authentication for corner proposals and implement owner/moderator edit transitions; verify unauthorized and state-machine API tests.
- [ ] 10.3 Replace community stats, feed, activity and suggestions mocks with persistent bounded queries or refreshable aggregates; verify fixture-free integration tests reflect committed data.
- [ ] 10.4 Add pagination, maximum radius/page size and field projection to nearby/map/community endpoints; verify the reproduced multi-megabyte response falls below the documented budget.
- [ ] 10.5 Enforce bounding boxes, spatial indexes and privacy-rounded coordinates; verify query plans and tests exclude out-of-bounds/private locations.
- [ ] 10.6 Update community frontend for pagination, loading/error/empty states and moderated visibility; verify tests run with mocks disabled against backend contracts.
- [ ] 10.7 Update OpenAPI/backlog and run performance plus full repository checks; verify the community delivery is ready for review.
- [ ] 10.8 Prepare the community PR with green CI/review and notify the user when manual merge is required; do not merge it.

## 11. Trust, safety and notifications

- [ ] 11.1 Add migrations for reports, moderation actions, notifications, notification preferences and post-exchange outcomes; verify constraints, indexes and legacy migration paths.
- [ ] 11.2 Implement report submission and restricted moderation case APIs with immutable decisions; verify reporter privacy and moderator-role tests.
- [ ] 11.3 Implement idempotent persistent notifications triggered by messaging, agreements and moderation; verify one notification per domain event and correct read state.
- [ ] 11.4 Add notification center and preferences UI with translated accessible states; verify user preferences suppress only optional delivery, not mandatory safety events.
- [ ] 11.5 Add private meeting-safety guidance and participant-only agreement details; verify third-party access and location-leakage tests.
- [ ] 11.6 Implement post-exchange confirmation, discrepant-outcome review and rating handoff; verify reputation remains pending during disputes.
- [ ] 11.7 Update OpenAPI, moderation/incident runbooks and backlog, then run full checks; verify the trust delivery is reviewable.
- [ ] 11.8 Prepare the trust/notifications PR with green CI/review and notify the user when manual merge is required; do not merge it.

## 12. Production delivery and operations

- [ ] 12.1 Rebuild backend/frontend Dockerfiles on Node 22 with deterministic dependency layers and non-root runtime where applicable; verify images build from a clean cache and pass container smoke tests.
- [ ] 12.2 Add nginx SPA fallback plus `/api` and `/socket.io` proxy configuration, mapping public port 3000 to container port 80 only for local preview; verify deep links, cookies and websocket upgrade.
- [ ] 12.3 Replace missing/contradictory Compose environment contracts with validated examples, local builds and explicit `NODE_ENV=production`; verify `docker compose config` succeeds without placeholder interpolation warnings.
- [ ] 12.4 Add one-shot migration service, database/backend healthchecks and readiness ordering; verify a fresh stack becomes healthy and a failed migration prevents backend readiness.
- [ ] 12.5 Remove public database exposure in production and configure secrets as external inputs with no defaults; verify a missing secret fails closed and rendered Compose output does not contain secret values.
- [ ] 12.6 Select and configure production email, object storage and malware-scanning providers behind the existing interfaces; verify provider smoke and failure-path tests in staging.
- [ ] 12.7 Implement and document encrypted backup, restore verification and application rollback; verify a staging restore and failed-release rollback drill.
- [ ] 12.8 Add production liveness/readiness, structured logs, correlation, latency/error/response-size metrics and alerts; verify dashboards detect a forced backend failure and oversized response without exposing PII.
- [ ] 12.9 Run production E2E for registration, profile, publication, map, messaging, agreement, notification, report and logout; verify all flows use real services with mocks disabled.
- [ ] 12.10 Prepare the production PR and deployment evidence with green CI/review; notify the user when manual merge/deployment approval is required and perform neither action automatically.

## 13. Data lifecycle, quality and documentation closure

- [ ] 13.1 Add OpenAPI drift/contract checks to CI and document every public route, security scheme, websocket event and i18n error key; verify intentional contract changes cannot pass without updates.
- [ ] 13.2 Add migration CI paths for empty, previous and preserved schemas plus PostGIS; verify every migration is append-only and repeat execution is safe.
- [ ] 13.3 Eliminate existing React `act`, empty image source and deprecated Faker warnings; verify frontend tests finish without those warnings.
- [ ] 13.4 Define and implement configured retention, export and deletion/anonymization for accounts, contact, messages, agreements, reports and audits; verify policy boundary and legal-hold tests.
- [ ] 13.5 Reconcile `docs/backlog.md` row by row with implemented capabilities, separating partial and post-MVP work without duplicates; verify every changed feature has one authoritative status.
- [ ] 13.6 Rewrite development, production, credentials, backup/restore, incident and PR/release runbooks; verify clean-clone and staging drills follow the documents exactly.
- [ ] 13.7 Run strict OpenSpec validation, all repository-required checks, dependency audit, image scan, E2E and production smoke; verify no failed gate or undocumented applicable high/critical issue remains.
- [ ] 13.8 Produce a final readiness report mapping every spec requirement to tests and delivered PRs; verify the report explicitly lists any accepted exception, owner and expiry.

## 14. Post-MVP roadmap and OpenSpec closure

- [ ] 14.1 Reassess onboarding, alliances, donations and growth ideas against production evidence; verify each retained initiative has a separate bounded OpenSpec proposal instead of entering the recovery diff.
- [ ] 14.2 Confirm every checkbox and requirement in this change against merged code and deployed behavior; verify incomplete work remains unchecked and blocks archival.
- [ ] 14.3 Sync completed delta specs to main specs only after their deliveries are merged; verify main specs match deployed behavior and no unmerged requirement is promoted.
- [ ] 14.4 Archive `complete-entrelibros-recovery` only after all required PRs were manually merged by the user and final validation passes; verify archive status and preserve the readiness report.
