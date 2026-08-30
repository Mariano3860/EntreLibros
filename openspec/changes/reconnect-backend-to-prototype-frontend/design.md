## Context

See [proposal.md](proposal.md) for the motivation. The visual change centralised the eight authenticated prototype screens around `PrototypeContext` and `prototypeCatalog`; its in-memory actions update only the browser session. In parallel, the repository still has typed frontend API clients/hooks and backend Express, PostgreSQL/PostGIS and Socket.IO capabilities for many of the same domains. The two models now coexist without an explicit ownership boundary.

The accepted dark editorial composition in `ideal-prototype-visual-language` and `ideal-prototype-screen-composition` is a non-negotiable product contract. The frontend owns the view model: backend contracts are consumed as-is when sufficient and receive compatible extensions only when a visual region cannot be expressed otherwise. This change plans only pre-existing product capabilities; it must not create a new analytics, social, map or support product simply to fill prototype data.

## Goals / Non-Goals

**Goals:**

- Replace in-memory prototype reads and mutations with existing persisted HTTP and Socket.IO contracts wherever the audit confirms support.
- Establish a region/action reconciliation matrix before conversion, so that every prototype value has an evidenced live source, an explicit compatible adaptation, or a documented future dependency.
- Keep page components presentation-led by introducing adapters from API/domain responses to stable prototype view models.
- Preserve deterministic MSW fixtures for visual development and tests while making API mode incapable of silently falling back to them.
- Prove both data behavior and visual continuity through integration and browser evidence.

**Non-Goals:**

- Building backend product capabilities that the audit finds absent (for example, a new charting, social-story, map clustering or help/live-chat system).
- Replacing the accepted prototype hierarchy, shell, styling or route composition to resemble legacy API payloads.
- Removing mock support needed for isolated frontend tests and visual comparison.
- Reworking unrelated authentication, database schema or design-system behavior.

## Decisions

### 1. Reconcile by visible region and action before replacing code

Create a versioned matrix covering every route/region/action, current prototype field source, legacy frontend client/hook, backend route/service/repository or socket event, auth requirements, persistence expectation, response gap and final disposition. Treat this as the implementation worklist and link its evidence to tests.

This is chosen over a route-by-route blind migration because overlapping domains (books in Explore, Home, Messages and Community) otherwise risk being connected inconsistently. A backend-endpoint-only inventory was rejected because it cannot prove which visible prototype values it restores.

### 2. Use frontend-owned view-model adapters at the boundary

Page and visual components consume typed route view models rather than raw backend DTOs or `prototypeCatalog`. Each adapter normalizes naming, dates, media, state labels and optional fields without embedding presentation geometry in backend code. When a field is genuinely unavailable but the underlying capability exists, extend or aggregate the backend response compatibly and keep old consumers working.

This is chosen over reshaping pages to legacy payloads because the UI is the product target. Copying demo objects into backend responses was rejected because it couples fixture vocabulary to persistence and conceals incomplete contracts.

### 3. Migrate vertical slices in dependency order

Implement stable session/identity and shared media/normalization first; then books/profile, community/map, messaging/agreements/notifications, and finally statistics/contact or any verified residuals. A slice is complete only when all its reads, relevant mutations and local feedback states are real-mode verified. Shared prototype provider state is removed incrementally after its owning slices no longer need it.

This is chosen over one large provider replacement because it retains a working UI and makes response gaps visible early. Updating the backend first across all domains was rejected because it risks broad server work before confirming frontend demand.

### 4. Make API mode and mock mode mutually explicit per capability

`PUBLIC_API_USE_MOCKS=true` keeps MSW deterministic for test/reference runs. With it disabled, the runtime routes only through real HTTP and Socket.IO clients; a deferred capability renders a designed limited/unavailable state, never fixture data. The reconciliation matrix is the single source for these temporary deferred states and their removal criteria.

This is chosen over automatic fallback-to-mock because fallback makes a disconnected real deployment appear healthy. Removing all mocks immediately was rejected because it would lose repeatable visual and component tests before every backend gap is available.

### 5. Verify behavior and appearance as one completion gate

For every reconnected slice, add client/server contract or integration coverage, real service HTTP evidence, and Socket.IO evidence where applicable. Run browser checks in both modes at desktop and narrow widths, using the local ideal prototype references for layout comparison and verifying loading, empty and error states inside their regions.

This is chosen over unit-only validation because type-compatible responses can still distort the prototype. Browser-extension automation is helpful when available; the validation path remains executable with the repository's documented local browser procedure if the extension connection is unavailable.

## Risks / Trade-offs

- [Legacy DTOs omit visual metadata or use incompatible semantics] -> Document the exact gap in the matrix; use a frontend adapter first and add only additive, backward-compatible server fields or aggregations when necessary.
- [A fixture masks an unimplemented real capability] -> Forbid mock fallback in real mode and require the `defer` state plus a future-contract entry.
- [Incremental migration leaves duplicate sources of truth] -> Assign each region/action one owner per slice and delete its provider-backed path only after real-mode coverage succeeds.
- [Socket ordering, authorization or reconnect behavior changes message UI] -> Preserve server-side conversation authorization, cursors, deduplication and persistence; add reconnection and multi-conversation integration tests before retiring the demo message state.
- [Real content length/media changes layout] -> Validate long/missing content and media transformations against the visual contract at each slice.
- [Browser automation availability varies] -> Keep documented manual browser evidence as a required fallback rather than relying on an extension-only check.

## Migration Plan

1. Record the baseline matrix and capture current mock-mode visual evidence; do not alter the accepted reference composition.
2. Deliver each vertical slice behind the existing explicit API/mock mode boundary, with adapters and region-local states.
3. Deploy compatible backend response additions before enabling the frontend use of them in real mode; preserve legacy endpoints and consumers throughout the transition.
4. Enable the real-mode slice after API, database-backed integration and browser checks pass; retain the equivalent MSW fixture for isolated tests.
5. Roll back a slice by restoring its prior frontend adapter/feature gate to a designed unavailable state, not to silent mock data. Backend additions remain backward compatible and do not require database rollback.

## Open Questions

- Which locally available environment can provide representative authenticated PostgreSQL and Socket.IO data for the real-mode evidence? This affects test setup only; it does not change the contract or migration order.
