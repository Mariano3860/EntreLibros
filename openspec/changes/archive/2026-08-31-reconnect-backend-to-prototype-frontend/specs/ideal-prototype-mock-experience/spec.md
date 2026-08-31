## MODIFIED Requirements

### Requirement: Explicit future-backend boundary

The mock contract SHALL remain separate from the real backend boundary, SHALL document the fields and mutations a later backend proposal must implement, and SHALL not cause demo values to be presented as persisted data when real API mode is active.

#### Scenario: Real mode compatibility

- **WHEN** mock mode is disabled
- **THEN** the frontend SHALL use the real service paths and Socket.IO contracts classified as available by the reconciliation matrix, SHALL not require demo-only fields for those regions, and SHALL render a designed unavailable state for explicitly deferred regions instead of a prototype fixture.

#### Scenario: Mock mode isolation

- **WHEN** mock mode is enabled for development or automated tests
- **THEN** deterministic fixture data and mock-only mutations SHALL remain available for the reference experience without modifying the contracts used by real API mode.

#### Scenario: Backend handoff

- **WHEN** a future backend spec is prepared
- **THEN** the mock manifest and reconciliation matrix SHALL identify each deferred resource, relationship, read operation, mutation and real-time behavior needed to replace the demo behavior without reverse-engineering page presentation code.
