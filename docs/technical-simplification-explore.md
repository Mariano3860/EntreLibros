# EntreLibros Technical Simplification Explore

> **Purpose.** This is a read-only exploration for future OpenSpec proposals. It
> does not authorize implementation. Its goal is to reduce accidental complexity
> while preserving all observable product behavior.

## 1. Executive summary

EntreLibros has a solid functional base: React/Rsbuild, Express, PostgreSQL with
PostGIS, Socket.IO, MSW, backend integration tests and a reproducible Playwright
baseline. The main opportunity is no longer adding architecture; it is removing
historical parallel surfaces and making the surviving flows easier to follow.

The investigation found a material set of frontend-only, test-only component
trees. Their source files have no importer under `frontend/src` other than their
own internal children; their only external consumers are unit tests. The most
substantial confirmed candidate is the old feed component tree, followed by old
community tabs, map utility widgets, small dashboard widgets and their tests,
styles, translations, mocks and helpers.

The largest remaining complexity is productive code, not dead code:

- `frontend/src/pages/messages/MessagesPage.tsx` has 2,875 lines, 29 local
  states, 9 effects, 5 queries and 3 mutations.
- `backend/src/routes/books.ts` has 1,797 lines and 13 route handlers;
  `bookListingRepository.ts` has 1,572 lines and 38 exports.
- Product/mock branching is intentional, but the global `PrototypeContext` and
  the `Prototype*` naming make the real product path harder to identify.
- Socket.IO has a real receive/replay role, but also retains a second write path
  that the browser UI no longer calls.

The safest order is: remove confirmed unreferenced frontend surfaces; correct
documentation and cache-key drift; then make bounded, domain-oriented splits.
Do not begin by redesigning `MessagesPage`, repositories, state management or
database transactions.

### Audit snapshot and scope caveat

The checkout inspected was `cleanup-remove-legacy-messaging-surface` at
`d53257f`; `main` was `af650d3`. The branch contains the pending legacy
messaging cleanup (34 files, 6,222 deleted lines) from PR #190. Therefore this
document treats that cleanup as the intended next baseline, but it must be
merged before a follow-up proposal assumes that the old
`components/messages/Messages.tsx` tree is absent from `main`.

No active OpenSpec change existed during the exploration. The worktree was
clean. Dynamic imports were searched: the only runtime frontend dynamic import
is MSW startup in `setupMocks.ts`; routes are synchronous imports, and there is
no Storybook/Ladle/Histoire configuration.

## 2. Current architecture

```text
Browser
  React + Rsbuild + React Query + i18n
  ├─ PUBLIC_API_USE_MOCKS=true -> MSW + prototype catalog/state
  └─ real mode -> /api and /socket.io proxy
          │
          ├─ Express routers -> repositories/services -> PostgreSQL/PostGIS
          └─ Socket.IO authenticated rooms -> React Query invalidation/replay

Quality boundary
  Vitest frontend + backend/integration -> isolated PostGIS + Playwright E2E
```

The frontend route owner is `frontend/src/routes/index.tsx`. Product pages are
imported eagerly; the route graph includes Home, Books, Community, Map,
Messages, Profile, Stats and Contact. `MessagesPage` is the canonical message
screen. `App.tsx` composes QueryClient, auth, theme, prototype state, language
initialization and the router.

The backend registers routers from `backend/src/app.ts`; routers generally own
authentication and transport validation while repositories own SQL and
transactions. Product data is persisted before notification/event delivery.
Migrations `001` through `035` are cumulative and are the schema authority.

### Product/mock boundary

`PUBLIC_API_USE_MOCKS` selects MSW and deterministic demo behavior. This is a
valid review/UI mode, not a second database. `PrototypeUI`, catalog types and
the real-data adapters are shared presentation infrastructure and must not be
classified as legacy merely because their names say “prototype”.

## 3. Main complexity hotspots

| Rank | Hotspot | Evidence | Natural limit, not an automatic split |
| --- | --- | --- | --- |
| 1 | `MessagesPage.tsx` | 2,875 lines; mock and real renderers; conversation, drafts, attachments, agreements, contacts and Socket replay | Separate page orchestration from conversation list, transcript/composer and agreement/draft dialogs only after cache/socket behavior is characterized. |
| 2 | `routes/books.ts` | 1,797 lines; 13 routes; parsing, policy checks, DTO mapping and publication validation | Catalog discovery, personal relations, publication mutation and route parsing are distinct readable units. |
| 3 | `bookListingRepository.ts` | 1,572 lines; 38 exports; SQL projections, filtering, personal relations, mutation and PostGIS-aware catalog ordering | Keep SQL close to each use case; split by read model/mutation only, not into generic query builders. |
| 4 | `BookDetailModal.tsx` | 1,136 lines; edit/view/contact/report concerns and several effects | Detail viewing, owner editing and contact actions are natural separate concerns. |
| 5 | `ProfilePage.tsx` | 830 lines; 18 local states; real/mock data and privacy/photo/editor behavior | Isolate photo editing and profile form state, preserving the single profile policy source. |
| 6 | `CommunityFeedPage.tsx` | 825 lines; 7 queries, a mutation, mock and real feed renderers | Extract real feed query/view composition before creating generic feed abstractions. |
| 7 | `routes/messages.ts` | 798 lines; 11 routes and rich attachment/draft validation | Conversations/contacts, drafts, and history/read endpoints are coherent route subdomains. |
| 8 | `messagingRepository.ts` | 754 lines; conversation, contact, attachments, bot and persistence concerns | Keep transactional send logic intact; group read models apart from write/idempotency logic. |
| 9 | `MapPage.tsx` | 719 lines; URL filters, geolocation, mock/real selection, mutations and modal state | URL/filter parsing, location resolution and map screen composition are safe boundaries. |
| 10 | `routes/community.ts` | 674 lines and 18 routes | Corners, social/feed, discovery/follows and metrics can be separated without changing `/api/community`. |

## 4. Dead and legacy code

### Confirmed deletion candidates

The following candidates were checked against production source imports,
route registration, dynamic imports, tests, MSW handler registration, scripts,
documentation and backend routes. “Test-only” means a test imports the unit but
no product source imports it.

| Group | Runtime consumers | Test/tool consumers | Recommendation |
| --- | --- | --- | --- |
| Community availability API | None. No backend route or OpenAPI path exists for `/api/community/messages/availability`. | Registered MSW handler only. | Delete API module, handler, registration and route constant leaf. |
| Old community tabs | None. `StatsTab`/`MessagesTab` have only their own tests; their card children are only imported by `StatsTab`. | Three tab/hook tests. | Delete the complete tab/card/style/hook chain, retaining productive stats API/pages. |
| `ProposeMeetingModal` | None. No map page, route or lazy import references it. | Its dedicated test only. | Delete component, SCSS, test and exclusive i18n leaves. |
| Old feed component tree | `FeedActions` and `FeedItem.types` are still used; the rest has no runtime parent. | Dedicated feed/card tests. | Delete only the unconsumed tree listed in DEL-04. |
| Map `common` widgets | None. The active map imports `MapCanvas`, `FilterRail`, `MapSelectionCard`, etc., not this directory. | One aggregate test. | Delete all six widgets, their styles/test and exclusive i18n leaves. |
| Small orphan widgets/helpers | None for `ThemeIconButton`, `TabsMenu`, old home sections, `UserActivityItem`, `utils/path`, `getInitials` and analytics stub. | Dedicated tests and old card tests. | Delete as a single low-risk cleanup after preserving shared assets/utilities. |
| Three SVG assets | `attachments.svg`, `emoji.svg`, `info.svg` have no source, test, docs or dynamic consumer. | None. | Delete them with the owning cleanup. |

### Explicitly preserved despite nearby legacy code

- `frontend/src/components/messages/drafts/MessageDraftCard.tsx`,
  `frontend/src/hooks/useMessageDraft.ts`, `frontend/src/api/messages/messages.ts`
  and `frontend/src/hooks/socket/useChatSocket.ts` participate in the current
  message page.
- `FeedActions.tsx` and `FeedItem.types.ts` are used by the productive
  `CommunityFeedPage` and community API services. Do not delete them with old
  feed cards.
- `fetchCommunityStats`, `/api/community/stats` and its backend services are
  used by Home, Community and Stats pages. Only the obsolete `useCommunityStats`
  wrapper and old tab cards are candidates.
- `CornersMiniMap`, `useCornersMap`, map components used by `MapPage`, and
  `MessageDraftCard` remain productive.
- `PrototypeUI`, `prototypeCatalog` and `realData.adapters.ts` bridge both
  mock and real displays. Their naming is confusing, but their consumers are
  real product pages.

## 5. Duplication and reuse opportunities

### Duplication worth addressing

1. **Message transport write paths.** HTTP draft send persists through
   `messageDraftRepository` and publishes `messageEvents`; Socket.IO has a
   separate `conversation:message` write handler that persists, emits and
   triggers bot replies directly. These paths duplicate validation, notification
   and delivery decisions.
2. **Agreement cache keys.** `agreementQueryKeys.detail(id)` is
   `['agreements', id]`, while `MessagesPage` queries and updates
   `['prototype', 'agreement', id]`. Socket invalidation targets the former,
   so it does not invalidate the active page query.
3. **Cookie parsing.** Equivalent `parseCookies` implementations exist in auth
   middleware, Socket.IO and books optional-viewer code. A tiny backend-owned
   session-cookie parser would reduce security-sensitive drift.
4. **Community query wrappers.** Several wrappers duplicate direct page queries
   but have no runtime caller (`useCommunityFeed`, `useSuggestions`,
   `useActivity`, `useNearbyCorners`, `useUserActivity`). Delete them instead of
   attempting a generic hook framework.

### Similar code that is acceptable

- Transport validation in a route and invariant validation inside a repository
  are intentionally separate trust boundaries. Do not merge them blindly.
- Mock and real branches are acceptable where the mock screen has deliberately
  different in-memory behavior; the simplification target is their ownership,
  not a claim that mock mode must disappear.
- Small local `isRecord` guards do not merit a universal utility merely to obey
  DRY.

## 6. Unnecessary abstractions

- `TabsMenu` and `utils/path.ts` form an unused abstraction pair. Both exports
  (`buildFullPath`, `getPathSegment`) are only consumed by the dead menu/test
  chain.
- `utils/analytics.ts` is a development `console.log` stub only used by old
  feed cards. Remove it with that tree rather than retaining a fake analytics
  layer.
- `useCommunityStats` and the other wrappers named above add React Query
  concepts without a production caller. Delete rather than relocate.
- Do **not** inline `realData.adapters.ts`: it is a useful explicit boundary
  between API DTOs and the shared visual models.

## 7. Frontend simplification

### Pages and state

`MessagesPage` combines two full implementations: `MockMessagesPage` starts at
line 457 and `RealMessagesPage` at line 1102. The real path combines selection,
search/unread filtering, contact creation, history reconciliation, draft
autosave, attachment selection, swap and agreement forms, mutation errors and
all presentation. Future extraction should keep one page-level owner for the
selected conversation and React Query cache, then move visual regions to
well-named components. It must not introduce a new state manager.

`ProfilePage`, `CommunityFeedPage`, `MapPage`, `BooksPage` and
`BookDetailModal` also mix presentation, API decisions and local state. The
appropriate future sequence is to remove dead code first, then split the
largest units around existing use cases rather than around arbitrary line count.

### React Query

Messages already has useful `messageQueryKeys`; notifications and map have
similar key modules. The agreement key mismatch is a correctness issue. Future
work should add/consume keys only for domains with cross-component
invalidations, beginning with agreements and profile, not perform a repository-
wide query-key rewrite.

### Mock/real/prototype

`PrototypeContext` holds catalog data plus unrelated mutable state for stats
period, social posts, mock chat messages, unread IDs, FAQ and support. It is a
global alternate state source even in real mode. Preserve the deterministic demo
mode, but move page-specific mock mutations near their page or MSW handlers in
small steps. This reduces the number of concepts a reader must load before
understanding a real page.

## 8. Backend simplification

`routes/books.ts` currently performs route parsing, optional authentication,
catalog/personal policy selection, publication validation and DTO mapping. Split
only into route-local modules such as `books.catalog`, `books.relations` and
`books.publication` while preserving router mounting and HTTP contracts.

`routes/community.ts` can similarly be divided by corners, social/feed,
discovery/follows and metrics. `routes/messages.ts` can group contacts and
conversations, drafts, and message history/read routes. These are readability
splits, not a controller/service/repository migration.

`bookListingRepository.ts` should retain readable SQL by use case. Its natural
units are listing writes, public discovery, personal relations and shared row
projection/mapping. Avoid a generic SQL DSL: it would obscure privacy predicates
and PostGIS filters.

## 9. Messaging

### Current product implementation

`MessagesPage.tsx` is the canonical screen. Its real flow is:

1. Load conversations and history by HTTP/React Query.
2. Join a Socket.IO conversation with a cursor to replay missed messages.
3. Save a draft by HTTP and send it through
   `POST /api/messages/:conversationId/draft/send`.
4. Persist transactionally, notify recipients and publish a committed event.
5. Receive `conversation:message`, invalidate conversations/history/
   notifications, merge deduplicated live messages, and mark reads by HTTP.

Playwright `e2e/tests/messaging.spec.ts` observes the draft and draft-send HTTP
requests, verifies cross-context delivery without reload and therefore confirms
the current browser write path.

### Legacy cleanup status

The audited branch removed the earlier `components/messages/Messages.tsx`
implementation, its composer/bubble/modals/store/types/tests and the generic
legacy `message` channel. This report does not propose removing shared drafts,
attachments, agreement types or Socket.IO receive/replay behavior.

### Remaining convergence question

`useChatSocket` exposes `sendConversationMessage`, `currentUser`, `error` and
`agreementUpdates`; no productive component consumes any of them. Its dedicated
test is their only consumer. In particular, the browser does not emit the
Socket.IO `conversation:message` or `conversation:read` mutation event; it uses
HTTP instead. Backend socket tests and `chatBot.test.ts` do emit the former, and
the bot reply exists only on that Socket.IO write path.

This is not safe to delete immediately because it requires a product decision:

- if bot/realtime writes are still intended browser capabilities, route HTTP and
  socket writes through one persisted delivery policy and cover both;
- if HTTP draft send is canonical, retire the unconsumed client write/read
  protocol and associated bot behavior only after an explicit decision and E2E
  coverage of the retained behavior.

## 10. Books/catalog

Books are a productive hotspot, not legacy. Public discovery, private personal
relations, book detail, publishing and contact use distinct visibility rules.
The route compatibility redirect `/books/mine -> /books` remains intentional.

The repository's `buildCatalogQuery` contains public-status, expiry, editorial,
block and optional distance policy in one place. Preserve that cohesion. A
future package should improve readability with small named query fragments and
comments, while retaining parameterized SQL and the current privacy behavior.

## 11. Map/community/profile

- **Map:** Product components are active. The dead map common widgets and the
  obsolete meeting modal are separate from `MapCanvas`, `FilterRail`,
  `MapSelectionCard`, `CornerDetailsPanel` and corner mutation flows.
- **Community:** The active page renders its own real feed composition and
  imports `FeedActions`; old reusable feed cards/panels are not on that path.
- **Profile:** Privacy, photo, profile mutation and real/mock values coexist in
  one page. Refactor only after the dead cleanup; privacy projections must stay
  in backend policy/repository code.

## 12. Socket.IO

| Event | Server emitter/listener | Frontend consumer | Status |
| --- | --- | --- | --- |
| `conversation:join` | listener; authorizes room and replays messages after cursor | `useChatSocket` from `MessagesPage` | Product, preserve. |
| `conversation:message` server-to-client | emitted after committed HTTP draft send and for socket writes | hook listener; page merges/invalidate | Product receive event, preserve. |
| `conversation:message` client-to-server | socket listener persists directly and may generate bot reply | only unused hook export and socket tests | FOLLOW-UP: parallel write protocol. |
| `conversation:read` | socket listener updates read state | no browser emitter; page calls HTTP | FOLLOW-UP: parallel mutation protocol. |
| `agreement:updated` | committed agreement event | hook listener, but cache key mismatch prevents active page invalidation | Product event; repair key alignment. |
| `conversation:error` | emitted for socket validation/authorization errors | no browser listener | FOLLOW-UP with socket-write decision; do not silently delete external protocol. |
| `conversation:leave` | no implementation | documentation only | Remove/correct documentation. |

The process-local EventEmitters are suitable for the current single-process
baseline. Outbox/distributed delivery is deliberately outside this exploration.

## 13. Data and persistence

The main data model is understandable through migrations, but no single document
explains table relationships and transaction boundaries progressively. Add a
study-oriented model document rather than changing applied migrations.

Do not edit migrations `031`, `032`, `033` or `034` to remove historical
overlap: their hashes are applied-state evidence. The `034` compatibility
migration is historical schema safety, not dead code.

Important persistence invariants worth preserving/documenting are:

- draft revision prevents stale overwrites;
- draft send creates agreement/message and removes the draft in one transaction;
- `clientKey` is the idempotency key for message sends;
- agreement versions lock/update atomically;
- public map locations deliberately round/offset coordinates and never expose
  street/number.

## 14. Testing

The test pyramid is useful and should be simplified by removing tests that only
exercise deleted units. Do not retain a test merely to keep a component alive.

Product protection currently includes:

- backend route/repository/socket tests for authorization, persistence,
  idempotency, drafts and agreement concurrency;
- frontend real-page tests, including `MessagesPage.real.test.tsx`;
- Playwright authentication, catalog, publishing, profile, map, messaging,
  agreement and security specs against isolated PostGIS;
- `npm run verify:ci`, which checks formatting, lint, typecheck, backend tests,
  frontend tests, builds and Playwright.

The missing behavior-level test to add before a Socket convergence is a
two-session agreement update that proves the active agreement UI refreshes after
`agreement:updated`. Existing hook tests only prove the invalidation requested
by the hook, not that it matches the page query key.

## 15. Documentation

Documentation is substantial and indexed in `docs/README.md`, but it is
organized primarily by operational artifact rather than by study sequence.
`tfg-mvp-trazabilidad.md` is valuable evidence but too dense to be the first
technical reading path.

Corrections required before presenting the docs as current behavior:

- `docs/arquitectura.md` lists `conversation:leave`, which has no implementation.
- `docs/messaging-bubbles.md` presents `conversation:message` socket write as
  the real send flow, while browser E2E proves draft-send HTTP is the current
  UI flow.
- `docs/troubleshooting.md` should distinguish receive delivery from the
  unconsumed socket write protocol.

## 16. English code comments

New comments should explain non-obvious constraints, never narrate syntax.

| Location | Needed knowledge comment (in English) |
| --- | --- |
| `backend/src/index.ts` dynamic imports | Explain that dotenv must resolve before importing modules that read configuration. |
| `backend/src/socket.ts` connection/join replay | Explain why initial room joins coexist with explicit cursor join, and the ordering guarantee for missed messages. |
| `backend/src/repositories/messageDraftRepository.ts` send transaction | Explain why validation is repeated while the draft/conversation rows are locked, and why events are emitted after commit. |
| `backend/src/repositories/bookListingRepository.ts` catalog predicate | Explain why blocked users, expiry, editorial status and owner inclusion are in the query rather than filtered after retrieval. |
| `backend/src/services/map.ts` publication truncation query | Explain the bounded extra query used only to expose honest truncation metadata. |
| `frontend/src/hooks/socket/useChatSocket.ts` | Keep the existing origin comment; add a concise comment only when resolving the HTTP/socket write ownership. |
| `MessagesPage.tsx` draft autosave effect | Explain revision/signature/timer behavior if it remains in the page; extraction is preferable to accumulating comments. |

## 17. Studyability

The hardest oral-defense paths today are:

1. **Why does a product use “Prototype” types in real mode?** The adapters are
   legitimate, but names obscure their shared visual-model role.
2. **How is a message sent versus received?** HTTP draft send and Socket receive
   are split, while a second socket write path remains.
3. **Which community components are live?** A large old feed tree and new inline
   page implementation coexist without a runtime consumer map.
4. **Where do catalog privacy rules live?** They are correctly in SQL predicates,
   but their rationale is not visible at the public API boundary.
5. **What is the product/mock distinction?** It is documented, but its global
   context mixes unrelated demo state and real shared presentation.

The proposed Project Tour and bounded deletion packages directly reduce these
questions before a presentation.

## 18. Performance

- **Do now:** no performance rewrite. The map has a recorded bounded benchmark
  and server limits; its expensive paths should not be changed without a new
  measurement.
- **Measure first:** routes are eagerly imported, so route-level code splitting
  could reduce initial JS. It is not recommended until bundle measurements show
  a meaningful cost; it would add loading states and routing complexity.
- **Keep:** message/history pagination and map response caps are existing
  guardrails, not premature optimization targets.

## 19. Prioritized findings

### DELETE

#### DEL-01 - Remove nonexistent community message availability surface

**Area:** frontend API/MSW. **Priority:** P0. **Difficulty:** small.
**Risk:** low.

**Files:** `frontend/src/api/community/messages.ts`,
`frontend/mocks/handlers/community/messages.handler.ts`, handler registration
and `RELATIVE_API_ROUTES.COMMUNITY.MESSAGES`.

**Evidence:** no frontend runtime importer of `fetchBookAvailability`; no backend
route, OpenAPI path, route registration, E2E or docs consumer exists. The MSW
handler is registered only to answer the orphan API path.

**Recommendation:** delete the complete chain and its exclusive tests if added.
Do not change productive `/api/messages` endpoints.

#### DEL-02 - Remove obsolete community tab implementation

**Area:** frontend community. **Priority:** P0. **Difficulty:** small.
**Risk:** low.

**Files:** `StatsTab.tsx`, `MessagesTab.tsx`, `CommunityTabs.module.scss`,
`StatsTab.module.scss`, five `components/community/cards/*` files,
`useCommunityStats.ts`, `COMMUNITY_STATS_RANGES`, three related tests and
exclusive locale leaves.

**Evidence:** neither tab is imported by a route/page. The cards are imported
only by `StatsTab`; the hook only by that tab/tests. Product stats are served by
`StatsPage`, Home and Community using `fetchCommunityStats` directly.

**Recommendation:** delete the isolated tab tree; retain stats service, backend
route and product pages.

#### DEL-03 - Remove unused map meeting modal

**Area:** map. **Priority:** P1. **Difficulty:** small. **Risk:** low.

**Files:** `components/map/ProposeMeetingModal/*`, its test and its exclusive
`map.cta.proposeMeeting`/modal locale leaves.

**Evidence:** no static runtime import, route, dynamic import, map page use or
documentation workflow references it; its only consumer is its own test.

**Recommendation:** delete the component chain. Agreement meeting data remains
productive inside Messages/agreements and must be preserved.

#### DEL-04 - Delete the unmounted old feed composition tree

**Area:** community/frontend. **Priority:** P0. **Difficulty:** medium.
**Risk:** low after targeted checks.

**Files:** `components/feed/{RightPanel,ActivityBar,FeedList,FeedFilters,
CornerChip,filterItems}`; `components/feed/cards/*`; corresponding SCSS; old
hooks `useActivity`, `useCommunityFeed`, `useSuggestions`, `useNearbyCorners`;
`components/community/corners/CornersStrip`; associated tests; `utils/analytics`.

**Evidence:** `CommunityFeedPage` imports `FeedActions` and `FeedItem.types`,
not `FeedList`, cards, panels or filters. Those units form an internal chain
whose external imports are tests. The APIs themselves remain live because pages
call the services directly.

**Recommendation:** delete only the unmounted tree. Preserve `FeedActions`,
`FeedItem.types`, `CornersMiniMap`, community services/routes and their tests.

#### DEL-05 - Delete unused map common widgets

**Area:** map/frontend. **Priority:** P1. **Difficulty:** small. **Risk:** low.

**Files:** all six `components/map/common` TSX/SCSS pairs and
`CommonComponents.test.tsx`.

**Evidence:** no active map component imports `Badge`, `EmptyState`,
`ErrorBanner`, `HeatLayerLegend`, `KeyValue` or `SkeletonList`; one aggregate
test is the sole external consumer.

**Recommendation:** delete them and their exclusive translations after checking
each locale leaf. Do not replace them with a generic UI library.

#### DEL-06 - Delete small test-only widgets and helpers

**Area:** frontend. **Priority:** P1. **Difficulty:** small. **Risk:** low.

**Files:** `ThemeIconButton`, `TabsMenu` and types/styles, `HeroLoggedIn`,
`CommunitySectionLoggedIn`, `UserActivityItem`, `useUserActivity`,
`utils/path.ts`, `utils/getInitials.ts`, related tests and exclusive i18n.

**Evidence:** production imports are absent. `TabsMenu` is the only caller of
`buildFullPath`; `getInitials` is only called from the old contributor card;
`UserActivityItem` is isolated from the live activity API.

**Recommendation:** delete full dependency chains, not tests alone.

#### DEL-07 - Remove orphan assets and conditional packages

**Area:** assets/dependencies. **Priority:** P2. **Difficulty:** small.
**Risk:** low with build verification.

**Evidence:** `attachments.svg`, `emoji.svg`, `info.svg` have no importer.
`date-fns` is used solely by `UserActivityItem`, so becomes removable with
DEL-06. `css-loader`, `style-loader`, `ts-loader` and
`react-compiler-runtime` have no source/config reference; Rsbuild/Vitest use
their own configured plugins. Backend Socket.IO packages include types, so
`@types/socket.io` and `@types/socket.io-client` appear redundant; the backend
test runtime `socket.io-client` itself is live and must remain.

**Recommendation:** remove assets first; remove packages in a separate commit
with lockfile, typecheck/build and `npm ls` verification.

### SIMPLIFY / REUSE / SPLIT

#### SIM-01 - Align agreement query keys with Socket.IO invalidation

**Area:** messages/agreements. **Priority:** P1. **Difficulty:** small.
**Risk:** medium.

**Evidence:** Socket invalidates `agreementQueryKeys.detail(id)`
(`['agreements', id]`), while `MessagesPage` queries and sets
`['prototype', 'agreement', id]`. The current socket listener therefore misses
the active query.

**Recommendation:** make the message page use `agreementQueryKeys.detail` and
add a two-session agreement Socket E2E or real-page integration test.

#### SIM-02 - Decide and converge the two message write protocols

**Area:** Socket.IO/messages. **Priority:** P1. **Difficulty:** medium.
**Risk:** high.

**Evidence:** browser E2E sends drafts by HTTP; no productive component calls
`sendConversationMessage` or emits `conversation:read`. Socket write tests and
the bot still exercise the parallel protocol.

**Recommendation:** make an explicit product decision before deletion. Retain
Socket receive/replay either way. If retaining socket writes, use the same
persisted publish path as HTTP; if retiring them, move or retire bot behavior
only after coverage proves the intended product result.

#### SIM-03 - Split MessagesPage along existing product regions

**Area:** frontend messages. **Priority:** P1. **Difficulty:** large.
**Risk:** medium.

**Evidence:** 2,875 lines and many independent states/effects in a single file.

**Recommendation:** after SIM-01/02, extract presentational conversation list,
transcript/composer, attachment picker and agreement dialog around stable props.
Keep selected conversation, cache orchestration and draft lifecycle together
initially. Do not redesign the architecture.

#### SIM-04 - Reduce PrototypeContext to real shared concerns

**Area:** frontend mock mode. **Priority:** P2. **Difficulty:** medium.
**Risk:** medium.

**Evidence:** catalog plus six unrelated mutable demo domains share one global
provider, even though individual pages own the UI.

**Recommendation:** preserve catalog and shared visual adapters; relocate mock
mutations only when a page is touched. Avoid a wholesale mock rewrite.

#### SIM-05 - Split books router by use case

**Area:** backend books. **Priority:** P2. **Difficulty:** medium. **Risk:** medium.

**Evidence:** 13 handlers and parsing/policy/mapping in 1,797 lines.

**Recommendation:** route-local modules for catalog, relations and publication
mutation; preserve endpoint strings and existing tests.

#### SIM-06 - Split book repository by read/write model

**Area:** backend SQL. **Priority:** P2. **Difficulty:** large. **Risk:** medium.

**Evidence:** 38 exports and public/private/personal query responsibilities.

**Recommendation:** group coherent SQL and shared projections; do not introduce
a generic query-builder abstraction.

#### SIM-07 - Split community router and page by active subdomains

**Area:** community. **Priority:** P2. **Difficulty:** medium. **Risk:** medium.

**Evidence:** 18 backend routes and an 825-line page with separate real/mock
feeds, queries and social actions.

**Recommendation:** first remove DEL-04; then isolate corners, feed/social,
discovery and metrics around existing contracts.

#### SIM-08 - Bound profile and map state

**Area:** profile/map. **Priority:** P2. **Difficulty:** medium. **Risk:** medium.

**Evidence:** profile has 18 local states; map has 15 and 10 callbacks.

**Recommendation:** extract photo/profile form and map URL/location concerns;
do not alter privacy, map query semantics or persisted models.

#### REUSE-01 - Share backend session-cookie parsing

**Area:** backend auth/Socket. **Priority:** P2. **Difficulty:** small.
**Risk:** medium.

**Evidence:** equivalent parsing exists in auth middleware, socket setup and
optional books viewer identification.

**Recommendation:** introduce one small internal parser only, retain distinct
required/optional authentication policy.

### DOCUMENT / COMMENT / TEST / CONFIG / FOLLOW-UP

#### DOC-01 - Correct the messaging protocol documentation

**Priority:** P0. **Difficulty:** small. **Risk:** low.

Correct `conversation:leave`, document HTTP draft send as the browser write
flow, document Socket receive/replay, and label unresolved socket writes/bot
behavior accurately.

#### DOC-02 - Add a progressive Project Tour

**Priority:** P1. **Difficulty:** medium. **Risk:** low.

Add a short study sequence: product overview, architecture, request flow, data
model, security/privacy, books, messaging/agreements, map, tests and deployment.
Link to existing operational documents rather than duplicate them.

#### DOC-03 - Add focused architecture documents

**Priority:** P2. **Difficulty:** medium. **Risk:** low.

Recommended documents: `architecture-overview.md`, `request-flow.md`,
`messaging-architecture.md`, `data-model.md`, `security-model.md`,
`testing-strategy.md` and `project-tour.md`. Start with Project Tour and
Messaging Architecture because they address the highest studyability cost.

#### COM-01 - Explain invariants where code is intentionally non-obvious

**Priority:** P2. **Difficulty:** small. **Risk:** low.

Apply the English-comment plan in section 16. Do not add comments to obvious
state setters, JSX or SQL syntax.

#### TEST-01 - Replace deleted implementation tests with product behavior tests

**Priority:** P1. **Difficulty:** medium. **Risk:** medium.

Delete tests exclusively covering DEL groups. Before removing any test that
encodes a domain rule, prove the rule through active page/backend/E2E coverage.
The agreement Socket cache test is the first required addition.

#### CFG-01 - Make root script names describe whether they mutate files

**Priority:** P2. **Difficulty:** small. **Risk:** low.

`format:backend`/`format:frontend` run mutating `format-all`, while
`format:check:*` are non-mutating. Rename/document the distinction so a reader
does not run formatting fixes by expecting a check.

#### CFG-02 - Reconcile PostGIS image versions

**Priority:** P3. **Difficulty:** small. **Risk:** low.

Backend CI uses `postgis/postgis:16-3.5`; E2E Compose uses `16-3.4`. Confirm
extension compatibility and pin one version if no deliberate reason exists.

#### FUP-01 - Measure before route-level code splitting

**Priority:** P3. **Difficulty:** medium. **Risk:** medium.

All pages are synchronously imported, but no bundle evidence demonstrates a
meaningful user problem. Do not add lazy routing yet.

#### FUP-02 - Preserve historical migrations and distributed-delivery scope

**Priority:** P3. **Difficulty:** large. **Risk:** high.

Do not rewrite applied migrations, introduce outbox, redesign transactions or
change persistence in this simplification program.

## 20. Proposed work packages

| Package | Objective and findings | Dependencies | Risk/tests | Recommended order |
| --- | --- | --- | --- | --- |
| A. Confirmed frontend dead-surface removal | DEL-01 through DEL-07, including styles, tests, i18n and packages that become unused | PR #190 merged first | Low; frontend test, typecheck, build, `verify:ci` | 1 |
| B. Messaging protocol truth and cache alignment | SIM-01, SIM-02, DOC-01, TEST-01 | A independent; needs product decision for bot/socket writes | Medium/high; backend socket tests, real messages tests, Playwright messaging/agreement | 2 |
| C. Documentation for study | DOC-02, DOC-03, COM-01 | Can follow A; should use B's protocol decision | Low; link/script audit | 3 |
| D. Bounded frontend page simplification | SIM-03, SIM-04, SIM-07, SIM-08 | A and B reduce noise first | Medium; focused page tests plus E2E | 4 |
| E. Backend use-case boundaries | SIM-05, SIM-06, REUSE-01 | Documentation/comments should capture policies first | Medium; backend tests, OpenAPI, E2E | 5 |
| F. Configuration hygiene | CFG-01, CFG-02 | Independent | Low; CI-equivalent checks | 6 |
| G. Measured loading/performance work | FUP-01 only if measurements justify | After stable simplification | Medium | 7 |

## 21. Recommended execution order

1. Merge the already-reviewed legacy messaging cleanup so `main` matches the
   assumed baseline.
2. Propose/apply Package A as a single evidence-driven deletion change.
3. Fix agreement cache-key alignment and write the missing Socket agreement
   behavior test; separately decide whether browser bot/socket writes remain a
   product capability.
4. Correct messaging documentation and add the Project Tour.
5. Modularize `MessagesPage` and the other frontend hotspots only after their
   active surface is smaller and tests describe the behavior.
6. Split backend books/community/messages by existing use case, keeping SQL and
   contracts stable.
7. Consider performance work only with measurements.

## 22. Do not touch yet

- Rewrite `MessagesPage` wholesale or introduce a new frontend state manager.
- Remove Socket receive/replay, drafts, agreements, notifications, unread state
  or real persistence.
- Delete bot-related code before deciding whether bot conversation is product.
- Rewrite MSW/prototype mode; reduce only isolated dead branches first.
- Replace repositories with generic controller/service/repository layers.
- Edit applied migrations, change transaction semantics, introduce an outbox or
  change product HTTP contracts.
- Remove map privacy rounding/offset behavior or PostGIS boundaries.
- Add code splitting or performance changes without measurements.

## 23. Expected end state

After the recommended program, EntreLibros should have one actual message page,
one documented browser message-send policy, one receive/replay protocol, fewer
unmounted frontend surfaces and fewer tests that only preserve history. Product
pages and backend routes should be readable by use case; SQL privacy and
transaction rules should remain explicit; mock mode should remain useful without
obscuring real behavior; and documentation should support a progressive oral
defense of the project.

### Informative removal estimate

The confirmed source/test groups total approximately **4,400 lines** before
exclusive translations, assets and lockfile changes: community tabs (589),
availability/modal (313), old feed/hooks source (1,362), old feed tests
(about 1,050 excluding the live `FeedActions` test), map common widgets (442),
small orphan widgets/hooks/tests (501), and helpers (113). This represents
roughly **95 files**, including about **29 legacy test files**, plus three SVGs.
The estimate is intentionally not a target: every deletion must be rechecked
against the then-current `main` and followed by `npm run verify:ci`.
