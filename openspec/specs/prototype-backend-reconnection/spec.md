# prototype-backend-reconnection Specification

## Purpose

Define how the accepted prototype interface consumes all currently available persisted and real-time capabilities without changing its visual hierarchy or silently presenting demonstration data as live product data.

## Requirements

### Requirement: Traceable capability reconciliation

The system SHALL maintain a versioned reconciliation matrix for every visible prototype region and user action, recording its frontend view-model fields, current data source, candidate HTTP route or Socket.IO event, authentication and authorization prerequisites, and one of the decisions `reconnect`, `compatible-adaptation` or `defer`.

#### Scenario: Supported capability is classified

- **WHEN** an existing backend route, service or socket event can provide a region or action required by the prototype
- **THEN** the matrix SHALL identify the real contract and classify it as `reconnect` or `compatible-adaptation`, with the owner-facing acceptance evidence required to remove the demo implementation.

#### Scenario: Absent capability is classified

- **WHEN** the prototype requires data or a mutation for which no backend capability exists after the route, service and persistence audit
- **THEN** the matrix SHALL classify it as `defer`, name the missing product contract and preserve it as input to a future change rather than fabricating a live integration.

### Requirement: Visual contract remains authoritative

The authenticated routes Inicio, Explorar, Comunidad, Mapa, Mensajes, EstadÃƒÂ­sticas, Perfil and Centro de ayuda SHALL preserve the accepted prototype shell, composition, interaction placement and region-local feedback while their data sources are reconnected.

#### Scenario: Real response has different shape or completeness

- **WHEN** a persisted response lacks a field or grouping required by a visible prototype region but the underlying capability exists
- **THEN** the frontend view model and, when needed, a backward-compatible backend adaptation SHALL supply the needed presentation contract without redesigning the route around the previous backend response.

#### Scenario: Connected region is loading, empty or unavailable

- **WHEN** a real request or event is pending, returns no valid records or fails
- **THEN** only the affected prototype region SHALL show its designed loading, empty or error treatment, while the route shell and unrelated visual regions remain intact.

### Requirement: Existing persisted capabilities are live in real API mode

With mock mode disabled, the frontend SHALL consume the existing authenticated and public capabilities for profile and user settings, books and listings, community feed/corners/activity/suggestions/statistics, map/geocoding, contact, messages, agreements, notifications and their supported Socket.IO conversation events whenever the reconciliation matrix classifies them as reconnectable.

#### Scenario: Read and mutation use a persisted contract

- **WHEN** a user opens a supported region or performs a supported action such as updating a profile, publishing/listing a book, creating a corner or story, sending a contact request, creating/selecting a conversation, sending/reading a message, or acting on an agreement
- **THEN** the visible result SHALL be obtained from or confirmed by the corresponding authenticated real API or Socket.IO contract and SHALL survive a route reload when that backend capability persists it.

#### Scenario: Conversation receives real-time updates

- **WHEN** a supported selected conversation receives, sends or marks a message as read while connected
- **THEN** the prototype conversation list, selected history and unread/preview state SHALL reconcile with the real conversation event and retain the integrated two-column layout.

### Requirement: Explicit deferred capability behavior

The frontend SHALL make every deferred prototype capability distinguishable from a live persisted capability without changing the surrounding visual hierarchy.

#### Scenario: Deferred region is encountered in real mode

- **WHEN** the user reaches a region or control classified as `defer` while mock mode is disabled
- **THEN** that region SHALL show a designed unavailable or limited-capability state with no fabricated account-specific value, successful mutation or stale demo record.

#### Scenario: Deferred scope is handed off

- **WHEN** the reconciliation work concludes
- **THEN** the documented deferred list SHALL include the required entities, reads, mutations, real-time behavior and acceptance criteria needed to plan the future backend capability independently.

### Requirement: End-to-end reconnection evidence

The reconnection SHALL be verified in both mock and real modes, including browser-level visual regression checks against the accepted prototype references and integrated HTTP/Socket.IO evidence for each reconnected capability.

#### Scenario: Capability is marked complete

- **WHEN** a matrix item moves to `reconnect` complete
- **THEN** it SHALL have automated contract or integration coverage where feasible and recorded browser evidence that its supported, loading, empty and error states preserve the applicable prototype layout.
