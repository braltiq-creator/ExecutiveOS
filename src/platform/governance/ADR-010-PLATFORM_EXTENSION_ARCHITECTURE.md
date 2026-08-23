# ADR-010 — Platform Extension Architecture

## Status

Accepted — Phase 8

## Context

ExecutiveOS Core (Events, Twin, Graph, Memory, Intent, Intelligence, Judgement, Council, Reality Lab, Experience) is complete. New industries and systems must not require Core edits.

## Decision

Introduce `src/platform/` with:

1. **Contracts** — stable TypeScript interfaces for packs, connectors, providers
2. **SDK** — manifest + compatibility helpers
3. **Plugin Registry** — discovery without Core modification
4. **Versioning** — semver for Platform, SDK, packs, connectors
5. **Governance** — lifecycle, security, testing, release docs

Business Events remain the universal language above connectors.

## Consequences

- SAP and Maximo (or any FSM/ERP) can be swapped or run together
- A Mining / Healthcare / Field Services pack consumes events, not vendors
- Future AI model routing plugs into `AgentExtension` without contract churn
- Core directories stay protected

## Alternatives considered

- Monolithic industry forks of Core — rejected (unmaintainable)
- Runtime scripting without types — rejected (unsafe for executive systems)
