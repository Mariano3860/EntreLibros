## Context

See `proposal.md` for the motivation and user-visible scope. The frontend already has separate hooks and API clients for public books, user books, Community, map, messages and auth, while `PUBLIC_API_USE_MOCKS` controls MSW. Some current paths still use static data directly: `HomePage` renders a local activity array, `BooksPage` uses the user-book query for its catalog, `CommunityFeedPage` leaves its publish button without a handler, and the backend Community feed/stats services import mock datasets. The map already sends bbox and distance filters, but its initial bbox is hardcoded and the browser location is not represented as a map marker. Conversation DTO mapping initializes book collections empty in real mode.

The repository has no `openspec/specs/` main tree; the change specs establish the affected domain contracts using the existing archived capability names. Existing database migrations and APIs remain the source of truth. Any schema correction must be additive through a new migration.

## Goals / Non-Goals

**Goals:**

- Establish a single real-data path for user-facing catalog, activity, Community and message book selectors.
- Make the primary navigation and actions observable and consistent across routes.
- Preserve authorization, public-location granularity and the explicit mock/demo boundary.
- Keep the map useful with browser location when authorized and predictable fallbacks otherwise.
- Cover the P0 flows with focused tests plus a real-browser verification pass with mocks disabled.

**Non-Goals:**

- Redesigning the entire visual system or changing unrelated post-MVP features such as reputation, moderation or advanced notifications.
- Adding a generic event-sourcing system for all user activity.
- Exposing exact user coordinates or replacing the existing privacy policy.
- Removing MSW fixtures from test code; only production/demo behavior must stop treating them as real data.

## Decisions

### 1. Real mode is authoritative; errors do not fall back to fixtures

Keep `PUBLIC_API_USE_MOCKS=true` as an explicit test/demo mode. With mocks disabled, hooks consume the existing same-origin API clients and render loading, empty or error states based on the response. No component or backend production route will silently substitute a static fixture after an API error.

Alternative considered: retain a fallback to keep screens populated. Rejected because it hides outages and makes false people, books and activity look real, which is the central P0 problem.

### 2. `/books` is the canonical complete catalog route

Keep `/books` as the canonical URL and add “Todos” as the first tab. “Ver todos” from home and the catalog navigates to `/books`; the active tab is determined from the URL, with “Todos” as the default. Existing detail and publish routes remain nested under the same base path.

Alternative considered: introduce `/books/all` as a second canonical route. Rejected for now because the router already treats `/books/*` as one resource and a second URL would create duplicate deep links without additional user value.

### 3. Separate public catalog data from authenticated user books

Use the public books query for home and the public tab filters, and keep `/api/books/mine` for “Mis libros”. The “Todos” view merges the public result set with the authenticated person’s own listings and de-duplicates by listing ID; private listings from other users never enter that result. Query keys and invalidation will be shared after publishing so a newly published book can appear in both the owner view and public catalog.

Alternative considered: expand `/api/books/mine` to return every catalog result. Rejected because ownership and public visibility have different authorization and caching semantics.

### 4. Derive “Mi actividad” from persisted domain records

Implement the minimum activity projection from existing publication/listing and agreement records, with stable event types for offering a book and completing/exchanging an agreement. Keep the UI label decision in the product contract: the home section is “Mi actividad” when it includes events, while “Mis libros” remains the direct collection view. A new generic activity table is not needed for this scope; add an additive migration only if the existing records lack the timestamp/status needed to produce these events.

Alternative considered: keep the current local array or create a general social timeline. The local array is not truthful, and a general timeline expands scope beyond the P0 acceptance criteria.

### 5. Make Community persistence-backed before polishing its presentation

Replace the backend Community stats/feed/activity/suggestions mock imports with repository queries over users, listings, corners, agreements and persisted community stories, preserving current response shapes where possible. Apply public-field projection, pagination and existing privacy rules at the service boundary. The frontend continues to use its hooks and shows an error rather than fake content. The Community publish button opens a dedicated story composer; it does not open book publication.

### 9. Persist book attachments as typed message metadata

Keep the existing JSONB attachment column, adding a validated `kind: 'book'` payload with listing ID and display metadata. The message history response remains backward-compatible; the frontend maps this metadata to the existing book-card message presentation after the POST succeeds. A failed POST must leave the conversation unchanged except for a visible error.

### 10. Keep map controls and layout purposeful

The community mini-map exposes only the action that navigates to `/map`, positioned in the top-right. The full map reacts to bbox changes with an imperative Leaflet view update, uses browser location when authorized, and applies a compact rail width/padding. The map is always expanded beside the filter rail; it does not reserve a conditional corners/detail section. Empty results are communicated as an overlay inside the map.

Alternative considered: only replace frontend fakers while leaving backend mock services. Rejected because real-mode clients would still receive fabricated people and publications.

### 6. Treat browser location as private client state

Request geolocation when `/map` initializes, store the result in component/query state, calculate the bbox from the authorized position, and render a distinct “you are here” indicator locally. Send only the bounded query needed to retrieve nearby public results; do not persist or broadcast the exact browser coordinate. If permission is unavailable, retain a documented fallback and make its state visible. The distance input remains constrained to 1–25 km and its visual fill derives from the same controlled value used in the query.

Alternative considered: use the user’s persisted profile location as the marker. Rejected as the default because it may be stale and has different privacy semantics from a one-session browser permission.

### 7. Hydrate conversation book options as conversation data

When a real conversation is selected, load the authenticated user’s eligible books from the user-books API and the counterpart’s public/eligible books through a dedicated availability response or an additive endpoint if the current one is insufficient. Keep `myBooks` and `theirBooks` explicit in the conversation view model, and pass loading/error/empty state to attachment and swap modals. Validate selected listing IDs again when creating a persisted agreement or sending an attachment.

Alternative considered: embed all books in the conversation list response. Rejected because it increases every conversation payload and risks exposing books unrelated to the active conversation.

### 8. Verify behavior at three levels

Add focused frontend tests for route selection, real-data states, controls and modals; backend tests for persistence-backed projections and authorization; and a browser checklist following `docs/recovery-baseline.md` with `PUBLIC_API_USE_MOCKS=false`. The browser pass must inspect Network requests for the critical flows, because Vitest/MSW cannot prove proxy, cookie, tile or geolocation behavior.

## Risks / Trade-offs

- [Community tables do not contain enough historical information for a requested activity or trend] → derive only events supported by persisted timestamps/statuses, show a truthful empty state, and add a narrowly scoped additive migration if a required field is genuinely missing.
- [Real API latency makes the home or modal feel empty] → add explicit loading states and query caching/invalidation; never mask the latency with fake records.
- [Browser geolocation is denied, unavailable or inaccurate] → show the fallback state and approximate private indicator only when authorized; keep map results bounded and explain the state to the user.
- [Existing mock-based tests rely on fixture-shaped conversation data] → keep fixtures behind explicit mock mode and add real-mode tests for hydration instead of changing test semantics silently.
- [Changing the catalog source changes what current snapshots expect] → update tests to assert public versus owned datasets separately and verify the active “Todos” URL contract.

## Migration Plan

1. Inspect current table fields and API response contracts, then implement the frontend route/data boundaries without changing persisted data.
2. Add persistence-backed Community and user-activity queries using existing columns. If a required field is missing, add one new forward-only migration and update `docs/base_de_datos.md`.
3. Deploy backend changes before enabling frontend consumers that require new response fields; preserve backward-compatible fields during the transition.
4. Run backend/frontend suites, build checks and the real-browser P0 checklist with mocks disabled.
5. Roll back by reverting the frontend consumers to the previous response contract and disabling the new UI entry points. Never edit or reverse an applied migration; any correction requires a subsequent migration.
