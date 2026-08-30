# ideal-prototype-mock-experience Specification

## Purpose
Define the deterministic MSW-backed demo contract that supplies every visible prototype region and makes its principal interactions observable before the future backend and persistence are implemented.

## Requirements

### Requirement: Single deterministic reference dataset

The mock experience SHALL provide one typed reference dataset centered on Mariano and SHALL reuse stable identifiers for users, books, Rincones, stories, activity events, conversations, messages, charts, rankings and help content across all eight routes.

#### Scenario: Repeatable route render

- **WHEN** the same route is loaded twice with the same authenticated mock session
- **THEN** names, counts, book titles, covers, avatars, statuses, chart values, ranking order, map points and visible timestamps SHALL remain stable and SHALL not be generated randomly during render.

#### Scenario: Cross-screen entity identity

- **WHEN** `Ecos del Viento Norte`, Mariano, Lucia, Café Literario or another reference entity appears in multiple screens
- **THEN** its identity, title/name, author, avatar/cover, status and related metadata SHALL remain consistent in every mock response.

### Requirement: Complete mock read coverage

MSW SHALL supply all read data required by the eight reference screens: the four Inicio metrics and recommendations, five Explorar cards and tabs, stories/feed/sidebar panels, conversation list/history, map rail/pins/detail, statistics charts/rankings, profile dashboard and help center.

#### Scenario: Initial route data

- **WHEN** a reference route loads with mock mode enabled
- **THEN** every region visible in its prototype quadrant SHALL receive a corresponding typed response or local query state, and the presentation SHALL not rely on page-local fake arrays for missing regions.

#### Scenario: Owned book reuse

- **WHEN** the mock session requests Mariano's books from Inicio, Explorar, Adjuntar libro or Proponer intercambio
- **THEN** the same non-empty owned-book set SHALL be returned with cover, title, author, condition, availability, price and exchange metadata sufficient for each visual treatment.

#### Scenario: Charts and support content

- **WHEN** Estadísticas or Centro de ayuda loads
- **THEN** deterministic series, KPI trends, rankings, FAQ items, categories and support-channel content SHALL be available without requiring an unimplemented backend endpoint.

### Requirement: Deterministic media resources

Visible reference media SHALL resolve to stable local or otherwise controlled resources with a documented asset manifest, including original resources when recoverable and approved crops/fallbacks when they are not.

#### Scenario: Reference media load

- **WHEN** a hero, book card, avatar, story, map preview or chart/map background requests its media
- **THEN** it SHALL preserve the expected aspect ratio and load consistently across renders, without a random remote image changing the screenshot geometry.

#### Scenario: Missing resource

- **WHEN** the exact source asset cannot be recovered
- **THEN** the mock SHALL use the registered local crop/fallback for that visual role and the asset manifest SHALL identify the substitution and its intended replacement path.

### Requirement: Social story interaction

The mock experience SHALL support the social publishing interaction shown in Comunidad, including text, optional media and optional linked book, without confusing it with book publication.

#### Scenario: Create story

- **WHEN** the user submits a valid story from the Comunidad composer
- **THEN** the mock feed SHALL add or visibly acknowledge the story with author/time/text and supplied media/book metadata, and the composer SHALL return to a usable state.

#### Scenario: Story validation

- **WHEN** the user attempts to publish without the required story content or with an invalid media state
- **THEN** the composer SHALL keep the action controlled, show readable validation and preserve the rest of the feed layout.

### Requirement: Messaging and exchange interaction

The mock experience SHALL support selecting conversations, sending text, attaching a book and proposing an exchange using the reference data.

#### Scenario: Send message

- **WHEN** the user sends a valid message in the selected conversation
- **THEN** the message SHALL appear in the visible history with stable sender/time metadata and the conversation preview SHALL reflect the newest content.

#### Scenario: Attach book

- **WHEN** the user selects a book from Adjuntar libro and confirms
- **THEN** the selected book SHALL produce an attachment or exchange card in the conversation with its cover/title/author metadata, and no-op submission SHALL be treated as an error.

#### Scenario: Propose exchange

- **WHEN** the user proposes an exchange from Mensajes or a book action
- **THEN** the mock SHALL show the proposal state with offered/requested book information, actions and feedback matching the prototype card rather than silently closing the flow.

### Requirement: Catalog, map and statistics interaction

The mock experience SHALL make search, tabs, filters, carousel controls, map controls, period selection and export visibly observable.

#### Scenario: Catalog controls

- **WHEN** the user searches, changes a tab, opens Filtros or advances the book rail
- **THEN** the result set, active state, filter surface or visible page of books SHALL update using the reference dataset and preserve the five-card visual geometry when enough data exists.

#### Scenario: Map controls

- **WHEN** the user changes map categories/distance, requests location or selects a pin
- **THEN** visible pins/clusters, user indicator, selected detail and control state SHALL update, with fallback feedback when permission or data is unavailable.

#### Scenario: Statistics controls

- **WHEN** the user selects a period or activates Exportar
- **THEN** KPI/chart data SHALL change or an explicit export feedback state SHALL appear, without replacing the analytics regions with generic blank placeholders.

### Requirement: Profile, FAQ and support interaction

The mock experience SHALL support the visible profile editing entry, FAQ accordion, help search and support actions without requiring persistence.

#### Scenario: Profile edit entry

- **WHEN** the user selects Editar perfil
- **THEN** the existing profile flow or a prototype-compatible modal SHALL open with the reference user's data and a visible cancel/success/error outcome.

#### Scenario: Help content controls

- **WHEN** the user searches help, expands an FAQ, starts chat or sends a consultation
- **THEN** the visible result, expanded answer, chat feedback or consultation confirmation SHALL appear in the correct support panel and preserve unrelated content.

### Requirement: Region-local loading, empty and error states

Every mock-backed region SHALL expose controllable loading, empty and error variants that preserve its surrounding geometry and distinguish unavailable data from valid empty content.

#### Scenario: Empty region

- **WHEN** a controlled fixture returns an empty book, story, conversation, corner, suggestion, chart or FAQ collection
- **THEN** only that region SHALL show a designed empty state, while the shell and unrelated regions remain visible and no fabricated item SHALL be presented as real activity.

#### Scenario: Error and retry

- **WHEN** a controlled fixture fails
- **THEN** the affected region SHALL show a readable error and retry/recovery action where meaningful, and a successful retry SHALL restore the reference region without a full-page blank state.

### Requirement: Explicit future-backend boundary

The mock contract SHALL remain separate from the real backend boundary and SHALL document the fields and mutations a later backend proposal must implement.

#### Scenario: Real mode compatibility

- **WHEN** mock mode is disabled
- **THEN** the frontend SHALL continue using the existing real service paths and SHALL not require demo-only fields from the current backend for routes outside the mock session.

#### Scenario: Backend handoff

- **WHEN** a future backend spec is prepared
- **THEN** the mock manifest SHALL identify each resource, relationship, read operation and mutation needed to replace the demo behavior without reverse-engineering page presentation code.
